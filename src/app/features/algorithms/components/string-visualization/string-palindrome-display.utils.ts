import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { ManacherTraceState, PalindromicTreeNodeView, PalindromicTreeTraceState } from '../../models/string';
import {
  StringDisplay,
  StringFact,
  StringMarker,
  StringNote,
  StringRackRow,
  StringTone,
  band,
  charCells,
  head,
  inRange,
  row,
  valueCells,
} from './string-tape.utils';

const STRING = I18N_KEY.features.algorithms.display.string;
const RACKS = I18N_KEY.features.algorithms.display.racks;

export function manacherLongestStart(state: ManacherTraceState): number | null {
  if (state.longestCenter === null || state.longestRadius <= 0) return null;
  return Math.floor((state.longestCenter - state.longestRadius) / 2);
}

export function manacherDisplay(state: ManacherTraceState): StringDisplay {
  const center = state.currentCenter;
  const radius = state.activeRadius;
  const left = state.compareLeft;
  const right = state.compareRight;
  const comparing = left !== null && right !== null;
  const equal = comparing && state.transformed[left] === state.transformed[right];
  const compareTone: StringTone = comparing && !equal ? 'pink' : 'cyan';
  const longestStart = manacherLongestStart(state);
  const sourceTone = (index: number): StringTone =>
    longestStart !== null && inRange(index, longestStart, state.longestRadius) ? 'lime' : 'ink';
  const transformedTone = (index: number): StringTone => {
    if (comparing && (index === left || index === right)) return compareTone;
    if (index === center) return 'cyan';
    if (index === state.mirrorIndex) return 'violet';
    if (center !== null && radius > 0 && Math.abs(index - center) <= radius) return 'lime';
    return state.transformed[index] === '#' ? 'dim' : 'idle';
  };
  const known = (index: number): boolean => center !== null && index <= center;
  const markers: StringMarker[] = [];
  if (state.leftBoundary !== null && state.rightBoundary !== null && state.rightBoundary > state.leftBoundary) {
    markers.push(band('reach', 'violet', 'transformed', state.leftBoundary, state.rightBoundary, STRING.marks.rightEdge));
  }
  if (center !== null) markers.push(head('head', comparing ? compareTone : 'cyan', 'transformed', 'radii', center, STRING.marks.center));
  const facts: StringFact[] = [
    { id: 'radius', label: STRING.facts.radius, value: String(radius), tone: 'amber' },
  ];
  if (state.mirrorIndex !== null) facts.push({ id: 'mirror', label: STRING.facts.mirror, value: String(state.mirrorIndex), tone: 'violet' });
  if (state.rightBoundary !== null) facts.push({ id: 'edge', label: STRING.facts.rightEdge, value: String(state.rightBoundary), tone: 'violet' });
  const notes: StringNote[] = [];
  if (state.mirrorIndex !== null && center !== null) {
    notes.push({
      id: 'mirror',
      title: STRING.notes.mirrorTitle,
      lines: [
        i18nText(STRING.notes.mirrorIndex, { mirror: state.mirrorIndex }),
        i18nText(STRING.notes.mirrorValue, { value: state.radii[state.mirrorIndex] ?? 0 }),
      ],
      tone: 'violet',
    });
  }
  const longestRows: StringRackRow[] =
    state.longestPalindrome.length > 0
      ? [
          {
            id: 'longest',
            lead: state.longestPalindrome,
            body: null,
            value: String(state.longestPalindrome.length),
            tone: 'done',
            led: 'lime',
          },
        ]
      : [];
  return {
    rows: [
      row('source', 'tape', charCells('s', state.source, 0, sourceTone), {
        caption: STRING.captions.source,
        aside: i18nText(STRING.aside.textLength, { n: state.source.length }),
      }),
      row('transformed', 'tape', charCells('x', state.transformed, 0, transformedTone), {
        caption: STRING.captions.transformed,
        aside: i18nText(STRING.aside.textLength, { n: state.transformed.length }),
      }),
      row(
        'radii',
        'values',
        valueCells(
          'r',
          state.radii.map((value, index) => (known(index) ? value : null)),
          0,
          (index) => (index === state.longestCenter && state.longestRadius > 0 ? 'lime' : known(index) ? 'amber' : 'dim'),
          (index) => index === center,
        ),
        { caption: STRING.captions.radii, captionTone: 'amber' },
      ),
    ],
    markers,
    racks: [{ id: 'longest', title: STRING.racks.longest, meta: null, rows: longestRows, empty: longestRows.length ? [] : [STRING.notes.noPalindromeYet] }],
    facts,
    notes,
    tree: null,
  };
}

export function palindromeLabel(palindrome: string): TranslatableText {
  if (palindrome === 'odd-root') return STRING.nodes.oddRoot;
  if (palindrome === 'ε' || palindrome === '') return STRING.nodes.evenRoot;
  return palindrome;
}

const PAL_ROW_TONES: Readonly<Record<PalindromicTreeNodeView['tone'], RackRowTone>> = {
  root: 'dim',
  active: 'now',
  new: 'done',
  suffix: 'default',
  ready: 'default',
};

const PAL_LEDS: Readonly<Record<PalindromicTreeNodeView['tone'], LedColor | null>> = {
  root: null,
  active: 'cyan',
  new: 'lime',
  suffix: 'pink',
  ready: 'slate',
};

export function palindromicTreeDisplay(state: PalindromicTreeTraceState): StringDisplay {
  const processed = state.processedIndex;
  const longest = state.longestSuffix.length;
  const suffixStart = processed - longest + 1;
  const sourceTone = (index: number): StringTone => {
    if (index === processed) return state.phase === 'followLink' ? 'pink' : 'cyan';
    if (longest > 0 && index >= suffixStart && index <= processed) return 'lime';
    return index < processed ? 'ink' : 'idle';
  };
  const markers: StringMarker[] = [];
  if (processed >= 0 && longest > 0) {
    markers.push(band('suffix', 'lime', 'source', suffixStart, processed, STRING.marks.longestSuffix));
  }
  if (processed >= 0 && processed < state.source.length) markers.push(head('head', 'cyan', 'source', 'source', processed, null));
  const byId = new Map(state.nodes.map((node) => [node.id, node] as const));
  const rows: StringRackRow[] = state.nodes.map((node) => ({
    id: node.id,
    lead: palindromeLabel(node.palindrome),
    body: node.length > 0 ? i18nText(STRING.rows.occurrences, { count: node.occurrences }) : null,
    value: String(node.length),
    tone: PAL_ROW_TONES[node.tone],
    led: PAL_LEDS[node.tone],
  }));
  const notes: StringNote[] = [];
  const path = state.suffixPath.map((id) => byId.get(id)).filter((node): node is PalindromicTreeNodeView => !!node);
  if (path.length > 0) {
    notes.push({
      id: 'suffix-path',
      title: STRING.notes.suffixPathTitle,
      lines: path.map((node) => palindromeLabel(node.palindrome)),
      tone: 'pink',
    });
  }
  const facts: StringFact[] = [];
  if (state.currentChar !== null) facts.push({ id: 'char', label: STRING.facts.char, value: state.currentChar, tone: 'cyan' });
  facts.push({ id: 'longest', label: STRING.facts.longestSuffix, value: String(longest), tone: 'lime' });
  return {
    rows: [
      row('source', 'tape', charCells('s', state.source, 0, sourceTone), {
        caption: STRING.captions.source,
        aside: i18nText(STRING.aside.textLength, { n: state.source.length }),
      }),
    ],
    markers,
    racks: [{ id: 'nodes', title: RACKS.nodes, meta: String(state.distinctCount), rows, empty: [] }],
    facts,
    notes,
    tree: null,
  };
}
