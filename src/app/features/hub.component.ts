import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import rawPages from '../../content/custom-pages.json';

const customPages = rawPages.pages as Array<{ slug: string; title: string; subtitle?: string }>;

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="hub-hero">
    <div class="inner">
      <h1>Antera Documentation</h1>
      <p>Internal reference for QA and Support. Pick a guide below. Each one explains how a part of the system is <i>supposed</i> to work, with searchable references and tools to confirm any case quickly.</p>
    </div>
  </div>

  <div class="hub-main">
    <div class="hub-section-title"><h2>Guides</h2><div class="rule"></div></div>
    <div class="doc-grid">

      <a class="doc-tile" routerLink="/shipping">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <h3>PO Shipping Address Guide</h3>
        <p>How the system decides where every purchase order ships: documents, flags, the seven destination addresses, and an interactive determination tool.</p>
        <div class="meta"><span class="status live">Live</span> · QA &amp; Support</div>
      </a>

      <a class="doc-tile" routerLink="/shipping/qa">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h3>PO Shipping QA Runner</h3>
        <p>Every shipping-address scenario as a live, trackable checklist with expected results computed from the rules engine, pass/fail tracking, run history, and CSV/JSON export.</p>
        <div class="meta"><span class="status live">Live</span> · QA &amp; Support</div>
      </a>

      <a class="doc-tile" routerLink="/auto-allocation">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
        </div>
        <h3>Auto Allocation Guide</h3>
        <p>How booking allocates stock line-by-line: partial stock, backorders, warehouse priority, and parent to child inventory transfer, with an interactive simulator and flowcharts.</p>
        <div class="meta"><span class="status live">Live</span> · QA &amp; Support</div>
      </a>

      <a class="doc-tile" routerLink="/auto-allocation/qa">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h3>Auto Allocation QA Runner</h3>
        <p>Every allocation and parent-transfer scenario as a trackable checklist with expected outcomes computed from the rules engine, run history, and export.</p>
        <div class="meta"><span class="status live">Live</span> · QA &amp; Support</div>
      </a>

    </div>

    @if (pages.length) {
      <div class="hub-section-title" style="margin-top:32px"><h2>More guides</h2><div class="rule"></div></div>
      <div class="doc-grid">
        @for (p of pages; track p.slug) {
          <a class="doc-tile" [routerLink]="'/guide/' + p.slug">
            <div class="ic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3>{{ p.title }}</h3>
            @if (p.subtitle) { <p>{{ p.subtitle }}</p> }
            <div class="meta"><span class="status live">Live</span> · QA &amp; Support</div>
          </a>
        }
      </div>
    }
  </div>

  <div class="footer" style="max-width:1700px;margin:0 auto">
    Antera Documentation · Internal QA &amp; Support knowledge base · Describes intended system behavior.
  </div>
  `,
})
export class HubComponent {
  pages = customPages;
}
