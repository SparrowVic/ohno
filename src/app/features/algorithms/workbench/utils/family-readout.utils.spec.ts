import { describe, expect, it } from 'vitest';

import { bellmanFordGenerator } from '../../algorithms/bellman-ford/bellman-ford';
import { convexHullGenerator } from '../../algorithms/convex-hull';
import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { dinicMaxFlowGenerator } from '../../algorithms/dinic-max-flow';
import { hopcroftKarpGenerator } from '../../algorithms/hopcroft-karp';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { knapsack01Generator } from '../../algorithms/knapsack-01/knapsack-01';
import { kruskalsMstGenerator } from '../../algorithms/kruskals-mst';
import { unionFindGenerator } from '../../algorithms/union-find';
import { GraphNodeSnapshot, GraphStepState } from '../../models/graph';
import { NetworkEdgeSnapshot, NetworkTraceState } from '../../models/network';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { generateDijkstraGraph } from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
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
  networkReadout,
  relaxationCounts,
  scratchpadReadout,
} from './family-readout.utils';
import { StageReadout } from './stage-readout.utils';
import { sortStep } from './step-events.fixture';

const METER_IDS: readonly FamilyMeterId[] = [
  'settled', 'queue', 'relaxed', 'row', 'column', 'value', 'textIndex', 'patternIndex', 'matches', 'stack', 'checked',
  'rejected', 'frontier', 'visited', 'result', 'pivot', 'improved', 'prime', 'bound', 'primes', 'components', 'merged',
  'output', 'low', 'high', 'probe', 'frames', 'returns', 'iteration', 'explored', 'depth', 'phases', 'lines', 'hits',
  'events', 'area', 'cells', 'triangles', 'vertices', 'pairs', 'distance', 'edges', 'rows', 'operations',
];
const GAUGE_IDS: readonly FamilyGaugeId[] = [
  'settled', 'rows', 'phases', 'checked', 'textChars', 'visited', 'marked', 'eliminated', 'output', 'frames', 'explored', 'events', 'cells',
];
const REGISTER_IDS: readonly FamilyRegisterId[] = [
  'u', 'v', 'w', 'alt', 'i', 'j', 'c', 'o', 'a', 'b', 'stack', 'p', 'lo', 'hi', 'mid', 'n', 'k', 'x', 'y', 'depth', 'row', 'col', 'level', 'cost',
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

function readoutAt(steps: readonly SortStep[], index: number, variant: VisualizationVariant, relaxations?: number) {
  const ctx: FamilyReadoutContext = { step: steps[index]!, index, lastIndex: steps.length - 1, variant, labels, relaxations };
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

  it('reads row, column and value meters from a knapsack step', () => {
    const steps = history(
      knapsack01Generator({
        kind: 'knapsack-01',
        presetId: 'camp',
        presetLabel: 'Camp',
        presetDescription: 'camp',
        capacity: 7,
        items: [
          { id: 'compass', label: 'Compass', weight: 2, value: 6 },
          { id: 'torch', label: 'Torch', weight: 1, value: 3 },
          { id: 'rope', label: 'Rope', weight: 3, value: 7 },
        ],
      }),
    );
    const activeIndex = steps.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active'));
    const readout = readoutAt(steps, activeIndex, 'dp')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['row', 'column', 'value']);
    expect(readout.meters[0]!.total).toBe(steps[activeIndex]!.dp!.rowHeaders.length);
    expect(readout.registers.map((item) => item.label)).toEqual(['r:i', 'r:c']);
    expect(readout.gaugeLabel).toBe('g:rows');
    expect(['cyan', 'pink']).toContain(readout.tone);
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
    const steps = history(dijkstraGenerator(generateDijkstraGraph(8)));
    const reversed = steps.findIndex((step) => {
      const graph = step.graph;
      const edge = graph?.edges.find((item) => item.id === graph.activeEdgeId);
      return edge !== undefined && edge.to === graph?.currentNodeId;
    });
    expect(reversed).toBeGreaterThan(0);
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
