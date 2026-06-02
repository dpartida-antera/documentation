# Understanding this Angular app (for a Rails developer)

This is a guide to this Angular project (the repository root) written for someone who knows Rails but not Angular. It explains the mental model, the TypeScript you will see, how the pieces fit, and how to change or extend things.

---

## 1. The big mental shift

Rails is a server that renders HTML per request. This app is the opposite: it is a **single-page application (SPA)**. The whole thing is compiled into a few JavaScript files, sent to the browser once, and from then on the browser does the rendering and navigation. There is no server rendering controllers and ERB here. If you ever need a server (for shared data or auth), it is a separate API, and this app would call it over HTTP.

So "where is the request cycle?" The answer is: there mostly isn't one. The browser loads `index.html`, boots the app, and the **router** swaps components in and out as the URL changes, all client-side.

### Rails to Angular cheat sheet

| Rails | Here (Angular) |
|---|---|
| `Gemfile` | `package.json` (dependencies + scripts) |
| `bundle install` | `npm install` |
| `rails server` | `npm start` (runs `ng serve`) |
| `config/routes.rb` | `src/app/app.routes.ts` |
| Controller + View (ERB) | A **Component** (one class holds the logic and the template together) |
| Partial (`_form.html.erb`) | A child component (e.g. `<app-flowchart>`) |
| Helpers, POROs, `app/services`, `lib/` | Plain TypeScript modules and **services** in `src/app/core/` |
| ActiveRecord model | A TypeScript `interface` in `models.ts` (just a shape; there is no database here) |
| `app/assets`, asset pipeline | `src/styles.scss`, the `public/` folder, and the `assets` config in `angular.json` |
| RSpec (`*_spec.rb`) | Jasmine specs (`*.spec.ts`) |
| `config/environments/*` | `app.config.ts` and Angular environment files |
| `rails console` | Browser DevTools console, or Node for pure logic |
| Strong params / validations | TypeScript **types** (checked at compile time, not runtime) |

---

## 2. TypeScript in five minutes

TypeScript is JavaScript with type annotations. The types are checked when you build and then erased; at runtime it is just JavaScript.

```ts
// a type alias (a closed set of allowed string values, like an enum)
export type ShippingDoc = 'blank' | 'decorator' | 'supplier';

// an interface describes the shape of an object (like documenting a Hash)
export interface AllocRow {
  size: string;
  required: number;
  stock: number;
  parentStock?: number;   // the ? means optional
}

// a plain function with typed inputs and output
export function allocate(rows: AllocRow[], o: AllocOptions = {}): AllocResult {
  // ...
}
```

Things a Rubyist will notice:

- `const` and `let` instead of just assigning. `const` is a constant binding.
- Arrow functions `(x) => x + 1` are Ruby lambdas. `rows.map(r => r.size)` is `rows.map { |r| r.size }`.
- `import { allocate } from './allocation-rules'` is like `require` plus an explicit list of what you are pulling in. `export` makes something importable. There is no autoloading; every dependency is imported by path.
- `foo?.bar` is the safe-navigation operator (`foo&.bar` in Ruby).
- `x as Type` is a type assertion ("trust me, treat this as this type"). It does nothing at runtime.
- Template strings use backticks: `` `Ships to ${name}` `` is `"Ships to #{name}"`.

You do not need to be a TypeScript expert to work here. The rules engine is just functions and objects.

---

## 3. How the app boots and routes

1. `src/index.html` has one tag: `<app-root></app-root>`.
2. `src/main.ts` calls `bootstrapApplication(AppComponent, appConfig)`. That is the entry point (think of it as `config.ru` + the root layout).
3. `AppComponent` (`src/app/app.component.ts`) is the shell: it renders the top bar and a `<router-outlet />`. The router fills that outlet with whatever component matches the URL.
4. `src/app/app.routes.ts` maps URLs to components, lazily:

```ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/hub.component').then(m => m.HubComponent) },
  { path: 'shipping', loadComponent: () => import('./features/shipping-guide.component').then(m => m.ShippingGuideComponent) },
  { path: 'shipping/qa', loadComponent: () => import('./features/shipping-qa.component').then(m => m.ShippingQaComponent) },
  { path: 'auto-allocation', loadComponent: () => import('./features/auto-allocation-guide.component').then(m => m.AutoAllocationGuideComponent) },
  { path: 'auto-allocation/qa', loadComponent: () => import('./features/auto-allocation-qa.component').then(m => m.AutoAllocationQaComponent) },
  { path: '**', redirectTo: '' },
];
```

`loadComponent` with `import(...)` means the code for that page is only downloaded when you visit it (code splitting). This is why the build prints separate "chunk" files per page.

---

## 4. What a component is

A component is the unit that replaces "controller + view." It is a class with a `@Component({...})` decorator. The decorator is metadata (similar in spirit to a Rails macro like `has_many`). Here is the smallest one in the app, the shell:

```ts
@Component({
  selector: 'app-root',          // the custom HTML tag for this component
  standalone: true,              // no NgModule needed (modern Angular)
  imports: [RouterOutlet, RouterLink],   // other components/directives this template uses
  template: `
    <div class="topbar">...</div>
    <router-outlet />
  `,
})
export class AppComponent {}
```

Key parts:

- **selector**: the tag you write to use it, e.g. `<app-flowchart>`.
- **template**: the HTML. Can be inline (as above) or in a separate `.html` file. In this project most are inline to keep each feature in one file.
- **imports**: because these are "standalone" components, each one declares exactly which other components, directives, and pipes its template uses (for example `FormsModule` for two-way form binding). This is the closest thing to a `require` for templates.
- The **class body** holds the data and methods the template can reference. Public fields and getters are available to the template.

### Template syntax (vs ERB)

| Goal | ERB | Here |
|---|---|---|
| Print a value | `<%= name %>` | `{{ name }}` |
| Set an attribute from data | `class="<%= css %>"` | `[class]="css"` or `[attr.x]="val"` |
| Handle a click | (JS / form) | `(click)="doThing()"` |
| Two-way form field | form helpers | `[(ngModel)]="row.stock"` |
| Conditional | `<% if x %>` | `@if (x) { ... }` |
| Loop | `<% items.each do |i| %>` | `@for (i of items; track i.id) { ... }` |

`@if` and `@for` are Angular's built-in control flow. `track` tells Angular how to identify list items so it can update efficiently (like a React key).

Example from the determination tool:

```html
@for (t of toggles[doc]; track t.id) {
  <div class="toggle-row" [class.disabled]="!isActive(t)">
    <div class="lbl">{{ t.label }}<small>{{ t.sub }}</small></div>
    <label class="sw">
      <input type="checkbox" [checked]="!!flags[t.id]" (change)="toggle(t, $event)" />
      <span></span>
    </label>
  </div>
}
```

When `toggle()` changes a field, Angular automatically re-renders the parts of the template that depend on it. You do not manually re-render. (This is "change detection." For this app you can treat it as "the screen reflects the fields, always.")

---

## 5. The folder layout

```
src/app/
  core/        the brains: pure logic, types, and services (no UI)
  shared/      reusable UI components used by more than one page
  features/    one folder-worth of components per route (the pages)
```

This mirrors a Rails instinct: `core/` is your `app/services` + `app/models` (as types), `shared/` is your shared partials/components, `features/` is your controllers+views grouped by feature.

### `core/` (the important part)

- **`models.ts`**: every shared type/interface. No logic. Read this first to learn the vocabulary (`ShippingFlags`, `AllocRow`, `FlowSpec`, `QaScenario`, etc.).
- **`shipping-rules.ts`**: the PO shipping decision logic as pure functions (`decideBlank`, `decideChain`, `decide`) plus the `ADDR` and `SHIPFROM` data. This is a "service object" with no side effects.
- **`allocation-rules.ts`**: the auto-allocation logic (`allocate`, `parentTransfer`).
- **`flow-layout.ts`**: pure geometry that turns a flowchart definition into positioned shapes.
- **`flow-specs.ts`**: the six flowcharts as data (`SHIPPING_FLOWS`, `ALLOCATION_FLOWS`).
- **`qa-state.service.ts`**: a service that reads/writes the browser's localStorage safely.
- **`export.util.ts`**: helpers to download CSV/JSON.
- **`*.spec.ts`**: the tests for the rules (the Jasmine equivalent of RSpec).

The design rule worth remembering: **all the business logic lives in `core/` as plain functions, and the UI imports it.** The interactive tools and the QA runners both call the exact same `decide()` and `allocate()`, so the "expected" answers a tester sees are computed by the same code the guide explains. They cannot disagree.

### A look at the rules logic

```ts
// shipping-rules.ts (abridged)
export function decideChain(f: ShippingFlags): ShippingResult {
  const isFinal = !f.additionalVendors || !!f.isFinalPO;
  if (!isFinal) return { a: 'secondBeyond', p: ['Additional vendors', 'NOT the final PO', 'hand off to the next decorator'] };
  if (f.alternateShipTo) return { a: 'alternate', p: ['Final PO', 'Alternate Ship To = Yes'] };
  if (f.shipToUsUponCompletion) {
    if (f.destWarehouse) return { a: 'warehouse', p: [/* ... */] };
    if (f.corpIdentity) return { a: 'corpIdentity', p: [/* ... */] };
    return { a: 'partner', p: [/* ... */] };
  }
  return { a: 'order', p: ['Final PO', 'No alternate', 'No Ship to Us', 'to Customer'] };
}
```

It returns an object: `a` is which address key won, `p` is the human "why" trail. The UI looks up `ADDR[a]` for the display name and shows `p.join(' to ')`. Pure input to output, easy to test.

### Services and dependency injection

`QaStateService` is marked `@Injectable({ providedIn: 'root' })`, which makes it a singleton you can ask for anywhere. A component receives it through its constructor:

```ts
constructor(private state: QaStateService) {}
```

That is dependency injection. Compared to Rails, think of a singleton service object that Angular hands you automatically instead of you calling `MyService.new`. `providedIn: 'root'` is "one instance for the whole app."

---

## 6. The reusable pieces in `shared/`

- **`flowchart.component.ts`**: give it a `FlowSpec` and it draws an SVG flowchart. Used as `<app-flowchart [spec]="mySpec" />`. The actual positioning math is in `core/flow-layout.ts`; the component just renders shapes from that.
- **`flow-tabs.component.ts`**: a tab strip plus a flowchart, for pages that show several diagrams.
- **`qa-runner.component.ts`**: the entire QA checklist UI (status tracking, search/filter, progress summary, run history with a tester name, CSV/JSON export and import). It is **generic**: a page hands it a flat list of `QaScenario` and a storage key, and it does the rest. Both QA pages are just a few lines that pass in their scenarios.

This is the payoff of the rebuild: the QA runner exists once, not copy-pasted per page.

---

## 7. How to do common things

### Run, build, test

```bash
npm install        # once
npm start          # dev server with live reload at http://localhost:4200
npm run build      # production build into dist/
npm test           # unit tests (needs Chrome installed; opens Karma)
```

### Change a business rule

1. Edit the function in `core/shipping-rules.ts` or `core/allocation-rules.ts`.
2. Update or add a case in the matching `*.spec.ts`.
3. Every page that uses it (tool, simulator, QA runner) updates automatically, because they all import the same function. Run `npm test` to confirm nothing else broke.

### Add a QA scenario

Open `features/shipping-scenarios.ts` or `features/allocation-scenarios.ts`. These are plain data arrays (`RAW`). Add an object following the existing shape. If it has the inputs needed to compute an answer (a `doc` + `flags`, or `alloc`/`transfer`), the `expected` value is computed for you by the rules engine; otherwise set `manualExpected`. No UI changes needed; it shows up in both the guide's scenario library and the QA runner.

### Add a flowchart

Add an entry to `core/flow-specs.ts` in the shape of the others (`vb` is the SVG viewbox size, `nodes` are boxes/diamonds with x/y/width/text/type, `edges` connect node ids with a `from`/`to` side and optional label). Then render it: `<app-flowchart [spec]="ALLOCATION_FLOWS['warehouse']" />`, or add it to a `flow-tabs` tab list. You never touch SVG drawing code; the layout engine handles it.

### Add a whole new guide page

This is the "new controller + view + route" flow:

1. **Create the component** `src/app/features/returns-guide.component.ts`:

   ```ts
   import { Component } from '@angular/core';
   import { RouterLink } from '@angular/router';

   @Component({
     selector: 'app-returns-guide',
     standalone: true,
     imports: [RouterLink],
     template: `
       <div class="doc-layout">
         <aside class="docnav"><a class="backlink" routerLink="/">All guides</a>...</aside>
         <main class="doc">
           <div class="hero"><h1>Returns &amp; RMA</h1></div>
           <section><h2><span class="num">01</span>Overview</h2><p class="lead">...</p></section>
         </main>
       </div>`,
   })
   export class ReturnsGuideComponent {}
   ```

2. **Register the route** in `app.routes.ts`:

   ```ts
   { path: 'returns', loadComponent: () => import('./features/returns-guide.component').then(m => m.ReturnsGuideComponent) },
   ```

3. **Add a hub tile** in `features/hub.component.ts` (copy an existing `<a class="doc-tile" routerLink="...">` block).

That is the whole loop. Reuse `<app-flowchart>`, `<app-flow-tabs>`, or `<app-qa-runner>` inside the new page if you need them.

### Reuse the QA runner for a new checklist

```ts
import { QaRunnerComponent, QaScenario } from '../shared/qa-runner.component';

const scenarios: QaScenario[] = [
  { id: 'X-1', group: 'My group', title: 'Something', cond: ['a', 'b'], expected: 'result', computed: false },
];
// in a component template:
// <app-qa-runner [scenarios]="scenarios" storageKey="my_feature_qa" csvPrefix="my-feature-qa" />
```

### Change styling

Global look comes from `src/styles/antera.css` (the documentation design system, reused as-is) imported by `src/styles.scss`. Component-specific CSS lives in that component's `styles: [...]` block and is automatically scoped to that component only (Angular adds attributes so it cannot leak). The design tokens are the CSS variables at the top of `antera.css` (`--navy`, `--blue`, `--line`, etc.).

---

## 8. Where data lives, and the road to a backend

Right now there is **no database**. The QA runner saves results and run history in the browser's `localStorage` through `QaStateService`, keyed per suite. That is durable on one machine but not shared.

To make runs shared across people, you add a backend (a small API plus a database, or reuse Antera's existing backend) and swap `QaStateService` to call it over HTTP instead of localStorage. Because every page goes through that one service, that swap is localized. The migration plan (`ANGULAR_MIGRATION_PLAN.md`, section 7.1) sketches the `qa_run` + `qa_result` tables for this.

---

## 9. A few gotchas coming from Rails

- **Types are compile-time only.** They will not validate user input at runtime; they catch developer mistakes during `npm run build` / in the editor. Runtime validation is still your job if you add forms that matter.
- **No autoloading.** If you use something, you `import` it explicitly by path. The editor will usually auto-add the import.
- **The build is the source of truth for "does it work."** `npm run build` does the same compilation as production and will fail loudly on a template typo or type error. Treat a green build like a green test suite for "it at least compiles."
- **Components re-render from their fields.** You change a field, the template updates. You do not manually push HTML. Avoid reaching into the DOM directly.
- **`*.spec.ts` files need a browser to run** (Karma launches Chrome). The pure logic in `core/` can also be exercised without a browser if you ever want a fast headless check.

---

## 10. Suggested reading order in the code

1. `core/models.ts` (the vocabulary)
2. `core/shipping-rules.ts` and `core/allocation-rules.ts` (the brains, plus their `.spec.ts`)
3. `features/determination-tool.component.ts` (a small component that consumes a rule)
4. `shared/flowchart.component.ts` + `core/flow-layout.ts` (data to SVG)
5. `shared/qa-runner.component.ts` (the one big generic component)
6. `features/*-guide.component.ts` (how a page assembles prose + the shared components)

Start there and the rest will make sense.
