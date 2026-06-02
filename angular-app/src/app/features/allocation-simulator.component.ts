import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { allocate } from '../core/allocation-rules';
import { AllocOptions, AllocRow } from '../core/models';

interface SimRow { size: string; required: number; stock: number; parentStock: number; }
interface SimToggle { id: keyof AllocOptions; label: string; sub: string; dep?: (f: AllocOptions) => boolean; }

const PRESETS: Record<string, { rows: [string, number, number, number?][]; f: AllocOptions }> = {
  'SC-1': { rows: [['S', 15, 20], ['M', 30, 50], ['L', 45, 60]], f: {} },
  'SC-2': { rows: [['S', 15, 3], ['M', 30, 0], ['L', 45, 39]], f: {} },
  'SC-3': { rows: [['S', 15, 0], ['M', 30, 14], ['L', 45, 0]], f: {} },
  'SC-4': { rows: [['S', 10, 0], ['M', 20, 0]], f: {} },
  'SC-5': { rows: [['S', 15, 6], ['M', 30, 0]], f: { backorder: true } },
  'SC-6': { rows: [['S', 10, 6, 10]], f: { parentTransfer: true, sameWhType: true } },
};

@Component({
  selector: 'app-allocation-simulator',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .mx{width:100%;border-collapse:collapse;margin:4px 0 8px}
    .mx th{font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);text-align:left;padding:4px 6px;font-weight:700}
    .mx td{padding:3px 6px}
    .mx input{width:62px;padding:6px 8px;border:1px solid var(--line);border-radius:7px;font-size:13px;box-sizing:border-box}
    .mx input.size{width:58px}
    .mx .rm{cursor:pointer;color:#c83838;border:none;background:none;font-size:17px;line-height:1}
    .simbtns{display:flex;gap:7px;flex-wrap:wrap;margin:4px 0 14px;align-items:center}
    .simbtns button{border:1px solid var(--line);background:var(--card);padding:6px 11px;border-radius:7px;font-size:12px;font-weight:600;color:var(--navy-2);cursor:pointer}
    .simbtns button:hover{border-color:var(--blue);color:var(--blue)}
    .simbtns .lab{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);font-weight:700;margin-right:2px}
    .addrow{border:1px dashed var(--line);background:var(--card);padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;color:var(--navy-2);cursor:pointer}
    .linecard{border:1px solid var(--line);border-radius:11px;padding:13px 15px;margin-top:11px;background:var(--card)}
    .linecard.ds,.linecard.flip{background:#fff7ef;border-color:#f0d6b6}
    .linecard h6{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--navy)}
    .lrow{display:grid;grid-template-columns:60px 60px 1fr;gap:8px;align-items:center;padding:4px 0;border-top:1px solid var(--line);font-size:13.5px}
    .lrow:first-of-type{border-top:none}
    .lrow .sz{font-weight:700;color:var(--navy-2)}
    .tp{display:inline-block;font-size:11px;font-weight:700;border-radius:5px;padding:2px 8px}
    .tp.stock{background:#e6f6ee;color:#0a8a4f}
    .tp.dropship{background:#fde7d6;color:#a9620a}
    .bell{display:inline-block;font-size:11.5px;color:#a9760a;background:#fdf6e3;border:1px solid #ecd595;border-radius:5px;padding:1px 7px;margin-left:8px}
    .xfer{margin-top:10px;font-size:12.8px;color:#0a5d43;background:#e9f6ef;border:1px solid #b9e0cc;border-radius:8px;padding:8px 11px}
    .simwhy{margin-top:12px;font-size:12.8px;color:var(--muted)}
    .simwhy b{color:var(--navy-2)}
    .matchhint{margin-top:6px;font-size:12px;color:var(--blue);font-weight:600}
  `],
  template: `
  <div class="card tool">
    <div class="controls">
      <div class="simbtns">
        <span class="lab">Load:</span>
        @for (p of presetKeys; track p) { <button (click)="loadPreset(p)">{{ p }}</button> }
      </div>
      <table class="mx">
        <thead><tr><th>Size</th><th>Required</th><th>Stock</th>@if (flags.parentTransfer) { <th>Parent</th> }<th></th></tr></thead>
        <tbody>
          @for (r of rows; track $index) {
            <tr>
              <td><input class="size" [(ngModel)]="r.size" /></td>
              <td><input type="number" min="0" [(ngModel)]="r.required" /></td>
              <td><input type="number" min="0" [(ngModel)]="r.stock" /></td>
              @if (flags.parentTransfer) { <td><input type="number" min="0" [(ngModel)]="r.parentStock" /></td> }
              <td>@if (rows.length > 1) { <button class="rm" (click)="removeRow($index)">&times;</button> }</td>
            </tr>
          }
        </tbody>
      </table>
      <button class="addrow" (click)="addRow()">+ Add size</button>
      <div style="margin-top:14px">
        @for (t of toggles; track t.id) {
          <div class="toggle-row" [class.disabled]="!isActive(t)">
            <div class="lbl">{{ t.label }}<small>{{ t.sub }}</small></div>
            <label class="sw">
              <input type="checkbox" [checked]="!!flags[t.id]" [disabled]="!isActive(t)" (change)="toggle(t, $event)" />
              <span></span>
            </label>
          </div>
        }
      </div>
    </div>
    <div class="result">
      <div class="reslabel">Result when booked</div>
      <div class="linecard" [class.flip]="res.inPlaceFlip">
        <h6>{{ res.inPlaceFlip ? 'Original line item, flipped to DropShip (in-place)' : 'Original line item' }}</h6>
        @for (r of res.original; track $index) {
          <div class="lrow">
            <span class="sz">{{ r.size }}</span><span>{{ r.qty }}</span>
            <span><span class="tp" [class.stock]="r.type==='Stock'" [class.dropship]="r.type==='DropShip'">{{ r.type }}</span>@if (r.backorder) { <span class="bell">&#128276; backorder {{ r.backorder }}</span> }</span>
          </div>
        }
      </div>
      @if (res.dropship.length) {
        <div class="linecard ds">
          <h6>New DropShip line item</h6>
          @for (r of res.dropship; track $index) {
            <div class="lrow"><span class="sz">{{ r.size }}</span><span>{{ r.qty }}</span><span><span class="tp dropship">DropShip</span></span></div>
          }
        </div>
      }
      @if (res.transfers.length) {
        <div class="xfer"><b>Parent &#8594; child transfer:</b> {{ transferText }} pulled from the parent into the child.</div>
      }
      <div class="simwhy"><b>What happened:</b> {{ why }}</div>
      @if (matchHint) { <div class="matchhint">Matches scenario {{ matchHint }}</div> }
    </div>
  </div>`,
})
export class AllocationSimulatorComponent {
  rows: SimRow[] = [
    { size: 'S', required: 15, stock: 3, parentStock: 0 },
    { size: 'M', required: 30, stock: 0, parentStock: 0 },
    { size: 'L', required: 45, stock: 39, parentStock: 0 },
  ];
  flags: AllocOptions = { backorder: false, parentTransfer: false, sameWhType: true };
  presetKeys = Object.keys(PRESETS);

  toggles: SimToggle[] = [
    { id: 'backorder', label: 'Backorder mode', sub: 'Allow No/Low Stock Allocation (Generate Backorder Quantity)' },
    { id: 'parentTransfer', label: 'Share Parent Inventory', sub: 'Allow parent to child transfer at booking' },
    { id: 'sameWhType', label: 'Parent & child same warehouse type', sub: 'Bypassed when child stock = 0', dep: f => !!f.parentTransfer },
  ];

  isActive(t: SimToggle): boolean { return !t.dep || t.dep(this.flags); }
  toggle(t: SimToggle, ev: Event): void { this.flags = { ...this.flags, [t.id]: (ev.target as HTMLInputElement).checked }; }
  addRow(): void { this.rows = [...this.rows, { size: '?', required: 0, stock: 0, parentStock: 0 }]; }
  removeRow(i: number): void { this.rows = this.rows.filter((_, idx) => idx !== i); }
  loadPreset(key: string): void {
    const p = PRESETS[key];
    this.rows = p.rows.map(r => ({ size: r[0], required: r[1], stock: r[2], parentStock: r[3] || 0 }));
    this.flags = { backorder: false, parentTransfer: false, sameWhType: true, ...p.f };
  }

  private toAllocRows(): AllocRow[] {
    return this.rows.map(r => ({ size: r.size, required: +r.required || 0, stock: +r.stock || 0, parentStock: +r.parentStock || 0 }));
  }
  get res() { return allocate(this.toAllocRows(), this.flags); }
  get transferText(): string { return this.res.transfers.map(t => t.size + ' +' + t.qty).join(', '); }
  get why(): string {
    const r = this.res;
    if (r.inPlaceFlip) return 'No size had any stock, so the entire line flips to DropShip in place.';
    if (this.flags.backorder) return 'Backorder mode is ON, so one Stock line is kept and any shortfall is stored as a backorder (bell). No DropShip line is created.';
    if (r.dropship.length) return 'Partial stock, so covered quantities stay as Stock on the original line and the shortfall (and any zero-stock sizes) move to a new DropShip line.';
    return 'Stock fully covers every size, so the line stays Stock and inventory is reserved.';
  }
  get matchHint(): string | null {
    for (const key of Object.keys(PRESETS)) {
      const p = PRESETS[key];
      if (p.rows.length !== this.rows.length) continue;
      const rowsEq = p.rows.every((pr, i) => pr[0] === this.rows[i].size && pr[1] === (+this.rows[i].required) && pr[2] === (+this.rows[i].stock) && (pr[3] || 0) === (+this.rows[i].parentStock));
      const keys: (keyof AllocOptions)[] = ['backorder', 'parentTransfer', 'sameWhType'];
      const fEq = keys.every(k => (!!p.f[k]) === (!!this.flags[k]) || (k === 'sameWhType' && !this.flags.parentTransfer));
      if (rowsEq && fEq) return key;
    }
    return null;
  }
}
