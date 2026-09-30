export function downloadText(document: Document, filename: string, text: string): void {
  const view = document.defaultView;
  if (!view) return;
  const url = view.URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  view.URL.revokeObjectURL(url);
}
