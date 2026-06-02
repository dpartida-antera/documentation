import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeterminationToolComponent } from './determination-tool.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { SHIPPING_FLOWS } from '../core/flow-specs';
import { SHIPPING_QA_SCENARIOS } from './shipping-scenarios';
import { QaScenario } from '../shared/qa-runner.component';
import { mdInline } from '../core/markdown';
import rawContent from '../../content/shipping-guide.json';

type ExtraSection = {
  id: string;
  heading: string;
  lead?: string;
  info?: string;
  note?: string;
  body?: string;
  cards?: Array<{ tag: string; title: string; body: string }>;
  table_header_col1?: string;
  table_header_col2?: string;
  table?: Array<{ col1: string; col2: string }>;
};

const content = rawContent as typeof rawContent & { extra_sections: ExtraSection[] };

@Component({
  selector: 'app-shipping-guide',
  standalone: true,
  imports: [FormsModule, RouterLink, DeterminationToolComponent, FlowTabsComponent],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">{{ c.hero.title }}</div>
      <div class="docsub">QA &amp; Support reference</div>
      <nav>
        <a class="section">Understand</a>
        <a href="#start">{{ c.sections.start.heading }}</a>
        <a href="#docs">{{ c.sections.docs.heading }}</a>
        <a href="#flags">{{ c.sections.flags.heading }}</a>
        <a href="#priority">{{ c.sections.priority.heading }}</a>
        <a class="section">Use</a>
        <a href="#tool">{{ c.sections.tool.heading }}</a>
        <a href="#flows">{{ c.sections.flows.heading }}</a>
        <a href="#scenarios">{{ c.sections.scenarios.heading }}</a>
        <a class="section">Reference</a>
        <a href="#glossary">{{ c.sections.glossary.heading }}</a>
        <a routerLink="/shipping/qa">QA test runner</a>
        @if (extraSections.length) {
          <a class="section">More</a>
          @for (s of extraSections; track s.id) {
            <a [href]="'#' + s.id">{{ s.heading }}</a>
          }
        }
      </nav>
    </aside>

    <main class="doc">
      <div class="hero">
        <h1>{{ c.hero.title }}</h1>
        <p [innerHTML]="md(c.hero.lead)"></p>
        <span class="pill">{{ c.hero.pill }}</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>{{ c.sections.start.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.start.lead)"></p>
        <div class="info" [innerHTML]="md(c.sections.start.info)"></div>
        <p [innerHTML]="md(c.sections.start.body)"></p>
      </section>

      <section id="docs">
        <h2><span class="num">02</span>{{ c.sections.docs.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.docs.lead)"></p>
        <div class="grid g3">
          @for (card of c.sections.docs.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="md(card.body)"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="md(c.sections.docs.note)"></div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>{{ c.sections.flags.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.flags.lead)"></p>
        <table>
          <thead><tr><th style="width:230px">Flag</th><th>What it means</th><th style="width:240px">Effect when ON</th></tr></thead>
          <tbody>
            @for (row of c.sections.flags.table; track row.flag) {
              <tr>
                <td><b>{{ row.flag }}</b></td>
                <td [innerHTML]="md(row.meaning)"></td>
                <td [innerHTML]="md(row.effect)"></td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section id="priority">
        <h2><span class="num">04</span>{{ c.sections.priority.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.priority.lead)"></p>
        <div class="grid g3">
          @for (card of c.sections.priority.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="md(card.body)"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="md(c.sections.priority.note)"></div>
      </section>

      <section id="tool">
        <h2><span class="num">05</span>{{ c.sections.tool.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.tool.lead)"></p>
        <app-determination-tool />
      </section>

      <section id="flows">
        <h2><span class="num">06</span>{{ c.sections.flows.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.flows.lead)"></p>
        <app-flow-tabs [flows]="flows" [tabs]="flowTabs" />
      </section>

      <section id="scenarios">
        <h2><span class="num">07</span>{{ c.sections.scenarios.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.scenarios.lead)"></p>
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
        <h2><span class="num">08</span>{{ c.sections.glossary.heading }}</h2>
        <table><tbody>
          @for (row of c.sections.glossary.rows; track row.term) {
            <tr>
              <td style="width:240px"><b>{{ row.term }}</b></td>
              <td [innerHTML]="md(row.definition)"></td>
            </tr>
          }
        </tbody></table>
      </section>

      @for (s of extraSections; track s.id) {
        <section [id]="s.id">
          <h2>{{ s.heading }}</h2>
          @if (s.lead) { <p class="lead" [innerHTML]="md(s.lead)"></p> }
          @if (s.info) { <div class="info" [innerHTML]="md(s.info)"></div> }
          @if (s.cards?.length) {
            <div class="grid g3" style="margin-bottom:1rem">
              @for (card of s.cards!; track card.tag) {
                <div class="card doc-card">
                  <span class="tag">{{ card.tag }}</span>
                  <h4>{{ card.title }}</h4>
                  <p [innerHTML]="md(card.body)"></p>
                </div>
              }
            </div>
          }
          @if (s.table?.length) {
            <table>
              <thead><tr>
                <th>{{ s.table_header_col1 || 'Item' }}</th>
                <th>{{ s.table_header_col2 || 'Details' }}</th>
              </tr></thead>
              <tbody>
                @for (row of s.table!; track row.col1) {
                  <tr>
                    <td><b>{{ row.col1 }}</b></td>
                    <td [innerHTML]="md(row.col2)"></td>
                  </tr>
                }
              </tbody>
            </table>
          }
          @if (s.note) { <div class="note" [innerHTML]="md(s.note)"></div> }
          @if (s.body) { <p [innerHTML]="md(s.body)"></p> }
        </section>
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
  md(s: string): string { return mdInline(s); }
  get extraSections(): ExtraSection[] { return this.c.extra_sections ?? []; }
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return SHIPPING_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
