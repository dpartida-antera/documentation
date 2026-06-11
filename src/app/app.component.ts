import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    @if (!isEmbed()) {
      <div class="topbar">
        <a class="brand" routerLink="/"><div class="logo">A</div><b>Antera Documentation</b><span>· Knowledge base</span></a>
        <div class="spacer"></div>
        <a class="barlink" routerLink="/">Home</a>
      </div>
    }
    <router-outlet />
  `,
})
export class AppComponent {
  // Embed routes (/embed/...) render chrome-free so they sit cleanly inside a GitBook iframe.
  isEmbed;

  constructor(router: Router) {
    this.isEmbed = toSignal(
      router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(e => e.urlAfterRedirects.startsWith('/embed')),
        startWith(router.url.startsWith('/embed')),
      ),
      { initialValue: router.url.startsWith('/embed') },
    );
  }
}
