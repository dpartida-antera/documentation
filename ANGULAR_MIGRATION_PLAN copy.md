# Angular Migration Plan: Antera Documentation

**Goal:** convert the current static HTML documentation site into a maintainable Angular web app, with a phased path toward non-developer content editing and shared/live data.

**Decisions captured for this plan**

- **Drivers:** modernize and improve maintainability; later enable non-dev editing (CMS); later support shared/live data.
- **Scope:** faithful 1:1 port first, reusing the existing `assets/styles.css` as-is.
- **Persistence:** stay client-side for now (localStorage, CSV/JSON export), same as today.
- **Deliverable:** this detailed plan document.

The strategy is deliberately staged: ship a pixel-faithful Angular version that behaves exactly like today (Phases 0 to 4), then layer the CMS (Phase 5) and shared/live data (Phase 6) on top once the foundation is solid. The two later goals do not change the early phases; they are enabled by the architecture chosen up front.

---

## 1. Why Angular helps here

The single biggest maintainability problem today is **duplicated logic across standalone HTML files**:

- The **flowchart engine** (`wrapText`, `geom`, `drawNode`, `anchor`, `drawEdge`, `renderFlow`, `FLOWSPEC`) is copied into `shipping.html` and `auto-allocation.html`.
- The **shipping determination rules** (`decideBlank`, `decideChain`, `ADDR`, `SHIPFROM`) live in both `shipping.html` and `qa-testing.html`.
- The **allocation rules** (`allocate`, `parentTransfer`) live in both `auto-allocation.html` and `auto-allocation-qa.html`.
- The **QA runner** (scenario list, status tracking, localStorage, CSV/JSON export, filters, progress summary) is duplicated in `qa-testing.html` and `auto-allocation-qa.html`.

A change to any rule must currently be made in two places by hand, which is exactly how "the sheet drifts from the guide" bugs creep in. Angular lets each rule engine and UI pattern exist **once**, be **strongly typed**, and be **unit tested**, while every page imports the same source of truth.

---

## 2. Current-state inventory

| File | Role | Interactive pieces | Reused logic |
|---|---|---|---|
| `index.html` | Hub / landing | Guide tiles | none |
| `shipping.html` | PO Shipping guide | Determination tool, 3 flowcharts, scenario library, field-mapping tables | flowchart engine, shipping rules |
| `qa-testing.html` | PO Shipping QA runner | 60 scenarios, status tracking, export | shipping rules (computed expected), QA runner |
| `auto-allocation.html` | Auto Allocation guide | Allocation simulator, 3 flowcharts, scenario library, screenshots | flowchart engine, allocation rules |
| `auto-allocation-qa.html` | Auto Allocation QA runner | 24 scenarios, status tracking, export | allocation rules, QA runner |
| `assets/styles.css` | Shared design system | CSS variables, layout, components | global |
| `assets/screenshots/*.png` | Setting-location images | static assets | n/a |

Shared UI primitives already implied by the CSS: top bar, doc layout with side nav, hero, cards, tables, badges, notes/info callouts, toggle switches (`.sw`), segmented control (`.seg`), filter bar, flow tabs.

---

## 3. Target architecture

Angular (current LTS, standalone components, no NgModules), Angular Router with lazy-loaded feature routes, TypeScript strict mode. Rendering of guides is component-based; the existing CSS is imported globally so the result is visually identical.

### Proposed project structure

```
antera-docs/
  src/
    app/
      app.config.ts            // bootstrap providers + router
      app.routes.ts            // lazy routes
      app.component.ts         // shell: top bar + <router-outlet>
      core/
        models/                // FlowSpec, NodeSpec, EdgeSpec, Scenario,
                               // AddressResult, AllocationResult, etc.
        flowchart/
          flow-layout.ts       // pure layout: wrap text, size nodes, anchors, edges
          flow-layout.spec.ts
        rules/
          shipping-rules.ts    // decideBlank, decideChain, ADDR, SHIPFROM
          shipping-rules.spec.ts
          allocation-rules.ts  // allocate, parentTransfer
          allocation-rules.spec.ts
        services/
          qa-state.service.ts  // localStorage, SSR-safe
          export.service.ts    // CSV / JSON download + import
      shared/
        ui/                    // top-bar, doc-layout, side-nav, hero, card,
                               // note, badge, toggle-switch, segmented-control
        flowchart/
          flowchart.component.ts   // renders a FlowSpec as inline SVG
        qa-runner/
          qa-runner.component.ts   // generic, configurable runner
        scenario-table/
          scenario-table.component.ts  // search + filter table
      features/
        hub/                   // landing page with tiles
        shipping/
          shipping-guide.component.ts
          determination-tool/  // toggles + result panel using shipping-rules
        shipping-qa/           // qa-runner configured with shipping scenarios
        auto-allocation/
          auto-allocation-guide.component.ts
          allocation-simulator/  // matrix input + result using allocation-rules
        auto-allocation-qa/    // qa-runner configured with allocation scenarios
      content/                 // Phase 5: guide content as data / markdown
    assets/
      styles.css               // existing file, imported globally
      screenshots/...
    styles.scss                // imports assets/styles.css + design tokens
  angular.json, package.json, tsconfig*.json
```

### Routing

| Route | Component | Notes |
|---|---|---|
| `/` | `HubComponent` | tiles, lazy children below |
| `/shipping` | `ShippingGuideComponent` | guide + embedded tool + flowcharts |
| `/shipping/qa` | `ShippingQaComponent` | QA runner instance |
| `/auto-allocation` | `AutoAllocationGuideComponent` | guide + simulator + flowcharts |
| `/auto-allocation/qa` | `AutoAllocationQaComponent` | QA runner instance |

Each feature route is lazy-loaded so first paint stays light.

---

## 4. Key components and services

### 4.1 Rules engines (single source of truth)

Port the existing JavaScript into typed, pure TypeScript modules with no DOM dependencies:

- `shipping-rules.ts`: `decideBlank(flags): AddressResult`, `decideChain(flags): AddressResult`, plus `ADDR` and `SHIPFROM` as typed constants.
- `allocation-rules.ts`: `allocate(rows, options): AllocationResult`, `parentTransfer(orderQty, childQty, parentInventory, poType, fifoLots): TransferResult`.

These modules are imported by **both** the interactive tools and the QA runners' "expected outcome" computation, which structurally guarantees the QA sheet cannot drift from the guide. The verification scripts already written during this project become the unit test suites (see Section 8).

### 4.2 Flowchart component

Today the SVG is built by string concatenation and injected as HTML. In Angular, keep the **pure layout function** (`flow-layout.ts`: text wrapping, node sizing, anchor points, edge geometry) and render the result **declaratively** in the component template using `*ngFor` over computed nodes and edges with native `<rect>`, `<polygon>`, `<text>`, and `<path>` elements. Benefits: no `innerHTML` sanitization concerns, the layout math is unit-testable in isolation, and `FlowSpec` is typed. The three shipping charts and three allocation charts become `FlowSpec` data objects passed to one `<app-flowchart [spec]="...">`.

### 4.3 Generic QA runner

One `QaRunnerComponent` configured by inputs:

- `scenarios`: typed scenario list.
- `groups`: group labels.
- `computeExpected`: a function (defaults to calling the relevant rules engine) so computed scenarios stay live.
- `storageKey`: keeps the existing keys (`antera_po_qa_v1`, `antera_aa_qa_v1`) so testers' saved progress carries over.
- column config.

It owns search/filter, the progress summary, status buttons, notes, and delegates persistence to `QaStateService` and export to `ExportService`. The two QA pages become thin configurations of this one component.

### 4.4 Shared UI

Small presentational components mapped directly to the current CSS classes: `TopBarComponent`, `DocLayoutComponent` (side nav + main), `HeroComponent`, `CardComponent`, `NoteComponent`/`InfoComponent`, `ToggleSwitchComponent` (`.sw`), `SegmentedControlComponent` (`.seg`), `BadgeComponent`. Because the CSS is reused unchanged, these are thin wrappers and the output looks identical.

### 4.5 Services

- `QaStateService`: read/write localStorage, guarded with `isPlatformBrowser` so it is safe under prerendering/SSR.
- `ExportService`: CSV and JSON download, plus JSON import (port the existing logic).

---

## 5. Styling strategy

Faithful 1:1 means **reuse `assets/styles.css` verbatim**, imported once via `styles.scss`. Keep the CSS variables (`--navy`, `--blue`, `--line`, `--muted`, etc.) as the design tokens. Components use the existing class names. Over later iterations, styles can migrate into component-scoped SCSS, but that is optional and not required for parity. Screenshots move to `src/assets/screenshots/` and are referenced the same way.

---

## 6. Content model and the CMS path (Phase 5)

To enable non-developer editing without a backend (consistent with staying client-side), the recommended approach is **git-based content**:

1. Extract each guide's prose, tables, notes, and scenario datasets out of the components into structured content files (JSON for scenarios and field mappings, Markdown for prose sections).
2. Build a generic `GuideRendererComponent` that renders a sequence of typed section blocks: `prose`, `table`, `note`, `flowchart` (references a `FlowSpec`), and `tool` (references the determination tool or simulator). Adding or editing a guide becomes editing content, not writing a page.
3. Add a git-based CMS such as **Decap CMS** (formerly Netlify CMS), which gives support/QA staff a friendly editing UI that commits Markdown/JSON back to the repo. This keeps the whole system static and free to host, with no server to run.

Scenario libraries and QA scenario sets become JSON, so QA staff can add scenarios through the CMS while the rules engine still computes expected outcomes in code.

---

## 7. Data and persistence

**Now (Phase 1 to 4):** identical to today. Tools are fully client-side; QA progress persists in localStorage with CSV/JSON export and import.

**Later (Phase 6, optional, shared/live data):** introduce an `ApiService` plus environment configuration. Two independent capabilities:

- **Shared QA runs:** save runs server-side so testers share results and history. Requires a small API plus a database and authentication.
- **Live Antera data:** tools read real product `Li Type`, warehouse priority, and inventory from Antera APIs instead of manual inputs. Requires API access and auth.

Both are isolated behind a service interface so the faithful port does not depend on them and can ship first.

---

## 8. Testing strategy

A major payoff of the migration. Convert the verification work already done in this project into automated tests:

- **Unit tests for rules** (`shipping-rules.spec.ts`, `allocation-rules.spec.ts`): port the existing checks (the 23 shipping routing cases, the 20 allocation and transfer cases including SC-1 through SC-11 and Transfer 1 through 13). These run on every commit.
- **Unit tests for layout** (`flow-layout.spec.ts`): assert no overlapping nodes and that edges connect declared anchors.
- **Component tests** for the determination tool, simulator, and QA runner (Angular testing utilities).
- **End-to-end** (Playwright or Cypress): smoke-test each route, the simulator presets, and QA export/import.
- Optional **visual regression** on the rendered flowcharts to catch layout drift.

---

## 9. Build, deployment, CI

- **Build:** Angular CLI. Configure `base-href` for the hosting path.
- **Static hosting (GitHub Pages, same as today):** use Angular route **prerendering** (`@angular/ssr` prerender / static site generation) so the app stays a set of static files, good for SEO and fast first paint, while remaining a SPA for interactivity. `angular-cli-ghpages` can publish the build.
- **CI:** GitHub Actions to install, lint, run unit and e2e tests, build, and deploy on merge to `main`.
- Keep a redirect/landing parity with the current `index.html` hub.

---

## 10. Phased roadmap

| Phase | Deliverable | Rough effort (1 dev) |
|---|---|---|
| **0. Setup** | Angular workspace, strict TS, lint/format, CI skeleton, GitHub Pages deploy of an empty shell | 0.5 to 1 day |
| **1. Foundation** | Global styles (reuse `styles.css`), app shell (top bar, doc layout, side nav), router, Hub page with tiles | 1 to 2 days |
| **2. Rules as services** | Typed `shipping-rules`, `allocation-rules`, `flow-layout` with unit tests ported from existing verification | 2 to 3 days |
| **3. Shared components** | `FlowchartComponent`, `QaRunnerComponent`, `ScenarioTableComponent`, UI primitives (toggle, segmented, card, note) | 3 to 4 days |
| **4. Port the pages** | Shipping guide + tool, Shipping QA, Auto Allocation guide + simulator, Auto Allocation QA, all faithful to current behavior | 3 to 5 days |
| **5. Content / CMS** | Guides as content (Markdown/JSON), `GuideRenderer`, Decap CMS for non-dev editing | 3 to 5 days |
| **6. Shared / live data** | `ApiService`, optional backend for shared QA runs, optional live Antera data | scope-dependent, 1 to 3 weeks |
| **7. Hardening** | Accessibility pass, visual regression, docs, final deploy | 1 to 2 days |

**Faithful port (Phases 0 to 4 plus 7):** roughly 2 to 3 weeks for one developer. CMS and live-data phases are additive and can be scheduled later.

---

## 11. File-to-Angular mapping

| Today | Becomes |
|---|---|
| `index.html` | `HubComponent` + tile data |
| `shipping.html` (guide markup) | `ShippingGuideComponent` (Phase 5: content files) |
| `shipping.html` (determination JS) | `core/rules/shipping-rules.ts` + `DeterminationToolComponent` |
| `shipping.html` (flow JS) | `core/flowchart/flow-layout.ts` + `FlowchartComponent` + shipping `FlowSpec`s |
| `qa-testing.html` | `ShippingQaComponent` = `QaRunnerComponent` + shipping scenarios JSON |
| `auto-allocation.html` (guide) | `AutoAllocationGuideComponent` (Phase 5: content files) |
| `auto-allocation.html` (simulator JS) | `core/rules/allocation-rules.ts` + `AllocationSimulatorComponent` |
| `auto-allocation.html` (flow JS) | `FlowchartComponent` + allocation `FlowSpec`s |
| `auto-allocation-qa.html` | `AutoAllocationQaComponent` = `QaRunnerComponent` + allocation scenarios JSON |
| `assets/styles.css` | `src/assets/styles.css`, imported globally |
| `assets/screenshots/*` | `src/assets/screenshots/*` |

---

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Flowchart SVG fidelity differs after moving from string output to declarative rendering | Keep the layout math identical; add visual-regression tests against the current PNGs |
| CSS variable / class parity | Reuse `styles.css` unchanged in Phase 1; diff rendered pages against the originals |
| localStorage under prerender/SSR | Guard all storage access with `isPlatformBrowser`; keep the existing storage keys |
| Rules drifting between tool and QA runner | One shared rules module imported by both; enforced by types and the ported test suite |
| Scope tension (1:1 port vs CMS vs live data) | Strict phase boundaries; ship the faithful port before starting Phase 5 and 6 |
| GitHub Pages base-href / deep links | Configure `base-href` and a SPA fallback; prerender the known routes |

---

## 13. Open decisions and recommendations

- **Angular standalone components and the current LTS** are recommended (no NgModules) for the simplest, most modern setup.
- **Hosting:** stay on GitHub Pages with prerendering unless the app is going to be embedded in the main Antera product, in which case align the build with that product's pipeline.
- **CMS choice:** Decap CMS (git-based, free, no server) fits the "stay client-side" decision best; revisit if a hosted CMS is preferred.
- **Live data and shared QA runs** should be treated as a separate project with its own API and auth design, started only after the faithful port is in production.

### Recommended first step

Stand up Phase 0 and Phase 2 together: scaffold the workspace and immediately port the rules engines with their tests. That proves the single-source-of-truth approach and gives a green test suite before any UI work begins.
