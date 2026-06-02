/**
 * GitHub OAuth proxy for Decap CMS, as a Cloudflare Worker.
 *
 * Why this exists: GitHub Pages is static and cannot hold the OAuth client secret.
 * This tiny worker performs the GitHub OAuth handshake and hands the token back to
 * the Decap admin window. Decap's config.yml points `base_url` at this worker.
 *
 * Required environment variables (set as Worker secrets):
 *   GITHUB_CLIENT_ID      - from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  - from your GitHub OAuth App
 *
 * Routes:
 *   /auth      -> redirects to GitHub's authorize page
 *   /callback  -> exchanges the code for a token, posts it back to Decap
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const redirectUri = `${url.origin}/callback`;
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', redirectUri);
      authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
      authorize.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authorize.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenResponse.json();
      const status = data.access_token ? 'success' : 'error';
      const payload = data.access_token
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error_description || 'Could not get a token' };

      // Canonical Decap / Netlify CMS postMessage handshake.
      const html = `<!doctype html><html><body><script>
        (function () {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(payload))},
              e.origin
            );
            window.removeEventListener('message', receiveMessage, false);
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script>Signing you in, you can close this window.</body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    return new Response('Decap CMS GitHub OAuth proxy. Open /auth to start.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
