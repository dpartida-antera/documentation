# GitHub login for the CMS (/admin/)

The content editor at `/admin/` logs in with GitHub. Because GitHub Pages is static and can't keep a secret, a tiny OAuth proxy does the login handshake. You set this up once. It is free.

There are three pieces: a **GitHub OAuth App**, the **Cloudflare Worker** in `worker.js`, and the `base_url` line in `public/admin/config.yml`.

## 1. Create a GitHub OAuth App

GitHub → your profile → **Settings → Developer settings → OAuth Apps → New OAuth App**:

- **Application name:** Antera Docs CMS (anything)
- **Homepage URL:** `https://dpartida-antera.github.io/documentation/`
- **Authorization callback URL:** `https://antera-cms-auth.YOUR-SUBDOMAIN.workers.dev/callback` (you'll get the real worker URL in step 2; come back and fix this)
- Register, then copy the **Client ID** and **Generate a new client secret** (copy it once).

## 2. Deploy the Cloudflare Worker

Easiest, dashboard route:

1. Sign in at dash.cloudflare.com → **Workers & Pages → Create → Worker**. Name it e.g. `antera-cms-auth`. Deploy the starter, then **Edit code**, paste the contents of `worker.js`, and Deploy.
2. In the worker's **Settings → Variables and Secrets**, add two **secrets**:
   - `GITHUB_CLIENT_ID` = the Client ID from step 1
   - `GITHUB_CLIENT_SECRET` = the client secret from step 1
3. Note the worker URL, for example `https://antera-cms-auth.your-subdomain.workers.dev`.
4. Go back to the GitHub OAuth App and set the **Authorization callback URL** to `<worker-url>/callback`.

(CLI alternative: `npm i -g wrangler`, `wrangler deploy worker.js`, then `wrangler secret put GITHUB_CLIENT_ID` and `wrangler secret put GITHUB_CLIENT_SECRET`.)

## 3. Point the CMS at the worker

In `public/admin/config.yml`, set:

```yaml
backend:
  name: github
  repo: dpartida-antera/documentation
  branch: main
  base_url: https://antera-cms-auth.your-subdomain.workers.dev   # your worker URL, no trailing slash
  auth_endpoint: auth
```

Commit and push. After the site redeploys, open `https://dpartida-antera.github.io/documentation/admin/` and click **Login with GitHub**.

## Who can edit

Anyone whose GitHub account has **write access to the `documentation` repo** can log in and save (saves are commits). To let a non-dev edit, add them as a collaborator with write access. They never see a password; they authorize with their own GitHub account.

## Notes

- For a **private** repo the OAuth scope `repo` (already set) is needed; for a public repo `public_repo` is enough.
- Local editing still works with no login: `npx decap-server` then `npm start`, open `/admin/`.
- This proxy only brokers the login; it never stores your token. The secret lives only in the Worker's environment.
