# Antera Documentation Widgets — GitBook integration

GitBook will not inline an arbitrary third-party iframe pasted as a URL (it shows a
bookmark card instead, by content-security policy). The only supported way to embed
live interactive content is a ContentKit **webframe** inside a GitBook integration.
This small integration renders the Antera embed widgets as live, interactive frames.

## What it does

Registers one block (`Antera widget`) that **unfurls** any URL matching
`https://dpartida-antera.github.io/documentation/embed/**` into a live webframe.
So a writer just pastes a widget URL and gets the working tool, auto-sized to its
height (the embed pages post `@webframe.ready` / `@webframe.resize`).

Widgets: `shipping-tool`, `shipping-flows`, `shipping-qa`, `allocation-simulator`,
`allocation-flows`, `allocation-qa`.

## Publish it (one-time)

You need a GitBook account; the publish step uses your login.

```bash
cd gitbook-integration
npm install

# 1. Set your org in gitbook-manifest.yaml:
#    organization: REPLACE_WITH_YOUR_ORG_ID
#    (find it in GitBook > Organization settings; the subdomain works too)

# 2. Log in and publish
npx gitbook auth          # opens a browser / prompts for an API token
npx gitbook publish .
```

After publishing, enable the integration on your space:
**Space → Integrations** (or **Organization settings → Integrations** to enable it
across spaces). Once enabled, pasting a widget URL into a page renders the live tool.

## Use it in a page

Paste any of these into a GitBook page (on its own line) and choose the embed:

```
https://dpartida-antera.github.io/documentation/embed/shipping-tool
https://dpartida-antera.github.io/documentation/embed/shipping-flows
https://dpartida-antera.github.io/documentation/embed/shipping-qa
https://dpartida-antera.github.io/documentation/embed/allocation-simulator
https://dpartida-antera.github.io/documentation/embed/allocation-flows
https://dpartida-antera.github.io/documentation/embed/allocation-qa
```

The imported guide markdown in `../gitbook/` already references these URLs, so once
the integration is enabled those embeds render live too.

## Develop locally

```bash
npm run typecheck          # type-check the block
npx gitbook dev .          # run the integration against GitBook for local testing
```

## Notes

- `scopes: []` — the integration needs no API access; it only renders a frame.
- `visibility: private` keeps it to your org. Change to `unlisted`/`public` to share.
- To change a widget's initial height, edit `DEFAULT_ASPECT` in `src/index.tsx`
  (the live height still comes from the widget's resize messages).
