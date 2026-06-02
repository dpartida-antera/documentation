import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QaRunnerComponent } from '../shared/qa-runner.component';
import { SHIPPING_QA_SCENARIOS } from './shipping-scenarios';

@Component({
  selector: 'app-shipping-qa',
  standalone: true,
  imports: [QaRunnerComponent, RouterLink],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">PO Shipping QA Runner</div>
      <div class="docsub">Interactive regression checklist</div>
      <nav>
        <a class="section">Related</a>
        <a routerLink="/shipping">Shipping guide</a>
      </nav>
    </aside>
    <main class="doc">
      <div class="hero">
        <h1>PO Shipping QA Runner</h1>
        <p>Every shipping-address scenario as a live, trackable checklist. Expected results are computed by the same rules engine the guide uses, so this sheet can never drift. Save runs to keep a history.</p>
        <span class="pill">Auto-saves in your browser · Export CSV / JSON</span>
      </div>
      <app-qa-runner [scenarios]="scenarios" storageKey="antera_po_qa" csvPrefix="po-shipping-qa" />
    </main>
  </div>`,
})
export class ShippingQaComponent { scenarios = SHIPPING_QA_SCENARIOS; }
