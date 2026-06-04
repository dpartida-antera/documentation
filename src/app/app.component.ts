import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="topbar">
      <a class="brand" routerLink="/"><div class="logo">A</div><b>Antera Documentation</b><span>· Knowledge base</span></a>
      <div class="spacer"></div>
      <a class="barlink" routerLink="/">Home</a>
    </div>
    <router-outlet />
  `,
})
export class AppComponent {}
