import { Component, Input } from '@angular/core';
import { DocSection } from '../core/models';
import { MdInlinePipe } from './md-inline.pipe';

/** Renders one editable prose section (lead / info / cards / table / note / body).
 *  Shared by the guide pages and custom pages so the section schema lives in one place. */
@Component({
  selector: 'app-doc-section',
  standalone: true,
  imports: [MdInlinePipe],
  template: `
  <section [id]="section.id">
    <h2>{{ section.heading }}</h2>
    @if (section.lead) { <p class="lead" [innerHTML]="section.lead | mdInline"></p> }
    @if (section.info) { <div class="info" [innerHTML]="section.info | mdInline"></div> }
    @if (section.cards?.length) {
      <div class="grid g3" style="margin-bottom:1rem">
        @for (card of section.cards!; track card.tag) {
          <div class="card doc-card">
            <span class="tag">{{ card.tag }}</span>
            <h4>{{ card.title }}</h4>
            <p [innerHTML]="card.body | mdInline"></p>
          </div>
        }
      </div>
    }
    @if (section.table?.length) {
      <table>
        <thead><tr>
          <th>{{ section.table_header_col1 || 'Item' }}</th>
          <th>{{ section.table_header_col2 || 'Details' }}</th>
        </tr></thead>
        <tbody>
          @for (row of section.table!; track row.col1) {
            <tr>
              <td><b>{{ row.col1 }}</b></td>
              <td [innerHTML]="row.col2 | mdInline"></td>
            </tr>
          }
        </tbody>
      </table>
    }
    @if (section.note) { <div class="note" [innerHTML]="section.note | mdInline"></div> }
    @if (section.body) { <p [innerHTML]="section.body | mdInline"></p> }
  </section>`,
})
export class DocSectionComponent {
  @Input({ required: true }) section!: DocSection;
}
