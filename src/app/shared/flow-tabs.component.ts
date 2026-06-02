import { Component, Input, OnInit } from '@angular/core';
import { FlowSpec } from '../core/models';
import { FlowchartComponent } from './flowchart.component';

@Component({
  selector: 'app-flow-tabs',
  standalone: true,
  imports: [FlowchartComponent],
  template: `
    <div class="flowtabs">
      @for (t of tabs; track t.key) {
        <button [class.active]="t.key === active" (click)="active = t.key">{{ t.label }}</button>
      }
    </div>
    <app-flowchart [spec]="flows[active]" />
  `,
})
export class FlowTabsComponent implements OnInit {
  @Input({ required: true }) flows!: Record<string, FlowSpec>;
  @Input({ required: true }) tabs!: { key: string; label: string }[];
  active = '';
  ngOnInit(): void { if (!this.active && this.tabs.length) this.active = this.tabs[0].key; }
}
