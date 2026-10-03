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
import { StringTraceState } from '../../models/string';
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
import {
  formatPercent,
  formatStringRatio,
  stringCalculationFacts,
  stringDetailSections,
  stringInsightFacts,
  stringSummaryFacts,
} from './string-trace-panel.utils';

function states(generator: Generator<SortStep>): readonly StringTraceState[] {
  return [...generator].map((step) => step.string).filter((state): state is StringTraceState => state !== undefined);
}

const RUNS: readonly { readonly mode: string; readonly states: readonly StringTraceState[]; readonly sections: readonly string[] }[] = [
  { mode: 'kmp', states: states(kmpPatternMatchingGenerator(createKmpScenario(20, 'overlap'))), sections: ['failure', 'scan'] },
  { mode: 'rabin-karp', states: states(rabinKarpGenerator(createRabinKarpScenario(20, 'alarm'))), sections: ['hashes', 'window'] },
  { mode: 'z-algorithm', states: states(zAlgorithmGenerator(createZAlgorithmScenario(20, 'classic'))), sections: ['skyline', 'box'] },
  { mode: 'manacher', states: states(manacherGenerator(createManacherScenario(14, 'banana'))), sections: ['radii', 'mirror'] },
  { mode: 'aho-corasick', states: states(ahoCorasickGenerator(createAhoCorasickScenario(18, 'classic'))), sections: ['automaton', 'matches'] },
  {
    mode: 'suffix-array-construction',
    states: states(suffixArrayConstructionGenerator(createSuffixArrayScenario(12, 'banana'))),
    sections: ['order', 'ranks'],
  },
  { mode: 'suffix-array-lcp-kasai', states: states(suffixArrayLcpKasaiGenerator(createSuffixArrayLcpScenario(12, 'banana'))), sections: ['pair', 'lcp'] },
  { mode: 'palindromic-tree', states: states(palindromicTreeGenerator(createPalindromicTreeScenario(12, 'banana'))), sections: ['active', 'nodes'] },
  {
    mode: 'burrows-wheeler-transform',
    states: states(burrowsWheelerTransformGenerator(createBurrowsWheelerScenario(8, 'banana'))),
    sections: ['columns', 'runs'],
  },
  { mode: 'rle', states: states(runLengthEncodingGenerator(createRleScenario(16, 'runs'))), sections: ['scanner', 'result'] },
  { mode: 'huffman', states: states(huffmanCodingGenerator(createHuffmanScenario(12, 'classic'))), sections: ['heap', 'compression'] },
];

describe('stringDetailSections', () => {
  it.each(RUNS)('builds the $mode sections for every step', ({ states: trail, sections }) => {
    expect(trail.length).toBeGreaterThan(0);
    for (const state of trail) {
      const built = stringDetailSections(state);
      expect(built.map((section) => section.id)).toEqual(sections);
      for (const section of built) {
        expect(section.title).toMatch(/^features\.algorithms\.tracePanels\.string\./);
        expect(section.facts !== undefined || section.chips !== undefined).toBe(true);
      }
    }
  });

  it('returns nothing without a state', () => {
    expect(stringDetailSections(null)).toEqual([]);
  });

  it('marks the active KMP failure cells', () => {
    const trail = RUNS[0]!.states;
    const scanning = trail.find((state) => state.mode === 'kmp' && state.patternIndex !== null);
    const chips = stringDetailSections(scanning ?? null)[0]?.chips ?? [];
    expect(chips.some((chip) => chip.active)).toBe(true);
  });

  it('translates RLE and Huffman phases instead of printing raw codes', () => {
    const rle = RUNS.find((run) => run.mode === 'rle')!.states[0]!;
    const phase = stringDetailSections(rle)[0]?.facts?.find((item) => item.id === 'phase');
    expect(phase?.value).toMatchObject({ key: expect.stringMatching(/Phase$/) });
    const huffman = RUNS.find((run) => run.mode === 'huffman')!.states[0]!;
    const huffmanPhase = stringDetailSections(huffman)[0]?.facts?.find((item) => item.id === 'phase');
    expect(huffmanPhase?.value).toMatchObject({ key: expect.stringContaining('huffmanCoding.phases') });
  });
});

describe('string summary facts', () => {
  it('always lists mode, preset, phase, active and result', () => {
    const state = RUNS[0]!.states[0]!;
    expect(stringSummaryFacts(state).map((item) => item.id)).toEqual(['mode', 'preset', 'phase', 'active', 'result']);
    expect(stringCalculationFacts(state).map((item) => item.id)).toEqual(['preset', 'expression', 'result', 'note', 'decision']);
    expect(stringInsightFacts(state)).toHaveLength(state.insights.length);
  });
});

describe('string formatters', () => {
  it('formats ratios and percentages', () => {
    expect(formatStringRatio(0.5)).toBe('0.50x');
    expect(formatStringRatio(null)).toBeNull();
    expect(formatPercent(0.256)).toBe('26%');
    expect(formatPercent(null)).toBeNull();
  });
});
