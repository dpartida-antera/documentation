# Deploying to GitHub Pages

Yes, this app runs on GitHub Pages. It is a static SPA, which Pages serves fine once three things are handled (the included workflow does all three): the **base-href**, an **SPA fallback** (`404.html`) so deep links work, and **`.nojekyll`**.

## One-time setup

1. Put this `angular-app` folder in its own GitHub repo and push it to `main`. (Recommended. See "If it is a subfolder" below if you keep it inside the existing docs repo.)
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. That's it. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

Your site will be at `https://<your-user-or-org>.github.io/<repo-name>/`.

## How the workflow handles the Pages gotchas

- **base-href**: a project page is served under `/<repo>/`, so the build runs with `--base-href "/<repo>/"` (auto-derived from the repo name). If you deploy to a **user/org root page** (`<user>.github.io`) or a **custom domain**, change that to `--base-href "/"`.
- **Deep links** (for example `/shipping/qa`): GitHub Pages returns 404 for client-side routes, so the workflow copies `index.html` to `404.html`, which makes Pages serve the app and lets the Angular router take over.
- **`.nojekyll`**: added so Pages does not run Jekyll over the build output.

## Build it yourself (without Actions)

```bash
npm ci
npx ng build --configuration production --base-href "/<repo>/"
cp dist/antera-docs/browser/index.html dist/antera-docs/browser/404.html
touch dist/antera-docs/browser/.nojekyll
# then publish dist/antera-docs/browser, e.g. with: npx angular-cli-ghpages --dir dist/antera-docs/browser
```

## If angular-app is a subfolder of a bigger repo

A repo can publish only one Pages site. If this stays inside the existing docs repo (which already contains the static HTML site), decide which one Pages serves. To serve this app:

- Move `.github/workflows/deploy.yml` to the **repo root**.
- In the build job add `defaults: { run: { working-directory: angular-app } }`.
- Change the artifact `path` to `angular-app/dist/antera-docs/browser`.

The simplest path is a dedicated repo for the app.

## The content editor (Decap CMS) on Pages

The `/admin/` editor works locally with `npx decap-server`. On GitHub Pages, its GitHub login backend needs an OAuth provider, which Pages alone does not give you. Two options:

- **Simplest:** non-devs edit the content files through GitHub's web editor (see `EDITING_CONTENT.md`, Option B). No extra setup.
- **Full CMS login:** host a small OAuth proxy (for example a free Cloudflare Worker or Netlify) and point `public/admin/config.yml` at it. This is a separate, optional setup.
