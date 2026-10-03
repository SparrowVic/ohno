import { SortStep } from '../../models/sort-step';
import { StringTraceState } from '../../models/string';
import { bwtDisplay, huffmanDisplay, rleDisplay } from './string-compress-display.utils';
import { kmpDisplay, kmpFallbackChain, rabinKarpDisplay, zAlgorithmDisplay } from './string-match-display.utils';
import { manacherDisplay, palindromicTreeDisplay } from './string-palindrome-display.utils';
import { suffixArrayDisplay, suffixLcpDisplay } from './string-suffix-display.utils';
import { StringDisplay, StringMarker, StringRow, emptyDisplay } from './string-tape.utils';
import { TreeBox, ahoCorasickDisplay } from './string-trie-display.utils';
import { stringTruth } from './string-truth.utils';

export interface StringDisplayContext {
  readonly step: SortStep | null;
  readonly history: readonly SortStep[];
  readonly treeBox: TreeBox;
}

export function stringDisplay(raw: StringTraceState | null, context: StringDisplayContext): StringDisplay {
  if (!raw) return emptyDisplay();
  const state = stringTruth(raw);
  switch (state.mode) {
    case 'kmp': {
      const history = context.history;
      const cursor = context.step ? history.indexOf(context.step) : -1;
      const chain = cursor >= 0 ? kmpFallbackChain(history, cursor) : context.step ? kmpFallbackChain([context.step], 0) : null;
      return kmpDisplay(state, chain);
    }
    case 'rabin-karp':
      return rabinKarpDisplay(state);
    case 'z-algorithm':
      return zAlgorithmDisplay(state);
    case 'manacher':
      return manacherDisplay(state);
    case 'rle':
      return rleDisplay(state);
    case 'burrows-wheeler-transform':
      return bwtDisplay(state);
    case 'huffman':
      return huffmanDisplay(state, context.treeBox);
    case 'aho-corasick':
      return ahoCorasickDisplay(state, context.treeBox);
    case 'suffix-array-construction':
      return suffixArrayDisplay(state);
    case 'suffix-array-lcp-kasai':
      return suffixLcpDisplay(state);
    case 'palindromic-tree':
      return palindromicTreeDisplay(state);
  }
}

export function stringSourceLength(state: StringTraceState | null): number {
  if (!state) return 0;
  switch (state.mode) {
    case 'kmp':
    case 'rabin-karp':
    case 'aho-corasick':
      return state.text.length;
    case 'z-algorithm':
      return state.combined.length;
    default:
      return state.source.length;
  }
}

export interface PlacedMarker extends StringMarker {
  readonly gridRow: string;
  readonly gridColumn: string;
}

export function placeMarkers(
  markers: readonly StringMarker[],
  body: Readonly<Record<string, number>>,
): readonly PlacedMarker[] {
  return markers
    .filter((marker) => body[marker.fromRow] !== undefined && body[marker.toRow] !== undefined)
    .map((marker) => {
      const from = body[marker.fromRow]!;
      const to = body[marker.toRow]!;
      return {
        ...marker,
        gridRow: `${Math.min(from, to)} / ${Math.max(from, to) + 1}`,
        gridColumn: `${marker.fromColumn + 1} / ${marker.toColumn + 2}`,
      };
    });
}

export function hasCompactRows(rows: readonly StringRow[]): boolean {
  return rows.some((entry) => entry.kind === 'compact');
}
