import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DeterminationToolComponent } from './determination-tool.component';
import { AllocationSimulatorComponent } from './allocation-simulator.component';
import { QaRunnerComponent, QaScenario } from '../shared/qa-runner.component';
import { FlowTabsComponent } from '../shared/flow-tabs.component';
import { FlowSpec } from '../core/models';
import { SHIPPING_FLOWS, ALLOCATION_FLOWS } from '../core/flow-specs';
import { SHIPPING_QA_SCENARIOS } from './shipping-scenarios';
import { ALLOCATION_QA_SCENARIOS } from './allocation-scenarios';

/**
 * Chrome-free single-widget page for embedding in GitBook (or any host) via an iframe.
 * Route: /embed/:widget. The topbar is hidden by AppComponent on /embed routes.
 * No docnav, no hero: just the interactive piece, padded for an iframe.
 */
@Component({
  selector: 'app-embed',
  standalone: true,
  // Keep the shipping determination tool side-by-side (not stacked) inside narrow frames.
  host: { '[class.embed-split]': "widget === 'shipping-tool'" },
  imports: [DeterminationToolComponent, AllocationSimulatorComponent, QaRunnerComponent, FlowTabsComponent],
  styles: [`
    :host{display:block;padding:18px;max-width:1040px;margin:0 auto}
    .embed-head{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin:0 0 12px}
    .embed-missing{color:var(--muted);font-size:14px;padding:24px;text-align:center}
  `],
  template: `
    @switch (widget) {
      @case ('shipping-tool') { <app-determination-tool /> }
      @case ('allocation-simulator') { <app-allocation-simulator /> }
      @case ('shipping-flows') { <app-flow-tabs [flows]="shippingFlows" [tabs]="shippingFlowTabs" /> }
      @case ('allocation-flows') { <app-flow-tabs [flows]="allocationFlows" [tabs]="allocationFlowTabs" /> }
      @case ('shipping-qa') { <app-qa-runner [scenarios]="shippingScenarios" storageKey="antera_po_qa" csvPrefix="po-shipping-qa" /> }
      @case ('allocation-qa') { <app-qa-runner [scenarios]="allocationScenarios" storageKey="antera_aa_qa" csvPrefix="auto-allocation-qa" /> }
      @default { <div class="embed-missing">Unknown embed widget: "{{ widget }}".</div> }
    }
  `,
})
export class EmbedComponent implements AfterViewInit, OnDestroy {
  widget = '';

  shippingFlows: Record<string, FlowSpec> = SHIPPING_FLOWS;
  allocationFlows: Record<string, FlowSpec> = ALLOCATION_FLOWS;
  shippingFlowTabs = [
    { key: 'blank', label: 'Blank PO' },
    { key: 'decorator', label: 'Decorator PO' },
    { key: 'supplier', label: 'Supplier Decorated PO' },
  ];
  allocationFlowTabs = [
    { key: 'alloc', label: 'Allocation outcome' },
    { key: 'warehouse', label: 'Warehouse resolution' },
    { key: 'transfer', label: 'Parent to Child transfer' },
  ];
  shippingScenarios: QaScenario[] = SHIPPING_QA_SCENARIOS;
  allocationScenarios: QaScenario[] = ALLOCATION_QA_SCENARIOS;

  private ro?: ResizeObserver;

  constructor(route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: object) {
    this.widget = route.snapshot.paramMap.get('widget') ?? '';
  }

  // Report height to the parent so the host can auto-size the iframe. Uses GitBook's
  // ContentKit webframe protocol (@webframe.ready / @webframe.resize), which is also
  // harmless on any other host that does not listen for it.
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const send = (action: Record<string, unknown>) => window.parent?.postMessage({ action }, '*');
    send({ action: '@webframe.ready' });
    const post = () => {
      const height = document.documentElement.scrollHeight;
      const width = document.documentElement.clientWidth || height;
      send({ action: '@webframe.resize', size: { aspectRatio: width / height, height } });
    };
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(post);
      this.ro.observe(document.documentElement);
    }
    post();
  }

  ngOnDestroy(): void { this.ro?.disconnect(); }
}
