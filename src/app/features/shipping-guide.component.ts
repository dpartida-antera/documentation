import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeterminationToolComponent } from './determination-tool.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { SHIPPING_FLOWS } from '../core/flow-specs';
import { SHIPPING_QA_SCENARIOS } from './shipping-scenarios';
import { QaScenario } from '../shared/qa-runner.component';
import { DocSection } from '../core/models';
import { DocSectionComponent } from '../shared/doc-section.component';
import { MdInlinePipe } from '../shared/md-inline.pipe';
import rawContent from '../../content/shipping-guide.json';

const content = rawContent as typeof rawContent & { extra_sections: DocSection[] };

@Component({
  selector: 'app-shipping-guide',
  standalone: true,
  imports: [FormsModule, RouterLink, DeterminationToolComponent, FlowTabsComponent, DocSectionComponent, MdInlinePipe],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">{{ c.hero.title }}</div>
      <div class="docsub">QA &amp; Support reference</div>
      <nav>
        <a class="section">Understand</a>
        <a [routerLink]="[]" fragment="start">{{ c.sections.start.heading }}</a>
        <a [routerLink]="[]" fragment="docs">{{ c.sections.docs.heading }}</a>
        <a [routerLink]="[]" fragment="flags">{{ c.sections.flags.heading }}</a>
        <a [routerLink]="[]" fragment="priority">{{ c.sections.priority.heading }}</a>
        <a class="section">Use</a>
        <a [routerLink]="[]" fragment="tool">{{ c.sections.tool.heading }}</a>
        <a [routerLink]="[]" fragment="flows">{{ c.sections.flows.heading }}</a>
        <a [routerLink]="[]" fragment="scenarios">{{ c.sections.scenarios.heading }}</a>
        <a class="section">Reference</a>
        <a [routerLink]="[]" fragment="glossary">{{ c.sections.glossary.heading }}</a>
        <a routerLink="/shipping/qa">QA test runner</a>
        @if (extraSections.length) {
          <a class="section">More</a>
          @for (s of extraSections; track s.id) {
            <a [routerLink]="[]" [fragment]="s.id">{{ s.heading }}</a>
          }
        }
      </nav>
    </aside>

    <main class="doc">
      <div class="hero">
        <h1>{{ c.hero.title }}</h1>
        <p [innerHTML]="c.hero.lead | mdInline"></p>
        <span class="pill">{{ c.hero.pill }}</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>{{ c.sections.start.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.start.lead | mdInline"></p>
        <div class="info" [innerHTML]="c.sections.start.info | mdInline"></div>
        <p [innerHTML]="c.sections.start.body | mdInline"></p>
      </section>

      <section id="docs">
        <h2><span class="num">02</span>{{ c.sections.docs.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.docs.lead | mdInline"></p>
        <div class="grid g3">
          @for (card of c.sections.docs.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="card.body | mdInline"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="c.sections.docs.note | mdInline"></div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>{{ c.sections.flags.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.flags.lead | mdInline"></p>
        <table>
          <thead><tr><th style="width:230px">Flag</th><th>What it means</th><th style="width:240px">Effect when ON</th></tr></thead>
          <tbody>
            @for (row of c.sections.flags.table; track row.flag) {
              <tr>
                <td><b>{{ row.flag }}</b></td>
                <td [innerHTML]="row.meaning | mdInline"></td>
                <td [innerHTML]="row.effect | mdInline"></td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section id="priority">
        <h2><span class="num">04</span>{{ c.sections.priority.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.priority.lead | mdInline"></p>
        <div class="grid g3">
          @for (card of c.sections.priority.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="card.body | mdInline"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="c.sections.priority.note | mdInline"></div>
      </section>

      <section id="tool">
        <h2><span class="num">05</span>{{ c.sections.tool.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.tool.lead | mdInline"></p>
        <app-determination-tool />
      </section>

      <section id="flows">
        <h2><span class="num">06</span>{{ c.sections.flows.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.flows.lead | mdInline"></p>
        <app-flow-tabs [flows]="flows" [tabs]="flowTabs" />
      </section>

      <section id="scenarios">
        <h2><span class="num">07</span>{{ c.sections.scenarios.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.scenarios.lead | mdInline"></p>
        <div class="filterbar">
          <input type="text" [(ngModel)]="scenQuery" placeholder="Search scenarios, e.g. warehouse, corporate identity, alternate" />
        </div>
        <table>
          <thead><tr><th style="width:160px">Group</th><th>Conditions</th><th style="width:300px">Ships to</th><th style="width:90px">Order</th></tr></thead>
          <tbody>
            @for (s of filteredScenarios; track s.id) {
              <tr><td><span class="badge">{{ s.group }}</span></td><td>{{ s.cond.join(' · ') }}</td><td><span class="addr-chip">{{ s.expected }}</span></td><td>@if (s.order) { <a [href]="s.order" target="_blank" rel="noopener noreferrer">View</a> }</td></tr>
            }
            @if (!filteredScenarios.length) { <tr><td colspan="4" style="color:var(--muted);text-align:center;padding:22px">No scenarios match.</td></tr> }
          </tbody>
        </table>
      </section>

      <section id="glossary">
        <h2><span class="num">08</span>{{ c.sections.glossary.heading }}</h2>
        <table><tbody>
          @for (row of c.sections.glossary.rows; track row.term) {
            <tr>
              <td style="width:240px"><b>{{ row.term }}</b></td>
              <td [innerHTML]="row.definition | mdInline"></td>
            </tr>
          }
        </tbody></table>
      </section>

      @for (s of extraSections; track s.id) {
        <app-doc-section [section]="s" />
      }

      <div class="footer">{{ c.footer }}</div>
    </main>
  </div>`,
})
export class ShippingGuideComponent {
  c = content;
  flows = SHIPPING_FLOWS;
  flowTabs = [
    { key: 'blank', label: 'Blank PO' },
    { key: 'decorator', label: 'Decorator PO' },
    { key: 'supplier', label: 'Supplier Decorated PO' },
  ];
  scenQuery = '';
  get extraSections(): DocSection[] { return this.c.extra_sections ?? []; }
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return SHIPPING_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
