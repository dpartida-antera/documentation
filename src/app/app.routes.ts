import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/hub.component').then(m => m.HubComponent), title: 'Antera Documentation' },
  { path: 'shipping', loadComponent: () => import('./features/shipping-guide.component').then(m => m.ShippingGuideComponent), title: 'PO Shipping Address Guide' },
  { path: 'shipping/qa', loadComponent: () => import('./features/shipping-qa.component').then(m => m.ShippingQaComponent), title: 'PO Shipping QA Runner' },
  { path: 'auto-allocation', loadComponent: () => import('./features/auto-allocation-guide.component').then(m => m.AutoAllocationGuideComponent), title: 'Auto Allocation Guide' },
  { path: 'auto-allocation/qa', loadComponent: () => import('./features/auto-allocation-qa.component').then(m => m.AutoAllocationQaComponent), title: 'Auto Allocation QA Runner' },
  { path: 'guide/:slug', loadComponent: () => import('./features/custom-page.component').then(m => m.CustomPageComponent) },
  { path: '**', redirectTo: '' },
];
