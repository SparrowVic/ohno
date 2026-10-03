import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import { KmpTraceState, RabinKarpTraceState, ZAlgorithmTraceState } from '../../models/string';
import {
  StringDisplay,
  StringFact,
  StringMarker,
  StringNote,
  StringRack,
  StringRow,
  StringTone,
  band,
  charCells,
  head,
  inRange,
  occurrences,
  row,
  valueCells,
} from './string-tape.utils';

const STRING = I18N_KEY.features.algorithms.display.string;
const RACKS = I18N_KEY.features.algorithms.display.racks;
const NOTES = I18N_KEY.features.algorithms.display.notes;

export function matchesRack(
  starts: readonly number[],
  length: number,
  text: string,
  pattern: string,
  endIndex = true,
  shift = 0,
): StringRack {
  const rows = starts.map((start, position) => ({
    id: `hit-${start}`,
    lead: i18nText(STRING.rows.span, { from: start, to: start + length - 1 }),
    body: null,
    value: String(start),
    tone: position === starts.length - 1 ? ('done' as const) : ('default' as const),
    led: 'lime' as const,
  }));
  return {
    id: 'matches',
    title: RACKS.matches,
    meta: String(starts.length),
    rows,
    empty: starts.length === 0 ? matchEmptyLines(text, pattern, endIndex, shift) : [],
  };
}

function matchEmptyLines(text: string, pattern: string, endIndex: boolean, shift: number): readonly TranslatableText[] {
  const first = occurrences(text, pattern)[0];
  if (first === undefined) return [NOTES.noMatchYet, STRING.notes.neverOccurs];
  return [NOTES.noMatchYet, i18nText(STRING.notes.firstAt, { index: shift + (endIndex ? first + pattern.length - 1 : first) })];
}

export interface KmpFallbackLink {
  readonly from: number;
  readonly to: number;
}

export interface KmpFallbackChain {
  readonly stage: 'failure' | 'scan';
  readonly hit: boolean;
  readonly at: number;
  readonly textChar: string;
  readonly patternChar: string;
  readonly links: readonly KmpFallbackLink[];
}

function fallbackAnchor(state: KmpTraceState): number {
  return state.stage === 'failure' ? (state.comparePatternIndex ?? -1) : (state.textIndex ?? -1);
}

function isHitFallback(state: KmpTraceState): boolean {
  return state.stage === 'scan' && state.fallbackFrom === state.pattern.length;
}

export function kmpFallbackChain(history: readonly SortStep[], cursor: number): KmpFallbackChain | null {
  let latest = -1;
  for (let index = Math.min(cursor, history.length - 1); index >= 0; index--) {
    const state = history[index]?.string;
    if (state?.mode !== 'kmp') return null;
    if (state.fallbackFrom !== null && state.fallbackTo !== null && state.stage !== 'done') {
      latest = index;
      break;
    }
  }
  if (latest < 0) return null;
  const last = history[latest]!.string as KmpTraceState;
  const anchor = fallbackAnchor(last);
  const hit = isHitFallback(last);
  const chain: KmpTraceState[] = [last];
  if (!hit) {
    for (let index = latest - 1; index >= 0; index--) {
      const state = history[index]?.string;
      if (state?.mode !== 'kmp' || state.stage !== last.stage || fallbackAnchor(state) !== anchor) break;
      if (state.fallbackFrom !== null && !isHitFallback(state)) chain.unshift(state);
    }
  }
  const first = chain[0]!;
  const textChar = first.stage === 'failure' ? (first.pattern[anchor] ?? '') : (first.text[anchor] ?? '');
  return {
    stage: last.stage === 'failure' ? 'failure' : 'scan',
    hit,
    at: hit ? anchor - first.pattern.length + 1 : anchor,
    textChar,
    patternChar: first.pattern[first.fallbackFrom ?? 0] ?? '',
    links: chain.map((state) => ({ from: state.fallbackFrom ?? 0, to: state.fallbackTo ?? 0 })),
  };
}

export function kmpFallbackNote(chain: KmpFallbackChain | null): StringNote | null {
  if (!chain) return null;
  const lines: TranslatableText[] = [];
  if (chain.hit) {
    lines.push(i18nText(STRING.fallback.hit, { start: chain.at }));
  } else if (chain.stage === 'failure') {
    lines.push(i18nText(STRING.fallback.buildMismatch, { q: chain.at, a: chain.textChar, b: chain.patternChar }));
  } else {
    lines.push(i18nText(STRING.fallback.mismatch, { i: chain.at, text: chain.textChar, pattern: chain.patternChar }));
  }
  const jump = chain.stage === 'failure' ? STRING.fallback.buildJump : STRING.fallback.jump;
  for (const link of chain.links) lines.push(i18nText(jump, { k: link.from - 1, to: link.to }));
  return { id: 'last-fallback', title: RACKS.lastFallback, lines, tone: 'pink' };
}

function kmpFailureDisplay(state: KmpTraceState): Omit<StringDisplay, 'notes'> {
  const q = state.comparePatternIndex;
  const k = state.patternIndex ?? 0;
  const falling = state.fallbackFrom !== null;
  const comparing = q !== null && q > 0;
  const mismatch = comparing && (falling || state.pattern[q] !== state.pattern[k]);
  const compareTone: StringTone = mismatch ? 'pink' : 'cyan';
  const textRow = row('text', 'tape', charCells('t', state.text, 0, () => 'dim'), {
    caption: RACKS.text,
    aside: i18nText(STRING.aside.textLength, { n: state.text.length }),
  });
  const patternTone = (index: number): StringTone => {
    if (comparing && (index === q || index === k)) return compareTone;
    if (comparing && k > 0 && (index < k || inRange(index, q - k, k))) return 'lime';
    return index <= state.failureReadyIndex ? 'ink' : 'idle';
  };
  const patternRow = row('pattern', 'tape', charCells('p', state.pattern, 0, patternTone), {
    caption: RACKS.pattern,
    aside: i18nText(STRING.aside.lpsReady, { ready: Math.max(0, state.failureReadyIndex + 1), total: state.pattern.length }),
  });
  const usedLps = falling && state.fallbackFrom !== null ? state.fallbackFrom - 1 : null;
  const lpsRow = row(
    'lps',
    'values',
    valueCells(
      'l',
      state.failure.map((value, index) => (index <= state.failureReadyIndex ? value : null)),
      0,
      (index) => (index === usedLps ? 'pink' : index <= state.failureReadyIndex ? 'amber' : 'dim'),
      (index) => index === usedLps || (!falling && index === q && index <= state.failureReadyIndex),
    ),
    { caption: RACKS.lps, captionTone: 'amber' },
  );
  const markers: StringMarker[] = [];
  if (comparing && q !== null) markers.push(head('head', compareTone, 'pattern', 'lps', q, falling ? STRING.marks.fallback : RACKS.head));
  const facts: StringFact[] = [{ id: 'prefix', label: NOTES.matchSoFar, value: String(k), tone: 'cyan' }];
  if (k > 0) facts.push({ id: 'lps', label: STRING.facts.lpsPrevK, value: String(state.failure[k - 1] ?? 0), tone: 'amber' });
  return {
    rows: [textRow, patternRow, lpsRow],
    markers,
    racks: [matchesRack(state.matches, state.pattern.length, state.text, state.pattern)],
    facts,
    tree: null,
  };
}

function kmpScanDisplay(state: KmpTraceState): Omit<StringDisplay, 'notes'> {
  const m = state.pattern.length;
  const done = state.stage === 'done';
  const offset = done ? Math.max(0, state.text.length - m) : Math.max(0, state.alignment);
  const i = state.compareTextIndex;
  const j = state.comparePatternIndex;
  const hit = state.fallbackFrom === m;
  const falling = state.fallbackFrom !== null && !hit;
  const comparing = i !== null && j !== null;
  const equal = comparing && state.text[i] === state.pattern[j];
  const headTone: StringTone = hit ? 'lime' : falling ? 'pink' : comparing && !equal ? 'pink' : 'cyan';
  const matched = state.patternIndex ?? 0;
  const reach = state.textIndex ?? state.text.length;
  const textTone = (index: number): StringTone => {
    if (!done && comparing && index === i) return headTone;
    if (hit && inRange(index, offset, m)) return 'lime';
    if (!done && inRange(index, offset, matched)) return 'lime';
    if (state.matches.some((start) => inRange(index, start, m))) return 'lime';
    return index < reach ? 'dim' : 'idle';
  };
  const patternTone = (index: number): StringTone => {
    if (done) return 'idle';
    if (comparing && index === j) return headTone;
    if (hit) return 'lime';
    if (index < matched) return 'lime';
    return 'idle';
  };
  const lpsIndex = !done && matched > 0 ? matched - 1 : null;
  const rows: StringRow[] = [
    row('text', 'tape', charCells('t', state.text, 0, textTone), {
      caption: RACKS.text,
      aside: done ? i18nText(STRING.aside.textLength, { n: state.text.length }) : i18nText(STRING.aside.shift, { shift: offset }),
    }),
    row('pattern', 'tape', charCells('p', state.pattern, offset, patternTone), {
      caption: RACKS.pattern,
      aside: i18nText(STRING.aside.patternLength, { m }),
    }),
    row(
      'lps',
      'values',
      valueCells('l', state.failure, offset, () => 'amber', (index) => index === lpsIndex),
      { caption: RACKS.lps, captionTone: 'amber' },
    ),
  ];
  const markers: StringMarker[] = [];
  const headColumn = comparing ? i : state.textIndex;
  if (!done && headColumn !== null && headColumn < state.text.length) {
    const label = hit ? STRING.marks.hit : falling ? STRING.marks.fallback : RACKS.head;
    markers.push(head('head', headTone, 'text', 'pattern', headColumn, label));
  }
  const facts: StringFact[] = [];
  if (!done) {
    facts.push({ id: 'prefix', label: NOTES.matchSoFar, value: String(matched), tone: 'cyan' });
    if (matched > 0) facts.push({ id: 'lps', label: STRING.facts.lpsPrev, value: String(state.failure[matched - 1] ?? 0), tone: 'amber' });
  }
  return {
    rows,
    markers,
    racks: [matchesRack(state.matches, m, state.text, state.pattern)],
    facts,
    tree: null,
  };
}

export function kmpDisplay(state: KmpTraceState, chain: KmpFallbackChain | null): StringDisplay {
  const base = state.stage === 'failure' ? kmpFailureDisplay(state) : kmpScanDisplay(state);
  const note = kmpFallbackNote(chain);
  return { ...base, notes: note ? [note] : [] };
}

export function rabinKarpDisplay(state: RabinKarpTraceState): StringDisplay {
  const m = state.windowLength;
  const start = state.windowStart;
  const end = start + m - 1;
  const v = state.verificationIndex;
  const verifyEqual = v !== null && state.text[start + v] === state.pattern[v];
  const sameHash = state.patternHash === state.windowHash;
  const isMatch = state.matches.includes(start);
  const windowTone: StringTone = state.collision ? 'amber' : isMatch ? 'lime' : state.verifying || sameHash ? 'cyan' : 'pink';
  const textTone = (index: number): StringTone => {
    if (v !== null && index === start + v) return verifyEqual ? 'cyan' : 'pink';
    if (state.matches.some((hitStart) => inRange(index, hitStart, m))) return 'lime';
    if (inRange(index, start, m)) return 'ink';
    return index < start ? 'dim' : 'idle';
  };
  const patternTone = (index: number): StringTone => {
    if (v !== null && index === v) return verifyEqual ? 'cyan' : 'pink';
    if (v !== null && index < v) return 'lime';
    if (isMatch) return 'lime';
    return 'idle';
  };
  const rows: StringRow[] = [
    row('text', 'tape', charCells('t', state.text, 0, textTone), {
      caption: RACKS.text,
      aside: i18nText(STRING.aside.window, { from: start, to: end }),
    }),
    row('pattern', 'tape', charCells('p', state.pattern, start, patternTone), {
      caption: RACKS.pattern,
      aside: i18nText(STRING.aside.patternLength, { m: state.pattern.length }),
    }),
  ];
  const markers: StringMarker[] = [band('window', windowTone, 'text', start, end, STRING.marks.window, 'pattern')];
  if (v !== null) markers.push(head('head', verifyEqual ? 'cyan' : 'pink', 'text', 'pattern', start + v, null));
  const hashRack: StringRack = {
    id: 'hash',
    title: RACKS.hash,
    meta: null,
    rows: [
      { id: 'hp', lead: STRING.facts.patternHash, body: null, value: String(state.patternHash), tone: 'default', led: 'violet' },
      {
        id: 'ht',
        lead: STRING.facts.windowHash,
        body: null,
        value: String(state.windowHash),
        tone: sameHash ? 'done' : 'default',
        led: sameHash ? 'lime' : 'pink',
      },
    ],
    empty: [],
  };
  const facts: StringFact[] = [
    { id: 'base', label: STRING.facts.base, value: String(state.base), tone: 'ink' },
    { id: 'mod', label: STRING.facts.mod, value: String(state.mod), tone: 'ink' },
  ];
  if (state.outgoingChar !== null && state.incomingChar !== null) {
    facts.push({ id: 'roll', label: STRING.facts.roll, value: `${state.outgoingChar} → ${state.incomingChar}`, tone: 'cyan' });
  }
  const notes: StringNote[] = state.collision
    ? [{ id: 'collision', title: STRING.notes.collisionTitle, lines: [STRING.notes.collisionBody], tone: 'amber' }]
    : [];
  return {
    rows,
    markers,
    racks: [hashRack, matchesRack(state.matches, state.pattern.length, state.text, state.pattern, false)],
    facts,
    notes,
    tree: null,
  };
}

export function zAlgorithmDisplay(state: ZAlgorithmTraceState): StringDisplay {
  const m = state.patternLength;
  const combined = state.combined;
  const active = state.activeIndex;
  const prefixIndex = state.comparePrefixIndex;
  const matchIndex = state.compareMatchIndex;
  const comparing = prefixIndex !== null && matchIndex !== null;
  const equal = comparing && combined[prefixIndex] === combined[matchIndex];
  const compareTone: StringTone = comparing && !equal ? 'pink' : 'cyan';
  const hitColumns = state.matches.map((offset) => offset + m + 1);
  const zKnown = (index: number): boolean => index > 0 && active !== null && index <= active;
  const isMirror = comparing && active !== null && matchIndex - active !== prefixIndex;
  const combinedTone = (index: number): StringTone => {
    if (comparing && index === matchIndex) return isMirror ? 'cyan' : compareTone;
    if (isMirror && index === prefixIndex) return 'violet';
    if (index === m) return 'dim';
    if (hitColumns.some((column) => inRange(index, column, m))) return 'lime';
    if (index < m) return 'violet';
    return active !== null && index < active ? 'dim' : 'idle';
  };
  const rows: StringRow[] = [
    row('combined', 'tape', charCells('c', combined, 0, combinedTone), {
      caption: STRING.captions.combined,
      aside: i18nText(STRING.aside.patternLength, { m }),
    }),
  ];
  const markers: StringMarker[] = [];
  const valid = active !== null && active > 0 && active < combined.length;
  const mirror = valid && comparing && matchIndex - active !== prefixIndex ? prefixIndex : null;
  if (valid && mirror === null) {
    const z = state.zValues[active] ?? 0;
    const matchedTo = matchIndex ?? active + z;
    const prefixTone = (index: number): StringTone => {
      if (comparing && index === prefixIndex) return compareTone;
      if (active + index < matchedTo) return 'lime';
      return 'idle';
    };
    rows.push(
      row('prefix', 'tape', charCells('q', combined.slice(0, m), active, prefixTone), {
        caption: STRING.captions.prefix,
        aside: i18nText(STRING.aside.at, { i: active }),
      }),
    );
    if (comparing) markers.push(head('head', compareTone, 'combined', 'prefix', matchIndex, RACKS.head));
  }
  rows.push(
    row(
      'z',
      'values',
      valueCells(
        'z',
        state.zValues.map((value, index) => (index === 0 ? '—' : zKnown(index) ? value : null)),
        0,
        (index) =>
          index === mirror ? 'violet' : zKnown(index) && (state.zValues[index] ?? 0) >= m && m > 0 ? 'lime' : zKnown(index) ? 'amber' : 'dim',
        (index) => index === active || index === mirror,
      ),
      { caption: STRING.captions.zValues, captionTone: 'amber' },
    ),
  );
  if (valid && mirror !== null) markers.push(head('head', 'cyan', 'combined', 'z', active, STRING.marks.mirror));
  if (state.boxLeft !== null && state.boxRight !== null && state.boxRight >= state.boxLeft) {
    markers.unshift(band('zbox', 'violet', 'combined', state.boxLeft, state.boxRight, STRING.marks.zBox));
  }
  const facts: StringFact[] = [];
  if (active !== null) facts.push({ id: 'z', label: STRING.facts.zValue, value: String(state.zValues[active] ?? 0), tone: 'amber' });
  if (state.boxLeft !== null && state.boxRight !== null) {
    facts.push({ id: 'box', label: STRING.facts.zBox, value: `${state.boxLeft}–${state.boxRight}`, tone: 'violet' });
  }
  const text = combined.slice(m + 1);
  const pattern = combined.slice(0, m);
  return {
    rows,
    markers,
    racks: [matchesRack(state.matches, m, text, pattern, false, m + 1)],
    facts,
    notes: [],
    tree: null,
  };
}
