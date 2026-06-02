import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AllocationSimulatorComponent } from './allocation-simulator.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { ALLOCATION_FLOWS } from '../core/flow-specs';
import { ALLOCATION_QA_SCENARIOS } from './allocation-scenarios';
import { QaScenario } from '../shared/qa-runner.component';
import { mdInline } from '../core/markdown';
import content from '../../content/auto-allocation-guide.json';

@Component({
  selector: 'app-auto-allocation-guide',
  standalone: true,
  imports: [FormsModule, RouterLink, AllocationSimulatorComponent, FlowTabsComponent],
  styles: [`
    .loc-inline{font-size:12.5px;color:var(--navy-2);background:#f3f6fb;border:1px solid #dde6f1;border-radius:6px;padding:2px 8px;white-space:nowrap}
    .shotgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px}
    .shot{border:1px solid var(--line);border-radius:10px;background:#fafbfd;padding:14px;font-size:12.5px;color:var(--muted)}
    .shot b{display:block;color:var(--navy);font-size:13px;margin-bottom:3px}
    .shot a.img{display:block;margin-top:8px}
    .shot img{width:100%;border-radius:7px;border:1px solid var(--line);display:block;cursor:zoom-in}
  `],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">Auto Allocation Guide</div>
      <div class="docsub">QA &amp; Support reference</div>
      <nav>
        <a class="section">Understand</a>
        <a href="#start">How it works</a>
        <a href="#prereq">Prerequisites</a>
        <a href="#flags">Settings &amp; flags</a>
        <a href="#outcomes">Allocation outcomes</a>
        <a href="#warehouse">Warehouse priority</a>
        <a href="#parent">Parent to Child transfer</a>
        <a class="section">Use</a>
        <a href="#tool">Allocation simulator</a>
        <a href="#flows">Decision flowcharts</a>
        <a href="#scenarios">Scenario library</a>
        <a routerLink="/auto-allocation/qa">QA test runner</a>
      </nav>
    </aside>

    <main class="doc">
      <div class="hero">
        <h1>{{ c.hero.title }}</h1>
        <p [innerHTML]="md(c.hero.lead)"></p>
        <span class="pill">Intended behavior reference · Standard &amp; Store orders</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>How auto-allocation works, in one minute</h2>
        <p class="lead" [innerHTML]="md(c.sections.start.lead)"></p>
        <div class="info" [innerHTML]="md(c.sections.start.info)"></div>
        <p [innerHTML]="md(c.sections.start.body)"></p>
      </section>

      <section id="prereq">
        <h2><span class="num">02</span>Prerequisites, when auto-allocation runs</h2>
        <p class="lead" [innerHTML]="md(c.sections.prereq.lead)"></p>
        <table>
          <thead><tr><th style="width:300px">Requirement</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td><b>Order is Pending</b></td><td>Allocation happens when a pending order is booked.</td></tr>
            <tr><td><b>Auto Allocation is ON</b></td><td>Enabled in Admin, Antera Admin, Settings, Orders, Inventory Sourcing.</td></tr>
            <tr><td><b>Order has line items</b></td><td>There must be at least one line item to evaluate.</td></tr>
            <tr><td><b>Product Li Type = Stock</b></td><td>Set on the product (the Li Type field). Only Stock-type products are eligible.</td></tr>
          </tbody>
        </table>
        <div class="note" [innerHTML]="md(c.sections.prereq.note)"></div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>Settings &amp; flags</h2>
        <p class="lead" [innerHTML]="md(c.sections.flags.lead)"></p>
        <table>
          <thead><tr><th style="width:230px">Setting</th><th>What it does</th><th style="width:260px">Where to find it</th></tr></thead>
          <tbody>
            <tr><td><b>Auto Allocation</b></td><td>Master switch. Must be ON for allocation to run.</td><td><span class="loc-inline">Admin ▸ Antera Admin ▸ Settings ▸ Orders</span></td></tr>
            <tr><td><b>Allow No/Low Stock Allocation</b></td><td>Backorder mode. Keeps one Stock line and records shortfalls as backorders.</td><td><span class="loc-inline">Admin ▸ Settings ▸ Orders</span></td></tr>
            <tr><td><b>Li Type = Stock</b></td><td>Makes a product eligible for allocation.</td><td><span class="loc-inline">Product record · Li Type field</span></td></tr>
            <tr><td><b>Matrix PO type (Source)</b></td><td>Per line-item: source from Stock or DropShip.</td><td><span class="loc-inline">Order ▸ line item · Source</span></td></tr>
            <tr><td><b>Warehouse priority &amp; Default</b></td><td>Global priority via the Auto Allocation Priority column; Default toggle marks the fallback.</td><td><span class="loc-inline">Admin ▸ Configuration ▸ Warehouse</span></td></tr>
            <tr><td><b>Customer override + Search Warehouses for Stock</b></td><td>Per-customer priority; optional scan of all warehouses.</td><td><span class="loc-inline">Customer ▸ Warehouse tab</span></td></tr>
            <tr><td><b>Share Parent Inventory</b></td><td>Lets a child pull inventory from its parent at booking.</td><td><span class="loc-inline">Product ▸ Child Product Settings</span></td></tr>
            <tr><td><b>Allow Transfer Parent Inventory to Child Pre-Decorated Products</b> <span class="badge">Aether Orders Only</span></td><td>System-level enable for parent to child transfer.</td><td><span class="loc-inline">Admin ▸ Settings ▸ Orders</span></td></tr>
          </tbody>
        </table>

        <h3>Setting locations</h3>
        <p style="margin:0 0 6px;color:var(--muted);font-size:13.5px">Where each setting lives in Antera. Click any image to open it full size.</p>
        <div class="shotgrid">
          <div class="shot"><b>Auto Allocation · Backorder · Parent-transfer</b>Admin ▸ Settings ▸ Orders ▸ Inventory Sourcing<a class="img" href="assets/screenshots/auto-allocation-backorder.png" target="_blank" rel="noopener"><img src="assets/screenshots/auto-allocation-backorder.png" alt="Inventory Sourcing settings" /></a></div>
          <div class="shot"><b>Li Type = Stock</b>Product record · Li Type field<a class="img" href="assets/screenshots/li-type-stock.png" target="_blank" rel="noopener"><img src="assets/screenshots/li-type-stock.png" alt="Product Li Type = Stock" /></a></div>
          <div class="shot"><b>Matrix PO type / Source</b>Order ▸ line item · Source<a class="img" href="assets/screenshots/matrix-po-type.png" target="_blank" rel="noopener"><img src="assets/screenshots/matrix-po-type.png" alt="Source Stock and DropShip" /></a></div>
          <div class="shot"><b>Global warehouses · Default · Priority</b>Admin ▸ Configuration ▸ Warehouse<a class="img" href="assets/screenshots/global-warehouses-default.png" target="_blank" rel="noopener"><img src="assets/screenshots/global-warehouses-default.png" alt="Warehouse config" /></a></div>
          <div class="shot"><b>Customer override + Search Warehouses</b>Customer ▸ Warehouse tab<a class="img" href="assets/screenshots/customer-warehouse-search.png" target="_blank" rel="noopener"><img src="assets/screenshots/customer-warehouse-search.png" alt="Customer warehouse tab" /></a></div>
          <div class="shot"><b>Share Parent Inventory</b>Product ▸ Child Product Settings<a class="img" href="assets/screenshots/share-parent-inventory.png" target="_blank" rel="noopener"><img src="assets/screenshots/share-parent-inventory.png" alt="Share Parent Inventory toggle" /></a></div>
        </div>
      </section>

      <section id="outcomes">
        <h2><span class="num">04</span>The allocation outcomes</h2>
        <p class="lead" [innerHTML]="md(c.sections.outcomes.lead)"></p>
        <div class="grid g3">
          <div class="card doc-card"><span class="tag">Full</span><h4>All Stock</h4><p>Stock covers the row. It stays Stock and inventory is reserved. No DropShip line.</p></div>
          <div class="card doc-card"><span class="tag">Partial · default</span><h4>Stock + DropShip line</h4><p>The covered quantity stays Stock; the shortfall (plus any fully-unstocked sizes) moves to a new DropShip line.</p></div>
          <div class="card doc-card"><span class="tag">Partial · backorder</span><h4>Stock + Backorder</h4><p>With Backorder mode on, nothing splits off. The line stays a single Stock line and the shortfall is stored as a backorder (bell).</p></div>
        </div>
        <div class="note" [innerHTML]="md(c.sections.outcomes.note)"></div>
      </section>

      <section id="warehouse">
        <h2><span class="num">05</span>Warehouse priority &amp; fallback</h2>
        <p class="lead" [innerHTML]="md(c.sections.warehouse.lead)"></p>
        <table>
          <thead><tr><th style="width:60px">Order</th><th>Warehouse</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td><b>1</b></td><td>Primary</td><td>Customer override if set, otherwise global.</td></tr>
            <tr><td><b>2</b></td><td>Secondary</td><td>Customer override or global.</td></tr>
            <tr><td><b>3</b></td><td>Tertiary</td><td>Customer override or global.</td></tr>
            <tr><td><b>4</b></td><td>Any other warehouse</td><td>Only if Search Warehouses for Stock is ON.</td></tr>
            <tr><td><b>5</b></td><td>Default warehouse</td><td>Final fallback. If empty too, the row follows DropShip / Backorder rules.</td></tr>
          </tbody>
        </table>
        <div class="info" [innerHTML]="md(c.sections.warehouse.info)"></div>
      </section>

      <section id="parent">
        <h2><span class="num">06</span>Parent to Child inventory transfer</h2>
        <p class="lead" [innerHTML]="md(c.sections.parent.lead)"></p>
        <table>
          <thead><tr><th style="width:280px">Rule</th><th>Behavior</th></tr></thead>
          <tbody>
            <tr><td><b>Only Stock-type lines</b></td><td>If the line's Matrix PO type is DropShip, no transfer happens.</td></tr>
            <tr><td><b>Transfer amount</b></td><td>min(shortfall, parent inventory). If the parent can't cover it all, the rest is backordered/dropshipped.</td></tr>
            <tr><td><b>Warehouse type must match</b></td><td>Normally only works when parent and child stock are the same warehouse type (Customer-owned, Distributor-owned, Vendor-owned).</td></tr>
            <tr><td><b>Unless the child has zero</b></td><td>If the child has 0 stock for the items, it can pull from the parent regardless of warehouse type.</td></tr>
            <tr><td><b>Unreserve does not reverse it</b></td><td>If you unreserve the line after booking, the child keeps the transferred inventory.</td></tr>
          </tbody>
        </table>
        <div class="info" [innerHTML]="md(c.sections.parent.info)"></div>
      </section>

      <section id="tool">
        <h2><span class="num">07</span>Allocation simulator</h2>
        <p class="lead" [innerHTML]="md(c.sections.tool.lead)"></p>
        <app-allocation-simulator />
      </section>

      <section id="flows">
        <h2><span class="num">08</span>Decision flowcharts</h2>
        <p class="lead" [innerHTML]="md(c.sections.flows.lead)"></p>
        <app-flow-tabs [flows]="flows" [tabs]="flowTabs" />
      </section>

      <section id="scenarios">
        <h2><span class="num">09</span>Scenario library</h2>
        <div class="filterbar">
          <input type="text" [(ngModel)]="scenQuery" placeholder="Search, e.g. backorder, parent, warehouse, zero" />
        </div>
        <table>
          <thead><tr><th style="width:140px">Group</th><th>Conditions</th><th style="width:330px">Outcome</th></tr></thead>
          <tbody>
            @for (s of filteredScenarios; track s.id) {
              <tr><td><span class="badge">{{ s.group }}</span></td><td>{{ s.cond.join(' · ') }}</td><td><span class="addr-chip">{{ s.expected }}</span></td></tr>
            }
            @if (!filteredScenarios.length) { <tr><td colspan="3" style="color:var(--muted);text-align:center;padding:22px">No scenarios match.</td></tr> }
          </tbody>
        </table>
      </section>

      <div class="footer">Auto Allocation Guide · QA &amp; Support reference · Describes intended system behavior.</div>
    </main>
  </div>`,
})
export class AutoAllocationGuideComponent {
  c = content;
  flows = ALLOCATION_FLOWS;
  flowTabs = [
    { key: 'alloc', label: 'Allocation outcome' },
    { key: 'warehouse', label: 'Warehouse resolution' },
    { key: 'transfer', label: 'Parent to Child transfer' },
  ];
  scenQuery = '';
  md(s: string): string { return mdInline(s); }
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return ALLOCATION_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
