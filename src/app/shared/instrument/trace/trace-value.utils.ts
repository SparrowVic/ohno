import { looksLikeI18nKey } from '../../../core/i18n/looks-like-i18n-key';
import { i18nText, isI18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { ResolvedTraceValueKind, TraceCell, TraceChip, TraceValue, TraceValueKind } from './trace.types';

const NUMERIC_TEXT = /^[-−+]?(?:∞|[\d.,]+(?:\s*[/:]\s*[\d.,∞]+)?)$/;
const EMPTY_PLACEHOLDER = '—';

export function isNumericTraceValue(value: TraceValue): boolean {
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value !== 'string') return false;
  return NUMERIC_TEXT.test(value.trim());
}

export function resolveTraceValueKind(value: TraceValue, kind: TraceValueKind = 'auto'): ResolvedTraceValueKind {
  if (value === null || value === undefined || value === '') return 'empty';
  if (isI18nText(value)) return kind === 'auto' || kind === 'text' ? 'i18n' : kind;
  if (kind !== 'auto') return kind;
  return isNumericTraceValue(value) ? 'number' : 'mono';
}

export function traceValueText(value: TraceValue): string {
  if (value === null || value === undefined || value === '') return EMPTY_PLACEHOLDER;
  if (typeof value === 'number') {
    if (value === Infinity) return '∞';
    if (value === -Infinity) return '−∞';
    return String(value);
  }
  if (isI18nText(value)) return value.key;
  return value;
}

export function isTraceChipList(cell: TraceCell): cell is readonly TraceChip[] {
  return Array.isArray(cell);
}

export function toTraceValue(text: TranslatableText | null | undefined): TraceValue {
  if (typeof text === 'string' && looksLikeI18nKey(text)) return i18nText(text);
  return text;
}
