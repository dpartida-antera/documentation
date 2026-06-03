import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocSection } from '../core/models';
import { DocSectionComponent } from '../shared/doc-section.component';
import { MdInlinePipe } from '../shared/md-inline.pipe';
import rawPages from '../../content/custom-pages.json';

type CustomPage = {
  slug: string;
  title: string;
  subtitle?: string;
  hero: { title: string; lead: string; pill?: string };
  sections: DocSection[];
  footer?: string;
};

const pages = rawPages as { pages: CustomPage[] };

@Component({
  selector: 'app-custom-page',
  standalone: true,
  imports: [RouterLink, DocSectionComponent, MdInlinePipe],
  template: `
  @if (page) {
    <div class="doc-layout">
      <aside class="docnav">
        <a class="backlink" routerLink="/">All guides</a>
        <div class="doctitle">{{ page.hero.title }}</div>
        <div class="docsub">QA &amp; Support reference</div>
        <nav>
          @for (s of page.sections; track s.id) {
            <a [routerLink]="[]" [fragment]="s.id">{{ s.heading }}</a>
          }
        </nav>
      </aside>

      <main class="doc">
        <div class="hero">
          <h1>{{ page.hero.title }}</h1>
          <p [innerHTML]="page.hero.lead | mdInline"></p>
          @if (page.hero.pill) { <span class="pill">{{ page.hero.pill }}</span> }
        </div>

        @for (s of page.sections; track s.id) {
          <app-doc-section [section]="s" />
        }

        @if (page.footer) { <div class="footer">{{ page.footer }}</div> }
      </main>
    </div>
  } @else {
    <div style="padding:80px;text-align:center;color:var(--muted)">Page not found.</div>
  }
  `,
})
export class CustomPageComponent implements OnInit {
  page: CustomPage | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.page = pages.pages.find(p => p.slug === slug) ?? null;
  }
}
