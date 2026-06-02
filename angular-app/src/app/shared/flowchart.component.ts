import { Component, Input } from '@angular/core';
import { FlowLayout, FlowSpec, NodeType, PositionedNode } from '../core/models';
import { layoutFlow } from '../core/flow-layout';

const LH = 13.5;

@Component({
  selector: 'app-flowchart',
  standalone: true,
  template: `
  <div class="flowwrap">
    <svg [attr.viewBox]="'0 0 ' + L.vb[0] + ' ' + L.vb[1]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 z" fill="#9aa7b8" />
        </marker>
      </defs>
      @for (e of L.edges; track $index) {
        <path [attr.d]="'M' + e.x1 + ',' + e.y1 + ' L' + e.x2 + ',' + e.y2" fill="none" stroke="#9aa7b8" stroke-width="1.4" marker-end="url(#arrow)" />
        @if (e.label) {
          <rect [attr.x]="e.lx - e.lw / 2" [attr.y]="e.ly - 9" [attr.width]="e.lw" height="16" rx="3" fill="#ffffff" opacity="0.95" />
          <text [attr.x]="e.lx" [attr.y]="e.ly + 3" text-anchor="middle" font-size="10" fill="#5f6b7a" font-weight="600">{{ e.label }}</text>
        }
      }
      @for (n of L.nodes; track n.id) {
        @if (n.type === 'dec') {
          <polygon [attr.points]="n.points" fill="#fbf3e0" stroke="#d9b96a" />
        } @else if (n.type === 'start') {
          <rect [attr.x]="n.x" [attr.y]="n.y" [attr.width]="n.w" [attr.height]="n.h" rx="9" fill="#dfeafb" stroke="#9cc0e8" />
        } @else {
          <rect [attr.x]="n.x" [attr.y]="n.y" [attr.width]="n.w" [attr.height]="n.h" rx="9" fill="#e6f4ee" stroke="#9fd1ba" />
        }
        <text [attr.x]="n.cx" text-anchor="middle" font-size="11" [attr.fill]="color(n.type)" font-family="-apple-system,Segoe UI,sans-serif">
          @for (ln of n.lines; track $index) {
            <tspan [attr.x]="n.cx" [attr.y]="textY(n, $index)">{{ ln }}</tspan>
          }
        </text>
      }
    </svg>
  </div>`,
})
export class FlowchartComponent {
  L!: FlowLayout;
  @Input({ required: true }) set spec(s: FlowSpec) { this.L = layoutFlow(s); }
  color(t: NodeType): string { return t === 'dec' ? '#6b5418' : t === 'start' ? '#274b6d' : '#0a5d43'; }
  textY(n: PositionedNode, i: number): number {
    const startY = n.cy - (n.lines.length - 1) * LH / 2;
    return startY + i * LH + 3.5;
  }
}
