import { allocate, parentTransfer } from './allocation-rules';

describe('allocation-rules: parentTransfer()', () => {
  it('T1 child covers', () => expect(parentTransfer(20, 20, 40, 'Stock', [40]).newChild).toBe(20));
  it('T2 parent exact', () => expect(parentTransfer(40, 10, 30, 'Stock', [30]).newChild).toBe(40));
  it('T3 parent more', () => expect(parentTransfer(40, 10, 40, 'Stock', [40]).newChild).toBe(40));
  it('T4 parent partial', () => expect(parentTransfer(40, 10, 15, 'Stock', [15]).newChild).toBe(25));
  it('T5 child zero', () => expect(parentTransfer(40, 0, 40, 'Stock', [40]).newChild).toBe(40));
  it('T6 parent zero', () => expect(parentTransfer(40, 10, 0, 'Stock', []).newChild).toBe(10));
  it('T7 fifo used', () => expect(parentTransfer(40, 10, 50, 'Stock', [12, 12, 30]).used).toBe(30));
  it('T8 fifo partial', () => expect(parentTransfer(40, 10, 20, 'Stock', [12, 12]).newChild).toBe(30));
  it('T9 invalid po type', () => expect(parentTransfer(40, 10, 40, 'Dropship', [40]).newChild).toBe(0));
  it('T10 no lots', () => expect(parentTransfer(40, 10, 40, 'Stock', []).newChild).toBe(0));
});

describe('allocation-rules: allocate()', () => {
  it('SC-1 all stocked', () => {
    const r = allocate([{ size: 'S', required: 15, stock: 20 }, { size: 'M', required: 30, stock: 50 }, { size: 'L', required: 45, stock: 60 }], {});
    expect(r.original.map(x => `${x.size}:${x.qty}:${x.type}`)).toEqual(['S:15:Stock', 'M:30:Stock', 'L:45:Stock']);
    expect(r.dropship.length).toBe(0);
  });
  it('SC-2 mixed split', () => {
    const r = allocate([{ size: 'S', required: 15, stock: 3 }, { size: 'M', required: 30, stock: 0 }, { size: 'L', required: 45, stock: 39 }], {});
    expect(r.original.map(x => `${x.size}:${x.qty}`)).toEqual(['S:3', 'L:39']);
    expect(r.dropship).toEqual([{ size: 'S', qty: 12 }, { size: 'M', qty: 30 }, { size: 'L', qty: 6 }]);
  });
  it('SC-4 all zero flips in place', () => {
    const r = allocate([{ size: 'S', required: 10, stock: 0 }, { size: 'M', required: 20, stock: 0 }], {});
    expect(r.inPlaceFlip).toBeTrue();
    expect(r.original.every(x => x.type === 'DropShip')).toBeTrue();
  });
  it('SC-5 backorder mode', () => {
    const r = allocate([{ size: 'S', required: 15, stock: 6 }, { size: 'M', required: 30, stock: 0 }], { backorder: true });
    expect(r.dropship.length).toBe(0);
    expect(r.original).toEqual([{ size: 'S', qty: 6, type: 'Stock', backorder: 9 }, { size: 'M', qty: 0, type: 'Stock', backorder: 30 }]);
  });
  it('SC-6 parent transfer covers gap', () => {
    const r = allocate([{ size: 'S', required: 10, stock: 6, parentStock: 10 }], { parentTransfer: true, sameWhType: true });
    expect(r.original).toEqual([{ size: 'S', qty: 10, type: 'Stock' }]);
    expect(r.transfers).toEqual([{ size: 'S', qty: 4 }]);
  });
  it('SC-7 no record + default + backorder', () => {
    const r = allocate([{ size: 'M', required: 10, stock: 0 }], { noRecord: true, defaultWarehouse: true, backorder: true });
    expect(r.original).toEqual([{ size: 'M', qty: 0, type: 'Stock', backorder: 10 }]);
  });
  it('SC-8 no record + no default flips in place', () => {
    const r = allocate([{ size: 'M', required: 10, stock: 0 }], { noRecord: true, defaultWarehouse: false });
    expect(r.inPlaceFlip).toBeTrue();
    expect(r.original).toEqual([{ size: 'M', qty: 10, type: 'DropShip' }]);
  });
  it('warehouse type mismatch blocks transfer when child has stock', () => {
    const r = allocate([{ size: 'S', required: 10, stock: 6, parentStock: 10 }], { parentTransfer: true, sameWhType: false });
    expect(r.transfers.length).toBe(0);
  });
  it('child zero bypasses warehouse type', () => {
    const r = allocate([{ size: 'S', required: 10, stock: 0, parentStock: 10 }], { parentTransfer: true, sameWhType: false });
    expect(r.transfers).toEqual([{ size: 'S', qty: 10 }]);
  });
});
