import { describe, expect, it } from 'vitest';

import { ahoCorasickGenerator } from '../../algorithms/aho-corasick/aho-corasick';
import { burrowsWheelerTransformGenerator } from '../../algorithms/burrows-wheeler-transform/burrows-wheeler-transform';
import { huffmanCodingGenerator } from '../../algorithms/huffman-coding/huffman-coding';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { manacherGenerator } from '../../algorithms/manacher/manacher';
import { palindromicTreeGenerator } from '../../algorithms/palindromic-tree/palindromic-tree';
import { rabinKarpGenerator } from '../../algorithms/rabin-karp/rabin-karp';
import { runLengthEncodingGenerator } from '../../algorithms/run-length-encoding/run-length-encoding';
import { suffixArrayConstructionGenerator } from '../../algorithms/suffix-array-construction/suffix-array-construction';
import { suffixArrayLcpKasaiGenerator } from '../../algorithms/suffix-array-lcp-kasai/suffix-array-lcp-kasai';
import { zAlgorithmGenerator } from '../../algorithms/z-algorithm/z-algorithm';
import { SortStep } from '../../models/sort-step';
import { HuffmanTraceState, ManacherTraceState, RleTraceState, ZAlgorithmTraceState } from '../../models/string';
import {
  createAhoCorasickScenario,
  createBurrowsWheelerScenario,
  createHuffmanScenario,
  createKmpScenario,
  createManacherScenario,
  createPalindromicTreeScenario,
  createRabinKarpScenario,
  createRleScenario,
  createSuffixArrayLcpScenario,
  createSuffixArrayScenario,
  createZAlgorithmScenario,
} from '../../utils/scenarios/string/string-scenarios';
import { huffmanDisplay, rleDisplay } from './string-compress-display.utils';
import { placeMarkers, stringDisplay, stringSourceLength } from './string-display.utils';
import { zAlgorithmDisplay } from './string-match-display.utils';
import { manacherDisplay } from './string-palindrome-display.utils';
import { EMPTY_GLYPH, stringGridLines } from './string-tape.utils';
import { NODE_RADIUS, treeEdge } from './string-trie-display.utils';
import { stringTruth } from './string-truth.utils';

const RUNS: Readonly<Record<string, () => SortStep[]>> = {
  kmp: () => [...kmpPatternMatchingGenerator(createKmpScenario(20, 'default'))],
  'rabin-karp': () => [...rabinKarpGenerator(createRabinKarpScenario(20, 'default'))],
  'z-algorithm': () => [...zAlgorithmGenerator(createZAlgorithmScenario(20, 'default'))],
  manacher: () => [...manacherGenerator(createManacherScenario(14, 'default'))],
  rle: () => [...runLengthEncodingGenerator(createRleScenario(16, 'default'))],
  bwt: () => [...burrowsWheelerTransformGenerator(createBurrowsWheelerScenario(8, 'default'))],
  huffman: () => [...huffmanCodingGenerator(createHuffmanScenario(12, 'default'))],
  aho: () => [...ahoCorasickGenerator(createAhoCorasickScenario(18, 'default'))],
  'suffix-array': () => [...suffixArrayConstructionGenerator(createSuffixArrayScenario(12, 'default'))],
  lcp: () => [...suffixArrayLcpKasaiGenerator(createSuffixArrayLcpScenario(12, 'default'))],
  'palindromic-tree': () => [...palindromicTreeGenerator(createPalindromicTreeScenario(12, 'default'))],
};

const BOX = { width: 600, height: 260 };

describe('string display dispatcher', () => {
  for (const [name, run] of Object.entries(RUNS)) {
    it(`${name}: every step yields a consistent tape layout`, () => {
      const steps = run();
      expect(steps.length).toBeGreaterThan(3);
      let lastMatches = 0;
      steps.forEach((step) => {
        const view = stringDisplay(step.string ?? null, { step, history: steps, treeBox: BOX });
        expect(view.rows.length).toBeGreaterThan(0);
        const lines = stringGridLines(view.rows);
        const ids = new Set(view.rows.map((row) => row.id));
        for (const marker of view.markers) {
          expect(ids.has(marker.fromRow)).toBe(true);
          expect(ids.has(marker.toRow)).toBe(true);
          expect(marker.fromColumn).toBeGreaterThanOrEqual(0);
          expect(marker.toColumn).toBeLessThan(lines.columns);
        }
        expect(placeMarkers(view.markers, lines.body).length).toBe(view.markers.length);
        expect(view.markers.filter((marker) => marker.variant === 'head').length).toBeLessThanOrEqual(1);
        const matches = view.racks.find((rack) => rack.id === 'matches');
        if (matches) {
          expect(matches.rows.length).toBeGreaterThanOrEqual(lastMatches);
          lastMatches = matches.rows.length;
        }
        for (const row of view.rows) {
          const columns = row.cells.map((cell) => cell.column);
          expect(new Set(columns).size).toBe(columns.length);
        }
      });
      expect(stringSourceLength(steps[0]!.string ?? null)).toBeGreaterThan(0);
    });
  }

  it('returns an empty display without a string slot', () => {
    expect(stringDisplay(null, { step: null, history: [], treeBox: BOX }).rows).toEqual([]);
  });

  it('draws the Huffman tree inside the measured box once merging starts', () => {
    const steps = RUNS['huffman']!();
    const last = steps.at(-1)!;
    const view = stringDisplay(last.string ?? null, { step: last, history: steps, treeBox: BOX });
    expect(view.tree).not.toBeNull();
    expect(view.tree!.width).toBeLessThanOrEqual(BOX.width + 80);
    expect(view.racks[0]?.id).toBe('codes');
  });

  it('draws the Aho–Corasick trie with one edge per non-root node', () => {
    const steps = RUNS['aho']!();
    const last = steps.at(-1)!;
    const view = stringDisplay(last.string ?? null, { step: last, history: steps, treeBox: BOX });
    const trie = view.tree!;
    expect(trie.edges.filter((edge) => !edge.curved).length).toBe(trie.nodes.length - 1);
  });
});

describe('final frames show every computed value', () => {
  it('z-algorithm lists all Z values once complete', () => {
    const steps = RUNS['z-algorithm']!();
    const state = stringTruth(steps.at(-1)!.string!) as ZAlgorithmTraceState;
    expect(state.activeIndex).toBeNull();
    const z = zAlgorithmDisplay(state).rows.find((row) => row.id === 'z')!;
    expect(z.cells.slice(1).every((cell) => cell.glyph !== EMPTY_GLYPH)).toBe(true);
    expect(z.cells.slice(1).map((cell) => cell.glyph)).toEqual(state.zValues.slice(1).map(String));
  });

  it('z-algorithm keeps unreached values hidden mid-run', () => {
    const steps = RUNS['z-algorithm']!();
    const mid = steps.find((step) => (step.string as ZAlgorithmTraceState).activeIndex === 3)!;
    const z = zAlgorithmDisplay(stringTruth(mid.string!) as ZAlgorithmTraceState).rows.find((row) => row.id === 'z')!;
    expect(z.cells.at(-1)?.glyph).toBe(EMPTY_GLYPH);
  });

  it('manacher lists all radii once complete', () => {
    const steps = RUNS['manacher']!();
    const state = stringTruth(steps.at(-1)!.string!) as ManacherTraceState;
    expect(state.currentCenter).toBeNull();
    const radii = manacherDisplay(state).rows.find((row) => row.id === 'radii')!;
    expect(radii.cells.map((cell) => cell.glyph)).toEqual(state.radii.map(String));
  });
});

describe('tone agreement', () => {
  it('rle pending output cells use the same tone as the run on the input', () => {
    const steps = RUNS['rle']!();
    const extending = steps.map((step) => stringTruth(step.string!) as RleTraceState).find((state) => state.phase === 'extend' && state.groupCount > 1)!;
    expect(extending).toBeDefined();
    const view = rleDisplay(extending);
    const pending = view.rows.find((row) => row.id === 'output')!.cells.filter((cell) => cell.key === 'pc' || cell.key === 'px');
    expect(pending.map((cell) => cell.tone)).toEqual(['pink', 'pink']);
    expect(view.markers.find((marker) => marker.id === 'run')?.tone).toBe('pink');
  });

  it('huffman root stays violet until the codes phase and turns lime once coded', () => {
    const steps = RUNS['huffman']!();
    const states = steps.map((step) => step.string as HuffmanTraceState);
    const rootFrames = states.filter((state) => state.phase !== 'codes' && state.allNodes.some((node) => node.tone === 'root' && state.visibleNodeIds.includes(node.id)));
    expect(rootFrames.length).toBeGreaterThan(0);
    for (const state of rootFrames) {
      const root = state.allNodes.find((node) => node.tone === 'root')!;
      const tree = huffmanDisplay(state, BOX).tree!;
      expect(tree.nodes.find((node) => node.id === root.id)?.tone).not.toBe('lime');
    }
    const coded = states.at(-1)!;
    const root = coded.allNodes.find((node) => node.tone === 'root')!;
    expect(huffmanDisplay(coded, BOX).tree!.nodes.find((node) => node.id === root.id)?.tone).toBe('lime');
  });
});

describe('tree edges', () => {
  it('ends a straight edge at both node rings', () => {
    const edge = treeEdge('e', { x: 0, y: 0 }, { x: 0, y: 100 }, 'plain', 'a');
    expect(edge.d).toBe(`M 0 ${NODE_RADIUS} L 0 ${100 - NODE_RADIUS}`);
    expect([edge.labelX, edge.labelY]).toEqual([0, 50]);
    expect(edge.curved).toBe(false);
  });

  it('bends a curved edge through a control point beside the midpoint', () => {
    const edge = treeEdge('f', { x: 0, y: 0 }, { x: 0, y: 100 }, 'amber', null, true);
    expect(edge.d).toMatch(/^M [\d.]+ [\d.]+ Q 30 50 [\d.]+ [\d.]+$/);
    const [, sx, sy, , , , ex, ey] = edge.d.split(' ').map(Number);
    expect(Math.hypot(sx!, sy!)).toBeCloseTo(NODE_RADIUS, 1);
    expect(Math.hypot(ex!, ey! - 100)).toBeCloseTo(NODE_RADIUS, 1);
  });

  it('never overshoots when nodes overlap', () => {
    const edge = treeEdge('g', { x: 0, y: 0 }, { x: 10, y: 0 }, 'plain');
    expect(edge.d).toBe('M 5 0 L 5 0');
  });
});
