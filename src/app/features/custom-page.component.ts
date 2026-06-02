import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { mdInline } from '../core/markdown';
import rawPages from '../../content/custom-pages.json';

type PageSection = {
  id: string;
  heading: string;
  lead?: string;
  info?: string;
  note?: string;
  body?: string;
  cards?: Array<{ tag: string; title: string; body: string }>;
  table_header_col1?: string;
  table_header_col2?: string;
  table?: Array<{ col1: string; col2: string }>;
};

type CustomPage = {
  slug: string;
  title: string;
  subtitle?: string;
  hero: { title: string; lead: string; pill?: string };
  sections: PageSection[];
  footer?: string;
};

const pages = rawPages as { pages: CustomPage[] };

@Component({
  selector: 'app-custom-page',
  standalone: true,
  imports: [RouterLink],
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
          <p [innerHTML]="md(page.hero.lead)"></p>
          @if (page.hero.pill) { <span class="pill">{{ page.hero.pill }}</span> }
        </div>

        @for (s of page.sections; track s.id) {
          <section [id]="s.id">
            <h2>{{ s.heading }}</h2>
            @if (s.lead) { <p class="lead" [innerHTML]="md(s.lead)"></p> }
            @if (s.info) { <div class="info" [innerHTML]="md(s.info)"></div> }
            @if (s.cards?.length) {
              <div class="grid g3" style="margin-bottom:1rem">
                @for (card of s.cards!; track card.tag) {
                  <div class="card doc-card">
                    <span class="tag">{{ card.tag }}</span>
                    <h4>{{ card.title }}</h4>
                    <p [innerHTML]="md(card.body)"></p>
                  </div>
                }
              </div>
            }
            @if (s.table?.length) {
              <table>
                <thead><tr>
                  <th>{{ s.table_header_col1 || 'Item' }}</th>
                  <th>{{ s.table_header_col2 || 'Details' }}</th>
                </tr></thead>
                <tbody>
                  @for (row of s.table!; track row.col1) {
                    <tr>
                      <td><b>{{ row.col1 }}</b></td>
                      <td [innerHTML]="md(row.col2)"></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
            @if (s.note) { <div class="note" [innerHTML]="md(s.note)"></div> }
            @if (s.body) { <p [innerHTML]="md(s.body)"></p> }
          </section>
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

  md(s: string): string { return mdInline(s); }
}
