# Antera Documentation, Angular app

A faithful Angular port of the static documentation site (PO Shipping Address guide and Auto Allocation guide), with the interactive tools, flowcharts, and QA runners rebuilt as components on a single, typed, tested rules engine.

Built with Angular 19 (standalone components, lazy-loaded routes). The existing design system (`assets/styles.css`) is reused verbatim, so it looks the same.

## Run it

Prerequisites: Node 18+ and npm.

```bash
cd angular-app
npm install
npm start          # ng serve, then open http://localhost:4200
```

Other commands:

```bash
npm run build      # production build into dist/
npm test           # unit tests (needs Chrome; see note below)
```

## What's inside

Routes (all lazy-loaded):

| Route | Page |
|---|---|
| `/` | Hub (guide tiles) |
| `/shipping` | PO Shipping guide: determination tool, flowcharts, scenario library |
| `/shipping/qa` | PO Shipping QA runner (60 scenarios, run history) |
| `/auto-allocation` | Auto Allocation guide: simulator, flowcharts, settings, screenshots |
| `/auto-allocation/qa` | Auto Allocation QA runner (24 scenarios, run history) |

## Project structure

```
src/app/
  core/                      single source of truth (pure, typed, tested)
    shipping-rules.ts        decideBlank / decideChain / ADDR / SHIPFROM
    allocation-rules.ts      allocate / parentTransfer
    flow-layout.ts           pure flowchart layout (text wrap, node sizing, edge routing)
    flow-specs.ts            the 6 flowchart definitions as data
    qa-state.service.ts      SSR-safe localStorage (results, history, tester)
    export.util.ts           CSV / JSON download helpers
    models.ts                shared types
    *.spec.ts                unit tests ported from the QA scenarios
  shared/
    flowchart.component.ts   renders a FlowSpec as declarative SVG
    flow-tabs.component.ts   tabbed flowchart switcher
    qa-runner.component.ts   generic QA runner (status, filters, summary, history, export)
  features/
    hub.component.ts
    shipping-guide.component.ts        + determination-tool.component.ts
    shipping-qa.component.ts           + shipping-scenarios.ts
    auto-allocation-guide.component.ts + allocation-simulator.component.ts
    auto-allocation-qa.component.ts    + allocation-scenarios.ts
```

The key maintainability win: the routing and allocation rules live in `core/` exactly once and are imported by both the interactive tools and the QA runners, so the QA "expected" values are computed from the same code the guide uses and cannot drift.

## Tests

`core/shipping-rules.spec.ts` and `core/allocation-rules.spec.ts` port the verification scenarios (shipping routing cases, SC-1 through SC-11, and the parent-transfer cases). They run with `npm test` (Karma needs Chrome installed locally). The rules logic was also verified headless during the build.

## Notes

- Persistence is client-side (localStorage), the same as the static site. QA progress and saved runs live in the browser.
- Screenshots are in `public/assets/screenshots/`.
- This is the faithful 1:1 port (Phase 0 to 4 of `ANGULAR_MIGRATION_PLAN.md`). The CMS (content editing) and shared-backend run history are the planned Phase 5 and Phase 6.
