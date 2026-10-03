import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  StringSuffixRow,
  SuffixArrayConstructionTraceState,
  SuffixArrayLcpTraceState,
} from '../../models/string';
import {
  StringCell,
  StringDisplay,
  StringFact,
  StringMarker,
  StringRackRow,
  StringTone,
  band,
  cell,
  charCells,
  displayChar,
  head,
  row,
  valueCells,
} from './string-tape.utils';

const STRING = I18N_KEY.features.algorithms.display.string;
const RACKS = I18N_KEY.features.algorithms.display.racks;

const SUFFIX_ROW_TONES: Readonly<Record<StringSuffixRow['tone'], RackRowTone>> = {
  pending: 'dim',
  active: 'now',
  compare: 'head',
  sorted: 'default',
};

const SUFFIX_LEDS: Readonly<Record<StringSuffixRow['tone'], LedColor | null>> = {
  pending: null,
  active: 'cyan',
  compare: 'pink',
  sorted: 'slate',
};

function suffixRackRow(entry: StringSuffixRow, value: string, complete: boolean, body: string | null): StringRackRow {
  return {
    id: entry.id,
    lead: entry.suffix,
    body,
    value,
    tone: complete ? 'done' : SUFFIX_ROW_TONES[entry.tone],
    led: complete ? 'lime' : SUFFIX_LEDS[entry.tone],
  };
}

export function suffixArrayDisplay(state: SuffixArrayConstructionTraceState): StringDisplay {
  const n = state.source.length;
  const k = state.stepSize;
  const complete = state.phase === 'complete';
  const active = new Set(state.activeSuffixes);
  const lead = state.activeSuffixes[0] ?? null;
  const sourceTone = (index: number): StringTone => {
    if (index === lead) return 'cyan';
    if (active.has(index)) return 'pink';
    return complete ? 'ink' : 'idle';
  };
  const showNext = state.phase !== 'seed';
  const rows = [
    row('source', 'tape', charCells('s', state.source, 0, sourceTone), {
      caption: STRING.captions.source,
      aside: i18nText(STRING.aside.textLength, { n }),
    }),
    row(
      'rank',
      'values',
      valueCells('r', state.ranks, 0, (index) => (active.has(index) ? 'cyan' : 'amber'), (index) => index === lead),
      { caption: STRING.captions.ranks, captionTone: 'amber' },
    ),
  ];
  if (showNext) {
    rows.push(
      row(
        'next',
        'values',
        valueCells(
          'n',
          state.ranks.map((_, index) => (index + k < n ? (state.ranks[index + k] ?? null) : '—')),
          0,
          (index) => (active.has(index) ? 'cyan' : 'amber'),
          (index) => index === lead,
        ),
        { caption: i18nText(STRING.captions.ranksNext, { k }), captionTone: 'amber' },
      ),
    );
  }
  const markers: StringMarker[] = [];
  if (lead !== null && !complete) {
    markers.push(band('window', 'cyan', 'source', lead, Math.min(n - 1, lead + 2 * k - 1), i18nText(STRING.marks.span, { length: 2 * k })));
  }
  const facts: StringFact[] = [
    { id: 'k', label: STRING.facts.k, value: String(k), tone: 'cyan' },
    { id: 'distinct', label: RACKS.ranks, value: `${Math.min(state.distinctRanks, n)}/${n}`, tone: 'amber' },
  ];
  return {
    rows,
    markers,
    racks: [
      {
        id: 'suffixes',
        title: RACKS.suffixes,
        meta: String(state.rows.length),
        rows: state.rows.map((entry) => suffixRackRow(entry, String(entry.startIndex), complete, entry.pairLabel)),
        empty: [],
      },
    ],
    facts,
    notes: [],
    tree: null,
  };
}

function suffixCells(prefix: string, source: string, start: number, toneAt: (offset: number) => StringTone): readonly StringCell[] {
  return Array.from(source.slice(start), (glyph, offset) =>
    cell(`${prefix}${offset}`, offset, displayChar(glyph), toneAt(offset), { index: String(start + offset) }),
  );
}

export function suffixLcpDisplay(state: SuffixArrayLcpTraceState): StringDisplay {
  const i = state.activeSuffixes[0] ?? null;
  const j = state.compareWith;
  const h = state.currentMatchLength;
  const complete = state.phase === 'complete';
  const sourceTone = (index: number): StringTone => {
    if (i !== null && index >= i && index < i + h) return 'lime';
    if (index === i) return 'cyan';
    if (index === j) return 'violet';
    return 'idle';
  };
  const rows = [
    row('source', 'tape', charCells('s', state.source, 0, sourceTone), {
      caption: STRING.captions.source,
      aside: i18nText(STRING.aside.textLength, { n: state.source.length }),
    }),
  ];
  const markers: StringMarker[] = [];
  if (i !== null && j !== null && !complete) {
    const next = h;
    const differs = state.source[i + next] !== state.source[j + next];
    const toneAt = (offset: number): StringTone => (offset < h ? 'lime' : offset === next ? (differs ? 'pink' : 'cyan') : 'idle');
    rows.push(
      row('si', 'tape', suffixCells('a', state.source, i, toneAt), { caption: i18nText(STRING.captions.suffixAt, { i }) }),
      row('sj', 'tape', suffixCells('b', state.source, j, toneAt), { caption: i18nText(STRING.captions.suffixPrev, { j }) }),
    );
    const shortest = Math.min(state.source.length - i, state.source.length - j);
    if (next < shortest) markers.push(head('head', differs ? 'pink' : 'cyan', 'si', 'sj', next, i18nText(STRING.marks.match, { h })));
    if (h > 0) markers.push(band('common', 'lime', 'si', 0, h - 1, null, 'sj'));
  }
  const facts: StringFact[] = [{ id: 'h', label: STRING.facts.h, value: String(h), tone: 'lime' }];
  return {
    rows,
    markers,
    racks: [
      {
        id: 'suffixes',
        title: RACKS.suffixes,
        meta: String(state.rows.length),
        rows: state.rows.map((entry) => suffixRackRow(entry, entry.lcp === null ? '·' : String(entry.lcp), complete, null)),
        empty: [],
      },
    ],
    facts,
    notes: [],
    tree: null,
  };
}
