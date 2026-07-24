// Serverless function (Vercel) — publishes the site by committing index.html to GitHub.
// GitHub then auto-deploys via the connected Vercel project.
//
// Required environment variables (set these in Vercel → Project → Settings → Environment Variables):
//   EDITOR_PASSWORD  - the password you type in the editor to publish
//   GITHUB_TOKEN     - a fine-grained GitHub token with Contents: Read & Write on this repo only
// Optional overrides (defaults shown):
//   GH_OWNER  = aaron335
//   GH_REPO   = StillyHomeServices
//   GH_BRANCH = main

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { password, html } = req.body || {};

  // --- auth ---
  if (!process.env.EDITOR_PASSWORD) {
    res.status(500).json({ error: "Server not configured: EDITOR_PASSWORD is missing." });
    return;
  }
  if (password !== process.env.EDITOR_PASSWORD) {
    res.status(401).json({ error: "Wrong password." });
    return;
  }

  // --- basic content sanity ---
  if (typeof html !== "string" || html.length < 200 || !html.includes("<!DOCTYPE html>")) {
    res.status(400).json({ error: "Content doesn't look like a valid page." });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    res.status(500).json({ error: "Server not configured: GITHUB_TOKEN is missing." });
    return;
  }

  const owner = process.env.GH_OWNER || "aaron335";
  const repo = process.env.GH_REPO || "StillyHomeServices";
  const branch = process.env.GH_BRANCH || "main";
  const path = "index.html"; // hardcoded — this endpoint can only ever update index.html
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "stilly-editor",
    "Content-Type": "application/json",
  };

  try {
    // 1) get the current file SHA (required to update an existing file)
    let sha;
    const cur = await fetch(`${url}?ref=${branch}`, { headers });
    if (cur.status === 200) {
      const j = await cur.json();
      sha = j.sha;
    } else if (cur.status !== 404) {
      const t = await cur.text();
      res.status(502).json({ error: "Couldn't read current file from GitHub.", detail: t });
      return;
    }

    // 2) commit the new contents
    const content = Buffer.from(html, "utf8").toString("base64");
    const put = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Update site from Stilly editor",
        content,
        sha,
        branch,
      }),
    });

    if (!put.ok) {
      const t = await put.text();
      res.status(502).json({ error: "GitHub rejected the update.", detail: t });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Publish failed.", detail: String(e) });
  }
}
