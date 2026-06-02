import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** SSR-safe localStorage wrapper used for QA results, history, and the tester name. */
@Injectable({ providedIn: 'root' })
export class QaStateService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  load<T>(key: string, fallback: T): T {
    if (!this.browser) return fallback;
    try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
    catch { return fallback; }
  }
  save(key: string, value: unknown): void {
    if (!this.browser) return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
  }
  loadText(key: string): string {
    if (!this.browser) return '';
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
  }
  saveText(key: string, value: string): void {
    if (!this.browser) return;
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  }
}
