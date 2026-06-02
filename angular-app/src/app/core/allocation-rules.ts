import { AllocOptions, AllocResult, AllocRow, PoType, TransferResult } from './models';

/** Parent -> child inventory transfer (FIFO by lot). Returns the new child quantity. */
export function parentTransfer(
  orderQty: number, childQty: number, parentInventory: number, poType: PoType, fifoLots: number[],
): TransferResult {
  if (poType !== 'Stock') return { newChild: 0, used: 0, reason: 'Invalid PO type, no transfer' };
  const required = orderQty - childQty;
  if (required <= 0) return { newChild: childQty, used: 0, reason: 'Child already covers the order' };
  if (parentInventory <= 0) return { newChild: childQty, used: 0, reason: 'Parent has no inventory' };
  if (!fifoLots || fifoLots.length === 0) return { newChild: 0, used: 0, reason: 'No FIFO lots returned' };
  const take = Math.min(required, parentInventory);
  let remaining = take, used = 0;
  for (const lot of fifoLots) { const t = Math.min(lot, remaining); used += t; remaining -= t; if (remaining <= 0) break; }
  return { newChild: childQty + used, used, reason: used < required ? 'Partial transfer (remainder backordered)' : 'Parent covered the gap' };
}

interface WorkRow extends AllocRow { _alloc: number; _rem: number; }

/** Auto-allocation: rewrite a line into Stock / DropShip / Backorder per the rules. */
export function allocate(rows: AllocRow[], o: AllocOptions = {}): AllocResult {
  const res: AllocResult = { original: [], dropship: [], inPlaceFlip: false, transfers: [] };

  if (o.noRecord && !o.defaultWarehouse) {
    res.inPlaceFlip = true;
    res.original = rows.map(r => ({ size: r.size, qty: r.required, type: 'DropShip' }));
    return res;
  }

  const work: WorkRow[] = rows.map(r => ({ ...r, _alloc: 0, _rem: 0 }));
  for (const r of work) {
    let stock = o.noRecord ? 0 : r.stock;
    let transferred = 0;
    if (o.parentTransfer && stock < r.required) {
      const allowed = !!o.sameWhType || stock === 0;
      if (allowed) { transferred = Math.min(r.required - stock, r.parentStock || 0); stock += transferred; }
    }
    r._alloc = Math.min(r.required, stock);
    r._rem = r.required - r._alloc;
    if (transferred > 0) res.transfers.push({ size: r.size, qty: transferred });
  }

  if (o.backorder) {
    res.original = work.map(r => ({ size: r.size, qty: r._alloc, type: 'Stock', backorder: r._rem }));
    return res;
  }

  const kept = work.filter(r => r._alloc > 0);
  if (kept.length === 0) {
    res.inPlaceFlip = true;
    res.original = work.map(r => ({ size: r.size, qty: r.required, type: 'DropShip' }));
    return res;
  }
  res.original = kept.map(r => ({ size: r.size, qty: r._alloc, type: 'Stock' }));
  res.dropship = work.filter(r => r._rem > 0).map(r => ({ size: r.size, qty: r._rem }));
  return res;
}
