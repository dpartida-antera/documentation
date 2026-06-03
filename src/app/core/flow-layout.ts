import { EdgeSpec, FlowLayout, FlowSpec, NodeSpec, PositionedEdge, PositionedNode, Side } from './models';

/** Line height for wrapped text inside flow nodes. Shared with the flowchart renderer. */
export const LH = 13.5;

export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

function position(n: NodeSpec): PositionedNode {
  const innerW = n.type === 'dec' ? n.w * 0.60 : n.w - 18;
  const maxChars = Math.max(7, Math.floor(innerW / 5.8));
  const lines = wrapText(n.text, maxChars);
  const minH = n.type === 'dec' ? 54 : n.type === 'start' ? 46 : 42;
  const h = Math.max(minH, lines.length * LH + (n.type === 'dec' ? 28 : 18));
  const cx = n.x + n.w / 2, cy = n.y + h / 2;
  const points = `${cx},${n.y} ${n.x + n.w},${cy} ${cx},${n.y + h} ${n.x},${cy}`;
  return { ...n, h, cx, cy, lines, points };
}

function anchor(g: PositionedNode, side: Side): [number, number] {
  const cx = g.x + g.w / 2, cy = g.y + g.h / 2;
  if (side === 'r') return [g.x + g.w, cy];
  if (side === 'l') return [g.x, cy];
  if (side === 't') return [cx, g.y];
  return [cx, g.y + g.h];
}

function routeEdge(gF: PositionedNode, gT: PositionedNode, e: EdgeSpec): PositionedEdge {
  const [x1, y1] = anchor(gF, e.from);
  const [x2, y2] = anchor(gT, e.to);
  const t = e.lt != null ? e.lt : 0.45;
  const lx = x1 + (x2 - x1) * t, ly = y1 + (y2 - y1) * t;
  const lw = (e.label ? e.label.length : 0) * 5.6 + 10;
  return { x1, y1, x2, y2, label: e.label, lx, ly, lw };
}

export function layoutFlow(spec: FlowSpec): FlowLayout {
  const nodes = spec.nodes.map(position);
  const byId: Record<string, PositionedNode> = {};
  for (const n of nodes) byId[n.id] = n;
  const edges = spec.edges.map(e => routeEdge(byId[e.f], byId[e.t], e));
  return { vb: spec.vb, nodes, edges };
}
