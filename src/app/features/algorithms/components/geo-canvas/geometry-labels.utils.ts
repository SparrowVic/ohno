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

const TRAIL_KEYS: Readonly<Record<string, string>> = {
  root: GEO.trail.root,
  L: GEO.trail.left,
  R: GEO.trail.right,
  merge: GEO.trail.merge,
  strip: GEO.trail.strip,
  done: GEO.trail.done,
};

export function trailText(step: string): TranslatableText {
  return lookup(step, TRAIL_KEYS);
}

const REGION_KEYS: Readonly<Record<string, string>> = {
  'global optimum': GEO.region.optimum,
};

const REGION_PATTERNS: readonly LabelPattern[] = [
  { pattern: /^(\d+) points on the plane$/, key: GEO.region.points, params: (match) => ({ count: Number(match[1]) }) },
  { pattern: /^x-sorted anchor: (P\d+) … (P\d+)$/, key: GEO.region.sorted, params: (match) => ({ first: match[1], last: match[2] }) },
];

const REGION_SLICE = /^(.+) • (\d+) pts$/;

export function closestRegionText(label: string | null | undefined): TranslatableText {
  const slice = label?.match(REGION_SLICE);
  if (!slice) return lookup(label, REGION_KEYS, REGION_PATTERNS);
  const path = slice[1]!.split(' / ').filter((part) => part !== 'root').join(' / ');
  const count = Number(slice[2]);
  return path ? i18nText(GEO.region.slice, { path, count }) : i18nText(GEO.region.whole, { count });
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

export function triangleVerticesText(id: string): string {
  const match = id.match(/^Δ(\d+)-(\d+)-(\d+)$/);
  return match ? `P${match[1]} · P${match[2]} · P${match[3]}` : id;
}
