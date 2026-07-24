# Cloud Editor Setup — editor.stillyhomeservices.com

Goal: edit your site from any device at **editor.stillyhomeservices.com**, click **Publish live**, enter your password, and the real site updates itself in ~1 minute.

**How it works:** the hosted editor sends your new page to a small function (`/api/publish`) on your Vercel project. The function checks your password, then commits `index.html` to your GitHub repo using a GitHub token you create. GitHub → Vercel then auto-deploys. The token lives only in Vercel's secure settings — never in the website code.

I've already built and added the code: `api/publish.js`, `vercel.json`, and the upgraded `editor.html`. You do the 6 account steps below.

---

## Step 1 — Create a GitHub token (2 min)
This lets the function write to your repo. Make it as narrow as possible.
1. Go to **github.com** → your avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `Stilly editor publish`
3. **Expiration:** your choice (e.g., 1 year).
4. **Resource owner:** `aaron335`
5. **Repository access:** *Only select repositories* → choose **StillyHomeServices**.
6. **Permissions** → **Repository permissions** → **Contents** → set to **Read and write**. (Leave everything else "No access".)
7. **Generate token** and **copy it** (starts with `github_pat_…`).
   - Paste it into Vercel in Step 3. Don't put it in any file or share it. If it ever leaks, delete it here and make a new one.

## Step 2 — Push the new code (1 min)
In **GitHub Desktop** you'll see new/changed files: `api/publish.js`, `vercel.json`, `editor.html`, `.gitignore`. Add a summary like "Add cloud editor" → **Commit** → **Push**.

## Step 3 — Set your secrets in Vercel (2 min)
1. **vercel.com** → your **stilly-home-services** project → **Settings** → **Environment Variables**.
2. Add these two (Environment: **Production**):
   - **Name:** `GITHUB_TOKEN`  **Value:** *(paste the token from Step 1)*
   - **Name:** `EDITOR_PASSWORD`  **Value:** *(pick a strong password you'll type in the editor)*
3. Save. Then **Deployments → latest → ⋯ → Redeploy** so the function picks up the values (or just push any small change).

*(Optional, only if your repo details differ: `GH_OWNER`, `GH_REPO`, `GH_BRANCH`. Defaults are `aaron335` / `StillyHomeServices` / `main`.)*

## Step 4 — Add the subdomain (3 min)
1. Vercel → your project → **Settings** → **Domains** → **Add** → type `editor.stillyhomeservices.com` → Add.
2. Vercel shows a DNS record to create — usually a **CNAME**: name `editor`, value `cname.vercel-dns.com`.
   - If your domain already uses **Vercel's nameservers**, Vercel adds it automatically — nothing to do.
   - If DNS is at your registrar (e.g., **Squarespace**): open its DNS settings and add a **CNAME** record — Host/Name = `editor`, Value = `cname.vercel-dns.com`.
3. Wait for Vercel to show the domain as **Valid** (minutes, sometimes up to an hour).

## Step 5 — Test it
1. Visit **https://editor.stillyhomeservices.com** — the editor should load with your site preview.
2. Make a tiny edit (e.g., a service description) → **Publish live** → enter your password.
3. Wait ~1 minute, then open **stillyhomeservices.com** and confirm the change is live.

## Step 6 — You're done
From now on: open the editor URL on any device, edit, **Publish live**, done. No computer or GitHub Desktop needed.

---

## Good to know
- **Security:** The token can only edit files in this one repo, and publishing needs your password. Worst case if the password leaked: someone could change your site text (not touch anything else). Keep the password strong; rotate it anytime by changing `EDITOR_PASSWORD` in Vercel. Revoke everything by deleting the token in GitHub.
- **The editor is also reachable at** `stillyhomeservices.com/editor.html`. Publishing still needs the password. Want it locked to the subdomain only? Say the word and I'll add a redirect.
- **Photos** are embedded directly in the page. A very large photo gallery could exceed the function's ~4.5 MB request limit; if a publish ever fails on size, use **Save local** for that update and push via GitHub Desktop, or keep galleries to a handful of images.
- **Local editing still works:** open `editor.html` from your folder and use **Save local** exactly like before.
- **More secure option (later):** instead of a stored token, we could switch to "Log in with GitHub" (OAuth). More setup, but no long-lived token. Ask if you want it.
