import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AllocationSimulatorComponent } from './allocation-simulator.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { ALLOCATION_FLOWS } from '../core/flow-specs';
import { ALLOCATION_QA_SCENARIOS } from './allocation-scenarios';
import { QaScenario } from '../shared/qa-runner.component';
import { DocSection } from '../core/models';
import { DocSectionComponent } from '../shared/doc-section.component';
import { MdInlinePipe } from '../shared/md-inline.pipe';
import rawContent from '../../content/auto-allocation-guide.json';

const content = rawContent as typeof rawContent & { extra_sections: DocSection[] };

@Component({
  selector: 'app-auto-allocation-guide',
  standalone: true,
  imports: [FormsModule, RouterLink, AllocationSimulatorComponent, FlowTabsComponent, DocSectionComponent, MdInlinePipe],
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
        <p [innerHTML]="c.hero.lead | mdInline"></p>
        <span class="pill">{{ c.hero.pill }}</span>
      </div>

      <section id="start">
        <h2><span class="num">01</span>{{ c.sections.start.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.start.lead | mdInline"></p>
        <div class="info" [innerHTML]="c.sections.start.info | mdInline"></div>
        <p [innerHTML]="c.sections.start.body | mdInline"></p>
      </section>

      <section id="prereq">
        <h2><span class="num">02</span>{{ c.sections.prereq.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.prereq.lead | mdInline"></p>
        <table>
          <thead><tr><th style="width:300px">Requirement</th><th>Detail</th></tr></thead>
          <tbody>
            @for (row of c.sections.prereq.table; track row.requirement) {
              <tr>
                <td><b>{{ row.requirement }}</b></td>
                <td [innerHTML]="row.detail | mdInline"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="note" [innerHTML]="c.sections.prereq.note | mdInline"></div>
      </section>

      <section id="flags">
        <h2><span class="num">03</span>{{ c.sections.flags.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.flags.lead | mdInline"></p>
        <table>
          <thead><tr><th style="width:230px">Setting</th><th>What it does</th><th style="width:260px">Where to find it</th></tr></thead>
          <tbody>
            @for (row of c.sections.flags.table; track row.setting) {
              <tr>
                <td><b>{{ row.setting }}</b></td>
                <td [innerHTML]="row.what_it_does | mdInline"></td>
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
        <p class="lead" [innerHTML]="c.sections.outcomes.lead | mdInline"></p>
        <div class="grid g3">
          @for (card of c.sections.outcomes.cards; track card.tag) {
            <div class="card doc-card">
              <span class="tag">{{ card.tag }}</span>
              <h4>{{ card.title }}</h4>
              <p [innerHTML]="card.body | mdInline"></p>
            </div>
          }
        </div>
        <div class="note" [innerHTML]="c.sections.outcomes.note | mdInline"></div>
      </section>

      <section id="warehouse">
        <h2><span class="num">05</span>{{ c.sections.warehouse.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.warehouse.lead | mdInline"></p>
        <table>
          <thead><tr><th style="width:60px">Order</th><th>Warehouse</th><th>Notes</th></tr></thead>
          <tbody>
            @for (row of c.sections.warehouse.table; track row.order) {
              <tr>
                <td><b>{{ row.order }}</b></td>
                <td>{{ row.warehouse }}</td>
                <td [innerHTML]="row.notes | mdInline"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="info" [innerHTML]="c.sections.warehouse.info | mdInline"></div>
      </section>

      <section id="parent">
        <h2><span class="num">06</span>{{ c.sections.parent.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.parent.lead | mdInline"></p>
        <table>
          <thead><tr><th style="width:280px">Rule</th><th>Behavior</th></tr></thead>
          <tbody>
            @for (row of c.sections.parent.table; track row.rule) {
              <tr>
                <td><b>{{ row.rule }}</b></td>
                <td [innerHTML]="row.behavior | mdInline"></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="info" [innerHTML]="c.sections.parent.info | mdInline"></div>
      </section>

      <section id="tool">
        <h2><span class="num">07</span>{{ c.sections.tool.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.tool.lead | mdInline"></p>
        <app-allocation-simulator />
      </section>

      <section id="flows">
        <h2><span class="num">08</span>{{ c.sections.flows.heading }}</h2>
        <p class="lead" [innerHTML]="c.sections.flows.lead | mdInline"></p>
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
        <app-doc-section [section]="s" />
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
  get extraSections(): DocSection[] { return this.c.extra_sections ?? []; }
  get filteredScenarios(): QaScenario[] {
    const q = this.scenQuery.toLowerCase();
    return ALLOCATION_QA_SCENARIOS.filter(s => !q || (s.group + ' ' + s.cond.join(' ') + ' ' + s.expected + ' ' + s.title).toLowerCase().includes(q));
  }
}
