import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { SearchRowStatus, SearchTraceState } from '../../models/search';
import { TapeLayout, TapeMetrics, TapeSpan, tapeCenter, tapeSpan } from '../../utils/helpers/tape-layout/tape-layout.utils';

export type SearchCellTone = 'idle' | 'live' | 'dim' | 'pink' | 'lime' | 'candidate';

export type SearchCandidate = 'first' | 'last' | 'both';

export type SearchCursorTone = 'cyan' | 'pink' | 'lime';

export type SearchNoteTone = 'cyan' | 'pink' | 'lime' | 'red';

export interface SearchTapeCell {
  readonly index: number;
  readonly value: number;
  readonly tone: SearchCellTone;
  readonly candidate: SearchCandidate | null;
  readonly focus: boolean;
}

export interface SearchCursor {
  readonly id: 'lo' | 'hi' | 'lohi' | 'probe';
  readonly index: number;
  readonly tone: SearchCursorTone;
  readonly side: 'top' | 'bottom';
  readonly labels: readonly I18nKey[];
}

export interface SearchSpan {
  readonly from: number;
  readonly to: number;
  readonly tone: SearchCursorTone;
}

export interface SearchTapeView {
  readonly cells: readonly SearchTapeCell[];
  readonly range: SearchSpan | null;
  readonly hit: SearchSpan | null;
  readonly probe: SearchSpan | null;
  readonly cursors: readonly SearchCursor[];
  readonly focus: number | null;
  readonly note: TranslatableText;
  readonly noteTone: SearchNoteTone;
}

export interface PlacedSearchSpan extends SearchSpan, TapeSpan {}

export interface PlacedSearchCursor extends SearchCursor {
  readonly x: number;
}

export const SEARCH_TAPE_METRICS: TapeMetrics = {
  gap: 3,
  inset: 10,
  minCell: 28,
  maxCell: 52,
  pad: 8,
  advance: 0.62,
  fonts: [20, 18, 16, 14],
};

export const SEARCH_RANGE_OUTSET = 5;

export const SEARCH_CELL_OUTSET = 1;

const SEARCH_TONES: Readonly<Record<SearchRowStatus, SearchCellTone>> = {
  found: 'lime',
  probe: 'pink',
  bound: 'candidate',
  eliminated: 'dim',
  visited: 'dim',
  window: 'live',
  idle: 'idle',
};

const R = I18N_KEY.features.algorithms.display.registers;

const PROBE_LABEL_BY_MODE: Readonly<Record<string, I18nKey>> = {
  'features.algorithms.runtime.search.linearSearch.modeLabel': R.i,
};

export const SEARCH_CANDIDATE_LABELS: Readonly<Record<SearchCandidate, I18nKey>> = {
  first: I18N_KEY.features.algorithms.display.search.candidates.first,
  last: I18N_KEY.features.algorithms.display.search.candidates.last,
  both: I18N_KEY.features.algorithms.display.search.candidates.both,
};

export const SEARCH_CANDIDATE_MARKS: Readonly<Record<SearchCandidate, string>> = {
  first: '⇤',
  last: '⇥',
  both: '⇹',
};

export function searchProbeLabel(state: SearchTraceState): I18nKey {
  const mode = typeof state.modeLabel === 'string' ? state.modeLabel : state.modeLabel.key;
  return PROBE_LABEL_BY_MODE[mode] ?? R.mid;
}

export function searchCandidate(state: SearchTraceState, index: number): SearchCandidate | null {
  const first = state.leftBound === index;
  const last = state.rightBound === index;
  if (first && last) return 'both';
  if (first) return 'first';
  if (last) return 'last';
  return null;
}

export function searchHitSpan(indices: readonly number[]): SearchSpan | null {
  if (indices.length === 0) return null;
  const sorted = [...indices].sort((a, b) => a - b);
  const from = sorted[0] ?? 0;
  const to = sorted[sorted.length - 1] ?? from;
  if (to - from + 1 !== new Set(sorted).size) return null;
  return { from, to, tone: 'lime' };
}

export function searchTapeView(state: SearchTraceState): SearchTapeView {
  const found = state.resultIndices.length > 0;
  const hasRange = state.low !== null && state.high !== null;
  const probe = state.probeIndex;
  const probeFound = probe !== null && state.resultIndices.includes(probe);
  const focus = probe ?? (found ? Math.min(...state.resultIndices) : state.low);

  const cells = state.rows.map<SearchTapeCell>((row) => ({
    index: row.index,
    value: row.value,
    tone: SEARCH_TONES[row.status],
    candidate: searchCandidate(state, row.index),
    focus: row.index === focus,
  }));

  return {
    cells,
    range: hasRange && !found ? { from: state.low ?? 0, to: state.high ?? 0, tone: 'cyan' } : null,
    hit: searchHitSpan(state.resultIndices),
    probe: probe !== null && !probeFound ? { from: probe, to: probe, tone: 'pink' } : null,
    cursors: searchCursors(state, probeFound),
    focus,
    note: state.decision ?? state.statusLabel,
    noteTone: found ? 'lime' : probe !== null ? 'pink' : hasRange ? 'cyan' : 'red',
  };
}

export function searchCursors(state: SearchTraceState, probeFound: boolean): SearchCursor[] {
  const cursors: SearchCursor[] = [];
  const found = state.resultIndices.length > 0;
  if (state.low !== null && state.high !== null && !found) {
    if (state.low === state.high) {
      cursors.push({ id: 'lohi', index: state.low, tone: 'cyan', side: 'bottom', labels: [R.lo, R.hi] });
    } else {
      cursors.push({ id: 'lo', index: state.low, tone: 'cyan', side: 'bottom', labels: [R.lo] });
      cursors.push({ id: 'hi', index: state.high, tone: 'cyan', side: 'bottom', labels: [R.hi] });
    }
  }
  if (state.probeIndex !== null) {
    cursors.push({
      id: 'probe',
      index: state.probeIndex,
      tone: probeFound ? 'lime' : 'pink',
      side: 'top',
      labels: [searchProbeLabel(state)],
    });
  }
  return cursors;
}

export function placeSearchSpan(span: SearchSpan | null, layout: TapeLayout, outset: number): PlacedSearchSpan | null {
  if (!span) return null;
  return { ...span, ...tapeSpan(span.from, span.to, layout, outset) };
}

export function placeSearchCursors(cursors: readonly SearchCursor[], layout: TapeLayout): PlacedSearchCursor[] {
  return cursors.map((cursor) => ({ ...cursor, x: tapeCenter(cursor.index, layout) }));
}
