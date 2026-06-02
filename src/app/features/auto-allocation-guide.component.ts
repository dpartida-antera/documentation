import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AllocationSimulatorComponent } from './allocation-simulator.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { ALLOCATION_FLOWS } from '../core/flow-specs';
import { ALLOCATION_QA_SCENARIOS } from './allocation-scenarios';
import { QaScenario } from '../shared/qa-runner.component';
import { mdInline } from '../core/markdown';
import rawContent from '../../content/auto-allocation-guide.json';

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
      <div class="doctitle">{{ c.hero.title }}</div>
      <div class="docsub">QA &amp; Support reference</div>
      <nav>
        <a class="section">Understand</a>
        <a [routerLink]="[]" fragment="start">{{ c.sections.start.heading }}</a>
        <a [routerLink]="[]" fragment="prereq">{{ c.sections.prereq.heading }}</a>
        <a [routerLink]="[]" fragment="flags">{{ c.sections.flags.heading }}</a>
        <a [routerLink]="[]" fragment="outcomes">{{ c.sections.outcomes.heading }}</a>
        <a [routerLink]="[]" fragment="warehouse">{{ c.sections.warehouse.heading }}</a>
        <a [routerLink]="[]" fragment="parent">{{ c.sections.parent.heading }}</a>
        <a class="section">Use</a>
        <a [routerLink]="[]" fragment="tool">{{ c.sections.tool.heading }}</a>
        <a [routerLink]="[]" fragment="flows">{{ c.sections.flows.heading }}</a>
        <a [routerLink]="[]" fragment="scenarios">Scenario library</a>
        <a routerLink="/auto-allocation/qa">QA test runner</a>
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
        <p [innerHTML]="md(c.hero.lead)"></p>
        <span class="pill">{{ c.hero.pill }}</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>{{ c.sections.start.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.start.lead)"></p>
        <div class="info" [innerHTML]="md(c.sections.start.info)"></div>
        <p [innerHTML]="md(c.sections.start.body)"></p>
      </section>

      <section id="prereq">
        <h2><span class="num">02</span>{{ c.sections.prereq.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.prereq.lead)"></p>
        <table>
          <thead><tr><th style="width:300px">Requirement</th><th>Detail</th></tr></thead>
          <tbody>
            @for (row of c.sections.prereq.table; track row.requirement) {
              <tr>
                <td><b>{{ row.requirement }}</b></td>
                <td [innerHTML]="md(row.detail)"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="note" [innerHTML]="md(c.sections.prereq.note)"></div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>{{ c.sections.flags.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.flags.lead)"></p>
        <table>
          <thead><tr><th style="width:230px">Setting</th><th>What it does</th><th style="width:260px">Where to find it</th></tr></thead>
          <tbody>
            @for (row of c.sections.flags.table; track row.setting) {
              <tr>
                <td><b>{{ row.setting }}</b></td>
                <td [innerHTML]="md(row.what_it_does)"></td>
                <td><span class="loc-inline">{{ row.where }}</span></td>
              </tr>
            }
          </tbody>
        </table>

        <h3>{{ c.sections.flags.locations_heading }}</h3>
        <p style="margin:0 0 6px;color:var(--muted);font-size:13.5px">{{ c.sections.flags.locations_subtitle }}</p>
        <div class="shotgrid">
          @for (shot of c.sections.flags.shots; track shot.title) {
            <div class="shot">
              <b>{{ shot.title }}</b>{{ shot.location }}
              <a class="img" [href]="shot.image" target="_blank" rel="noopener">
                <img [src]="shot.image" [alt]="shot.alt" />
              </a>
            </div>
          }
        </div>
      </section>

      <section id="outcomes">
        <h2><span class="num">04</span>{{ c.sections.outcomes.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.outcomes.lead)"></p>
        <div class="grid g3">
          @for (card of c.sections.outcomes.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="md(card.body)"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="md(c.sections.outcomes.note)"></div>
      </section>

      <section id="warehouse">
        <h2><span class="num">05</span>{{ c.sections.warehouse.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.warehouse.lead)"></p>
        <table>
          <thead><tr><th style="width:60px">Order</th><th>Warehouse</th><th>Notes</th></tr></thead>
          <tbody>
            @for (row of c.sections.warehouse.table; track row.order) {
              <tr>
                <td><b>{{ row.order }}</b></td>
                <td>{{ row.warehouse }}</td>
                <td [innerHTML]="md(row.notes)"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="info" [innerHTML]="md(c.sections.warehouse.info)"></div>
      </section>

      <section id="parent">
        <h2><span class="num">06</span>{{ c.sections.parent.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.parent.lead)"></p>
        <table>
          <thead><tr><th style="width:280px">Rule</th><th>Behavior</th></tr></thead>
          <tbody>
            @for (row of c.sections.parent.table; track row.rule) {
              <tr>
                <td><b>{{ row.rule }}</b></td>
                <td [innerHTML]="md(row.behavior)"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="info" [innerHTML]="md(c.sections.parent.info)"></div>
      </section>

      <section id="tool">
        <h2><span class="num">07</span>{{ c.sections.tool.heading }}</h2>
        <p class="lead" [innerHTML]="md(c.sections.tool.lead)"></p>
        <app-allocation-simulator />
      </section>

      <section id="flows">
        <h2><span class="num">08</span>{{ c.sections.flows.heading }}</h2>
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
  get extraSections(): ExtraSection[] { return this.c.extra_sections ?? []; }
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return ALLOCATION_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
