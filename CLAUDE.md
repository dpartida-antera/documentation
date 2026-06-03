# CLAUDE.md

Guidance for AI coding agents working in this repository. Read this before making changes.

## What this is

An Angular 19 single-page app: internal QA and Support documentation for the Antera order system. It explains two pieces of intended system behavior and lets users confirm any case interactively:

1. **PO Shipping Address**: which address a purchase order ships to.
2. **Auto Allocation**: how booking an order splits each line into Stock vs DropShip vs Backorder, including warehouse priority and parent-to-child inventory transfer.

Each topic has a guide page (prose + reference tables + an interactive tool + flowcharts + a scenario library) and a QA runner page (a trackable checklist of scenarios). It is a static client-side app (no backend); QA progress and run history live in `localStorage`.

The Angular project is named `documentation-app`. It is the repository root. It deploys to GitHub Pages.

## Commands

```bash
npm install          # install deps (run on the OS you build on; esbuild is platform-specific)
npm start            # ng serve, dev server at http://localhost:4200
npm run build        # production build into dist/documentation-app/browser
npm test             # Karma/Jasmine unit tests (requires Chrome)
```

Production build with the Pages base-href (CI does this automatically):

```bash
npx ng build --configuration production --base-href "/documentation/"
```

## Architecture

Standalone components (no NgModules), lazy-loaded routes, strict TypeScript.

```
src/app/
  core/                      pure logic, types, services (no UI). The brains.
    models.ts                all shared interfaces/types
    shipping-rules.ts        decideBlank, decideChain, decide, ADDR, SHIPFROM
    allocation-rules.ts      allocate, parentTransfer
    flow-layout.ts           pure flowchart layout (text wrap, node sizing, edge routing)
    flow-specs.ts            the 6 flowcharts as data (SHIPPING_FLOWS, ALLOCATION_FLOWS)
    qa-state.service.ts      SSR-safe localStorage wrapper
    export.util.ts           CSV/JSON download + helpers
    markdown.ts              tiny inline-markdown -> HTML (uses `marked`)
    *.spec.ts                unit tests, ported from the QA scenarios
  shared/
    flowchart.component.ts   renders a FlowSpec as declarative SVG
    flow-tabs.component.ts   tabbed flowchart switcher
    qa-runner.component.ts   generic QA runner (status, filters, summary, run history, export). Exports the QaScenario interface.
  features/
    hub.component.ts                     landing tiles
    shipping-guide.component.ts          + determination-tool.component.ts
    shipping-qa.component.ts             + shipping-scenarios.ts   (60 scenarios)
    auto-allocation-guide.component.ts   + allocation-simulator.component.ts
    auto-allocation-qa.component.ts      + allocation-scenarios.ts (24 scenarios)
  app.component.ts / app.config.ts / app.routes.ts
src/content/                 editable guide prose as JSON (see "Content")
src/styles/antera.css        the shared design system, imported by src/styles.scss
public/                      static assets served at the site root
  admin/                     Decap CMS editor (index.html + config.yml)
  assets/screenshots/        setting screenshots used by the auto-allocation guide
cms-oauth/                   Cloudflare Worker + SETUP.md for the CMS GitHub login
.github/workflows/deploy.yml GitHub Pages deploy (build at repo root, base-href from repo name)
```

Routes (all lazy): `/`, `/shipping`, `/shipping/qa`, `/auto-allocation`, `/auto-allocation/qa`.

## Core invariant: one source of truth

The business logic lives ONCE in `core/` as pure functions and is imported by both the interactive tools and the QA runners. A QA scenario's "expected" value is computed by calling the same `decide()` / `allocate()` / `parentTransfer()` the guide uses, so the checklist cannot drift from the documented behavior.

When changing behavior:
1. Edit the function in `core/shipping-rules.ts` or `core/allocation-rules.ts`.
2. Update/add the matching case in its `*.spec.ts`.
3. Do NOT reimplement the rule in a component or scenario file. Tools, simulators, and scenarios must all go through `core/`.

### Rule summaries (intent, so you do not change behavior by accident)

Shipping (`shipping-rules.ts`): returns one of seven destinations. Priority is Alternate Ship To, then Ship to Us (Destination Warehouse, then Corporate Identity, then Partner), then default (Order / Vendor). The Decorator/Supplier chain gates on "is this the final PO?": a non-final PO always ships to the next decorator; only the final PO evaluates the overrides. Blank PO: undecorated + Ship to Us Upon Completion routes to the Ship-to-Us chain; decorated uses Ship to Us Instead of Decorator.

Allocation (`allocation-rules.ts`): per size, `allocated = min(required, stock)`. Full stock stays Stock. Partial keeps the covered qty as Stock and either creates a DropShip line for the shortfall or, in Backorder mode, records a backorder on the same line. If no size has stock, the whole line flips to DropShip in place. `parentTransfer` is FIFO by lot; it only runs for Stock-type lines, requires matching warehouse types unless the child has zero stock, and is not reversed on unreserve.

The PDF source material these were built from is not in the repo; the guides and the `*.spec.ts` files are the living spec. Treat the specs as the contract.

## Conventions

- **Standalone components**, inline `template:`/`styles:`. Use Angular control flow (`@if`, `@for`) not `*ngIf`/`*ngFor`.
- **Reuse the global CSS** in `src/styles/antera.css` (classes like `.doc-layout`, `.docnav`, `.hero`, `.card`, `.tool`, `.seg`, `.toggle-row`, `.sw`, `.badge`, `.note`, `.info`). Add component-scoped styles only for genuinely new UI.
- **Strict TypeScript** is on (`strict`, `noPropertyAccessFromIndexSignature`, `strictTemplates`). Keep things typed; avoid `any`.
- **No em dashes anywhere** (house style). Use commas, colons, or parentheses. This applies to code, comments, content, and docs.
- The production build is the gate for "does it compile" (AOT templates included). A green `npm run build` is required before considering a change done.

## Content (editable by non-developers)

Guide prose (intros, section leads, callouts) is NOT hardcoded in components. It lives in:

- `src/content/shipping-guide.json`
- `src/content/auto-allocation-guide.json`

The guide components `import` these JSON files at build time and render prose through `mdInline()` (markdown) bound via `[innerHTML]`. Page structure, tables, flowcharts, the interactive tools, and QA scenarios stay in code on purpose.

Editing happens via Decap CMS at `/admin/` (config in `public/admin/config.yml`, GitHub login through the `cms-oauth/` Worker), or by editing the JSON directly. Because content is imported at build time, a content change requires a rebuild/redeploy (a Decap commit triggers the Pages workflow).

## How to extend

- **Change a rule:** edit `core/*-rules.ts` + its spec. Everything else updates automatically.
- **Add a QA scenario:** add an entry to `features/shipping-scenarios.ts` or `features/allocation-scenarios.ts`. If it has the inputs to compute an answer, `expected` is computed by the engine; otherwise set `manualExpected`. It appears in both the guide's scenario library and the QA runner.
- **Add a flowchart:** add a `FlowSpec` to `core/flow-specs.ts` (nodes with x/y/width/text/type, edges by node id with from/to side and optional label). Render with `<app-flowchart [spec]="...">` or via `<app-flow-tabs>`. Never hand-draw SVG; the layout engine positions everything.
- **Add a guide page:** create `features/<name>.component.ts` (standalone), register a lazy route in `app.routes.ts`, add a tile in `hub.component.ts`. Reuse `<app-flowchart>`, `<app-flow-tabs>`, `<app-qa-runner>` as needed.
- **Reuse the QA runner:** pass `[scenarios]` (QaScenario[]), `storageKey`, and `csvPrefix`.

## Persistence and the road to a backend

`QaStateService` wraps `localStorage` (SSR-safe via `isPlatformBrowser`) for QA results, saved-run history, and the tester name. There is no server. To make runs shared across people, the plan is to swap `QaStateService` to call an API (`qa_run` + `qa_result` tables). Keep all persistence behind that service so the swap stays localized.

## Deployment (GitHub Pages)

- Repo: `dpartida-antera/documentation`, served at `https://dpartida-antera.github.io/documentation/`.
- `.github/workflows/deploy.yml` builds at the repo root with `--base-href "/<repo>/"` (auto from repo name), copies `index.html` to `404.html` (SPA deep-link fallback), adds `.nojekyll`, and deploys. Pages Source must be "GitHub Actions".
- For a user/org root page or a custom domain, change base-href to `/`.

## Gotchas

- **esbuild is platform-specific.** `node_modules` built on one OS will not build on another (you will see "esbuild for another platform"). Run `npm ci` on the OS you build on; CI does this on Linux.
- **No SSR.** Guard any browser API behind `isPlatformBrowser` if you add server rendering later. `QaStateService` already does.
- **QA "expected" comes from the engine.** Never hardcode an expected result that the rules engine could compute.
- **Content is build-time imported.** Editing `src/content/*.json` needs a rebuild to show.
- **`npm test` needs Chrome.** The pure logic in `core/` can also be checked headlessly by bundling with esbuild and running under Node.

## Related docs

- `CODEBASE_GUIDE.md`: a longer walkthrough (written for a Rails developer).
- `DEPLOY.md`: GitHub Pages deployment details.
- `EDITING_CONTENT.md`: for non-dev content editors.
- `cms-oauth/SETUP.md`: set up the GitHub login for the CMS.
