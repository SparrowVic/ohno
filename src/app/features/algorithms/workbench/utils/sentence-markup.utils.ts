const NUMBER_PATTERN = /(?<![\w.-])-?\d+(?:\.\d+)?(?!\w)/g;
const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function markupSentence(text: string): string {
  return escapeHtml(text).replace(NUMBER_PATTERN, (match) => `<em>${match}</em>`);
}
