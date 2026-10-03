import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { bellmanFordGenerator } from '../../algorithms/bellman-ford/bellman-ford';
import { bfsGenerator } from '../../algorithms/bfs/bfs';
import { bipartiteCheckGenerator } from '../../algorithms/bipartite-check/bipartite-check';
import { bridgesArticulationPointsGenerator } from '../../algorithms/bridges-articulation-points';
import { chromaticNumberGenerator } from '../../algorithms/chromatic-number';
import { connectedComponentsGenerator } from '../../algorithms/connected-components/connected-components';
import { cycleDetectionGenerator } from '../../algorithms/cycle-detection/cycle-detection';
import { dfsGenerator } from '../../algorithms/dfs/dfs';
import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { dominatorTreeGenerator } from '../../algorithms/dominator-tree';
import { eulerPathCircuitGenerator } from '../../algorithms/euler-path-circuit';
import { kosarajuSccGenerator } from '../../algorithms/kosaraju-scc';
import { primsMstGenerator } from '../../algorithms/prims-mst';
import { steinerTreeGenerator } from '../../algorithms/steiner-tree';
import { tarjanSccGenerator } from '../../algorithms/tarjan-scc';
import { topologicalSortKahnGenerator } from '../../algorithms/topological-sort-kahn/topological-sort-kahn';
import { GraphEdgeSnapshot, GraphNodeSnapshot, GraphStepState, WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import {
  generateBellmanFordGraph,
  generateBipartiteGraph,
  generateBridgesGraph,
  generateColoringGraph,
  generateConnectedComponentsGraph,
  generateCycleDetectionGraph,
  generateDagGraph,
  generateDijkstraGraph,
  generateDominatorGraph,
  generateEulerGraph,
  generateSccGraph,
  generateSteinerGraph,
  generateTraversalGraph,
} from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
import {
  graphCompletionRows,
  graphEdgeTone,
  graphFrontierRows,
  graphGlyphScale,
  graphValueFont,
  graphLabelKey,
  graphLabelText,
  graphNodeTone,
  graphRouteEdgeIds,
  graphRouteMode,
  graphRouteNodeIds,
  GRAPH_NODE_RADIUS,
  GRAPH_VIEW_PADDING,
  graphSecondaryText,
  graphValueText,
  graphViewBox,
  trimSegment,
} from './graph-display.utils';

const LABELS = I18N_KEY.features.algorithms.display.graph.labels;
const SECONDARY = I18N_KEY.features.algorithms.display.graph.secondary;

const GRAPH_RUNS: readonly (readonly [string, (graph: WeightedGraphData) => Generator<SortStep>, (size: number) => WeightedGraphData])[] = [
  ['dijkstra', dijkstraGenerator, generateDijkstraGraph],
  ['bfs', bfsGenerator, generateTraversalGraph],
  ['dfs', dfsGenerator, generateTraversalGraph],
  ['topological-sort-kahn', topologicalSortKahnGenerator, generateDagGraph],
  ['cycle-detection', cycleDetectionGenerator, generateCycleDetectionGraph],
  ['connected-components', connectedComponentsGenerator, generateConnectedComponentsGraph],
  ['bipartite-check', bipartiteCheckGenerator, generateBipartiteGraph],
  ['bellman-ford', bellmanFordGenerator, generateBellmanFordGraph],
  ['prims-mst', primsMstGenerator, generateDijkstraGraph],
  ['bridges-articulation-points', bridgesArticulationPointsGenerator, generateBridgesGraph],
  ['tarjan-scc', tarjanSccGenerator, generateSccGraph],
  ['kosaraju-scc', kosarajuSccGenerator, generateSccGraph],
  ['euler-path-circuit', eulerPathCircuitGenerator, generateEulerGraph],
  ['chromatic-number', chromaticNumberGenerator, generateColoringGraph],
  ['steiner-tree', steinerTreeGenerator, generateSteinerGraph],
  ['dominator-tree', dominatorTreeGenerator, generateDominatorGraph],
];

function graphStates(run: (typeof GRAPH_RUNS)[number]): GraphStepState[] {
  const [, generator, createGraph] = run;
  return [...generator(createGraph(8))].flatMap((step) => (step.graph ? [step.graph] : []));
}

function node(overrides: Partial<GraphNodeSnapshot> & Pick<GraphNodeSnapshot, 'id'>): GraphNodeSnapshot {
  return {
    label: overrides.id.toUpperCase(),
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
  };
}

function edge(overrides: Partial<GraphEdgeSnapshot> & Pick<GraphEdgeSnapshot, 'id' | 'from' | 'to'>): GraphEdgeSnapshot {
  return { weight: 1, isActive: false, isRelaxed: false, isTree: false, ...overrides };
}

function state(overrides: Partial<GraphStepState>): GraphStepState {
  return {
    nodes: [],
    edges: [],
    sourceId: 'a',
    phaseLabel: '',
    metricLabel: 'Distance',
    secondaryLabel: 'Prev',
    frontierLabel: 'Priority queue',
    frontierHeadLabel: 'Queue head',
    completionLabel: 'Settled',
    frontierStatusLabel: 'queued',
    completionStatusLabel: 'settled',
    showEdgeWeights: true,
    detailLabel: 'Path',
    detailValue: '',
    visitOrderLabel: 'Settled order',
    currentNodeId: null,
    activeEdgeId: null,
    queue: [],
    visitOrder: [],
    traceRows: [],
    computation: null,
    ...overrides,
  };
}

describe('graph display labels', () => {
  it.each(GRAPH_RUNS.map((run) => [run[0], run] as const))('maps every %s label to a key', (_, run) => {
    const unmapped = new Set<string>();
    for (const graph of graphStates(run)) {
      for (const label of [
        graph.metricLabel,
        graph.secondaryLabel,
        graph.frontierLabel,
        graph.frontierHeadLabel,
        graph.completionLabel,
        graph.frontierStatusLabel,
        graph.completionStatusLabel,
        graph.detailLabel,
        graph.visitOrderLabel,
      ]) {
        if (!graphLabelKey(label)) unmapped.add(label);
      }
    }
    expect([...unmapped]).toEqual([]);
  });

  it('keeps the case-sensitive status labels apart from the rack titles', () => {
    expect(graphLabelKey('Settled')).toBe(LABELS.settled);
    expect(graphLabelKey('settled')).toBe(LABELS.statusSettled);
  });

  it('falls back to the raw label when no key exists', () => {
    expect(graphLabelText('Priority queue')).toEqual({ key: LABELS.priorityQueue, params: undefined });
    expect(graphLabelText('Mystery')).toBe('Mystery');
    expect(graphLabelText(null)).toBe('');
  });
});

describe('graph display tones', () => {
  it('ranks generator tones over current, settled, frontier, source and idle', () => {
    expect(graphNodeTone(node({ id: 'a', tone: 'right', isCurrent: true }))).toBe('pink');
    expect(graphNodeTone(node({ id: 'a', isCurrent: true, isSettled: true }))).toBe('cyan');
    expect(graphNodeTone(node({ id: 'a', isSettled: true, isSource: true }))).toBe('lime');
    expect(graphNodeTone(node({ id: 'a', isFrontier: true }))).toBe('amber');
    expect(graphNodeTone(node({ id: 'a', isSource: true }))).toBe('violet');
    expect(graphNodeTone(node({ id: 'a' }))).toBe('slate');
    expect(graphNodeTone(node({ id: 'a', tone: 'component-d' }))).toBe('violet');
  });

  it('keeps current and frontier over SCC component colours', () => {
    expect(graphNodeTone(node({ id: 'a', tone: 'component-b', isCurrent: true, isSettled: true }))).toBe('cyan');
    expect(graphNodeTone(node({ id: 'a', tone: 'component-d', isFrontier: true, isSettled: true }))).toBe('amber');
    expect(graphNodeTone(node({ id: 'a', tone: 'component-c', isSettled: true }))).toBe('amber');
    expect(graphNodeTone(node({ id: 'a', tone: 'component-b', isSettled: true }))).toBe('pink');
  });

  it('paints Euler path endpoints violet and keeps bipartite sides cyan and pink', () => {
    expect(graphNodeTone(node({ id: 'a', tone: 'left', isFrontier: true }), 'Euler path')).toBe('violet');
    expect(graphNodeTone(node({ id: 'a', tone: 'right', isCurrent: true }), 'Euler path')).toBe('violet');
    expect(graphNodeTone(node({ id: 'a', tone: 'left' }), 'Partition check')).toBe('cyan');
    expect(graphNodeTone(node({ id: 'a', tone: 'right' }), 'Partition check')).toBe('pink');
    expect(graphNodeTone(node({ id: 'a', tone: 'critical' }), 'Euler path')).toBe('red');
  });

  it('never paints an Euler path endpoint in the inspected-edge pink', () => {
    const run = GRAPH_RUNS.find(([name]) => name === 'euler-path-circuit');
    if (!run) throw new Error('missing euler run');
    const [, generator, createGraph] = run;
    for (const size of [6, 8, 10]) {
      for (const step of generator(createGraph(size))) {
        const graph = step.graph;
        if (!graph || graph.detailLabel !== 'Euler path') continue;
        for (const item of graph.nodes) {
          if (item.tone === 'left' || item.tone === 'right') expect(graphNodeTone(item, graph.detailLabel)).toBe('violet');
        }
      }
    }
  });

  it('paints the active edge pink unless it is a conflict, then tones, route, tree and relaxed', () => {
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', isActive: true, isTree: true }), false)).toBe('pink');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', isActive: true, tone: 'critical' }), false)).toBe('red');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', tone: 'bridge', isTree: true }), true)).toBe('amber');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', isTree: true }), true)).toBe('cyan');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', isTree: true }), false)).toBe('lime');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', isRelaxed: true }), false)).toBe('soft');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b' }), false)).toBe('base');
    expect(graphEdgeTone(edge({ id: 'e', from: 'a', to: 'b', tone: 'component-b' }), false)).toBe('rose');
  });

  it('prints infinity only for distance-like metrics', () => {
    expect(graphValueText(null, 'Distance')).toBe('∞');
    expect(graphValueText(null, 'Color')).toBe('—');
    expect(graphValueText(0, 'Color')).toBe('0');
  });
});

describe('graph display geometry', () => {
  it('frames the nodes with padding and a minimum span', () => {
    expect(graphViewBox([{ x: 100, y: 100 }, { x: 900, y: 500 }], { x: 40, top: 30, bottom: 50 })).toEqual({
      x: 60,
      y: 70,
      width: 880,
      height: 480,
    });
    const single = graphViewBox([{ x: 0, y: 0 }], { x: 0, top: 0, bottom: 0 });
    expect(single.width).toBeGreaterThan(0);
    expect(single.height).toBeGreaterThan(0);
    expect(graphViewBox([], { x: 0, top: 0, bottom: 0 }).width).toBe(960);
  });

  it('sizes glyphs in screen pixels: one glyph unit per CSS pixel, within a cap', () => {
    const box = { x: 0, y: 0, width: 1000, height: 500 };
    expect(graphGlyphScale(box, 1000, 500)).toBe(1);
    expect(graphGlyphScale(box, 2000, 1000)).toBe(0.5);
    expect(graphGlyphScale(box, 500, 500)).toBe(2);
    expect(graphGlyphScale(box, 100, 500)).toBe(6);
    expect(graphGlyphScale(box, 0, 0)).toBe(1);
  });

  it('keeps the screen padding constant in pixels when fitting the content', () => {
    const content = { x: 0, y: 0, width: 800, height: 400 };
    const padding = { x: 50, top: 30, bottom: 70 };
    const scale = graphGlyphScale(content, 900, 600, padding);
    expect(scale).toBe(1);
    const fitted = graphGlyphScale(content, 500, 600, padding);
    expect(fitted).toBe(2);
    const framed = { width: content.width + padding.x * 2 * fitted, height: content.height + 100 * fitted };
    expect(Math.min(500 / framed.width, 600 / framed.height)).toBeCloseTo(1 / fitted);
    expect(graphGlyphScale(content, 80, 600, padding)).toBe(6);
  });

  it('draws the ring at 14px and keeps the value in Doto at the 1440 Dijkstra stage', () => {
    const run = GRAPH_RUNS[0];
    const first = graphStates(run)[0];
    const content = graphViewBox(first.nodes, { x: 0, top: 0, bottom: 0 });
    const padding = GRAPH_VIEW_PADDING;
    const scale = graphGlyphScale(content, 608, 382, padding);
    const box = graphViewBox(first.nodes, { x: padding.x * scale, top: padding.top * scale, bottom: padding.bottom * scale });
    const pixelsPerUnit = Math.min(608 / box.width, 382 / box.height);
    expect(GRAPH_NODE_RADIUS * scale * pixelsPerUnit).toBeCloseTo(14);
    expect(scale * pixelsPerUnit).toBeCloseTo(1);
    const value = graphValueFont(box, 608, 382, scale, 14);
    expect(value.dot).toBe(true);
    expect(value.size * pixelsPerUnit).toBeGreaterThanOrEqual(14 - 1e-9);
  });

  it('keeps the Doto value at 14px on screen or falls back to mono when it would grow too much', () => {
    const box = { x: 0, y: 0, width: 1000, height: 500 };
    expect(graphValueFont(box, 1000, 500, 1, 14)).toEqual({ size: 14, dot: true });
    expect(graphValueFont(box, 800, 500, 1, 14)).toEqual({ size: 17.5, dot: true });
    expect(graphValueFont(box, 300, 500, 1.8, 14)).toEqual({ size: 25.2, dot: false });
    expect(graphValueFont(box, 0, 0, 1, 14)).toEqual({ size: 14, dot: true });
  });

  it('trims a segment by the ring radius on both ends', () => {
    const segment = trimSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, 16, 18);
    expect(segment).toEqual({ x1: 16, y1: 0, x2: 82, y2: 0, midX: 50, midY: 0 });
    const short = trimSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, 16, 16);
    expect(short.x1).toBeLessThan(short.x2);
  });
});

describe('graph display routes', () => {
  const nodes = [
    node({ id: 'a', isSource: true }),
    node({ id: 'b', previousId: 'a' }),
    node({ id: 'c', previousId: 'b' }),
    node({ id: 'x', previousId: 'y' }),
    node({ id: 'y', previousId: 'x' }),
  ];

  it('walks the predecessor chain to the root and survives cycles', () => {
    expect(graphRouteNodeIds(nodes, 'c')).toEqual(['a', 'b', 'c']);
    expect(graphRouteNodeIds(nodes, 'x')).toEqual(['y', 'x']);
    expect(graphRouteNodeIds(nodes, null)).toEqual([]);
    expect(graphRouteNodeIds(nodes, 'missing')).toEqual([]);
  });

  it('collects edges along the route respecting direction', () => {
    const edges = [
      edge({ id: 'ab', from: 'b', to: 'a' }),
      edge({ id: 'bc', from: 'b', to: 'c', directed: true }),
      edge({ id: 'cb', from: 'c', to: 'b', directed: true }),
    ];
    expect([...graphRouteEdgeIds(edges, ['a', 'b', 'c'])]).toEqual(['ab', 'bc']);
  });

  it('offers routes only for shortest-path, BFS and DFS traces', () => {
    expect(graphRouteMode(state({ metricLabel: 'Distance' }))).toBe('shortest-tree');
    expect(graphRouteMode(state({ metricLabel: 'Level' }))).toBe('bfs-tree');
    expect(graphRouteMode(state({ metricLabel: 'Depth', detailLabel: 'Depth path' }))).toBe('dfs-tree');
    expect(graphRouteMode(state({ metricLabel: 'Depth', detailLabel: 'Cycle' }))).toBeNull();
    expect(graphRouteMode(null)).toBeNull();
  });
});

describe('graph display racks', () => {
  it('lists the frontier in queue order with the head lit and unreachable rows dim', () => {
    const rows = graphFrontierRows(
      state({
        nodes: [node({ id: 'a', isSource: true }), node({ id: 'c', previousId: 'a' }), node({ id: 'd' })],
        queue: [
          { nodeId: 'c', label: 'C', distance: 4 },
          { nodeId: 'd', label: 'D', distance: null },
        ],
      }),
    );
    expect(rows).toEqual([
      { id: '0:c', label: 'C', fromLabel: 'A', secondary: null, isSource: false, value: '4', tone: 'head' },
      { id: '1:d', label: 'D', fromLabel: null, secondary: null, isSource: false, value: '∞', tone: 'dim' },
    ]);
  });

  it('shows the secondary column instead of the predecessor when the trace is not a Prev trace', () => {
    const rows = graphFrontierRows(
      state({
        metricLabel: 'Index',
        secondaryLabel: 'Low / SCC',
        nodes: [
          node({ id: 'a', previousId: 'b', secondaryText: '0' }),
          node({ id: 'b', secondaryText: 'sealed' }),
          node({ id: 'c' }),
        ],
        queue: [
          { nodeId: 'a', label: 'A', distance: 0 },
          { nodeId: 'b', label: 'B', distance: 1 },
          { nodeId: 'c', label: 'C', distance: 2 },
        ],
      }),
    );
    expect(rows.map((row) => [row.fromLabel, row.secondary])).toEqual([
      [null, '0'],
      [null, { key: SECONDARY.sealed, params: undefined }],
      [null, null],
    ]);
  });

  it('orders settled nodes by the visit order, matching labels or ids', () => {
    const rows = graphCompletionRows(
      state({
        nodes: [
          node({ id: 'a', isSource: true, isSettled: true, distance: 0 }),
          node({ id: 'b', previousId: 'f', isSettled: true, distance: 3 }),
          node({ id: 'f', previousId: 'a', isSettled: true, distance: 2 }),
          node({ id: 'g', previousId: 'a', isSettled: true, distance: 9 }),
          node({ id: 'h', distance: 5 }),
        ],
        visitOrder: ['A', 'f', 'B'],
      }),
    );
    expect(rows.map((row) => row.label)).toEqual(['A', 'F', 'B', 'G']);
    expect(rows[0]).toEqual({ id: 'a', label: 'A', fromLabel: null, secondary: null, isSource: true, value: '0', tone: 'done' });
    expect(rows[2].fromLabel).toBe('F');
  });

  it('translates the generator secondary words and keeps the rest verbatim', () => {
    expect(graphSecondaryText('BLUE')).toEqual({ key: SECONDARY.sideZero, params: undefined });
    expect(graphSecondaryText('AMBER')).toEqual({ key: SECONDARY.sideOne, params: undefined });
    expect(graphSecondaryText('start / finish')).toEqual({ key: SECONDARY.startFinish, params: undefined });
    expect(graphSecondaryText('L2 S1')).toBe('L2 S1');
    expect(graphSecondaryText('steiner')).toEqual({ key: SECONDARY.steiner, params: undefined });
    expect(graphSecondaryText('idle')).toEqual({ key: SECONDARY.idle, params: undefined });
  });

  it('translates the patterned generator secondary texts with their parameters', () => {
    expect(graphSecondaryText('via C')).toEqual({ key: SECONDARY.via, params: { node: 'C' } });
    expect(graphSecondaryText('next B')).toEqual({ key: SECONDARY.next, params: { node: 'B' } });
    expect(graphSecondaryText('2/4 used')).toEqual({ key: SECONDARY.used, params: { used: '2', total: '4' } });
    expect(graphSecondaryText('deg 3')).toEqual({ key: SECONDARY.degree, params: { degree: '3' } });
    expect(graphSecondaryText('c1')).toBe('c1');
  });

  it('returns empty racks without a state', () => {
    expect(graphFrontierRows(null)).toEqual([]);
    expect(graphCompletionRows(null)).toEqual([]);
  });

  it('builds racks with unique row ids for every graph algorithm', () => {
    for (const run of GRAPH_RUNS) {
      for (const graph of graphStates(run)) {
        for (const rows of [graphFrontierRows(graph), graphCompletionRows(graph)]) {
          expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
        }
      }
    }
  });
});
