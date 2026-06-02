import { marked } from 'marked';

/** Render a short, single-line markdown string (bold, italics, links, code) to HTML.
 *  Used for editable prose; the result is bound via [innerHTML], which Angular sanitizes. */
export function mdInline(src: string): string {
  return marked.parseInline(src || '', { async: false }) as string;
}
