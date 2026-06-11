# Adding a new guide and tool

How to add a new documentation topic like the PO Shipping Address guide or the Auto
Allocation guide: the rules engine, the interactive tool, the QA runner, the
flowcharts, the embeddable widget, and the GitBook side. Follow this top to bottom and
the new topic will behave exactly like the existing two.

House style: no em dashes anywhere (use commas, colons, or parentheses). Standalone
components, Angular control flow (`@if` / `@for`), strict TypeScript, reuse the global
CSS in `src/styles/antera.css`. A green `npm run build` is the gate for "done".

## The core idea (read this first)

The business logic lives ONCE in `src/app/core/` as pure functions. The interactive
tool, the QA runner, and the scenario library all import that same function, so the
documentation cannot drift from the behavior. When you add a topic, the rule goes in
`core/` and everything else consumes it. Never reimplement a rule inside a component or
a scenario file.

## Fast path vs full path

- **Just a new interactive tool** (no full guide page): do steps 1, 3, and 9 only. The
  tool becomes embeddable at `/embed/<key>` and works in GitBook with no integration
  changes.
- **A full guide** like Shipping or Auto Allocation: do all steps. The easiest way is to
  copy the Shipping files and rename, because Shipping is the simplest complete example.

## Steps

### 1. Rules and types (`core/`)

- Add your types to `src/app/core/models.ts`.
- Create `src/app/core/<topic>-rules.ts` with pure functions (no UI, no Angular). Look
  at `shipping-rules.ts` (`decide`) and `allocation-rules.ts` (`allocate`) as models.
- Add `src/app/core/<topic>-rules.spec.ts` with unit tests, one per important case.
  These specs are the living contract for the behavior.

### 2. Scenarios (`features/<topic>-scenarios.ts`)

- Export a `QaScenario[]` (the interface is in `shared/qa-runner.component.ts`).
- Each scenario's `expected` is COMPUTED by calling your `core/` function on the
  scenario inputs, never hardcoded. If a scenario has no computable inputs, set
  `manualExpected` instead. See `shipping-scenarios.ts` for the pattern (a `RAW` array
  mapped through the engine).

### 3. Interactive tool (`features/<topic>-tool.component.ts`)

- A standalone component that reads inputs, calls your `core/` function, and shows the
  result. Copy `determination-tool.component.ts` (shipping) or
  `allocation-simulator.component.ts` (allocation).
- Use the global `.card.tool`, `.controls`, `.result` classes so it matches the others
  and so the embed side-by-side layout works (see step 9).

### 4. Content JSON (`src/content/<topic>-guide.json`)

- The guide prose (hero, section leads, callouts, tables, glossary) lives here, not in
  the component, so non-developers can edit it. Copy `shipping-guide.json` and edit.
- Prose is rendered as inline markdown, so `**bold**` and `*italic*` work.

### 5. Guide page (`features/<topic>-guide.component.ts`)

- Standalone component that imports the JSON, the tool, the flowcharts, and the
  scenarios, and lays out the sections. Copy `shipping-guide.component.ts` and rename.
- It binds prose through the `mdInline` pipe and renders tables/cards with `@for`.

### 6. QA runner page (`features/<topic>-qa.component.ts`)

- Thin wrapper that passes your scenarios to the shared runner:
  `<app-qa-runner [scenarios]="scenarios" storageKey="antera_<topic>_qa" csvPrefix="<topic>-qa" />`.
  Copy `shipping-qa.component.ts`. Use a unique `storageKey`.

### 7. Flowcharts (`core/flow-specs.ts`)

- Add a `FlowSpec` (nodes with x/y/width/text/type, edges by node id). Never hand draw
  SVG; the layout engine in `flow-layout.ts` positions everything. Render with
  `<app-flow-tabs>` in the guide.

### 8. Routes and hub tile

- Register lazy routes in `src/app/app.routes.ts` (copy the `shipping` and
  `shipping/qa` lines).
- Add tiles in `src/app/features/hub.component.ts` (copy a `<a class="doc-tile">`
  block, change the `routerLink`, title, blurb, and icon).

### 9. Make the tool embeddable (`features/embed.component.ts`)

This is what lets GitBook show the tool live.

- Import your tool component and add it to the `imports` array.
- Add a `@case` to the `@switch`, choosing a URL key:
  `@case ('<topic>-tool') { <app-<topic>-tool /> }`.
- If your tool uses the `controls | result` layout and you want it side by side in
  narrow frames, add its key to the `embed-split` host binding at the top of the
  component.

After this, the tool is live at
`https://dpartida-antera.github.io/documentation/embed/<topic>-tool` once deployed.

Available embed keys today: `shipping-tool`, `shipping-flows`, `shipping-qa`,
`allocation-simulator`, `allocation-flows`, `allocation-qa`.

### 10. Build, commit, deploy

```bash
npm run build      # must be green (AOT templates included)
npm test           # optional, runs the specs (needs Chrome)
git add -A && git commit -m "Add <topic> guide" && git push
```

Pushing to `main` triggers the GitHub Pages deploy, which makes the new `/embed/...`
URLs live.

## GitBook side

The GitBook integration (`gitbook-integration/`) unfurls ANY URL matching
`https://dpartida-antera.github.io/documentation/embed/**`. So a brand new embed key
works in GitBook with NO integration change: just paste the new embed URL into a page
and it renders live.

You only touch the integration to fine-tune a frame's default height:

1. Add the key to `DEFAULT_ASPECT` in `gitbook-integration/src/index.tsx` (lower number
   = taller frame). Optionally add it to `scripts/gen-oembed.mjs` for other platforms.
2. Republish:
   ```bash
   cd gitbook-integration
   npx gitbook publish .
   ```

To add the prose guide to GitBook, write `gitbook/<topic>.md` (copy
`gitbook/po-shipping-address.md`), reference the tool with an embed block:

```
{% embed url="https://dpartida-antera.github.io/documentation/embed/<topic>-tool" %}
```

then add a line to `gitbook/SUMMARY.md`, and import it into GitBook.

## Checklist

- [ ] `core/<topic>-rules.ts` + `models.ts` types + `*.spec.ts`
- [ ] `features/<topic>-scenarios.ts` (expected computed from the engine)
- [ ] `features/<topic>-tool.component.ts` (reuses `.card.tool`)
- [ ] `src/content/<topic>-guide.json`
- [ ] `features/<topic>-guide.component.ts`
- [ ] `features/<topic>-qa.component.ts` (unique `storageKey`)
- [ ] `core/flow-specs.ts` flowchart(s)
- [ ] routes in `app.routes.ts` + tiles in `hub.component.ts`
- [ ] embed `@case` (+ `embed-split` if side by side) in `embed.component.ts`
- [ ] `npm run build` green, commit, push
- [ ] GitBook: paste the embed URL; optionally write `gitbook/<topic>.md` and tune
      `DEFAULT_ASPECT`
