# Deploying to GitHub Pages

Yes, this app runs on GitHub Pages. It is a static SPA, which Pages serves fine once three things are handled (the included workflow does all three): the **base-href**, an **SPA fallback** (`404.html`) so deep links work, and **`.nojekyll`**.

## One-time setup

1. Push this repository (the Angular app is the repo root) to `main`.
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
cp dist/documentation-app/browser/index.html dist/documentation-app/browser/404.html
touch dist/documentation-app/browser/.nojekyll
# then publish dist/documentation-app/browser, e.g. with: npx angular-cli-ghpages --dir dist/documentation-app/browser
```

## The content editor (Decap CMS) on Pages

The `/admin/` editor logs in with GitHub through the OAuth proxy in `cms-oauth/`. Follow `cms-oauth/SETUP.md` once to deploy the proxy and set `base_url` in `public/admin/config.yml`. Locally it works with no login: `npx decap-server` then `npm start`, open `/admin/`.
