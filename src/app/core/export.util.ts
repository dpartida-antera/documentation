export function downloadFile(name: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function tsNow(): string { return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'); }
export function tsFromIso(iso: string): string { return iso.slice(0, 19).replace(/[:T]/g, '-'); }
