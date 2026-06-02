// Shared domain models (single source of truth for the whole app)

/* ---------- Shipping determination ---------- */
export type ShippingDoc = 'blank' | 'decorator' | 'supplier';

export interface ShippingFlags {
  decorated?: boolean;
  alternateShipTo?: boolean;
  shipToUsInstead?: boolean;
  shipToUsUponCompletion?: boolean;
  additionalVendors?: boolean;
  isFinalPO?: boolean;
  destWarehouse?: boolean;
  corpIdentity?: boolean;
}

export type AddressKey =
  | 'order' | 'alternate' | 'firstDecorator' | 'secondBeyond'
  | 'warehouse' | 'corpIdentity' | 'partner';

export interface AddressInfo { name: string; source: string; fields?: string[]; }
export interface ShippingResult { a: AddressKey; p: string[]; }

/* ---------- Auto allocation ---------- */
export interface AllocRow { size: string; required: number; stock: number; parentStock?: number; }
export interface AllocOptions {
  backorder?: boolean;
  parentTransfer?: boolean;
  sameWhType?: boolean;
  noRecord?: boolean;
  defaultWarehouse?: boolean;
}
export interface AllocLine { size: string; qty: number; type: 'Stock' | 'DropShip'; backorder?: number; }
export interface AllocResult {
  original: AllocLine[];
  dropship: { size: string; qty: number }[];
  inPlaceFlip: boolean;
  transfers: { size: string; qty: number }[];
}
export type PoType = 'Stock' | 'Dropship';
export interface TransferResult { newChild: number; used: number; reason: string; }

/* ---------- Flowcharts ---------- */
export type NodeType = 'start' | 'dec' | 'end';
export type Side = 'r' | 'l' | 't' | 'b';
export interface NodeSpec { id: string; x: number; y: number; w: number; text: string; type: NodeType; }
export interface EdgeSpec { f: string; t: string; from: Side; to: Side; label?: string; lt?: number; }
export interface FlowSpec { vb: [number, number]; nodes: NodeSpec[]; edges: EdgeSpec[]; }

export interface PositionedNode extends NodeSpec { h: number; cx: number; cy: number; lines: string[]; points: string; }
export interface PositionedEdge { x1: number; y1: number; x2: number; y2: number; label?: string; lx: number; ly: number; lw: number; }
export interface FlowLayout { vb: [number, number]; nodes: PositionedNode[]; edges: PositionedEdge[]; }

/* ---------- QA runner ---------- */
export type RunStatus = 'untested' | 'pass' | 'fail' | 'blocked';
export interface QaRecord { status: RunStatus; notes: string; }
export type QaResults = Record<string, QaRecord>;
export interface QaSnapshot { id: string; savedAt: string; tester: string; results: QaResults; }
