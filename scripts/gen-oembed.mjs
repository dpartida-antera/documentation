// Generates oEmbed discovery pages + JSON so GitBook renders the embed widgets
// as live inline iframes (not link cards). Output goes to public/oembed/ and is
// served from the Pages site. Re-run after changing a widget or its size:
//   node scripts/gen-oembed.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://dpartida-antera.github.io/documentation';

// One entry per embeddable widget. height is the iframe height GitBook will use.
const WIDGETS = [
  { key: 'shipping-tool',         title: 'Address determination tool',     height: 640 },
  { key: 'shipping-flows',        title: 'Shipping decision flowcharts',   height: 660 },
  { key: 'shipping-qa',           title: 'PO Shipping QA runner',          height: 1000 },
  { key: 'allocation-simulator',  title: 'Allocation simulator',           height: 800 },
  { key: 'allocation-flows',      title: 'Allocation decision flowcharts', height: 660 },
  { key: 'allocation-qa',         title: 'Auto Allocation QA runner',      height: 1000 },
];

const WIDTH = 1040;
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../public/oembed');
mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const w of WIDGETS) {
  const widgetUrl = `${BASE}/embed/${w.key}`;
  const pageUrl = `${BASE}/oembed/${w.key}.html`;
  const jsonUrl = `${BASE}/oembed/${w.key}.json`;

  const iframe = `<iframe src="${widgetUrl}" width="${WIDTH}" height="${w.height}" style="border:0;max-width:100%" title="${esc(w.title)}" loading="lazy"></iframe>`;

  // The page GitBook fetches: advertises oEmbed (primary) + a Twitter player card
  // (fallback), and shows the live tool to any human who opens it directly.
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(w.title)}</title>
<link rel="alternate" type="application/json+oembed" href="${jsonUrl}" title="${esc(w.title)}">
<meta property="og:type" content="rich">
<meta property="og:title" content="${esc(w.title)}">
<meta property="og:url" content="${pageUrl}">
<meta name="twitter:card" content="player">
<meta name="twitter:title" content="${esc(w.title)}">
<meta name="twitter:player" content="${widgetUrl}">
<meta name="twitter:player:width" content="${WIDTH}">
<meta name="twitter:player:height" content="${w.height}">
<style>html,body{margin:0;height:100%;background:#0f1115}iframe{display:block}</style>
</head>
<body>
<iframe src="${widgetUrl}" style="border:0;width:100%;height:100vh" title="${esc(w.title)}"></iframe>
</body>
</html>
`;

  const json = {
    version: '1.0',
    type: 'rich',
    provider_name: 'Antera Documentation',
    provider_url: `${BASE}/`,
    title: w.title,
    width: WIDTH,
    height: w.height,
    html: iframe,
  };

  writeFileSync(resolve(outDir, `${w.key}.html`), html);
  writeFileSync(resolve(outDir, `${w.key}.json`), JSON.stringify(json, null, 2) + '\n');
  console.log(`wrote oembed/${w.key}.html + .json  (paste ${pageUrl})`);
}
