import { Component } from '@angular/core';
import { ADDR, SHIPFROM, decide } from '../core/shipping-rules';
import { AddressInfo, ShippingDoc, ShippingFlags } from '../core/models';

interface Toggle { id: keyof ShippingFlags; label: string; sub: string; dep?: (f: ShippingFlags) => boolean; }

const ADMIN = 'Warehouse configured · needs Admin "Prioritize Warehouse Address on Ship To Us Toggles" = On';

@Component({
  selector: 'app-determination-tool',
  standalone: true,
  template: `
  <div class="card tool">
    <div class="controls">
      <div class="seg">
        <button [class.active]="doc === 'blank'" (click)="setDoc('blank')">Blank PO</button>
        <button [class.active]="doc === 'decorator'" (click)="setDoc('decorator')">Decorator PO</button>
        <button [class.active]="doc === 'supplier'" (click)="setDoc('supplier')">Supplier Decorated PO</button>
      </div>
      <div>
        @for (t of toggles[doc]; track t.id) {
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
      <div class="reslabel">Ships from</div>
      <div class="resfrom">{{ shipFrom }}</div>
      <div class="reslabel" style="margin-top:14px">Ships to</div>
      <div class="resaddr">{{ result.name }}</div>
      <div class="ressource">Source: <b>{{ result.source }}</b></div>
      <div class="fieldbox">
        <h5>Expected address-block fields</h5>
        <ul>@for (f of result.fields; track f) { <li>{{ f }}</li> }</ul>
      </div>
      <div class="path"><b>Why:</b> {{ why }}</div>
    </div>
  </div>`,
})
export class DeterminationToolComponent {
  doc: ShippingDoc = 'blank';
  flags: ShippingFlags = {};

  private chain: Toggle[] = [
    { id: 'additionalVendors', label: 'Additional Decorations by Different Vendors', sub: 'Item needs more than one decorator' },
    { id: 'isFinalPO', label: 'This is the FINAL PO', sub: 'Last decorator in the chain', dep: f => !!f.additionalVendors },
    { id: 'alternateShipTo', label: 'Alternate Ship To', sub: 'Override address (only affects the final PO)', dep: f => (!f.additionalVendors || !!f.isFinalPO) },
    { id: 'shipToUsUponCompletion', label: 'Ship to Us Upon Completion', sub: 'Return to us after decoration', dep: f => (!f.additionalVendors || !!f.isFinalPO) && !f.alternateShipTo },
    { id: 'destWarehouse', label: 'Destination Warehouse Setting', sub: ADMIN, dep: f => (!f.additionalVendors || !!f.isFinalPO) && !f.alternateShipTo && !!f.shipToUsUponCompletion },
    { id: 'corpIdentity', label: 'Corporate Identity Assigned', sub: 'Account corporate identity', dep: f => (!f.additionalVendors || !!f.isFinalPO) && !f.alternateShipTo && !!f.shipToUsUponCompletion && !f.destWarehouse },
  ];

  toggles: Record<ShippingDoc, Toggle[]> = {
    blank: [
      { id: 'decorated', label: 'Decorated', sub: 'Item has artwork applied' },
      { id: 'alternateShipTo', label: 'Alternate Ship To', sub: 'Override address entered' },
      { id: 'shipToUsUponCompletion', label: 'Ship to Us Upon Completion', sub: 'Return undecorated goods to us (applies only when NOT decorated)', dep: f => !f.alternateShipTo && !f.decorated },
      { id: 'shipToUsInstead', label: 'Ship to Us Instead of Decorator', sub: 'Route blanks back to us instead of the decorator (decorated only)', dep: f => !f.alternateShipTo && !!f.decorated },
      { id: 'destWarehouse', label: 'Destination Warehouse Setting', sub: ADMIN, dep: f => !f.alternateShipTo && ((!f.decorated && !!f.shipToUsUponCompletion) || (!!f.decorated && !!f.shipToUsInstead)) },
      { id: 'corpIdentity', label: 'Corporate Identity Assigned', sub: 'Account corporate identity', dep: f => !f.alternateShipTo && ((!f.decorated && !!f.shipToUsUponCompletion) || (!!f.decorated && !!f.shipToUsInstead)) && !f.destWarehouse },
    ],
    decorator: this.chain,
    supplier: this.chain,
  };

  setDoc(d: ShippingDoc): void { this.doc = d; this.flags = {}; }
  isActive(t: Toggle): boolean { return !t.dep || t.dep(this.flags); }
  toggle(t: Toggle, ev: Event): void {
    this.flags = { ...this.flags, [t.id]: (ev.target as HTMLInputElement).checked };
  }
  get result(): AddressInfo { return ADDR[decide(this.doc, this.flags).a]; }
  get shipFrom(): string { return SHIPFROM[this.doc]; }
  get why(): string { return decide(this.doc, this.flags).p.join(' → '); }
}
