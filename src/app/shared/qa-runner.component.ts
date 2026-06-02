import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QaRecord, QaResults, QaSnapshot, RunStatus } from '../core/models';
import { QaStateService } from '../core/qa-state.service';
import { csvCell, downloadFile, tsFromIso, tsNow } from '../core/export.util';

/** View model a feature page passes in. `expected` is precomputed by the page (from the rules engine). */
export interface QaScenario {
  id: string;
  group: string;
  title: string;
  cond: string[];
  expected: string;
  computed: boolean;
}

interface Counts { untested: number; pass: number; fail: number; blocked: number; }
const STATUSES: RunStatus[] = ['untested', 'pass', 'fail', 'blocked'];

@Component({
  selector: 'app-qa-runner',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .qa-summary{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:18px 0 6px}
    .qa-stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 14px;text-align:center}
    .qa-stat .n{font-size:26px;font-weight:800;line-height:1}
    .qa-stat .l{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-top:5px;font-weight:700}
    .qa-stat.pass .n{color:#0a8a4f}.qa-stat.fail .n{color:#c83838}.qa-stat.blocked .n{color:#b5820a}
    .qa-stat.untested .n{color:#8895a8}.qa-stat.total .n{color:var(--navy)}.qa-stat.pct .n{color:var(--blue)}
    .progress{height:10px;border-radius:6px;background:#eef1f5;overflow:hidden;margin:10px 0 4px;display:flex}
    .progress span{height:100%;display:block}
    .progress .p{background:#34b878}.progress .f{background:#e05858}.progress .b{background:#e6b53c}
    .seclegend{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 0}
    .seclegend .s{font-size:11.5px;border:1px solid var(--line);border-radius:20px;padding:4px 11px;color:var(--muted);cursor:pointer;background:var(--card)}
    .seclegend .s b{color:var(--navy-2)}
    .qa-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:22px 0 14px}
    .qa-toolbar input[type=text],.qa-toolbar select{padding:9px 12px;border:1px solid var(--line);border-radius:9px;font-size:13.5px;background:var(--card)}
    .qa-toolbar input.search{flex:1;min-width:200px}
    .qa-toolbar input.tester{flex:0 0 auto;min-width:140px;max-width:190px}
    .qa-toolbar .btn{padding:9px 13px;border:1px solid var(--line);border-radius:9px;background:var(--card);font-size:13px;font-weight:600;color:var(--navy-2);cursor:pointer}
    .qa-toolbar .btn:hover{border-color:var(--blue);color:var(--blue)}
    .qa-toolbar .btn.danger:hover{border-color:#c83838;color:#c83838}
    .histcount{font-size:12px;color:var(--muted);align-self:center}
    .historypanel{margin:0 0 18px}
    .hist-empty{color:var(--muted);font-size:13px;padding:4px 0 10px}
    .histtitle{font-size:11px;font-weight:700;color:var(--navy);margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
    .histrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid var(--line);border-radius:10px;padding:10px 13px;margin-bottom:8px;background:var(--card)}
    .histrow .when{font-weight:700;color:var(--navy);font-size:13.5px}
    .histrow .who{color:var(--muted);font-size:12px}
    .histrow .tally{display:flex;gap:6px;margin-left:auto;font-size:12px}
    .histrow .tally .t{border-radius:5px;padding:1px 7px;font-weight:700}
    .histrow .tally .t.pass{background:#e6f6ee;color:#0a8a4f}
    .histrow .tally .t.fail{background:#fdecec;color:#c83838}
    .histrow .tally .t.blk{background:#fdf6e3;color:#a9760a}
    .histrow .tally .t.unt{background:#eef1f5;color:#5a6675}
    .histrow .acts{display:flex;gap:6px}
    .histrow .acts button{border:1px solid var(--line);background:var(--card);border-radius:7px;padding:5px 9px;font-size:12px;font-weight:600;color:var(--navy-2);cursor:pointer}
    .histrow .acts button:hover{border-color:var(--blue);color:var(--blue)}
    .histrow .acts button.del:hover{border-color:#c83838;color:#c83838}
    .sec-head{margin:26px 0 10px;display:flex;align-items:baseline;gap:10px}
    .sec-head h3{margin:0;font-size:16px;color:var(--navy)}
    .sec-head .sc{font-size:12px;color:var(--muted)}
    .scn{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px 17px;margin-bottom:11px;border-left:4px solid #cdd6e2}
    .scn.s-pass{border-left-color:#34b878}.scn.s-fail{border-left-color:#e05858}.scn.s-blocked{border-left-color:#e6b53c}
    .scn .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
    .scn .tid{font-weight:800;color:var(--navy);font-size:14px}
    .scn .title{font-weight:600;font-size:14px;color:#2a3442}
    .scn .cond{margin:9px 0 4px;font-size:13px;color:#46505e}
    .scn .cond .chip{display:inline-block;background:#eef2f7;border-radius:6px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;color:#3a4654}
    .scn .exp{margin:9px 0 0;font-size:13.5px}
    .scn .exp .lab{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);font-weight:700;margin-right:6px}
    .scn .exp .live{font-size:10.5px;background:#e7f0fb;color:#2f6fb0;border-radius:5px;padding:1px 6px;font-weight:700;margin-left:7px;vertical-align:middle}
    .statusbtns{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
    .statusbtns button{border:1px solid var(--line);background:var(--card);padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:700;color:var(--muted);cursor:pointer}
    .statusbtns button.untested.on{background:#eef1f5;color:#5a6675;border-color:#c3cdd9}
    .statusbtns button.pass.on{background:#e6f6ee;color:#0a8a4f;border-color:#9ad8b8}
    .statusbtns button.fail.on{background:#fdecec;color:#c83838;border-color:#f0b6b6}
    .statusbtns button.blocked.on{background:#fdf6e3;color:#a9760a;border-color:#ecd595}
    .scn textarea{width:100%;margin-top:10px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:13px;font-family:inherit;resize:vertical;min-height:38px;box-sizing:border-box}
    .scn textarea:focus{outline:none;border-color:var(--blue)}
    .empty{color:var(--muted);text-align:center;padding:40px;font-size:14px}
    @media(max-width:760px){.qa-summary{grid-template-columns:repeat(3,1fr)}}
  `],
  template: `
  <section>
    <h2><span class="num">01</span>Progress summary</h2>
    <div class="qa-summary">
      <div class="qa-stat total"><div class="n">{{ scenarios.length }}</div><div class="l">Total</div></div>
      <div class="qa-stat pass"><div class="n">{{ counts.pass }}</div><div class="l">Pass</div></div>
      <div class="qa-stat fail"><div class="n">{{ counts.fail }}</div><div class="l">Fail</div></div>
      <div class="qa-stat blocked"><div class="n">{{ counts.blocked }}</div><div class="l">Blocked</div></div>
      <div class="qa-stat untested"><div class="n">{{ counts.untested }}</div><div class="l">Not tested</div></div>
      <div class="qa-stat pct"><div class="n">{{ executedPct }}%</div><div class="l">Executed</div></div>
    </div>
    <div class="progress" title="Pass / Fail / Blocked">
      <span class="p" [style.width.%]="pct(counts.pass)"></span>
      <span class="f" [style.width.%]="pct(counts.fail)"></span>
      <span class="b" [style.width.%]="pct(counts.blocked)"></span>
    </div>
    <div class="seclegend">
      @for (g of groups; track g) {
        <span class="s" (click)="fGroup = g; ">{{ '' }}<b>{{ g }}</b> {{ groupExecuted(g) }}/{{ groupTotal(g) }}</span>
      }
    </div>
  </section>

  <section>
    <h2><span class="num">02</span>Test scenarios</h2>
    <div class="qa-toolbar">
      <input class="search" type="text" placeholder="Search tests, id, conditions, expected…" [(ngModel)]="query" />
      <select [(ngModel)]="fGroup">
        <option value="all">All groups</option>
        @for (g of groups; track g) { <option [value]="g">{{ g }}</option> }
      </select>
      <select [(ngModel)]="fStatus">
        <option value="all">All statuses</option>
        <option value="untested">Not tested</option>
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
        <option value="blocked">Blocked</option>
      </select>
      <input class="tester" type="text" placeholder="Your name / initials" [(ngModel)]="tester" (ngModelChange)="onTesterChange()" />
      <button class="btn" (click)="saveRun()">+ Save this run</button>
      <span class="histcount">{{ history.length ? history.length + ' saved' : '' }}</span>
      <button class="btn" (click)="exportCsv()">Export CSV</button>
      <button class="btn" (click)="exportJson()">Export JSON</button>
      <button class="btn" (click)="fileInput.click()">Import JSON</button>
      <button class="btn" (click)="print()">Print</button>
      <button class="btn danger" (click)="resetAll()">Reset all</button>
      <input #fileInput type="file" accept="application/json" hidden (change)="onImport($event)" />
    </div>

    <div class="historypanel">
      @if (!history.length) {
        <div class="hist-empty">No saved runs yet. Enter your name and click "Save this run" to snapshot the current results.</div>
      } @else {
        <div class="histtitle">Saved runs</div>
        @for (h of history; track h.id) {
          <div class="histrow">
            <div>
              <div class="when">{{ formatWhen(h.savedAt) }}</div>
              <div class="who">{{ h.tester ? 'by ' + h.tester : 'no name' }}</div>
            </div>
            <div class="tally">
              <span class="t pass">{{ tally(h.results).pass }} pass</span>
              <span class="t fail">{{ tally(h.results).fail }} fail</span>
              <span class="t blk">{{ tally(h.results).blocked }} blk</span>
              <span class="t unt">{{ tally(h.results).untested }} left</span>
            </div>
            <div class="acts">
              <button (click)="openRun(h)">Open</button>
              <button (click)="exportCsv(h)">CSV</button>
              <button (click)="exportJson(h)">JSON</button>
              <button class="del" (click)="deleteRun(h)">Delete</button>
            </div>
          </div>
        }
      }
    </div>

    @if (!filtered.length) {
      <div class="empty">No tests match the current filters.</div>
    }
    @for (g of visibleGroups; track g) {
      <div class="sec-head"><h3>{{ g }}</h3><span class="sc">{{ groupRows(g).length }} test{{ groupRows(g).length > 1 ? 's' : '' }}</span></div>
      @for (s of groupRows(g); track s.id) {
        <div class="scn" [class.s-pass]="rec(s.id).status==='pass'" [class.s-fail]="rec(s.id).status==='fail'" [class.s-blocked]="rec(s.id).status==='blocked'">
          <div class="top"><div><span class="tid">{{ s.id }}</span> &nbsp;<span class="title">{{ s.title }}</span></div><span class="badge">{{ s.group }}</span></div>
          <div class="cond">@for (c of s.cond; track $index) { <span class="chip">{{ c }}</span> }</div>
          <div class="exp"><span class="lab">Expected</span>{{ s.expected }}@if (s.computed) { <span class="live" title="Computed live from the rules engine">computed</span> }</div>
          <div class="statusbtns">
            @for (st of statuses; track st) {
              <button [class]="st" [class.on]="rec(s.id).status===st" (click)="setStatus(s.id, st)">{{ label(st) }}</button>
            }
          </div>
          <textarea placeholder="Actual result / notes (optional)" [ngModel]="rec(s.id).notes" (ngModelChange)="setNotes(s.id, $event)"></textarea>
        </div>
      }
    }
  </section>
  `,
})
export class QaRunnerComponent implements OnInit {
  @Input({ required: true }) scenarios: QaScenario[] = [];
  @Input({ required: true }) storageKey = '';
  @Input({ required: true }) csvPrefix = 'qa';
  @Input() title = 'QA';

  statuses = STATUSES;
  store: QaResults = {};
  history: QaSnapshot[] = [];
  tester = '';
  query = '';
  fGroup = 'all';
  fStatus = 'all';
  groups: string[] = [];

  private histKey = '';
  private testerKey = '';

  constructor(private state: QaStateService) {}

  ngOnInit(): void {
    this.histKey = this.storageKey + '_history';
    this.testerKey = this.storageKey + '_tester';
    this.store = this.state.load<QaResults>(this.storageKey, {});
    this.history = this.state.load<QaSnapshot[]>(this.histKey, []);
    this.tester = this.state.loadText(this.testerKey);
    this.groups = [...new Set(this.scenarios.map(s => s.group))];
  }

  rec(id: string): QaRecord { return this.store[id] || (this.store[id] = { status: 'untested', notes: '' }); }
  setStatus(id: string, st: RunStatus): void { this.rec(id).status = st; this.persist(); }
  setNotes(id: string, v: string): void { this.rec(id).notes = v; this.persist(); }
  private persist(): void { this.state.save(this.storageKey, this.store); }

  label(st: RunStatus): string { return st === 'untested' ? 'Not tested' : st[0].toUpperCase() + st.slice(1); }

  get counts(): Counts { return this.tally(this.store); }
  tally(results: QaResults): Counts {
    const c: Counts = { untested: 0, pass: 0, fail: 0, blocked: 0 };
    for (const s of this.scenarios) c[(results[s.id]?.status) || 'untested']++;
    return c;
  }
  get executedPct(): number {
    const t = this.scenarios.length || 1;
    return Math.round((this.counts.pass + this.counts.fail + this.counts.blocked) / t * 100);
  }
  pct(n: number): number { return this.scenarios.length ? +(n / this.scenarios.length * 100).toFixed(2) : 0; }
  groupTotal(g: string): number { return this.scenarios.filter(s => s.group === g).length; }
  groupExecuted(g: string): number { return this.scenarios.filter(s => s.group === g && (this.store[s.id]?.status || 'untested') !== 'untested').length; }

  get filtered(): QaScenario[] {
    const q = this.query.toLowerCase();
    return this.scenarios.filter(s => {
      const hay = (s.id + ' ' + s.title + ' ' + s.cond.join(' ') + ' ' + s.expected).toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (this.fGroup !== 'all' && s.group !== this.fGroup) return false;
      if (this.fStatus !== 'all' && (this.store[s.id]?.status || 'untested') !== this.fStatus) return false;
      return true;
    });
  }
  get visibleGroups(): string[] { return this.groups.filter(g => this.filtered.some(s => s.group === g)); }
  groupRows(g: string): QaScenario[] { return this.filtered.filter(s => s.group === g); }

  /* ---- history ---- */
  onTesterChange(): void { this.state.saveText(this.testerKey, this.tester); }
  saveRun(): void {
    const snap: QaSnapshot = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      savedAt: new Date().toISOString(),
      tester: (this.tester || '').trim(),
      results: JSON.parse(JSON.stringify(this.store)),
    };
    this.history = [snap, ...this.history];
    this.state.save(this.histKey, this.history);
  }
  openRun(h: QaSnapshot): void {
    if (!confirm('Open this saved run? It replaces the current working results.')) return;
    this.store = JSON.parse(JSON.stringify(h.results));
    this.persist();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  deleteRun(h: QaSnapshot): void {
    if (!confirm('Delete this saved run?')) return;
    this.history = this.history.filter(x => x.id !== h.id);
    this.state.save(this.histKey, this.history);
  }
  formatWhen(iso: string): string { return new Date(iso).toLocaleString(); }

  /* ---- export / import ---- */
  private buildCsv(results: QaResults): string {
    const head = ['ID', 'Group', 'Title', 'Conditions', 'Expected', 'Status', 'Notes'];
    const rows = this.scenarios.map(s => {
      const r = results[s.id] || { status: 'untested', notes: '' };
      return [s.id, s.group, s.title, s.cond.join(' · '), s.expected, r.status, r.notes || ''].map(csvCell).join(',');
    });
    return head.join(',') + '\n' + rows.join('\n');
  }
  private buildJson(results: QaResults, meta?: Partial<QaSnapshot>): unknown {
    const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), ...meta, results: {} };
    const r: QaResults = {};
    for (const s of this.scenarios) {
      const cur = results[s.id] || { status: 'untested', notes: '' };
      r[s.id] = { status: cur.status, notes: cur.notes || '' };
    }
    out['results'] = r;
    return out;
  }
  exportCsv(h?: QaSnapshot): void {
    const results = h ? h.results : this.store;
    const stamp = h ? tsFromIso(h.savedAt) : tsNow();
    downloadFile(`${this.csvPrefix}-${stamp}.csv`, this.buildCsv(results), 'text/csv');
  }
  exportJson(h?: QaSnapshot): void {
    const results = h ? h.results : this.store;
    const stamp = h ? tsFromIso(h.savedAt) : tsNow();
    const meta = h ? { savedAt: h.savedAt, tester: h.tester } : undefined;
    downloadFile(`${this.csvPrefix}-${stamp}.json`, JSON.stringify(this.buildJson(results, meta), null, 2), 'application/json');
  }
  onImport(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const res = (data.results || data) as QaResults;
        for (const id of Object.keys(res)) {
          if (res[id]) this.store[id] = { status: res[id].status || 'untested', notes: res[id].notes || '' };
        }
        this.persist();
        alert('Imported results.');
      } catch { alert('Could not read that file, expected a JSON export from this page.'); }
      input.value = '';
    };
    reader.readAsText(f);
  }
  resetAll(): void {
    if (!confirm('Clear all statuses and notes for every test? This cannot be undone.')) return;
    this.store = {};
    this.persist();
  }
  print(): void { if (typeof window !== 'undefined') window.print(); }
}
