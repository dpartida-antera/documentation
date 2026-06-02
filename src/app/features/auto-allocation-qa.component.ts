import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QaRunnerComponent } from '../shared/qa-runner.component';
import { ALLOCATION_QA_SCENARIOS } from './allocation-scenarios';

@Component({
  selector: 'app-auto-allocation-qa',
  standalone: true,
  imports: [QaRunnerComponent, RouterLink],
  template: `
  <div class="doc-layout">
    <aside class="docnav">
      <a class="backlink" routerLink="/">All guides</a>
      <div class="doctitle">Auto Allocation QA Runner</div>
      <div class="docsub">Interactive regression checklist</div>
      <nav>
        <a class="section">Related</a>
        <a routerLink="/auto-allocation">Auto Allocation guide</a>
      </nav>
    </aside>
    <main class="doc">
      <div class="hero">
        <h1>Auto Allocation QA Runner</h1>
        <p>Every auto-allocation and parent-transfer scenario as a live, trackable checklist. Expected outcomes are computed by the same rules engine the guide uses, so the sheet can't drift. Save runs to keep a history.</p>
        <span class="pill">Auto-saves in your browser · Export CSV / JSON</span>
      </div>
      <app-qa-runner [scenarios]="scenarios" storageKey="antera_aa_qa" csvPrefix="auto-allocation-qa" />
    </main>
  </div>`,
})
export class AutoAllocationQaComponent { scenarios = ALLOCATION_QA_SCENARIOS; }
