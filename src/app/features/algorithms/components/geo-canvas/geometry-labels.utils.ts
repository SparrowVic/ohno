import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextParams, TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';

const GEO = I18N_KEY.features.algorithms.display.geometry;

interface LabelPattern {
  readonly pattern: RegExp;
  readonly key: string;
  readonly params: (match: RegExpMatchArray) => I18nTextParams;
}

function lookup(
  label: string | null | undefined,
  exact: Readonly<Record<string, string>>,
  patterns: readonly LabelPattern[] = [],
): TranslatableText {
  if (!label) return '';
  const key = exact[label];
  if (key) return i18nText(key);
  for (const entry of patterns) {
    const match = label.match(entry.pattern);
    if (match) return i18nText(entry.key, entry.params(match));
  }
  return label;
}

const DIVIDER_KEYS: Readonly<Record<string, string>> = {
  split: GEO.divider.split,
  'merge line': GEO.divider.mergeLine,
  mid: GEO.divider.mid,
};

export function dividerText(label: string | null | undefined): TranslatableText {
  return lookup(label, DIVIDER_KEYS);
}

const LINE_EVENT_PATTERNS: readonly LabelPattern[] = [
  { pattern: /^Start (S\d+)$/, key: GEO.events.start, params: (match) => ({ segment: match[1] }) },
  { pattern: /^End (S\d+)$/, key: GEO.events.end, params: (match) => ({ segment: match[1] }) },
  { pattern: /^Cross (.+)$/, key: GEO.events.cross, params: (match) => ({ pair: match[1] }) },
];

export function lineEventText(label: string): TranslatableText {
  return lookup(label, {}, LINE_EVENT_PATTERNS);
}

const SWEEP_EVENT_PATTERNS: readonly LabelPattern[] = [
  { pattern: /^\+(R\d+)$/, key: GEO.events.enter, params: (match) => ({ rect: match[1] }) },
  { pattern: /^[−-](R\d+)$/, key: GEO.events.leave, params: (match) => ({ rect: match[1] }) },
];

export function sweepEventText(label: string): TranslatableText {
  return lookup(label, {}, SWEEP_EVENT_PATTERNS);
}

export function triangleVerticesText(id: TranslatableText): TranslatableText {
  if (typeof id !== 'string') return id;
  const match = id.match(/^Δ(\d+)-(\d+)-(\d+)$/);
  return match ? `P${match[1]} · P${match[2]} · P${match[3]}` : id;
}
