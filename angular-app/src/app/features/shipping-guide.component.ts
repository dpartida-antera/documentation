import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeterminationToolComponent } from './determination-tool.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { SHIPPING_FLOWS } from '../core/flow-specs';
import { SHIPPING_QA_SCENARIOS } from './shipping-scenarios';
import { QaScenario } from '../shared/qa-runner.component';

@Component({
  selector: 'app-shipping-guide',
  standalone: true,
  imports: [FormsModule, RouterLink, DeterminationToolComponent, FlowTabsComponent],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">PO Shipping Address Guide</div>
      <div class="docsub">QA &amp; Support reference</div>
      <nav>
        <a class="section">Understand</a>
        <a href="#start">How shipping works</a>
        <a href="#docs">The three PO documents</a>
        <a href="#flags">Settings &amp; flags</a>
        <a href="#priority">Priority rules</a>
        <a class="section">Use</a>
        <a href="#tool">Determination tool</a>
        <a href="#flows">Decision flowcharts</a>
        <a href="#scenarios">Scenario library</a>
        <a class="section">Reference</a>
        <a href="#glossary">Glossary</a>
        <a routerLink="/shipping/qa">QA test runner</a>
      </nav>
    </aside>

    <main class="doc">
      <div class="hero">
        <h1>PO Shipping Address Guide</h1>
        <p>How the system decides <i>where every purchase order ships</i>, written for QA and Support. Start with the mental model, then use the interactive tool to confirm any case in seconds.</p>
        <span class="pill">Intended behavior reference · Standard &amp; Store orders</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>How shipping works, in one minute</h2>
        <p class="lead">Every order is broken into one or more <b>Purchase Orders (POs)</b>. Each PO is a document telling one party to send goods somewhere. The system answers a single question for each PO: <b>what address goes in the Ship To block?</b></p>
        <div class="info"><b>The whole system is three inputs feeding one decision.</b><br>1) <b>Which document</b> is this (Blank PO, Decorator PO, or Supplier Decorated PO)? 2) <b>Which flags</b> are set on the order/product? 3) The system walks a <b>decision tree</b> and picks one of seven possible <b>destination addresses</b>.</div>
        <p>The goal is to route product through the right hands: a blank garment may need to reach a decorator before it reaches the customer; a finished item may go straight to the buyer; sometimes everything routes back to your own warehouse first.</p>
      </section>

      <section id="docs">
        <h2><span class="num">02</span>The three PO documents</h2>
        <p class="lead">A single order can generate more than one of these. Each follows its own decision tree because they sit at different points in the production chain.</p>
        <div class="grid g3">
          <div class="card doc-card"><span class="tag">Blank PO</span><h4>Undecorated goods from a supplier</h4><p>Orders blank product from the blank supplier. If the item is decorated, the blank usually has to reach a decorator before going anywhere else.</p></div>
          <div class="card doc-card"><span class="tag">Decorator PO</span><h4>Sends work to a decorator</h4><p>Goes to the vendor doing the decoration when decoration is done by a <i>different</i> vendor than the blank supplier.</p></div>
          <div class="card doc-card"><span class="tag">Supplier Decorated PO</span><h4>Supplier also decorates</h4><p>Used when the product and its decoration come from the <i>same</i> supplier. Follows the same address logic as a Decorator PO.</p></div>
        </div>
        <div class="note"><b>Multi-decoration chains:</b> when an item carries decorations from several vendors, POs hand off in sequence, Supplier to Decorator 1 to Decorator 2 to final destination. Only the <b>final</b> PO ships to the customer (or Alternate address); every earlier PO ships to the <i>next</i> decorator.</div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>Settings &amp; flags that drive the decision</h2>
        <p class="lead">These are the toggles a CSR sets on the order, product, or partner configuration. Each one can redirect where a PO ships.</p>
        <table>
          <thead><tr><th style="width:230px">Flag</th><th>What it means</th><th style="width:240px">Effect when ON</th></tr></thead>
          <tbody>
            <tr><td><b>Decorated</b></td><td>The item has artwork applied.</td><td>Opens the decorator routing branch (Blank PO).</td></tr>
            <tr><td><b>Alternate Ship To</b></td><td>A specific override address was entered on the order.</td><td><b>Highest priority.</b> Sends the final PO to that address.</td></tr>
            <tr><td><b>Ship to Us Instead of Decorator</b></td><td>Route blanks back to your own location rather than to the decorator.</td><td>Triggers the Ship to Us branch on a decorated Blank PO.</td></tr>
            <tr><td><b>Ship to Us Upon Completion</b></td><td>Route goods back to your location instead of out to the customer.</td><td>Triggers the Ship to Us branch on Decorator / Supplier Decorated POs, and on an undecorated Blank PO.</td></tr>
            <tr><td><b>Destination Warehouse Setting</b></td><td>A warehouse is configured to receive Ship to Us goods.</td><td>Ship-to-Us goods go to the Destination Warehouse Address, but only if the Prioritize Warehouse admin setting is also On.</td></tr>
            <tr><td><b>Corporate Identity Assigned</b></td><td>The order is tied to a Corporate Identity location.</td><td>Used as the Ship-to-Us address when no warehouse is set.</td></tr>
            <tr><td><b>Additional Decorations / This is the FINAL PO</b></td><td>Describe where this PO sits in the decoration chain. On their own they do not change the address.</td><td>If another decorator comes next, this PO ships to the next decorator; if final, the normal checks decide.</td></tr>
          </tbody>
        </table>
      </section>

      <section id="priority">
        <h2><span class="num">04</span>Priority rules</h2>
        <p class="lead">When more than one flag is set, the system resolves conflicts in a fixed order. This single rule explains most "why did it ship there?" questions.</p>
        <div class="grid g3">
          <div class="card doc-card"><span class="tag">1 · Highest</span><h4>Alternate Ship To</h4><p>If an Alternate address is set, it wins over Ship-to-Us and default routing on the final PO.</p></div>
          <div class="card doc-card"><span class="tag">2</span><h4>Ship to Us settings</h4><p>If no Alternate address, Ship-to-Us routing (warehouse to corporate identity to partner) applies.</p></div>
          <div class="card doc-card"><span class="tag">3 · Default</span><h4>Vendor / Order</h4><p>With no overrides, the Supplier PO ships from Vendor and the Decorator PO ships to the Order address.</p></div>
        </div>
        <div class="note"><b>Within Ship to Us there is a sub-priority:</b> Destination Warehouse, then Corporate Identity, then Partner Address. The Destination Warehouse step only applies when the admin setting "Prioritize Warehouse Address on Ship To Us Toggles" is On.</div>
      </section>

      <section id="tool">
        <h2><span class="num">05</span>Address determination tool</h2>
        <p class="lead">Pick a document, flip the flags as they appear on the order, and the tool shows the exact destination, its data source, and the fields you should see in the address block.</p>
        <app-determination-tool />
      </section>

      <section id="flows">
        <h2><span class="num">06</span>Decision flowcharts</h2>
        <p class="lead">The same logic the tool uses, drawn out. Diamonds are flag checks; green boxes are destinations.</p>
        <app-flow-tabs [flows]="flows" [tabs]="flowTabs" />
      </section>

      <section id="scenarios">
        <h2><span class="num">07</span>Scenario library</h2>
        <p class="lead">Worked examples of intended behavior. Search by keyword to confirm what should happen for a given flag combination.</p>
        <div class="filterbar">
          <input type="text" [(ngModel)]="scenQuery" placeholder="Search scenarios, e.g. warehouse, corporate identity, alternate" />
        </div>
        <table>
          <thead><tr><th style="width:160px">Group</th><th>Conditions</th><th style="width:300px">Ships to</th></tr></thead>
          <tbody>
            @for (s of filteredScenarios; track s.id) {
              <tr><td><span class="badge">{{ s.group }}</span></td><td>{{ s.cond.join(' · ') }}</td><td><span class="addr-chip">{{ s.expected }}</span></td></tr>
            }
            @if (!filteredScenarios.length) { <tr><td colspan="3" style="color:var(--muted);text-align:center;padding:22px">No scenarios match.</td></tr> }
          </tbody>
        </table>
      </section>

      <section id="glossary">
        <h2><span class="num">08</span>Glossary</h2>
        <table><tbody>
          <tr><td style="width:240px"><b>PO (Purchase Order)</b></td><td>A document instructing one party to supply/decorate/ship goods. One order can spawn several.</td></tr>
          <tr><td><b>Final / Final Decorator PO</b></td><td>The last PO in a decoration chain, the one that ships to the customer or Alternate address.</td></tr>
          <tr><td><b>Ship to Us</b></td><td>Routing goods back to your own location (warehouse to corporate identity to partner) instead of onward.</td></tr>
          <tr><td><b>Alternate Ship To</b></td><td>A one-off override address entered on the order; highest routing priority.</td></tr>
        </tbody></table>
      </section>

      <div class="footer">PO Shipping Address Guide · QA &amp; Support reference · Describes intended system behavior.</div>
    </main>
  </div>`,
})
export class ShippingGuideComponent {
  flows = SHIPPING_FLOWS;
  flowTabs = [
    { key: 'blank', label: 'Blank PO' },
    { key: 'decorator', label: 'Decorator PO' },
    { key: 'supplier', label: 'Supplier Decorated PO' },
  ];
  scenQuery = '';
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return SHIPPING_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
