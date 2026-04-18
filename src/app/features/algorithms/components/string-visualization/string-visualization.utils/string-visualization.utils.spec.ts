import { describe, expect, it } from 'vitest';

import type {
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  RleTraceState,
} from '../../../models/string';
import {
  buildManacherArcs,
  freqBarHeight,
  huffmanSvgHeight,
  huffmanSvgWidth,
  huffmanVisibleEdges,
  huffmanVisibleNodes,
  kmpTextClass,
  manacherArcViewBox,
  patternOffset,
  rleCellClass,
} from './string-visualization.utils';

const baseStrings = {
  modeLabel: 'Demo',
  phaseLabel: 'Phase',
  presetLabel: 'Preset',
  presetDescription: 'Preset description',
  activeLabel: 'Active',
  resultLabel: 'Result',
  decisionLabel: 'Decision',
  insights: [],
  computation: null,
} as const;

describe('string-visualization.utils', () => {
  it('patternOffset clamps negative values to zero', () => {
    expect(patternOffset(-4)).toBe(0);
    expect(patternOffset(3)).toBe(3);
  });

  it('kmpTextClass highlights matches and focus states', () => {
    const state: KmpTraceState = {
      ...baseStrings,
      mode: 'kmp',
      stage: 'scan',
      text: 'ababa',
      pattern: 'aba',
      failure: [0, 0, 1],
      failureReadyIndex: 2,
      alignment: 0,
      textIndex: 4,
      patternIndex: 2,
      compareTextIndex: 1,
      comparePatternIndex: 1,
      fallbackFrom: null,
      fallbackTo: null,
      matches: [],
    };

    expect(kmpTextClass(state, 1)).toBe('str-cell str-cell--match');
    expect(kmpTextClass(state, 4)).toBe('str-cell str-cell--focus');
    expect(kmpTextClass({ ...state, matches: [0] }, 0)).toBe('str-cell str-cell--found');
  });

  it('buildManacherArcs derives tones and geometry from radii', () => {
    const state: ManacherTraceState = {
      ...baseStrings,
      mode: 'manacher',
      source: 'aba',
      transformed: '#a#b#a#',
      radii: [0, 1, 0, 3, 0, 1, 0],
      currentCenter: 5,
      mirrorIndex: 1,
      leftBoundary: 0,
      rightBoundary: 6,
      activeRadius: 1,
      compareLeft: 4,
      compareRight: 6,
      longestCenter: 3,
      longestRadius: 3,
      longestPalindrome: 'aba',
    };

    const arcs = buildManacherArcs(state);

    expect(arcs).toHaveLength(3);
    expect(arcs.find((arc) => arc.id === 'arc-3')?.tone).toBe('best');
    expect(arcs.find((arc) => arc.id === 'arc-5')?.tone).toBe('current');
    expect(arcs.find((arc) => arc.id === 'arc-1')?.tone).toBe('mirror');
    expect(manacherArcViewBox(state)).toBe('0 0 274 128');
  });

  it('filters visible Huffman nodes and edges and computes the svg bounds', () => {
    const huffman: HuffmanTraceState = {
      ...baseStrings,
      mode: 'huffman',
      source: 'aba',
      phase: 'codes',
      charFreqs: [
        { char: 'a', freq: 2, isActive: false },
        { char: 'b', freq: 1, isActive: true },
      ],
      heapItems: [],
      visibleNodeIds: ['root', 'left'],
      allNodes: [
        { id: 'root', char: null, freq: 3, code: '', leftId: 'left', rightId: null, x: 120, y: 20, tone: 'root' },
        { id: 'left', char: 'a', freq: 2, code: '0', leftId: null, rightId: null, x: 80, y: 90, tone: 'leaf' },
        { id: 'hidden', char: 'b', freq: 1, code: '1', leftId: null, rightId: null, x: 220, y: 90, tone: 'leaf' },
      ],
      visibleEdgeIds: ['root|left'],
      allEdges: [
        { fromId: 'root', toId: 'left', label: '0' },
        { fromId: 'root', toId: 'hidden', label: '1' },
      ],
      codeTable: [],
      totalOriginalBits: 24,
      totalCompressedBits: 5,
    };

    const nodes = huffmanVisibleNodes(huffman);
    const edges = huffmanVisibleEdges(huffman);

    expect(nodes.map((node) => node.id)).toEqual(['root', 'left']);
    expect(edges).toEqual([{ fromId: 'root', toId: 'left', label: '0' }]);
    expect(huffmanSvgWidth(nodes)).toBe(180);
    expect(huffmanSvgHeight(nodes)).toBe(170);
    expect(freqBarHeight(huffman, 1)).toBe('44px');
  });

  it('classifies RLE cells by completed and active runs', () => {
    const state: RleTraceState = {
      ...baseStrings,
      mode: 'rle',
      source: 'aaabb',
      scanIndex: 3,
      groupStart: 3,
      groupChar: 'b',
      groupCount: 2,
      completedRuns: [{ id: 'run-1', char: 'a', count: 3 }],
      output: '3a2b',
      phase: 'extend',
      compressionRatio: 0.8,
    };

    expect(rleCellClass(state, 1)).toBe('str-cell str-cell--found');
    expect(rleCellClass(state, 3)).toBe('str-cell str-cell--focus');
    expect(rleCellClass(state, 4)).toBe('str-cell str-cell--window');
  });
});
