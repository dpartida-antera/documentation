import { allocate, parentTransfer } from '../core/allocation-rules';
import { AllocOptions, AllocResult, AllocRow, PoType } from '../core/models';
import { QaScenario } from '../shared/qa-runner.component';

const GROUPS: Record<string, string> = { alloc: 'Allocation', transfer: 'Parent \u2192 Child transfer', warehouse: 'Warehouse', store: 'Store order' };

interface RawAlloc { id: string; g: string; title: string; cond: string[]; alloc?: { rows: AllocRow[]; flags: AllocOptions }; transfer?: { order: number; child: number; parent: number; poType: PoType; lots: number[] }; manualExpected?: string; }

const RAW: RawAlloc[] = [
  // Allocation (computed)
  {id:"SC-1",g:"alloc",title:"All sizes fully stocked",cond:["S 15/20","M 30/50","L 45/60","Backorder OFF","Transfer OFF"],alloc:{rows:[{size:"S",required:15,stock:20},{size:"M",required:30,stock:50},{size:"L",required:45,stock:60}],flags:{}}},
  {id:"SC-2",g:"alloc",title:"Mixed, S partial, M zero, L partial",cond:["S 15/3","M 30/0","L 45/39","Backorder OFF"],alloc:{rows:[{size:"S",required:15,stock:3},{size:"M",required:30,stock:0},{size:"L",required:45,stock:39}],flags:{}}},
  {id:"SC-3",g:"alloc",title:"S zero, M partial, L no inventory",cond:["S 15/0","M 30/14","L 45/0","Backorder OFF"],alloc:{rows:[{size:"S",required:15,stock:0},{size:"M",required:30,stock:14},{size:"L",required:45,stock:0}],flags:{}}},
  {id:"SC-4",g:"alloc",title:"All sizes zero stock",cond:["S 10/0","M 20/0","Backorder OFF"],alloc:{rows:[{size:"S",required:10,stock:0},{size:"M",required:20,stock:0}],flags:{}}},
  {id:"SC-5",g:"alloc",title:"Backorder mode, partial stock",cond:["S 15/6","M 30/0","Backorder ON"],alloc:{rows:[{size:"S",required:15,stock:6},{size:"M",required:30,stock:0}],flags:{backorder:true}}},
  {id:"SC-6",g:"alloc",title:"Parent inventory transfer covers the gap",cond:["S 10/6","parent stock 10","Share Parent Inventory ON","same WH type"],alloc:{rows:[{size:"S",required:10,stock:6,parentStock:10}],flags:{parentTransfer:true,sameWhType:true}}},
  {id:"SC-7",g:"warehouse",title:"No inventory record → Default warehouse fallback",cond:["No PartInventory record","Default warehouse set","Backorder ON","M 10/0"],alloc:{rows:[{size:"M",required:10,stock:0}],flags:{noRecord:true,defaultWarehouse:true,backorder:true}}},
  {id:"SC-8",g:"warehouse",title:"No Default warehouse → in-place DropShip flip",cond:["No PartInventory record","No Default warehouse","Backorder OFF","M 10/0"],alloc:{rows:[{size:"M",required:10,stock:0}],flags:{noRecord:true,defaultWarehouse:false}}},
  {id:"SC-9",g:"warehouse",title:"Warehouse priority, customer primary used",cond:["Customer primary WH-CUST stock 20","Global priority-1 WH-G1 stock 20","M 10 required"],manualExpected:"Allocated 10 from the customer primary warehouse WH-CUST; the global priority warehouses are never consulted."},
  {id:"SC-10",g:"store",title:"Aether Store Order, system auto-alloc OFF, zero stock",cond:["orderType=StoreOrder","orderSource=aether","system auto-alloc OFF","Backorder ON","M 10/0"],manualExpected:"Aether Store Order takes the special zero-stock path even with system auto-alloc OFF → full qty backordered (M backorder 10). No DropShip line."},
  {id:"SC-11",g:"store",title:"Aether Store Order, system auto-alloc ON",cond:["orderType=StoreOrder","orderSource=aether","system auto-alloc ON"],manualExpected:"Standard allocation path applies (same as a normal order with auto-allocation on)."},
  // Parent → child transfer (computed)
  {id:"T-1",g:"transfer",title:"Child has enough, no transfer needed",cond:["order 20","child 20","parent 40"],transfer:{order:20,child:20,parent:40,poType:"Stock",lots:[40]}},
  {id:"T-2",g:"transfer",title:"Parent covers the shortfall exactly",cond:["order 40","child 10","parent 30"],transfer:{order:40,child:10,parent:30,poType:"Stock",lots:[30]}},
  {id:"T-3",g:"transfer",title:"Parent has more than enough",cond:["order 40","child 10","parent 40"],transfer:{order:40,child:10,parent:40,poType:"Stock",lots:[40]}},
  {id:"T-4",g:"transfer",title:"Parent has less than required (partial)",cond:["order 40","child 10","parent 15"],transfer:{order:40,child:10,parent:15,poType:"Stock",lots:[15]}},
  {id:"T-5",g:"transfer",title:"Child zero, parent covers",cond:["order 40","child 0","parent 40"],transfer:{order:40,child:0,parent:40,poType:"Stock",lots:[40]}},
  {id:"T-6",g:"transfer",title:"Parent has zero inventory",cond:["order 40","child 10","parent 0"],transfer:{order:40,child:10,parent:0,poType:"Stock",lots:[]}},
  {id:"T-7",g:"transfer",title:"Multiple FIFO lots, parent covers",cond:["order 40","child 10","parent 50","lots 12/12/30"],transfer:{order:40,child:10,parent:50,poType:"Stock",lots:[12,12,30]}},
  {id:"T-8",g:"transfer",title:"Multiple FIFO lots, parent partially covers",cond:["order 40","child 10","parent 20","lots 12/12"],transfer:{order:40,child:10,parent:20,poType:"Stock",lots:[12,12]}},
  {id:"T-9",g:"transfer",title:"Invalid PO type (Dropship)",cond:["poType = Dropship"],transfer:{order:40,child:10,parent:40,poType:"Dropship",lots:[40]}},
  {id:"T-10",g:"transfer",title:"No FIFO lots returned",cond:["parent 40 but FIFO returns empty"],transfer:{order:40,child:10,parent:40,poType:"Stock",lots:[]}},
  {id:"T-11",g:"transfer",title:"Child cost present vs missing",cond:["cost logic"],manualExpected:"If the child cost is present it is used; if the child cost is missing (or both present) a weighted-average cost from the parent lots is applied."},
  {id:"T-12",g:"transfer",title:"Different warehouse type, child has stock",cond:["parent customer-owned","child distributor-owned partial"],manualExpected:"Transfer blocked, parent and child warehouse types differ and the child is not at zero. Row follows DropShip / Backorder rules. (Same type, or child = 0, is required.)"},
  {id:"T-13",g:"transfer",title:"Unreserve after a parent→child transfer",cond:["Booked with transfer","then unreserve the line"],manualExpected:"The child KEEPS the transferred inventory, it is not returned to the parent."}];

function fmtRows(arr: { size: string; qty: number; type?: string; backorder?: number }[]): string {
  return arr.map(r => r.size + ':' + r.qty + (r.type ? ' ' + r.type : '') + (r.backorder ? ' [backorder ' + r.backorder + ']' : '')).join(', ');
}
function describeAlloc(res: AllocResult): string {
  let s = (res.inPlaceFlip ? 'Line flips to DropShip in-place. ' : '') + 'Original line \u2192 ' + fmtRows(res.original);
  if (res.dropship.length) s += ' \u00b7 New DropShip line \u2192 ' + fmtRows(res.dropship);
  else if (!res.inPlaceFlip) s += ' \u00b7 no DropShip line';
  if (res.transfers.length) s += ' \u00b7 parent transfer ' + res.transfers.map(t => t.size + '+' + t.qty).join(',');
  return s;
}
function describeTransfer(order: number, child: number, parent: number, poType: PoType, lots: number[]): string {
  const t = parentTransfer(order, child, parent, poType, lots);
  return 'New child qty = ' + t.newChild + (t.used ? ' (took ' + t.used + ' from parent)' : '') + ', ' + t.reason;
}

export const ALLOCATION_QA_SCENARIOS: QaScenario[] = RAW.map(s => {
  const computed = !!(s.alloc || s.transfer);
  let expected = '';
  if (s.alloc) expected = describeAlloc(allocate(s.alloc.rows.map(r => ({ ...r })), s.alloc.flags));
  else if (s.transfer) { const t = s.transfer; expected = describeTransfer(t.order, t.child, t.parent, t.poType, t.lots); }
  else expected = s.manualExpected || '';
  return { id: s.id, group: GROUPS[s.g], title: s.title, cond: s.cond, expected, computed };
});
