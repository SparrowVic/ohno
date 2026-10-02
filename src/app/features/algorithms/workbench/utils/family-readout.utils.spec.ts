import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { bellmanFordGenerator } from '../../algorithms/bellman-ford/bellman-ford';
import { convexHullGenerator } from '../../algorithms/convex-hull';
import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { dinicMaxFlowGenerator } from '../../algorithms/dinic-max-flow';
import { hopcroftKarpGenerator } from '../../algorithms/hopcroft-karp';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { aStarPathfindingGenerator } from '../../algorithms/a-star-pathfinding/a-star-pathfinding';
import { coinChangeGenerator } from '../../algorithms/coin-change/coin-change';
import { editDistanceGenerator } from '../../algorithms/edit-distance/edit-distance';
import { floodFillGenerator } from '../../algorithms/flood-fill/flood-fill';
import { floydWarshallGenerator } from '../../algorithms/floyd-warshall/floyd-warshall';
import { gaussianEliminationGenerator } from '../../algorithms/gaussian-elimination/gaussian-elimination';
import { hungarianAlgorithmGenerator } from '../../algorithms/hungarian-algorithm';
import { knapsack01Generator } from '../../algorithms/knapsack-01/knapsack-01';
import { longestCommonSubsequenceGenerator } from '../../algorithms/longest-common-subsequence/longest-common-subsequence';
import { radixSortGenerator } from '../../algorithms/radix-sort';
import { ahoCorasickGenerator } from '../../algorithms/aho-corasick/aho-corasick';
import { burrowsWheelerTransformGenerator } from '../../algorithms/burrows-wheeler-transform/burrows-wheeler-transform';
import { huffmanCodingGenerator } from '../../algorithms/huffman-coding/huffman-coding';
import { manacherGenerator } from '../../algorithms/manacher/manacher';
import { palindromicTreeGenerator } from '../../algorithms/palindromic-tree/palindromic-tree';
import { rabinKarpGenerator } from '../../algorithms/rabin-karp/rabin-karp';
import { runLengthEncodingGenerator } from '../../algorithms/run-length-encoding/run-length-encoding';
import { suffixArrayConstructionGenerator } from '../../algorithms/suffix-array-construction/suffix-array-construction';
import { suffixArrayLcpKasaiGenerator } from '../../algorithms/suffix-array-lcp-kasai/suffix-array-lcp-kasai';
import { zAlgorithmGenerator } from '../../algorithms/z-algorithm/z-algorithm';
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
import { regexMatchingDpGenerator } from '../../algorithms/regex-matching-dp/regex-matching-dp';
import { matrixChainMultiplicationGenerator } from '../../algorithms/matrix-chain-multiplication/matrix-chain-multiplication';
import { sieveOfEratosthenesGenerator } from '../../algorithms/sieve-of-eratosthenes/sieve-of-eratosthenes';
import { simplexAlgorithmGenerator } from '../../algorithms/simplex-algorithm/simplex-algorithm';
import { subsetSumGenerator } from '../../algorithms/subset-sum/subset-sum';
import { kruskalsMstGenerator } from '../../algorithms/kruskals-mst';
import { unionFindGenerator } from '../../algorithms/union-find';
import { GraphNodeSnapshot, GraphStepState } from '../../models/graph';
import { NetworkEdgeSnapshot, NetworkTraceState } from '../../models/network';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { generateDijkstraGraph } from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
import {
  createCoinChangeScenario,
  createEditDistanceScenario,
  createKnapsackScenario,
  createRegexMatchingScenario,
  createLcsScenario,
  createMatrixChainScenario,
  createSubsetSumScenario,
} from '../../utils/scenarios/dp/dp-scenarios';
import { createAStarScenario, createFloodFillScenario } from '../../utils/scenarios/grid/grid-scenarios';
import { createFloydWarshallScenario } from '../../utils/scenarios/matrix/matrix-scenarios';
import { createGaussianEliminationScenario } from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';
import { createSimplexAlgorithmScenario } from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';
import { createEratosthenesScenario } from '../../utils/scenarios/sieve-grid/sieve-grid-scenarios';
import { createDinicScenario, createHopcroftKarpScenario } from '../../utils/scenarios/network/network-scenarios';
import {
  edgeFlow,
  FamilyGaugeId,
  FamilyMeterId,
  FamilyReadoutContext,
  FamilyReadoutLabels,
  FamilyRegisterId,
  familyStageReadout,
  graphReadout,
  isRadixStep,
  matrixGridOperationCounts,
  matrixPhaseText,
  matrixResultCount,
  networkReadout,
  operationProgress,
  radixDigit,
  relaxationCounts,
  scratchpadReadout,
} from './family-readout.utils';
import { StageReadout } from './stage-readout.utils';
import { sortStep } from './step-events.fixture';

const METER_IDS: readonly FamilyMeterId[] = [
  'hash', 'zBox', 'center', 'radius', 'longest', 'runs', 'rotations', 'symbols', 'heap', 'bits', 'nodes', 'round', 'span',
  'ranks', 'lcp', 'computed', 'palindromes', 'digit', 'bucket', 'placed', 'settled', 'queue', 'relaxed', 'row', 'column', 'value', 'textIndex', 'patternIndex', 'matches', 'stack', 'checked',
  'rejected', 'frontier', 'visited', 'result', 'pivot', 'improved', 'prime', 'bound', 'components', 'merged',
  'output', 'low', 'high', 'probe', 'frames', 'returns', 'iteration', 'explored', 'depth', 'phases', 'lines', 'hits',
  'events', 'area', 'cells', 'triangles', 'vertices', 'pairs', 'distance', 'edges', 'rows', 'operations', 'capacity',
  'best', 'amount', 'sum', 'indexI', 'indexJ', 'matched', 'zeros', 'path', 'closed', 'painted', 'crossed',
];
const GAUGE_IDS: readonly FamilyGaugeId[] = [
  'treeNodes', 'ranks', 'digits', 'settled', 'rows', 'phases', 'checked', 'textChars', 'visited', 'marked', 'eliminated', 'output', 'frames', 'explored', 'events', 'cells',
  'matched', 'operations', 'closed',
];
const REGISTER_IDS: readonly FamilyRegisterId[] = [
  'textChar', 'patternChar', 'patternHash', 'windowHash', 'boxLeft', 'boxRight', 'zValue', 'center', 'mirror', 'rightEdge',
  'char', 'count', 'node', 'matchLength', 'digit', 'bucket', 'u', 'v', 'w', 'alt', 'i', 'j', 'c', 'o', 'a', 'b', 'stack', 'p', 'lo', 'hi', 'mid', 'n', 'k', 'x', 'y', 'depth', 'row', 'col', 'level', 'cost',
];

function labelMap<T extends string>(ids: readonly T[], prefix: string): Record<T, string> {
  return Object.fromEntries(ids.map((id) => [id, `${prefix}:${id}`])) as Record<T, string>;
}

const labels: FamilyReadoutLabels = {
  meters: labelMap(METER_IDS, 'm'),
  gauges: labelMap(GAUGE_IDS, 'g'),
  registers: labelMap(REGISTER_IDS, 'r'),
  phases: { start: 'Start', step: 'Krok', complete: 'Koniec' },
  translate: (text) => (typeof text === 'string' ? text : text.key),
};

function history(generator: Generator<SortStep>): readonly SortStep[] {
  return [...generator];
}

function readoutAt(
  steps: readonly SortStep[],
  index: number,
  variant: VisualizationVariant,
  relaxations?: number,
  operations?: FamilyReadoutContext['operations'],
) {
  const ctx: FamilyReadoutContext = { step: steps[index]!, index, lastIndex: steps.length - 1, variant, labels, relaxations, operations };
  return familyStageReadout(ctx);
}

function registerMap(readout: StageReadout): Record<string, string> {
  return Object.fromEntries(readout.registers.map((item) => [item.label, item.value]));
}

function meterValue(readout: StageReadout, id: string): number | string | undefined {
  return readout.meters.find((item) => item.id === id)?.value;
}

describe('familyStageReadout', () => {
  it('reads settled, queue and relaxed meters from a Dijkstra step and lights the settled gauge', () => {
    const steps = history(dijkstraGenerator(generateDijkstraGraph(8)));
    const relaxIndex = steps.findIndex((step) => step.graph?.activeEdgeId && step.graph.computation);
    const readout = readoutAt(steps, relaxIndex, 'dijkstra-graph')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['settled', 'queue', 'relaxed']);
    expect(readout.meters[0]).toMatchObject({ label: 'm:settled', total: 8 });
    expect(readout.tone).toBe('pink');
    expect(readout.registers.map((item) => item.label)).toEqual(['r:u', 'r:v', 'r:w', 'r:alt']);
    expect(readout.gaugeLabel).toBe('g:settled');
    expect(readout.gauge?.count).toBe(8);
    const last = readoutAt(steps, steps.length - 1, 'dijkstra-graph')!;
    expect(last.tone).toBe('lime');
    expect(last.phaseLabel).toBe(steps.at(-1)!.graph!.phaseLabel);
  });

  it('reads the text and pattern cursors from a KMP step and counts scanned characters', () => {
    const steps = history(
      kmpPatternMatchingGenerator({
        kind: 'kmp-pattern-matching',
        presetId: 'overlap',
        presetLabel: 'Overlap',
        presetDescription: 'overlap',
        text: 'ABABDABACDABABCABAB',
        pattern: 'ABABCABAB',
      }),
    );
    const scanIndex = steps.findIndex((step) => step.string?.mode === 'kmp' && step.string.stage === 'scan' && step.string.textIndex !== null);
    const readout = readoutAt(steps, scanIndex, 'string')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['textIndex', 'patternIndex', 'matches']);
    expect(readout.meters[0]!.total).toBe(19);
    expect(readout.meters[1]!.total).toBe(9);
    expect(readout.gaugeLabel).toBe('g:textChars');
    expect(readout.gauge).toEqual({ count: 19, done: (steps[scanIndex]!.string as { textIndex: number }).textIndex + 1, lit: (steps[scanIndex]!.string as { textIndex: number }).textIndex + 1 });
  });

  it('reads stack, checked and rejected meters from a convex hull step', () => {
    const steps = history(
      convexHullGenerator({
        points: [
          { x: 48, y: 4 }, { x: 86, y: 14 }, { x: 94, y: 36 }, { x: 78, y: 52 }, { x: 56, y: 60 }, { x: 30, y: 54 },
          { x: 10, y: 42 }, { x: 14, y: 20 }, { x: 40, y: 30 }, { x: 60, y: 28 }, { x: 70, y: 44 },
        ],
      }),
    );
    const checkIndex = steps.findIndex((step) => step.geometry?.mode === 'convex-hull' && step.geometry.turnCheck !== null);
    const readout = readoutAt(steps, checkIndex, 'convex-hull')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['stack', 'checked', 'rejected']);
    expect(readout.meters[1]!.total).toBe(11);
    expect(readout.registers.map((item) => item.label)).toEqual(['r:o', 'r:a', 'r:b', 'r:stack']);
    expect(readout.gaugeLabel).toBe('g:checked');
  });

  it('returns null when the step carries no family slot', () => {
    expect(readoutAt([sortStep({ array: [1, 2] })], 0, 'bar')).toBeNull();
  });
});

describe('scratchpadReadout', () => {
  const scratchpad: ScratchpadLabTraceState = {
    mode: 'extended-euclidean',
    modeLabel: 'eea',
    phaseLabel: 'phase.forward',
    decisionLabel: 'decide',
    presetLabel: 'preset',
    taskPrompt: null,
    tone: 'decide',
    lines: [
      { id: 'g', kind: 'goal', indent: 0, marker: null, caption: null, content: 'goal', instruction: null, annotation: null, state: 'settled' },
      { id: 'd1', kind: 'divider', indent: 0, marker: null, caption: null, content: '', instruction: null, annotation: null, state: 'settled' },
      { id: 'e1', kind: 'equation', indent: 0, marker: '01', caption: null, content: '735 = 3 · 210 + 105', instruction: null, annotation: null, state: 'settled' },
      { id: 'e2', kind: 'equation', indent: 0, marker: '02', caption: null, content: '210 = 2 · 105 + 0', instruction: null, annotation: null, state: 'settled' },
      { id: 'x', kind: 'decision', indent: 0, marker: '03', caption: null, content: 'r = 0', instruction: null, annotation: null, state: 'current' },
      { id: 'd2', kind: 'divider', indent: 0, marker: null, caption: null, content: '', instruction: null, annotation: null, state: 'entering' },
    ],
    margins: [],
    resultLabel: null,
    iteration: 3,
  };

  it('uses number-lab registers as meters when they exist and counts passed phases for the gauge', () => {
    const registers = {
      modeLabel: 'm',
      phaseLabel: 'p',
      decisionLabel: 'd',
      tone: 'compare' as const,
      registers: [
        { id: 'a', label: 'a', value: '210', hint: null, tone: 'default' as const },
        { id: 'b', label: 'b', value: '105', hint: null, tone: 'default' as const },
        { id: 'q', label: 'q', value: '2', hint: null, tone: 'active' as const },
        { id: 'r', label: 'r', value: '0', hint: null, tone: 'active' as const },
      ],
      history: [],
      formula: null,
      presetLabel: 'preset',
      resultLabel: null,
      iteration: 3,
    };
    const readout = scratchpadReadout(scratchpad, registers, {
      step: sortStep({ array: [], scratchpadLab: scratchpad, numberLab: registers }),
      index: 4,
      lastIndex: 11,
      variant: 'scratchpad-lab',
      labels,
    });
    expect(readout.meters.map((meter) => [meter.label, meter.value])).toEqual([['a', '210'], ['b', '105'], ['q', '2']]);
    expect(readout.registers).toHaveLength(4);
    expect(readout.tone).toBe('pink');
    expect(readout.phaseLabel).toBe('phase.forward');
    expect(readout.gauge).toEqual({ count: 2, done: 0, lit: 1 });
    expect(readout.gaugeLabel).toBe('g:phases');
  });

  it('translates register labels that are i18n keys', () => {
    const key = 'features.algorithms.numberLab.registers.current';
    const registers = {
      modeLabel: 'm',
      phaseLabel: 'p',
      decisionLabel: 'd',
      tone: 'emit' as const,
      registers: [{ id: 'f', label: key, value: '8', hint: null, tone: 'active' as const }],
      history: [],
      formula: null,
      presetLabel: 'preset',
      resultLabel: null,
      iteration: 1,
    };
    const translated: FamilyReadoutLabels = { ...labels, translate: (text) => (text === key ? 'Bieżąca' : labels.translate(text)) };
    const readout = scratchpadReadout(scratchpad, registers, {
      step: sortStep({ array: [], scratchpadLab: scratchpad, numberLab: registers }),
      index: 4,
      lastIndex: 11,
      variant: 'scratchpad-lab',
      labels: translated,
    });
    expect(readout.meters[0]?.label).toBe('Bieżąca');
    expect(readout.registers[0]?.label).toBe('Bieżąca');
  });

  it('falls back to line counts when no registers exist', () => {
    const readout = scratchpadReadout(scratchpad, null, {
      step: sortStep({ array: [], scratchpadLab: scratchpad }),
      index: 4,
      lastIndex: 11,
      variant: 'scratchpad-lab',
      labels,
    });
    expect(readout.meters.map((meter) => [meter.id, meter.value])).toEqual([['lines', 2], ['phases', 1], ['result', 1]]);
    expect(readout.registers).toEqual([]);
  });
});

describe('graphReadout', () => {
  const node = (id: string, overrides: Partial<GraphNodeSnapshot> = {}): GraphNodeSnapshot => ({
    id,
    label: id.toUpperCase(),
    x: 0,
    y: 0,
    distance: null,
    previousId: null,
    secondaryText: null,
    isSource: false,
    isCurrent: false,
    isSettled: false,
    isFrontier: false,
    ...overrides,
  });
  const state: GraphStepState = {
    nodes: [node('b', { previousId: 'a' }), node('f', { isCurrent: true, previousId: 'a' }), node('a', { isSource: true })],
    edges: [{ id: 'b-f', from: 'b', to: 'f', weight: 4, isActive: true, isRelaxed: false, isTree: false }],
    sourceId: 'a',
    phaseLabel: 'relax',
    metricLabel: 'd',
    secondaryLabel: 'prev',
    frontierLabel: 'queue',
    frontierHeadLabel: 'head',
    completionLabel: 'done',
    frontierStatusLabel: 'frontier',
    completionStatusLabel: 'settled',
    showEdgeWeights: true,
    detailLabel: 'detail',
    detailValue: '',
    visitOrderLabel: 'order',
    currentNodeId: 'f',
    activeEdgeId: 'b-f',
    queue: [],
    visitOrder: [],
    traceRows: [],
    computation: null,
  };
  const ctx = (graph: GraphStepState, relaxations?: number): FamilyReadoutContext => ({
    step: sortStep({ array: [], graph }),
    index: 3,
    lastIndex: 10,
    variant: 'dijkstra-graph',
    labels,
    relaxations,
  });

  it('reads v from the endpoint that is not the current node when an undirected edge is stored towards it', () => {
    expect(registerMap(graphReadout(state, ctx(state)))).toMatchObject({ 'r:u': 'F', 'r:v': 'B', 'r:w': '4' });
  });

  it('reads v from the edge target when the current node is the edge source', () => {
    const forward = { ...state, currentNodeId: 'b' };
    expect(registerMap(graphReadout(forward, ctx(forward)))).toMatchObject({ 'r:u': 'B', 'r:v': 'F' });
  });

  it('shows the relaxation count from context and falls back to reached nodes without it', () => {
    expect(meterValue(graphReadout(state, ctx(state, 7)), 'relaxed')).toBe(7);
    expect(meterValue(graphReadout(state, ctx(state)), 'relaxed')).toBe(2);
  });

  it('never repeats u under v across a Dijkstra run on an undirected graph', () => {
    const reversedIndex = (run: readonly SortStep[]) =>
      run.findIndex((step) => {
        const graph = step.graph;
        const edge = graph?.edges.find((item) => item.id === graph.activeEdgeId);
        return edge !== undefined && edge.to === graph?.currentNodeId;
      });
    const runs = Array.from({ length: 40 }, () => history(dijkstraGenerator(generateDijkstraGraph(8))));
    const steps = runs.find((run) => reversedIndex(run) > 0)!;
    expect(steps).toBeDefined();
    steps.forEach((_, index) => {
      const registers = registerMap(readoutAt(steps, index, 'dijkstra-graph')!);
      if (registers['r:v'] !== undefined) expect(registers['r:v']).not.toBe(registers['r:u']);
    });
  });
});

describe('relaxationCounts', () => {
  it('counts relax steps up to and including each index', () => {
    const steps = [
      sortStep({ array: [] }),
      sortStep({ array: [], phase: 'relax' }),
      sortStep({ array: [], phase: 'skip-relax' }),
      sortStep({ array: [], phase: 'relax' }),
      sortStep({ array: [], phase: 'settle-node' }),
    ];
    expect(relaxationCounts(steps)).toEqual([0, 1, 1, 2, 2]);
  });

  it('feeds the relaxed meter with every Bellman-Ford relaxation, not the reached-node count', () => {
    const steps = history(bellmanFordGenerator(generateDijkstraGraph(8)));
    const counts = relaxationCounts(steps);
    const relaxSteps = steps.filter((step) => step.phase === 'relax').length;
    const last = steps.length - 1;
    expect(counts[last]).toBe(relaxSteps);
    expect(meterValue(readoutAt(steps, last, 'dijkstra-graph', counts[last])!, 'relaxed')).toBe(relaxSteps);
  });
});

describe('dsuReadout', () => {
  it('counts real unions on find() steps and shows an operations meter without a weight register', () => {
    const steps = history(
      unionFindGenerator({
        kind: 'union-find',
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
          { id: 'd', label: 'D' },
        ],
        operations: [
          { kind: 'union', a: 'a', b: 'b' },
          { kind: 'find', a: 'b' },
          { kind: 'find', a: 'a' },
          { kind: 'union', a: 'c', b: 'd' },
        ],
      }),
    );
    const findIndex = steps.findIndex((step) => step.dsu?.edges.some((edge) => edge.status === 'active' && edge.fromId === edge.toId));
    expect(findIndex).toBeGreaterThan(0);
    const findReadout = readoutAt(steps, findIndex, 'dsu')!;
    expect(findReadout.meters.map((item) => item.id)).toEqual(['components', 'merged', 'operations']);
    expect(findReadout.registers.map((item) => item.label)).toEqual(['r:a']);
    const afterFinds = steps.findIndex((step) => step.dsu?.edges.filter((edge) => edge.status === 'accepted').length === 3);
    expect(afterFinds).toBeGreaterThan(0);
    expect(meterValue(readoutAt(steps, afterFinds, 'dsu')!, 'merged')).toBe(1);
    const last = readoutAt(steps, steps.length - 1, 'dsu')!;
    expect(meterValue(last, 'merged')).toBe(2);
    expect(last.meters[2]).toMatchObject({ id: 'operations', label: 'm:operations', value: 4, total: 4 });
  });

  it('counts merged components and shows the weight register on a Kruskal step', () => {
    const steps = history(
      kruskalsMstGenerator({
        kind: 'kruskal',
        graph: {
          sourceId: 'a',
          nodes: [
            { id: 'a', label: 'A', x: 0, y: 0 },
            { id: 'b', label: 'B', x: 1, y: 0 },
            { id: 'c', label: 'C', x: 2, y: 0 },
          ],
          edges: [
            { id: 'ab', from: 'a', to: 'b', weight: 1 },
            { id: 'bc', from: 'b', to: 'c', weight: 2 },
            { id: 'ac', from: 'a', to: 'c', weight: 5 },
          ],
        },
      }),
    );
    const activeIndex = steps.findIndex((step) => step.dsu?.edges.some((edge) => edge.status === 'active'));
    const active = readoutAt(steps, activeIndex, 'dsu')!;
    expect(active.meters.map((item) => item.id)).toEqual(['components', 'merged', 'edges']);
    expect(active.registers.map((item) => item.label)).toEqual(['r:a', 'r:b', 'r:w']);
    const last = readoutAt(steps, steps.length - 1, 'dsu')!;
    expect(meterValue(last, 'merged')).toBe(2);
    expect(last.meters[2]).toMatchObject({ id: 'edges', value: 3, total: 3 });
  });
});

describe('networkReadout', () => {
  const edge = (id: string, primaryText: string, status: NetworkEdgeSnapshot['status']): NetworkEdgeSnapshot => ({
    id,
    fromId: 's',
    toId: 't',
    directed: true,
    primaryText,
    secondaryText: null,
    status,
  });
  const state = (mode: NetworkTraceState['mode'], edges: readonly NetworkEdgeSnapshot[]): NetworkTraceState => ({
    mode,
    modeLabel: mode,
    phaseLabel: 'phase',
    statusLabel: 'status',
    resultLabel: 'result',
    frontierLabel: 'frontier',
    frontierCount: 0,
    queueLabel: 'queue',
    queue: [],
    activeRouteLabel: null,
    focusItemsLabel: 'focus',
    focusItems: [],
    nodes: [{ id: 's', label: 'S', x: 0, y: 0, lane: 'source', level: 2, linkLabel: null, status: 'current', tags: [] }],
    edges,
    traceRows: [],
    computation: null,
  });
  const ctx = (network: NetworkTraceState): FamilyReadoutContext => ({
    step: sortStep({ array: [], network }),
    index: 3,
    lastIndex: 10,
    variant: 'network',
    labels,
  });

  it('parses the flow from the f/c chip and treats other text as no flow', () => {
    expect(edgeFlow(edge('a', '3/4', 'augment'))).toBe(3);
    expect(edgeFlow(edge('b', '0/5', 'base'))).toBe(0);
    expect(edgeFlow(edge('c', 'match', 'matched'))).toBe(1);
    expect(edgeFlow(edge('f', 'free', 'base'))).toBe(0);
  });

  it('counts flow-carrying edges regardless of their display status', () => {
    const network = state('dinic', [
      edge('a', '3/4', 'augment'),
      edge('b', '3/3', 'active'),
      edge('c', '0/2', 'candidate'),
      edge('d', '2/2', 'saturated'),
      edge('e', 'match', 'matched'),
      edge('m', 'match', 'augment'),
    ]);
    expect(meterValue(networkReadout(network, ctx(network)), 'edges')).toBe(5);
  });

  it('labels the node level register as level outside min-cost flow', () => {
    const dinic = state('dinic', []);
    expect(networkReadout(dinic, ctx(dinic)).registers).toEqual([
      { label: 'r:u', value: 'S' },
      { label: 'r:level', value: '2' },
    ]);
    const minCost = state('min-cost-max-flow', []);
    expect(networkReadout(minCost, ctx(minCost)).registers.map((item) => item.label)).toEqual(['r:u', 'r:cost']);
  });

  it('keeps the edges meter above zero on Dinic augment steps', () => {
    const steps = history(dinicMaxFlowGenerator(createDinicScenario(8)));
    const augmentIndex = steps.findIndex((step) => step.network?.edges.some((item) => item.status === 'augment' && edgeFlow(item) > 0));
    expect(augmentIndex).toBeGreaterThan(0);
    expect(Number(meterValue(readoutAt(steps, augmentIndex, 'network')!, 'edges'))).toBeGreaterThan(0);
  });

  it('counts matched edges in Hopcroft-Karp and reads the BFS level register', () => {
    const steps = history(hopcroftKarpGenerator(createHopcroftKarpScenario(10)));
    const last = steps.at(-1)!.network!;
    expect(meterValue(readoutAt(steps, steps.length - 1, 'network')!, 'edges')).toBe(last.edges.filter((item) => item.status === 'matched').length);
    const currentIndex = steps.findIndex((step) => step.network?.nodes.some((item) => item.status === 'current'));
    expect(readoutAt(steps, currentIndex, 'network')!.registers.map((item) => item.label)).toEqual(['r:u', 'r:level']);
  });
});

const MATRIX_PHASE_KEY = 'features.algorithms.display.phases.matrix';

function meterIds(readout: StageReadout): readonly string[] {
  return readout.meters.map((item) => item.id);
}

function meterOf(readout: StageReadout, id: string) {
  return readout.meters.find((item) => item.id === id);
}

describe('dpReadout', () => {
  const knapsack = history(knapsack01Generator(createKnapsackScenario(5, 'camp')));

  it('reads row, capacity and best like image 09 on the Rope × 5 compare step', () => {
    const compareIndex = knapsack.findIndex((step) => {
      const active = step.dp?.cells.find((cell) => cell.status === 'active');
      return active?.row === 3 && active.col === 5 && step.dp?.computation?.result === '13';
    });
    expect(compareIndex).toBeGreaterThan(0);
    const readout = readoutAt(knapsack, compareIndex, 'dp')!;
    expect(meterIds(readout)).toEqual(['row', 'capacity', 'best']);
    expect(meterOf(readout, 'row')).toMatchObject({ label: 'm:row', value: 3, total: 5 });
    expect(meterOf(readout, 'capacity')).toMatchObject({ label: 'm:capacity', value: 5, total: 7 });
    expect(meterOf(readout, 'best')).toMatchObject({ label: 'm:best', value: '13' });
    expect(registerMap(readout)).toEqual({ 'r:i': '3', 'r:c': '5', 'r:w': '3', 'r:v': '7' });
    expect(readout.gauge).toEqual({ count: 5, done: 2, lit: 3 });
    expect(readout.gaugeLabel).toBe('g:rows');
  });

  it('prefers the pending computation result over the stale cell value on every knapsack compare step', () => {
    knapsack.forEach((step, index) => {
      const result = step.dp?.computation?.result;
      if (typeof result !== 'string' || !/^\d+$/.test(result)) return;
      expect(meterValue(readoutAt(knapsack, index, 'dp')!, 'best')).toBe(result);
    });
  });

  it('fills the row gauge once the table is complete', () => {
    const last = readoutAt(knapsack, knapsack.length - 1, 'dp')!;
    expect(meterOf(last, 'row')).toMatchObject({ value: 5, total: 5 });
    expect(last.gauge).toEqual({ count: 5, done: 5, lit: 5 });
    expect(last.tone).toBe('lime');
    const answer = last.meters.find((item) => item.id === 'best')?.value;
    expect(answer).not.toBe('—');
    expect(Number(answer)).toBeGreaterThan(0);
  });

  it('never runs the row gauge backwards while the traceback walks the table', () => {
    const done = knapsack.map((_, index) => readoutAt(knapsack, index, 'dp')!.gauge?.done ?? 0);
    done.slice(1).forEach((value, index) => expect(value).toBeGreaterThanOrEqual(done[index]!));
  });

  it('reads the base row of a regex table as row zero instead of an empty meter', () => {
    const regex = history(regexMatchingDpGenerator(createRegexMatchingScenario(5, 'alias')));
    const rowZero = regex.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active' && cell.row === 0));
    if (rowZero < 0) return;
    const readout = readoutAt(regex, rowZero, 'dp')!;
    expect(readout.meters[0]?.value).toBe(0);
  });

  it('shows an empty capacity and no registers when no cell is active', () => {
    const readout = readoutAt(knapsack, 0, 'dp')!;
    expect(meterValue(readout, 'capacity')).toBe('—');
    expect(readout.registers).toEqual([]);
  });

  it('names the column axis amount for coin change and sum for subset sum', () => {
    const coin = history(coinChangeGenerator(createCoinChangeScenario(5, 'classic')));
    const coinIndex = coin.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active'));
    const coinReadout = readoutAt(coin, coinIndex, 'dp')!;
    expect(meterIds(coinReadout)).toEqual(['row', 'amount', 'value']);
    expect(meterOf(coinReadout, 'amount')?.total).toBe(coin[0]!.dp!.colHeaders.length - 1);
    expect(meterOf(coinReadout, 'row')?.total).toBe(coin[0]!.dp!.rowHeaders.length - 1);

    const subset = history(subsetSumGenerator(createSubsetSumScenario(5, 'classic')));
    const subsetIndex = subset.findIndex((step) => step.dp?.computation?.result === 'T');
    const subsetReadout = readoutAt(subset, subsetIndex, 'dp')!;
    expect(meterIds(subsetReadout)).toEqual(['row', 'sum', 'value']);
    expect(meterValue(subsetReadout, 'value')).toBe('T');
  });

  it('reads i and j indices for the string tables', () => {
    const lcs = history(longestCommonSubsequenceGenerator(createLcsScenario(5, 'classic')));
    const lcsIndex = lcs.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active') && step.dp.computation);
    const active = lcs[lcsIndex]!.dp!.cells.find((cell) => cell.status === 'active')!;
    const readout = readoutAt(lcs, lcsIndex, 'dp')!;
    expect(meterIds(readout)).toEqual(['indexI', 'indexJ', 'value']);
    expect(meterOf(readout, 'indexI')).toMatchObject({ value: active.row, total: 5 });
    expect(meterOf(readout, 'indexJ')).toMatchObject({ value: active.col, total: 5 });
    expect(meterValue(readout, 'value')).toBe(lcs[lcsIndex]!.dp!.computation!.result);

    const edit = history(editDistanceGenerator(createEditDistanceScenario(5, 'classic')));
    const editIndex = edit.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active'));
    expect(meterIds(readoutAt(edit, editIndex, 'dp')!)).toEqual(['indexI', 'indexJ', 'value']);
  });

  it('keeps row, column and value with 1-based positions where the column axis has no obvious name', () => {
    const chain = history(matrixChainMultiplicationGenerator(createMatrixChainScenario(5, 'classic')));
    const index = chain.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active'));
    const active = chain[index]!.dp!.cells.find((cell) => cell.status === 'active')!;
    const readout = readoutAt(chain, index, 'dp')!;
    expect(meterIds(readout)).toEqual(['row', 'column', 'value']);
    expect(meterOf(readout, 'row')).toMatchObject({ value: active.row + 1, total: chain[index]!.dp!.rowHeaders.length });
    expect(meterOf(readout, 'column')).toMatchObject({ value: active.col + 1, total: chain[index]!.dp!.colHeaders.length });
    expect(readout.registers.map((item) => item.label)).toEqual(['r:i', 'r:c']);
  });
});

describe('matrixReadout', () => {
  const floyd = history(floydWarshallGenerator(createFloydWarshallScenario(5)));

  it('maps every Floyd-Warshall phase to a display key so no English reaches the op-line', () => {
    floyd.forEach((step, index) => {
      expect(readoutAt(floyd, index, 'matrix')!.phaseLabel.startsWith(MATRIX_PHASE_KEY)).toBe(true);
    });
    expect(matrixPhaseText('Pivot C')).toEqual({ key: `${MATRIX_PHASE_KEY}.pivot`, params: { pivot: 'C' } });
    expect(matrixPhaseText('Pivot C complete')).toEqual({ key: `${MATRIX_PHASE_KEY}.pivotDone`, params: { pivot: 'C' } });
    expect(matrixPhaseText('Adjust matrix 2')).toEqual({ key: `${MATRIX_PHASE_KEY}.adjustMatrix`, params: { round: '2' } });
  });

  it('falls back to the generic phase when a matrix phase is unknown', () => {
    const step = floyd[3]!;
    const unknown = { ...step, matrix: { ...step.matrix!, phaseLabel: 'Something new' } };
    expect(readoutAt([floyd[0]!, floyd[1]!, floyd[2]!, unknown, floyd[4]!], 3, 'matrix')!.phaseLabel).toBe('Krok');
  });

  it('counts cumulative Floyd-Warshall improvements instead of the current step only', () => {
    const last = floyd.length - 1;
    const total = matrixResultCount(floyd[last]!.matrix!);
    expect(total).toBeGreaterThan(1);
    expect(meterValue(readoutAt(floyd, last, 'matrix')!, 'improved')).toBe(total);
    let previous = 0;
    floyd.forEach((_, index) => {
      const value = Number(meterValue(readoutAt(floyd, index, 'matrix')!, 'improved'));
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    });
    expect(readoutAt(floyd, last, 'matrix')!.gauge).toEqual({ count: 5, done: 5, lit: 5 });
  });

  it('reads the focus cell registers on update steps and the pivot gauge while comparing', () => {
    const updateIndex = floyd.findIndex((step) => step.matrix?.cells.some((cell) => cell.status === 'improved'));
    const readout = readoutAt(floyd, updateIndex, 'matrix')!;
    expect(readout.registers.map((item) => item.label)).toEqual(['r:row', 'r:col']);
    expect(readout.tone).toBe('pink');
    const compareIndex = floyd.findIndex((step) => step.matrix?.pivotLabel === 'B' && step.matrix.cells.some((cell) => cell.status === 'active'));
    expect(readoutAt(floyd, compareIndex, 'matrix')!.gauge).toEqual({ count: 5, done: 1, lit: 2 });
  });

  const hungarian = history(
    hungarianAlgorithmGenerator({
      kind: 'hungarian',
      rowLabels: ['Ava', 'Ben', 'Cara', 'Dean'],
      colLabels: ['UI', 'API', 'DB', 'QA'],
      costs: [
        [82, 83, 69, 92],
        [77, 37, 49, 92],
        [11, 69, 5, 86],
        [8, 9, 98, 23],
      ],
    }),
  );

  it('shows matched, lines and zeros for Hungarian and reaches a cover step', () => {
    const coverIndex = hungarian.findIndex((step) => step.matrix?.phaseLabel.startsWith('Cover zeros'));
    expect(coverIndex).toBeGreaterThan(0);
    const cover = readoutAt(hungarian, coverIndex, 'matrix')!;
    expect(meterIds(cover)).toEqual(['matched', 'lines', 'zeros']);
    const state = hungarian[coverIndex]!.matrix!;
    const covered = [...state.rowHeaders, ...state.colHeaders].filter((header) => header.status === 'covered').length;
    expect(covered).toBeGreaterThan(0);
    expect(meterOf(cover, 'lines')).toMatchObject({ value: covered, total: 4 });
    expect(meterOf(cover, 'matched')).toMatchObject({ value: matrixResultCount(state), total: 4 });
    expect(cover.phaseLabel).toBe(`${MATRIX_PHASE_KEY}.coverZeros`);
    expect(cover.gaugeLabel).toBe('g:matched');
    const last = readoutAt(hungarian, hungarian.length - 1, 'matrix')!;
    expect(meterValue(last, 'matched')).toBe(4);
    expect(last.gauge).toEqual({ count: 4, done: 4, lit: 4 });
  });

  it('reads Hungarian registers from the active header row or column', () => {
    const rowIndex = hungarian.findIndex((step) => step.matrix?.rowHeaders.some((header) => header.status === 'active'));
    const rowState = hungarian[rowIndex]!.matrix!;
    expect(readoutAt(hungarian, rowIndex, 'matrix')!.registers).toEqual([
      { label: 'r:row', value: rowState.rowHeaders.find((header) => header.status === 'active')!.label },
    ]);
    const colIndex = hungarian.findIndex((step) => step.matrix?.colHeaders.some((header) => header.status === 'active'));
    const colState = hungarian[colIndex]!.matrix!;
    expect(readoutAt(hungarian, colIndex, 'matrix')!.registers).toEqual([
      { label: 'r:col', value: colState.colHeaders.find((header) => header.status === 'active')!.label },
    ]);
  });
});

describe('matrixGridReadout', () => {
  const gaussian = history(gaussianEliminationGenerator(createGaussianEliminationScenario(0, null)));
  const simplex = history(simplexAlgorithmGenerator(createSimplexAlgorithmScenario(0, null)));

  function gridAt(steps: readonly SortStep[], index: number): StageReadout {
    return readoutAt(steps, index, 'matrix-grid', undefined, operationProgress(matrixGridOperationCounts(steps), index))!;
  }

  it('counts each row operation once and each simplex pivot once', () => {
    const gaussianCounts = matrixGridOperationCounts(gaussian);
    const operations = new Set(
      gaussian
        .map((step) => step.matrixGrid?.operationLabel)
        .filter((label): label is string => typeof label === 'string' && label.includes('R_') && !label.includes('\\begin')),
    );
    expect(gaussianCounts.at(-1)).toBe(operations.size);
    expect(matrixGridOperationCounts(simplex).at(-1)).toBe(2);
    expect(operationProgress([0, 0, 0], 1)).toBeUndefined();
    expect(operationProgress([0, 1, 2], 1)).toEqual({ done: 1, total: 2 });
  });

  it('shows the real Gaussian pivot from the table builder', () => {
    const index = gaussian.findIndex((step) => step.matrixGrid?.cells.some((cell) => cell.state === 'pivot-row'));
    const readout = gridAt(gaussian, index);
    expect(meterValue(readout, 'pivot')).toMatch(/^(x|y|z|x\d+)$/);
    expect(registerMap(readout)).toEqual({ 'r:row': 'R₁', 'r:col': 'x' });
    expect(meterIds(readout)).toEqual(['operations', 'pivot', 'rows']);
    expect(readout.gaugeLabel).toBe('g:operations');
    expect(readout.gauge).toEqual({ count: matrixGridOperationCounts(gaussian).at(-1), done: 1, lit: 1 });
  });

  it('labels the Simplex pivot with the entering column and fills the gauge by the end', () => {
    const selectIndex = simplex.findIndex((step) => step.matrixGrid?.tone === 'compute');
    expect(meterValue(gridAt(simplex, selectIndex), 'pivot')).toBe('x');
    const pivotIndex = simplex.findIndex((step) => step.matrixGrid?.cells.some((cell) => cell.state === 'pivot'));
    const pivot = gridAt(simplex, pivotIndex);
    expect(meterValue(pivot, 'pivot')).toBe('x');
    expect(registerMap(pivot)).toEqual({ 'r:row': 'R₂', 'r:col': 'x' });
    expect(gridAt(simplex, simplex.length - 1).gauge).toEqual({ count: 2, done: 2, lit: 2 });
  });

  it('falls back to the iteration meter and the row gauge without operation context', () => {
    const readout = readoutAt(gaussian, 0, 'matrix-grid')!;
    expect(meterIds(readout)).toEqual(['iteration', 'pivot', 'rows']);
    expect(readout.gaugeLabel).toBe('g:rows');
  });
});

describe('gridReadout', () => {
  it('reads closed and path meters for A*', () => {
    const steps = history(aStarPathfindingGenerator(createAStarScenario(8)));
    const last = readoutAt(steps, steps.length - 1, 'grid')!;
    expect(meterIds(last)).toEqual(['frontier', 'closed', 'path']);
    expect(meterValue(last, 'path')).toBe(steps.at(-1)!.grid!.resultCount);
    expect(meterValue(last, 'closed')).toBe(steps.at(-1)!.grid!.visitedCount);
  });

  it('reads a painted meter for flood fill', () => {
    const steps = history(floodFillGenerator(createFloodFillScenario(8)));
    const last = readoutAt(steps, steps.length - 1, 'grid')!;
    expect(meterIds(last)).toEqual(['frontier', 'visited', 'painted']);
    expect(meterValue(last, 'painted')).toBe(steps.at(-1)!.grid!.resultCount);
  });
});

describe('sieveReadout', () => {
  const steps = history(sieveOfEratosthenesGenerator(createEratosthenesScenario(48, null)));
  const upper = steps[0]!.sieveGrid!.cells.at(-1)!.value;

  it('reads n from the last cell and gauges only the candidates from 2', () => {
    const readout = readoutAt(steps, 0, 'sieve-grid')!;
    expect(registerMap(readout)['r:n']).toBe(String(upper));
    expect(readout.gauge).toEqual({ count: upper - 1, done: 0, lit: 0 });
    const last = readoutAt(steps, steps.length - 1, 'sieve-grid')!;
    expect(last.gauge).toEqual({ count: upper - 1, done: upper - 1, lit: upper - 1 });
  });

  it('replaces the primes meter with the crossed composites so far', () => {
    const lastState = steps.at(-1)!.sieveGrid!;
    const primes = lastState.cells.filter((cell) => cell.state === 'prime').length;
    const last = readoutAt(steps, steps.length - 1, 'sieve-grid')!;
    expect(meterIds(last)).toEqual(['prime', 'bound', 'crossed']);
    expect(meterValue(last, 'crossed')).toBe(upper - 1 - primes);
    let previous = 0;
    steps.forEach((_, index) => {
      const value = Number(meterValue(readoutAt(steps, index, 'sieve-grid')!, 'crossed'));
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    });
  });
});

describe('radixReadout', () => {
  const steps = history(radixSortGenerator([170, 45, 75, 90, 802, 24, 2, 66]));

  it('recognises radix steps and leaves other sorting steps alone', () => {
    expect(isRadixStep(steps[0]!)).toBe(true);
    expect(isRadixStep(sortStep({ array: [3, 1, 2] }))).toBe(false);
  });

  it('reads the digit pass, the active bucket and the cards already scattered', () => {
    const index = steps.findIndex((step) => step.phase === 'distribute' && step.digitIndex === 1);
    const step = steps[index]!;
    const readout = readoutAt(steps, index, 'radix')!;
    expect(meterIds(readout)).toEqual(['digit', 'bucket', 'placed']);
    expect(meterOf(readout, 'digit')).toMatchObject({ value: 2, total: 3 });
    expect(meterValue(readout, 'bucket')).toBe(step.activeBucket);
    const placed = (step.buckets ?? []).reduce((total, bucket) => total + bucket.items.length, 0);
    expect(meterOf(readout, 'placed')).toMatchObject({ value: placed, total: 8 });
    expect(readout.tone).toBe('pink');
    expect(readout.phaseLabel).toBe(I18N_KEY.features.algorithms.display.radix.phases.distribute);
    expect(readout.gauge).toEqual({ count: 3, done: 1, lit: 2 });
    expect(readout.gaugeLabel).toBe('g:digits');
  });

  it('names the active value, its digit and its bucket on the op-line', () => {
    const index = steps.findIndex((step) => step.phase === 'distribute' && step.digitIndex === 0 && step.activeItemId === 'rdx-4');
    const readout = readoutAt(steps, index, 'radix')!;
    expect(registerMap(readout)).toEqual({ 'r:x': '802', 'r:digit': '2', 'r:bucket': '2' });
  });

  it('fills every digit LED at the end and never runs the gauge backwards', () => {
    const done = steps.map((_, index) => readoutAt(steps, index, 'radix')!.gauge?.done ?? 0);
    done.slice(1).forEach((value, index) => expect(value).toBeGreaterThanOrEqual(done[index]!));
    const last = readoutAt(steps, steps.length - 1, 'radix')!;
    expect(last.gauge).toEqual({ count: 3, done: 3, lit: 3 });
    expect(meterOf(last, 'digit')).toMatchObject({ value: 3, total: 3 });
    expect(last.tone).toBe('lime');
  });

  it('extracts a decimal digit by position', () => {
    expect(radixDigit(802, 0)).toBe(2);
    expect(radixDigit(802, 1)).toBe(0);
    expect(radixDigit(802, 2)).toBe(8);
    expect(radixDigit(45, 2)).toBe(0);
  });
});

describe('stringReadout', () => {
  const runs: readonly { readonly mode: string; readonly steps: readonly SortStep[]; readonly meters: readonly string[] }[] = [
    { mode: 'kmp', steps: history(kmpPatternMatchingGenerator(createKmpScenario(20, 'overlap'))), meters: ['textIndex', 'patternIndex', 'matches'] },
    { mode: 'rabin-karp', steps: history(rabinKarpGenerator(createRabinKarpScenario(20, 'alarm'))), meters: ['textIndex', 'hash', 'matches'] },
    { mode: 'z-algorithm', steps: history(zAlgorithmGenerator(createZAlgorithmScenario(20, 'classic'))), meters: ['textIndex', 'zBox', 'matches'] },
    { mode: 'manacher', steps: history(manacherGenerator(createManacherScenario(14, 'banana'))), meters: ['center', 'radius', 'longest'] },
    { mode: 'aho-corasick', steps: history(ahoCorasickGenerator(createAhoCorasickScenario(18, 'classic'))), meters: ['textIndex', 'nodes', 'matches'] },
    { mode: 'suffix-array-construction', steps: history(suffixArrayConstructionGenerator(createSuffixArrayScenario(12, 'banana'))), meters: ['round', 'span', 'ranks'] },
    { mode: 'suffix-array-lcp-kasai', steps: history(suffixArrayLcpKasaiGenerator(createSuffixArrayLcpScenario(12, 'banana'))), meters: ['row', 'lcp', 'computed'] },
    { mode: 'palindromic-tree', steps: history(palindromicTreeGenerator(createPalindromicTreeScenario(12, 'banana'))), meters: ['textIndex', 'palindromes', 'longest'] },
    { mode: 'burrows-wheeler-transform', steps: history(burrowsWheelerTransformGenerator(createBurrowsWheelerScenario(8, 'banana'))), meters: ['rotations', 'output', 'runs'] },
    { mode: 'rle', steps: history(runLengthEncodingGenerator(createRleScenario(16, 'runs'))), meters: ['textIndex', 'runs', 'output'] },
    { mode: 'huffman', steps: history(huffmanCodingGenerator(createHuffmanScenario(12, 'classic'))), meters: ['symbols', 'heap', 'bits'] },
  ];

  it.each(runs)('gives $mode its own meters and a gauge that ends full', ({ mode, steps, meters }) => {
    expect(steps.every((step) => step.string?.mode === mode)).toBe(true);
    steps.forEach((_, index) => {
      const readout = readoutAt(steps, index, 'string')!;
      expect(meterIds(readout)).toEqual(meters);
      expect(readout.meters.every((item) => item.label.startsWith('m:'))).toBe(true);
      expect(readout.registers.every((item) => item.label.startsWith('r:'))).toBe(true);
      expect(readout.gauge!.done).toBeLessThanOrEqual(readout.gauge!.count);
    });
    const last = readoutAt(steps, steps.length - 1, 'string')!;
    expect(last.tone).toBe('lime');
    expect(last.gauge!.done).toBe(last.gauge!.count);
  });

  it('names the compared characters like image 12 during a KMP comparison', () => {
    const steps = runs[0]!.steps;
    const index = steps.findIndex((step) => {
      const state = step.string;
      return state?.mode === 'kmp' && state.stage === 'scan' && state.compareTextIndex !== null && state.comparePatternIndex !== null;
    });
    const state = steps[index]!.string as { text: string; pattern: string; compareTextIndex: number; comparePatternIndex: number };
    const registers = registerMap(readoutAt(steps, index, 'string')!);
    expect(registers['r:textChar']).toBe(state.text[state.compareTextIndex]);
    expect(registers['r:patternChar']).toBe(state.pattern[state.comparePatternIndex]);
  });

  it('turns pink on a KMP fallback and amber while the failure table is built', () => {
    const steps = runs[0]!.steps;
    const fallback = steps.findIndex((step) => step.string?.mode === 'kmp' && step.string.fallbackFrom !== null && step.string.stage === 'scan');
    if (fallback > 0) expect(readoutAt(steps, fallback, 'string')!.tone).toBe('pink');
    const failure = steps.findIndex((step, index) => index > 0 && step.string?.mode === 'kmp' && step.string.stage === 'failure' && step.string.fallbackFrom === null);
    if (failure > 0) expect(readoutAt(steps, failure, 'string')!.tone).toBe('amber');
  });
});
