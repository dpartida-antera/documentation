import { Pipe, PipeTransform } from '@angular/core';
import { mdInline } from '../core/markdown';

/** {{ text | mdInline }} -> inline markdown HTML. Pure, so it caches per input. */
@Pipe({ name: 'mdInline', standalone: true })
export class MdInlinePipe implements PipeTransform {
  transform(value: string | null | undefined): string { return mdInline(value || ''); }
}
