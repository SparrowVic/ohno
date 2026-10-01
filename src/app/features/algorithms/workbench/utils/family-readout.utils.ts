import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OpLineRegister } from '../../../../shared/instrument/opline/opline.types';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';
import { DpTraceState } from '../../models/dp';
import { DsuTraceState } from '../../models/dsu';
import { GeometryStepState } from '../../models/geometry';
import { GraphStepState } from '../../models/graph';
import { GridTraceState } from '../../models/grid';
import { MatrixTraceState } from '../../models/matrix';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { NetworkEdgeSnapshot, NetworkTraceState } from '../../models/network';
import { NumberLabTraceState } from '../../models/number-lab';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { ScratchpadLabTraceState, ScratchpadLine } from '../../models/scratchpad-lab';
import { SearchTraceState } from '../../models/search';
import { SieveGridTraceState } from '../../models/sieve-grid';
import { SortStep } from '../../models/sort-step';
import { StringTraceState } from '../../models/string';
import { TreeTraversalTraceState } from '../../models/tree';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { PassGauge, StageMeter, StageReadout } from './stage-readout.utils';

export type FamilyMeterId =
  | 'settled'
  | 'queue'
  | 'relaxed'
  | 'row'
  | 'column'
  | 'value'
  | 'textIndex'
  | 'patternIndex'
  | 'matches'
  | 'stack'
  | 'checked'
  | 'rejected'
  | 'frontier'
  | 'visited'
  | 'result'
  | 'pivot'
  | 'improved'
  | 'prime'
  | 'bound'
  | 'primes'
  | 'components'
  | 'merged'
  | 'output'
  | 'low'
  | 'high'
  | 'probe'
  | 'frames'
  | 'returns'
  | 'iteration'
  | 'explored'
  | 'depth'
  | 'phases'
  | 'lines'
  | 'hits'
  | 'events'
  | 'area'
  | 'cells'
  | 'triangles'
  | 'vertices'
  | 'pairs'
  | 'distance'
  | 'edges'
  | 'rows'
  | 'operations';

export type FamilyGaugeId =
  | 'settled'
  | 'rows'
  | 'phases'
  | 'checked'
  | 'textChars'
  | 'visited'
  | 'marked'
  | 'eliminated'
  | 'output'
  | 'frames'
  | 'explored'
  | 'events'
  | 'cells';

export type FamilyRegisterId =
  | 'u'
  | 'v'
  | 'w'
  | 'alt'
  | 'i'
  | 'j'
  | 'c'
  | 'o'
  | 'a'
  | 'b'
  | 'stack'
  | 'p'
  | 'lo'
  | 'hi'
  | 'mid'
  | 'n'
  | 'k'
  | 'x'
  | 'y'
  | 'depth'
  | 'row'
  | 'col'
  | 'level'
  | 'cost';

export interface FamilyReadoutLabels {
  readonly meters: Readonly<Record<FamilyMeterId, string>>;
  readonly gauges: Readonly<Record<FamilyGaugeId, string>>;
  readonly registers: Readonly<Record<FamilyRegisterId, string>>;
  readonly phases: { readonly start: string; readonly step: string; readonly complete: string };
  readonly translate: (text: TranslatableText) => string;
}

export interface FamilyReadoutContext {
  readonly step: SortStep;
  readonly index: number;
  readonly lastIndex: number;
  readonly variant: VisualizationVariant;
  readonly labels: FamilyReadoutLabels;
  readonly relaxations?: number;
}

const EMPTY = '—';

function meter(id: FamilyMeterId, labels: FamilyReadoutLabels, value: number | string, total: number | null = null, pad = 2): StageMeter {
  return { id, label: labels.meters[id], value, total, pad };
}

function register(id: FamilyRegisterId, labels: FamilyReadoutLabels, value: number | string | null): OpLineRegister {
  return { label: labels.registers[id], value: value === null ? EMPTY : String(value) };
}

function gauge(count: number, done: number, lit = done): PassGauge {
  return { count, done: Math.min(count, done), lit: Math.min(count, lit) };
}

function edgeTone(index: number, lastIndex: number, tone: LedColor): LedColor {
  if (index <= 0) return 'slate';
  if (index >= lastIndex) return 'lime';
  return tone;
}

function phaseText(labels: FamilyReadoutLabels, index: number, lastIndex: number, label: string | null): string {
  if (label) return label;
  if (index <= 0) return labels.phases.start;
  if (index >= lastIndex) return labels.phases.complete;
  return labels.phases.step;
}

export function relaxationCounts(history: readonly SortStep[]): readonly number[] {
  let count = 0;
  return history.map((step) => (step.phase === 'relax' ? ++count : count));
}

export function graphReadout(state: GraphStepState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const settled = state.nodes.filter((node) => node.isSettled).length;
  const relaxed = ctx.relaxations ?? state.nodes.filter((node) => node.previousId !== null).length;
  const current = state.nodes.find((node) => node.id === state.currentNodeId) ?? null;
  const activeEdge = state.edges.find((edge) => edge.id === state.activeEdgeId) ?? null;
  const candidateId = activeEdge && activeEdge.to === state.currentNodeId ? activeEdge.from : activeEdge?.to;
  const candidate = candidateId === undefined ? null : (state.nodes.find((node) => node.id === candidateId) ?? null);
  const tone = edgeTone(index, lastIndex, activeEdge ? 'pink' : current ? 'cyan' : 'slate');
  const registers: OpLineRegister[] = [];
  if (current) registers.push(register('u', labels, current.label));
  if (activeEdge && candidate) {
    registers.push(register('v', labels, candidate.label));
    if (state.showEdgeWeights) registers.push(register('w', labels, activeEdge.weight));
  }
  if (state.computation) registers.push(register('alt', labels, state.computation.result));
  return {
    meters: [
      meter('settled', labels, settled, state.nodes.length),
      meter('queue', labels, state.queue.length),
      meter('relaxed', labels, relaxed, null, 3),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, state.phaseLabel),
    tone,
    registers,
    gauge: gauge(state.nodes.length, settled),
    gaugeLabel: labels.gauges.settled,
  };
}

export function dpReadout(state: DpTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const active = state.cells.find((cell) => cell.status === 'active') ?? null;
  const touchedRows = new Set(
    state.cells.filter((cell) => cell.status !== 'idle' && cell.status !== 'base' && cell.status !== 'blocked').map((cell) => cell.row),
  );
  const rowCount = state.rowHeaders.length;
  const doneRows = state.rowHeaders.filter((_, row) =>
    state.cells.filter((cell) => cell.row === row).every((cell) => cell.status !== 'idle'),
  ).length;
  const hasPath = state.cells.some((cell) => cell.status === 'chosen' || cell.status === 'backtrack');
  const hasCandidate = state.cells.some((cell) => cell.status === 'candidate');
  const tone = edgeTone(index, lastIndex, hasPath ? 'lime' : hasCandidate ? 'pink' : active ? 'cyan' : 'slate');
  const best = active?.valueLabel ?? state.cells.find((cell) => cell.status === 'improved')?.valueLabel ?? EMPTY;
  return {
    meters: [
      meter('row', labels, active ? active.row + 1 : touchedRows.size, rowCount),
      meter('column', labels, active ? active.col + 1 : 0, state.colHeaders.length),
      meter('value', labels, best, null, 2),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone,
    registers: active ? [register('i', labels, active.rowLabel), register('c', labels, active.colLabel)] : [],
    gauge: gauge(rowCount, doneRows, Math.max(doneRows, touchedRows.size)),
    gaugeLabel: labels.gauges.rows,
  };
}

interface TapeCursor {
  readonly textIndex: number | null;
  readonly textLength: number;
  readonly patternIndex: number | null;
  readonly patternLength: number;
  readonly matches: number;
}

function tapeCursor(state: StringTraceState): TapeCursor {
  switch (state.mode) {
    case 'kmp':
      return {
        textIndex: state.textIndex,
        textLength: state.text.length,
        patternIndex: state.patternIndex,
        patternLength: state.pattern.length,
        matches: state.matches.length,
      };
    case 'rabin-karp':
      return {
        textIndex: state.windowStart,
        textLength: state.text.length,
        patternIndex: state.verificationIndex,
        patternLength: state.pattern.length,
        matches: state.matches.length,
      };
    case 'z-algorithm':
      return {
        textIndex: state.activeIndex,
        textLength: state.combined.length,
        patternIndex: state.comparePrefixIndex,
        patternLength: state.patternLength,
        matches: state.matches.length,
      };
    case 'manacher':
      return {
        textIndex: state.currentCenter,
        textLength: state.transformed.length,
        patternIndex: state.activeRadius,
        patternLength: state.longestRadius,
        matches: state.longestRadius,
      };
    case 'rle':
      return {
        textIndex: state.scanIndex,
        textLength: state.source.length,
        patternIndex: state.groupCount,
        patternLength: state.completedRuns.length,
        matches: state.completedRuns.length,
      };
    case 'burrows-wheeler-transform':
      return {
        textIndex: state.activeRows.length,
        textLength: state.rotations.length,
        patternIndex: null,
        patternLength: state.source.length,
        matches: state.runGroups.length,
      };
    case 'huffman':
      return {
        textIndex: state.heapItems.length,
        textLength: state.charFreqs.length,
        patternIndex: state.visibleNodeIds.length,
        patternLength: state.allNodes.length,
        matches: state.codeTable.length,
      };
    case 'aho-corasick':
      return {
        textIndex: state.currentTextIndex,
        textLength: state.text.length,
        patternIndex: null,
        patternLength: state.nodes.length,
        matches: state.matches.length,
      };
    case 'suffix-array-construction':
      return {
        textIndex: state.activeSuffixes[0] ?? null,
        textLength: state.rows.length,
        patternIndex: state.stepSize,
        patternLength: state.source.length,
        matches: state.distinctRanks,
      };
    case 'suffix-array-lcp-kasai':
      return {
        textIndex: state.activeOrder,
        textLength: state.rows.length,
        patternIndex: state.currentMatchLength,
        patternLength: state.source.length,
        matches: state.lcpValues.length,
      };
    case 'palindromic-tree':
      return {
        textIndex: state.processedIndex,
        textLength: state.source.length,
        patternIndex: null,
        patternLength: state.nodes.length,
        matches: state.distinctCount,
      };
  }
}

export function stringReadout(state: StringTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const cursor = tapeCursor(state);
  const scanned = cursor.textIndex === null ? 0 : Math.min(cursor.textLength, cursor.textIndex + 1);
  return {
    meters: [
      meter('textIndex', labels, cursor.textIndex ?? EMPTY, cursor.textLength),
      meter('patternIndex', labels, cursor.patternIndex ?? EMPTY, cursor.patternLength),
      meter('matches', labels, cursor.matches),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, 'cyan'),
    registers: [register('i', labels, cursor.textIndex), register('j', labels, cursor.patternIndex)],
    gauge: gauge(cursor.textLength, scanned),
    gaugeLabel: labels.gauges.textChars,
  };
}

const SCRATCHPAD_TONES: Readonly<Record<ScratchpadLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  setup: 'cyan',
  compute: 'cyan',
  substitute: 'amber',
  decide: 'pink',
  conclude: 'lime',
  complete: 'lime',
};

const isSectionNote = (line: ScratchpadLine): boolean => line.kind === 'note' && line.indent === 0;
const isCaptioned = (line: ScratchpadLine): boolean => line.caption !== null;
const isDivider = (line: ScratchpadLine): boolean => line.kind === 'divider';

function phaseHeadPredicate(lines: readonly ScratchpadLine[]): (line: ScratchpadLine) => boolean {
  if (lines.some(isCaptioned)) return isCaptioned;
  if (lines.some(isSectionNote)) return isSectionNote;
  return isDivider;
}

export function scratchpadReadout(
  state: ScratchpadLabTraceState,
  registersState: NumberLabTraceState | null,
  ctx: FamilyReadoutContext,
): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const isPhaseHead = phaseHeadPredicate(state.lines);
  const phaseCount = Math.max(1, state.lines.filter(isPhaseHead).length);
  const currentIndex = state.lines.findIndex((line) => line.state === 'current');
  const complete = currentIndex < 0 || index >= lastIndex;
  const currentPhase = Math.max(1, state.lines.slice(0, complete ? state.lines.length : currentIndex + 1).filter(isPhaseHead).length);
  const donePhases = complete ? currentPhase : currentPhase - 1;
  const equations = state.lines.filter((line) => line.kind === 'equation' || line.kind === 'substitute').length;
  const decisions = state.lines.filter((line) => line.kind === 'decision').length;
  const registerMeters: StageMeter[] = (registersState?.registers ?? [])
    .slice(0, 3)
    .map((item) => ({ id: item.id, label: labels.translate(item.label), value: item.value, total: null, pad: 2 }));
  return {
    meters:
      registerMeters.length > 0
        ? registerMeters
        : [meter('lines', labels, equations), meter('phases', labels, currentPhase, phaseCount), meter('result', labels, decisions)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, SCRATCHPAD_TONES[state.tone]),
    registers: (registersState?.registers ?? []).slice(0, 4).map((item) => ({ label: labels.translate(item.label), value: item.value })),
    gauge: gauge(phaseCount, donePhases, currentPhase),
    gaugeLabel: labels.gauges.phases,
  };
}

const NUMBER_LAB_TONES: Readonly<Record<NumberLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  compare: 'cyan',
  update: 'pink',
  emit: 'amber',
  settle: 'lime',
  complete: 'lime',
};

export function numberLabReadout(state: NumberLabTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  return {
    meters: state.registers.slice(0, 3).map((item) => ({ id: item.id, label: labels.translate(item.label), value: item.value, total: null, pad: 2 })),
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, NUMBER_LAB_TONES[state.tone]),
    registers: state.registers.slice(0, 4).map((item) => ({ label: labels.translate(item.label), value: item.value })),
    gauge: gauge(Math.max(1, state.history.length), state.history.filter((entry) => !entry.isCurrent).length, state.history.length),
    gaugeLabel: labels.gauges.output,
  };
}

export function geometryReadout(state: GeometryStepState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const base = { phaseLabel: phaseText(labels, index, lastIndex, null), registers: [] as OpLineRegister[] };
  switch (state.mode) {
    case 'convex-hull': {
      const processed = new Set([
        ...state.stackIds,
        ...state.points.filter((point) => point.status === 'rejected' || point.status === 'hull').map((point) => point.id),
      ]).size;
      const rejected = state.points.filter((point) => point.status === 'rejected').length;
      const check = state.turnCheck;
      const tone = edgeTone(index, lastIndex, state.crossProduct !== null && state.crossProduct <= 0 ? 'pink' : check ? 'cyan' : 'slate');
      return {
        ...base,
        meters: [
          meter('stack', labels, state.stackIds.length),
          meter('checked', labels, processed, state.points.length),
          meter('rejected', labels, rejected),
        ],
        tone,
        registers: check
          ? [
              register('o', labels, check[0]),
              register('a', labels, check[1]),
              register('b', labels, check[2]),
              register('stack', labels, state.stackIds.length),
            ]
          : [register('stack', labels, state.stackIds.length)],
        gauge: gauge(state.points.length, processed),
        gaugeLabel: labels.gauges.checked,
      };
    }
    case 'closest-pair':
      return {
        ...base,
        meters: [
          meter('pairs', labels, state.checkedPairs, null, 3),
          meter('distance', labels, state.bestDistance === null ? EMPTY : state.bestDistance.toFixed(1)),
          meter('depth', labels, state.depth),
        ],
        tone: edgeTone(index, lastIndex, state.currentPair ? 'cyan' : 'slate'),
        registers: state.currentPair
          ? [register('a', labels, state.currentPair[0]), register('b', labels, state.currentPair[1])]
          : [],
        gauge: gauge(state.points.length, state.points.filter((point) => point.status !== 'default').length),
        gaugeLabel: labels.gauges.checked,
      };
    case 'line-intersection': {
      const done = state.events.filter((event) => event.tone === 'done').length;
      return {
        ...base,
        meters: [meter('hits', labels, state.foundCount), meter('events', labels, done, state.events.length), meter('stack', labels, state.activeOrder.length)],
        tone: edgeTone(index, lastIndex, state.intersections.some((marker) => marker.tone === 'current') ? 'pink' : 'cyan'),
        registers: state.sweepX === null ? [] : [register('x', labels, state.sweepX)],
        gauge: gauge(state.events.length, done),
        gaugeLabel: labels.gauges.events,
      };
    }
    case 'half-plane-intersection': {
      const done = state.events.filter((event) => event.tone === 'done').length;
      return {
        ...base,
        meters: [
          meter('vertices', labels, state.vertexCount),
          meter('events', labels, done, state.events.length),
          meter('area', labels, state.feasibleArea === null ? EMPTY : Math.round(state.feasibleArea)),
        ],
        tone: edgeTone(index, lastIndex, state.status === 'empty' ? 'red' : 'cyan'),
        registers: [],
        gauge: gauge(state.events.length, done),
        gaugeLabel: labels.gauges.events,
      };
    }
    case 'minkowski-sum':
      return {
        ...base,
        meters: [
          meter('merged', labels, state.mergedEdgeCount, state.totalEdges),
          meter('edges', labels, state.totalEdges),
          meter('area', labels, state.resultArea === null ? EMPTY : Math.round(state.resultArea)),
        ],
        tone: edgeTone(index, lastIndex, state.activeSource ? 'cyan' : 'slate'),
        registers: [],
        gauge: gauge(state.totalEdges, state.mergedEdgeCount),
        gaugeLabel: labels.gauges.events,
      };
    case 'sweep-line': {
      const done = state.events.filter((event) => event.tone === 'done').length;
      return {
        ...base,
        meters: [meter('area', labels, Math.round(state.coveredArea), null, 3), meter('events', labels, done, state.events.length), meter('stack', labels, state.spans.length)],
        tone: edgeTone(index, lastIndex, 'cyan'),
        registers: state.sweepX === null ? [] : [register('x', labels, state.sweepX)],
        gauge: gauge(state.events.length, done),
        gaugeLabel: labels.gauges.events,
      };
    }
    case 'voronoi-diagram': {
      const done = state.events.filter((event) => event.tone === 'done').length;
      return {
        ...base,
        meters: [meter('cells', labels, state.closedCells, state.points.length), meter('events', labels, done, state.events.length), meter('visited', labels, state.points.length)],
        tone: edgeTone(index, lastIndex, state.activeSiteId === null ? 'slate' : 'cyan'),
        registers: state.sweepY === null ? [] : [register('y', labels, state.sweepY)],
        gauge: gauge(state.points.length, state.closedCells),
        gaugeLabel: labels.gauges.cells,
      };
    }
    case 'delaunay-triangulation': {
      const done = state.events.filter((event) => event.tone === 'done').length;
      return {
        ...base,
        meters: [meter('triangles', labels, state.triangleCount), meter('events', labels, done, state.events.length), meter('visited', labels, state.points.length)],
        tone: edgeTone(index, lastIndex, state.circles.some((circle) => circle.tone === 'rejected') ? 'pink' : 'cyan'),
        registers: [],
        gauge: gauge(state.events.length, done),
        gaugeLabel: labels.gauges.events,
      };
    }
  }
}

export function gridReadout(state: GridTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const total = state.rows * state.cols;
  const active = state.cells.find((cell) => cell.id === state.activeCellId) ?? null;
  return {
    meters: [meter('frontier', labels, state.frontierCount), meter('visited', labels, state.visitedCount, total, 3), meter('result', labels, state.resultCount, null, 3)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.statusLabel)),
    tone: edgeTone(index, lastIndex, state.cells.some((cell) => cell.status === 'path') ? 'lime' : active ? 'cyan' : 'slate'),
    registers: active ? [register('row', labels, active.row), register('col', labels, active.col)] : [],
    gauge: gauge(total, state.visitedCount),
    gaugeLabel: labels.gauges.visited,
  };
}

export function matrixReadout(state: MatrixTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const improved = state.cells.filter((cell) => cell.status === 'improved' || cell.status === 'assignment').length;
  const pivotIndex = state.rowHeaders.findIndex((header) => header.status === 'pivot');
  const active = state.cells.find((cell) => cell.status === 'active' || cell.status === 'candidate') ?? null;
  return {
    meters: [
      meter('pivot', labels, state.pivotLabel ?? EMPTY, state.rowHeaders.length),
      meter('improved', labels, improved, null, 3),
      meter('rows', labels, state.rowHeaders.length),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, state.phaseLabel),
    tone: edgeTone(index, lastIndex, improved > 0 && active?.status === 'candidate' ? 'pink' : active ? 'cyan' : 'slate'),
    registers: active ? [register('row', labels, active.rowLabel), register('col', labels, active.colLabel)] : [],
    gauge: gauge(state.rowHeaders.length, pivotIndex < 0 ? 0 : pivotIndex, pivotIndex < 0 ? 0 : pivotIndex + 1),
    gaugeLabel: labels.gauges.rows,
  };
}

const MATRIX_GRID_TONES: Readonly<Record<MatrixGridTraceState['tone'], LedColor>> = {
  idle: 'slate',
  compute: 'cyan',
  pivot: 'cyan',
  eliminate: 'pink',
  complete: 'lime',
  fail: 'red',
};

export function matrixGridReadout(state: MatrixGridTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const pivot = state.cells.find((cell) => cell.state === 'pivot') ?? null;
  const leading = state.cells.filter((cell) => cell.state === 'leading').length;
  return {
    meters: [meter('iteration', labels, state.iteration), meter('pivot', labels, pivot ? `${pivot.row + 1}:${pivot.col + 1}` : EMPTY), meter('rows', labels, state.rows)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, MATRIX_GRID_TONES[state.tone]),
    registers: pivot ? [register('row', labels, pivot.row + 1), register('col', labels, pivot.col + 1)] : [],
    gauge: gauge(state.rows, leading, pivot ? pivot.row + 1 : leading),
    gaugeLabel: labels.gauges.rows,
  };
}

const SIEVE_TONES: Readonly<Record<SieveGridTraceState['tone'], LedColor>> = {
  idle: 'slate',
  pick: 'cyan',
  mark: 'pink',
  settle: 'lime',
  complete: 'lime',
};

export function sieveReadout(state: SieveGridTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const primes = state.cells.filter((cell) => cell.state === 'prime' || cell.state === 'current-prime').length;
  const marked = state.cells.filter((cell) => cell.state !== 'unchecked').length;
  return {
    meters: [meter('prime', labels, state.activePrime ?? EMPTY), meter('bound', labels, state.bound), meter('primes', labels, primes)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, SIEVE_TONES[state.tone]),
    registers: [register('p', labels, state.activePrime), register('n', labels, state.cells.length)],
    gauge: gauge(state.cells.length, marked),
    gaugeLabel: labels.gauges.marked,
  };
}

export function edgeFlow(edge: NetworkEdgeSnapshot): number {
  if (edge.primaryText === 'match') return 1;
  const flow = Number(edge.primaryText.split('/')[0]);
  return Number.isFinite(flow) ? flow : 0;
}

export function networkReadout(state: NetworkTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const flowEdges = state.edges.filter((edge) => edgeFlow(edge) > 0).length;
  const current = state.nodes.find((node) => node.status === 'current') ?? null;
  const augmenting = state.edges.some((edge) => edge.status === 'augment');
  return {
    meters: [meter('frontier', labels, state.frontierCount), meter('queue', labels, state.queue.length), meter('edges', labels, flowEdges)],
    phaseLabel: phaseText(labels, index, lastIndex, state.phaseLabel),
    tone: edgeTone(index, lastIndex, augmenting ? 'pink' : current ? 'cyan' : 'slate'),
    registers: current
      ? [register('u', labels, current.label), register(state.mode === 'min-cost-max-flow' ? 'cost' : 'level', labels, current.level)]
      : [],
    gauge: gauge(state.nodes.length, state.nodes.filter((node) => node.status === 'visited' || node.status === 'linked').length),
    gaugeLabel: labels.gauges.visited,
  };
}

export function treeReadout(state: TreeTraversalTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const pending = state.order === 'level-order' ? state.queue : state.stack;
  const current = state.nodes.find((node) => node.id === state.currentNodeId) ?? null;
  return {
    meters: [
      meter('visited', labels, state.visitedCount, state.totalNodes),
      meter(state.order === 'level-order' ? 'queue' : 'stack', labels, pending.length),
      meter('output', labels, state.output.length),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, current?.status === 'backtrack' ? 'pink' : current ? 'cyan' : 'slate'),
    registers: current ? [register('u', labels, current.label), register('depth', labels, current.depth)] : [],
    gauge: gauge(state.totalNodes, state.visitedCount),
    gaugeLabel: labels.gauges.visited,
  };
}

export function dsuReadout(state: DsuTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const merged = state.nodes.length - state.componentCount;
  const decided = state.edges.filter((edge) => edge.status === 'accepted' || edge.status === 'rejected').length;
  const active = state.edges.find((edge) => edge.status === 'active') ?? null;
  const merging = state.nodes.some((node) => node.status === 'merged');
  const registers = active ? [register('a', labels, active.fromLabel)] : [];
  if (active && active.fromId !== active.toId) registers.push(register('b', labels, active.toLabel));
  if (active && active.weight !== null) registers.push(register('w', labels, active.weight));
  return {
    meters: [
      meter('components', labels, state.componentCount),
      meter('merged', labels, merged),
      meter(state.mode === 'union-find' ? 'operations' : 'edges', labels, decided, state.edges.length),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.statusLabel)),
    tone: edgeTone(index, lastIndex, merging ? 'pink' : active ? 'cyan' : 'slate'),
    registers,
    gauge: gauge(Math.max(1, state.edges.length), decided),
    gaugeLabel: labels.gauges.checked,
  };
}

export function searchReadout(state: SearchTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const found = state.resultIndices.length > 0;
  return {
    meters: [meter('low', labels, state.low ?? EMPTY), meter('probe', labels, state.probeIndex ?? EMPTY), meter('high', labels, state.high ?? EMPTY)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.statusLabel)),
    tone: edgeTone(index, lastIndex, found ? 'lime' : state.probeIndex === null ? 'slate' : 'cyan'),
    registers: [register('lo', labels, state.low), register('mid', labels, state.probeIndex), register('hi', labels, state.high), register('x', labels, state.target)],
    gauge: gauge(state.rows.length, state.eliminated.length, state.eliminated.length + state.visitedOrder.length),
    gaugeLabel: labels.gauges.eliminated,
  };
}

const POINTER_TONES: Readonly<Record<PointerLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  compare: 'cyan',
  swap: 'pink',
  settle: 'lime',
  complete: 'lime',
};

export function pointerLabReadout(state: PointerLabTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const settled = state.cells.filter((cell) => cell.status === 'settled' || cell.status === 'best').length;
  const pointerMeters: StageMeter[] = state.pointers
    .slice(0, 2)
    .map((pointer) => ({ id: pointer.id, label: pointer.label, value: pointer.index, total: null, pad: 2 }));
  return {
    meters: [...pointerMeters, meter('iteration', labels, state.iteration)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, POINTER_TONES[state.tone]),
    registers: state.pointers.map((pointer) => ({ label: pointer.label, value: String(pointer.index) })),
    gauge: gauge(state.cells.length, settled),
    gaugeLabel: labels.gauges.visited,
  };
}

const CALL_STACK_TONES: Readonly<Record<CallStackLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  descend: 'cyan',
  combine: 'amber',
  return: 'pink',
  complete: 'lime',
};

export function callStackReadout(state: CallStackLabTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const depth = Math.max(0, ...state.frames.map((frame) => frame.depth + 1));
  return {
    meters: [meter('frames', labels, state.frames.length), meter('depth', labels, depth), meter('returns', labels, state.recentReturns.length)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, CALL_STACK_TONES[state.tone]),
    registers: state.frames.length > 0 ? [register('depth', labels, state.frames.length), register('n', labels, state.iteration)] : [],
    gauge: gauge(Math.max(1, state.frames.length + state.recentReturns.length), state.recentReturns.length),
    gaugeLabel: labels.gauges.frames,
  };
}

const CALL_TREE_TONES: Readonly<Record<CallTreeLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  descend: 'cyan',
  prune: 'red',
  solve: 'lime',
  return: 'pink',
  complete: 'lime',
};

export function callTreeReadout(state: CallTreeLabTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const explored = state.nodes.filter((node) => node.phase !== 'pending').length;
  return {
    meters: [meter('explored', labels, explored, state.nodes.length), meter('depth', labels, state.activePath.length), meter('iteration', labels, state.iteration)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, CALL_TREE_TONES[state.tone]),
    registers: [register('depth', labels, state.activePath.length), register('n', labels, state.iteration)],
    gauge: gauge(Math.max(1, state.nodes.length), explored),
    gaugeLabel: labels.gauges.explored,
  };
}

export function familyStageReadout(ctx: FamilyReadoutContext): StageReadout | null {
  const { step, variant } = ctx;
  if (step.graph) return graphReadout(step.graph, ctx);
  if (step.network) return networkReadout(step.network, ctx);
  if (step.dsu) return dsuReadout(step.dsu, ctx);
  if (step.tree) return treeReadout(step.tree, ctx);
  if (step.dp) return dpReadout(step.dp, ctx);
  if (step.matrix) return matrixReadout(step.matrix, ctx);
  if (step.grid) return gridReadout(step.grid, ctx);
  if (step.sieveGrid) return sieveReadout(step.sieveGrid, ctx);
  if (step.string) return stringReadout(step.string, ctx);
  if (step.search) return searchReadout(step.search, ctx);
  if (step.pointerLab) return pointerLabReadout(step.pointerLab, ctx);
  if (step.matrixGrid && variant === 'matrix-grid') return matrixGridReadout(step.matrixGrid, ctx);
  if (step.numberLab && (variant === 'number-lab' || !step.scratchpadLab)) return numberLabReadout(step.numberLab, ctx);
  if (step.scratchpadLab) return scratchpadReadout(step.scratchpadLab, step.numberLab ?? null, ctx);
  if (step.geometry) return geometryReadout(step.geometry, ctx);
  if (step.callStackLab) return callStackReadout(step.callStackLab, ctx);
  if (step.callTreeLab) return callTreeReadout(step.callTreeLab, ctx);
  return null;
}
