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
import { placeMarkers, stringDisplay, stringSourceLength } from './string-display.utils';
import { stringGridLines } from './string-tape.utils';

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
