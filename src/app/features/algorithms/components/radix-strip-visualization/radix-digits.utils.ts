import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nText, i18nText } from '../../../../core/i18n/translatable-text';
import type { SortItemSnapshot, SortStep } from '../../models/sort-step';

const PLACES = I18N_KEY.features.algorithms.display.radix.digitPlace;

export const RADIX_BUCKET_COUNT = 10;

export type RadixPhase = 'idle' | 'focus-digit' | 'distribute' | 'gather' | 'pass-complete' | 'complete';

export type RadixBinTone = 'idle' | 'empty' | 'cyan' | 'pink';

export interface RadixDigit {
  readonly digit: number;
  readonly exponent: number;
  readonly lead: boolean;
}

export interface RadixState {
  readonly phase: RadixPhase;
  readonly exponent: number | null;
  readonly maxDigits: number;
  readonly source: readonly SortItemSnapshot[];
  readonly output: readonly SortItemSnapshot[];
  readonly buckets: readonly (readonly SortItemSnapshot[])[];
  readonly activeId: string | null;
  readonly activeBucket: number | null;
}

export interface RadixBinCard {
  readonly id: string;
  readonly value: number;
  readonly fresh: boolean;
  readonly digits: readonly RadixDigit[];
}

export interface RadixBin {
  readonly bucket: number;
  readonly tone: RadixBinTone;
  readonly count: number;
  readonly cards: readonly RadixBinCard[];
}

const RADIX_PHASES: ReadonlySet<string> = new Set<RadixPhase>([
  'idle',
  'focus-digit',
  'distribute',
  'gather',
  'pass-complete',
  'complete',
]);

const SETTLED_PHASES: ReadonlySet<RadixPhase> = new Set<RadixPhase>(['pass-complete', 'complete']);

export function isRadixPhase(phase: string | undefined): phase is RadixPhase {
  return phase !== undefined && RADIX_PHASES.has(phase);
}

export function isSettledPhase(phase: RadixPhase): boolean {
  return SETTLED_PHASES.has(phase);
}

export function radixDigitCount(value: number): number {
  return String(Math.floor(Math.abs(value))).length;
}

export function radixDigitAt(value: number, exponent: number): number {
  return Math.floor(Math.abs(value) / 10 ** exponent) % 10;
}

export function radixDigits(value: number, maxDigits: number): RadixDigit[] {
  const width = Math.max(1, Math.floor(maxDigits));
  const length = radixDigitCount(value);
  return Array.from({ length: width }, (_, column) => {
    const exponent = width - column - 1;
    return { digit: radixDigitAt(value, exponent), exponent, lead: exponent >= length };
  });
}

const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'] as const;

export function radixSuperscript(exponent: number): string {
  return [...String(Math.max(0, Math.floor(exponent)))].map((digit) => SUPERSCRIPT_DIGITS[Number(digit)]).join('');
}

export function radixPlaceLabel(exponent: number): I18nText {
  if (exponent === 0) return i18nText(PLACES.ones);
  if (exponent === 1) return i18nText(PLACES.tens);
  if (exponent === 2) return i18nText(PLACES.hundreds);
  return i18nText(PLACES.power, { power: radixSuperscript(exponent) });
}

export function radixPad(value: number, width: number): string {
  return String(value).padStart(Math.max(1, width), '0');
}

export function radixState(step: SortStep | null, array: readonly number[]): RadixState {
  const fallback = array.map((value, index) => ({ id: `rdx-${index}`, value }));
  const output = step?.items?.length ? step.items : fallback;
  const source = step?.sourceItems?.length ? step.sourceItems : output;
  const rawPhase = step?.phase;
  const phase: RadixPhase = isRadixPhase(rawPhase) ? rawPhase : 'idle';
  const widest = Math.max(1, ...source.map((item) => radixDigitCount(item.value)));
  return {
    phase,
    exponent: phase === 'idle' ? null : (step?.digitIndex ?? null),
    maxDigits: Math.max(1, step?.maxDigits ?? widest),
    source,
    output,
    buckets: Array.from(
      { length: RADIX_BUCKET_COUNT },
      (_, bucket) => step?.buckets?.find((entry) => entry.bucket === bucket)?.items ?? [],
    ),
    activeId: step?.activeItemId ?? null,
    activeBucket: step?.activeBucket ?? null,
  };
}

export function radixBins(state: RadixState): RadixBin[] {
  const working = state.phase === 'distribute' || state.phase === 'gather';
  return state.buckets.map((items, bucket) => {
    const active = working && state.activeBucket === bucket;
    const tone: RadixBinTone = active
      ? state.phase === 'distribute'
        ? 'pink'
        : 'cyan'
      : items.length === 0
        ? 'empty'
        : 'idle';
    return {
      bucket,
      tone,
      count: items.length,
      cards: items.map((item) => ({
        id: item.id,
        value: item.value,
        fresh: state.phase === 'distribute' && item.id === state.activeId,
        digits: radixDigits(item.value, radixDigitCount(item.value)),
      })),
    };
  });
}
