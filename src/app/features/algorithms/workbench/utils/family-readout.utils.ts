import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, isI18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OpLineRegister } from '../../../../shared/instrument/opline/opline.types';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';
import {
  buildMatrixGridTable,
  isRowOperationLabel,
  matrixGridColumnLabel,
} from '../../components/matrix-grid-visualization/matrix-grid-display.utils';
import { hullDrawnRejectedIds } from '../../components/convex-hull-visualization/convex-hull-display.utils';
import { delaunayMeshIds } from '../../components/delaunay-visualization/delaunay-display.utils';
import { dpFocusCell } from '../../components/dp-visualization/dp-display.utils';
import { matrixFocus, matrixPivotIndex } from '../../components/matrix-visualization/matrix-display.utils';
import { searchProbeLabel } from '../../components/search-visualization/search-display.utils';
import { notebookPhaseHead, notebookResultCount } from '../../components/scratchpad-lab-visualization/scratchpad-display.utils';
import { DpCell, DpMode, DpTraceState } from '../../models/dp';
import { DsuTraceState } from '../../models/dsu';
import { GeometryStepState } from '../../models/geometry';
import { GraphStepState } from '../../models/graph';
import { GridTraceState } from '../../models/grid';
import { MatrixTraceState } from '../../models/matrix';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { NetworkEdgeSnapshot, NetworkTraceState } from '../../models/network';
import { NumberLabTraceState } from '../../models/number-lab';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SearchTraceState } from '../../models/search';
import { SieveCellState, SieveGridCell, SieveGridTraceState } from '../../models/sieve-grid';
import { SortStep } from '../../models/sort-step';
import {
  AhoCorasickTraceState,
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  PalindromicTreeTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringTraceState,
  SuffixArrayConstructionTraceState,
  SuffixArrayLcpTraceState,
  ZAlgorithmTraceState,
} from '../../models/string';
import { TreeTraversalTraceState } from '../../models/tree';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { PassGauge, StageMeter, StageReadout } from './stage-readout.utils';

export type FamilyMeterId =
  | 'hash'
  | 'zBox'
  | 'center'
  | 'radius'
  | 'longest'
  | 'runs'
  | 'rotations'
  | 'symbols'
  | 'heap'
  | 'bits'
  | 'nodes'
  | 'round'
  | 'span'
  | 'ranks'
  | 'lcp'
  | 'computed'
  | 'palindromes'
  | 'settled'
  | 'digit'
  | 'bucket'
  | 'placed'
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
  | 'operations'
  | 'capacity'
  | 'best'
  | 'amount'
  | 'sum'
  | 'indexI'
  | 'indexJ'
  | 'matched'
  | 'zeros'
  | 'path'
  | 'closed'
  | 'painted'
  | 'crossed'
  | 'active'
  | 'spans';

export type FamilyGaugeId =
  | 'treeNodes'
  | 'ranks'
  | 'settled'
  | 'digits'
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
  | 'cells'
  | 'matched'
  | 'operations'
  | 'closed';

export type FamilyRegisterId =
  | 'textChar'
  | 'patternChar'
  | 'patternHash'
  | 'windowHash'
  | 'boxLeft'
  | 'boxRight'
  | 'zValue'
  | 'center'
  | 'mirror'
  | 'rightEdge'
  | 'char'
  | 'count'
  | 'node'
  | 'matchLength'
  | 'u'
  | 'digit'
  | 'bucket'
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
  readonly operations?: { readonly done: number; readonly total: number };
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
  if (state.computation) registers.push(register('alt', labels, labels.translate(state.computation.result)));
  return {
    meters: [
      meter('settled', labels, settled, state.nodes.length),
      meter('queue', labels, state.queue.length),
      meter('relaxed', labels, relaxed, null, 3),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone,
    registers,
    gauge: gauge(state.nodes.length, settled),
    gaugeLabel: labels.gauges.settled,
  };
}

interface DpAxes {
  readonly row: FamilyMeterId;
  readonly column: FamilyMeterId;
  readonly value: FamilyMeterId;
}

const DP_BASE_AXES: Partial<Readonly<Record<DpMode, DpAxes>>> = {
  'knapsack-01': { row: 'row', column: 'capacity', value: 'best' },
  'coin-change': { row: 'row', column: 'amount', value: 'value' },
  'subset-sum': { row: 'row', column: 'sum', value: 'value' },
  'longest-common-subsequence': { row: 'indexI', column: 'indexJ', value: 'value' },
  'edit-distance': { row: 'indexI', column: 'indexJ', value: 'value' },
  'wildcard-matching': { row: 'textIndex', column: 'patternIndex', value: 'value' },
  'regex-matching-dp': { row: 'textIndex', column: 'patternIndex', value: 'value' },
};

const DP_PLAIN_AXES: DpAxes = { row: 'row', column: 'column', value: 'value' };
const DP_RESULT = /^(-?\d+|T|F|∞)$/;
const KNAPSACK_ITEM = /^w(\d+) · v(\d+)$/;

export function dpResultValue(state: DpTraceState): string | null {
  const result = state.computation?.result;
  return typeof result === 'string' && DP_RESULT.test(result) ? result : null;
}

function dpAnswerCell(state: DpTraceState): DpCell | null {
  const lastRow = state.rowHeaders.length - 1;
  const lastCol = state.colHeaders.length - 1;
  return state.cells.find((cell) => cell.row === lastRow && cell.col === lastCol && cell.valueLabel !== '·') ?? null;
}

function dpBestValue(state: DpTraceState, active: DpCell | null, complete: boolean): string {
  const result = dpResultValue(state);
  if (result !== null) return result;
  if (active && active.valueLabel !== '·' && !complete) return active.valueLabel;
  const improved = state.cells.find((cell) => cell.status === 'improved')?.valueLabel;
  if (improved) return improved;
  return (complete ? dpAnswerCell(state)?.valueLabel : active?.valueLabel) ?? EMPTY;
}

function dpRegisters(state: DpTraceState, active: DpCell | null, labels: FamilyReadoutLabels): OpLineRegister[] {
  if (!active) return [];
  if (state.mode !== 'knapsack-01') {
    return [register('i', labels, labels.translate(active.rowLabel)), register('c', labels, labels.translate(active.colLabel))];
  }
  const meta = state.rowHeaders[active.row]?.metaLabel;
  const item = typeof meta === 'string' ? meta.match(KNAPSACK_ITEM) : null;
  const registers = [register('i', labels, active.row), register('c', labels, active.col)];
  if (item) registers.push(register('w', labels, item[1]!), register('v', labels, item[2]!));
  return registers;
}

interface DpProgress {
  readonly row: number | string;
  readonly done: number;
  readonly lit: number;
}

function dpTouchedRows(state: DpTraceState): number {
  return new Set(
    state.cells.filter((cell) => cell.status !== 'idle' && cell.status !== 'base' && cell.status !== 'blocked').map((cell) => cell.row),
  ).size;
}

function dpRowMajorProgress(state: DpTraceState, focus: DpCell | null, complete: boolean): DpProgress {
  const rowCount = state.rowHeaders.length - 1;
  if (complete) return { row: rowCount, done: rowCount, lit: rowCount };
  const focusRow = focus?.row ?? state.rowHeaders.findIndex((header) => header.status === 'active');
  if (focusRow >= 0) return { row: focusRow, done: Math.max(0, focusRow - 1), lit: focusRow };
  return { row: EMPTY, done: 0, lit: 0 };
}

function dpTableProgress(state: DpTraceState, focus: DpCell | null): DpProgress {
  const touched = dpTouchedRows(state);
  const done = state.rowHeaders.filter((_, row) =>
    state.cells.filter((cell) => cell.row === row).every((cell) => cell.status !== 'idle'),
  ).length;
  return { row: focus ? focus.row + 1 : touched, done, lit: Math.max(done, touched) };
}

export function dpReadout(state: DpTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const baseAxes = DP_BASE_AXES[state.mode];
  const axes = baseAxes ?? DP_PLAIN_AXES;
  const offset = baseAxes ? 1 : 0;
  const focus = dpFocusCell(state);
  const hasPath = state.cells.some((cell) => cell.status === 'chosen' || cell.status === 'backtrack');
  const hasCandidate = state.cells.some((cell) => cell.status === 'candidate');
  const tone = edgeTone(index, lastIndex, hasPath ? 'lime' : hasCandidate ? 'pink' : focus ? 'cyan' : 'slate');
  const complete = state.cells.some((cell) => cell.status === 'backtrack') || index >= lastIndex;
  const progress = baseAxes ? dpRowMajorProgress(state, focus, complete) : dpTableProgress(state, focus);
  const rowCount = state.rowHeaders.length - offset;
  const answerCol = state.colHeaders.length - 1 - offset;
  const column = complete && baseAxes ? answerCol : focus ? focus.col + 1 - offset : baseAxes ? EMPTY : 0;
  return {
    meters: [
      meter(axes.row, labels, progress.row, rowCount),
      meter(axes.column, labels, column, state.colHeaders.length - offset),
      meter(axes.value, labels, dpBestValue(state, focus, complete), null, 2),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone,
    registers: dpRegisters(state, focus, labels),
    gauge: gauge(rowCount, progress.done, progress.lit),
    gaugeLabel: labels.gauges.rows,
  };
}

function charAt(source: string, index: number | null): string | null {
  return index === null ? null : (source[index] ?? null);
}

function scannedCount(length: number, index: number | null, complete: boolean): number {
  if (complete) return length;
  return index === null ? 0 : Math.min(length, index + 1);
}

interface StringReadoutParts {
  readonly meters: readonly StageMeter[];
  readonly tone: LedColor;
  readonly registers: readonly OpLineRegister[];
  readonly gauge: PassGauge;
  readonly gaugeLabel: string;
}

function kmpParts(state: KmpTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const comparing = state.compareTextIndex !== null && state.comparePatternIndex !== null;
  const tone: LedColor =
    state.stage === 'done' ? 'lime' : state.fallbackFrom !== null ? 'pink' : state.stage === 'failure' ? 'amber' : comparing ? 'cyan' : 'slate';
  const registers = [register('i', labels, state.textIndex), register('j', labels, state.patternIndex)];
  if (comparing) {
    registers.push(
      register('textChar', labels, charAt(state.text, state.compareTextIndex)),
      register('patternChar', labels, charAt(state.pattern, state.comparePatternIndex)),
    );
  }
  return {
    meters: [
      meter('textIndex', labels, state.textIndex ?? EMPTY, state.text.length),
      meter('patternIndex', labels, state.patternIndex ?? EMPTY, state.pattern.length),
      meter('matches', labels, state.matches.length),
    ],
    tone,
    registers,
    gauge: gauge(state.text.length, scannedCount(state.text.length, state.textIndex, complete || state.stage === 'done')),
    gaugeLabel: labels.gauges.textChars,
  };
}

function rabinKarpParts(state: RabinKarpTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const tone: LedColor = state.collision
    ? 'amber'
    : state.verifying
      ? 'cyan'
      : state.patternHash === state.windowHash
        ? 'lime'
        : 'pink';
  const windowEnd = state.windowStart + state.windowLength - 1;
  return {
    meters: [
      meter('textIndex', labels, state.windowStart, state.text.length),
      meter('hash', labels, state.windowHash, null, 2),
      meter('matches', labels, state.matches.length),
    ],
    tone,
    registers: [
      register('i', labels, state.windowStart),
      register('patternHash', labels, state.patternHash),
      register('windowHash', labels, state.windowHash),
    ],
    gauge: gauge(state.text.length, scannedCount(state.text.length, windowEnd, complete)),
    gaugeLabel: labels.gauges.textChars,
  };
}

function zAlgorithmParts(state: ZAlgorithmTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const active = state.activeIndex;
  const zValue = active === null ? null : (state.zValues[active] ?? null);
  const box = state.boxLeft !== null && state.boxRight !== null ? `${state.boxLeft}–${state.boxRight}` : EMPTY;
  const tone: LedColor =
    state.comparePrefixIndex !== null ? 'cyan' : zValue !== null && zValue >= state.patternLength && state.patternLength > 0 ? 'lime' : 'slate';
  return {
    meters: [
      meter('textIndex', labels, active ?? EMPTY, state.combined.length),
      meter('zBox', labels, box),
      meter('matches', labels, state.matches.length),
    ],
    tone,
    registers: [
      register('i', labels, active),
      register('boxLeft', labels, state.boxLeft),
      register('boxRight', labels, state.boxRight),
      register('zValue', labels, zValue),
    ],
    gauge: gauge(state.combined.length, scannedCount(state.combined.length, active, complete)),
    gaugeLabel: labels.gauges.textChars,
  };
}

function manacherParts(state: ManacherTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const tone: LedColor =
    state.compareLeft !== null ? 'cyan' : state.currentCenter !== null && state.currentCenter === state.longestCenter && state.longestRadius > 0 ? 'lime' : 'slate';
  return {
    meters: [
      meter('center', labels, state.currentCenter ?? EMPTY, state.transformed.length),
      meter('radius', labels, state.activeRadius),
      meter('longest', labels, state.longestPalindrome.length, state.source.length),
    ],
    tone,
    registers: [
      register('center', labels, state.currentCenter),
      register('mirror', labels, state.mirrorIndex),
      register('rightEdge', labels, state.rightBoundary),
    ],
    gauge: gauge(state.transformed.length, scannedCount(state.transformed.length, state.currentCenter, complete)),
    gaugeLabel: labels.gauges.textChars,
  };
}

function rleParts(state: RleTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const done = complete || state.phase === 'complete';
  const tone: LedColor = state.phase === 'emit' || done ? 'lime' : state.phase === 'extend' ? 'pink' : 'cyan';
  return {
    meters: [
      meter('textIndex', labels, state.scanIndex ?? EMPTY, state.source.length),
      meter('runs', labels, state.completedRuns.length),
      meter('output', labels, state.output.length),
    ],
    tone,
    registers: state.groupChar ? [register('char', labels, state.groupChar), register('count', labels, state.groupCount)] : [],
    gauge: gauge(state.source.length, scannedCount(state.source.length, state.scanIndex, done)),
    gaugeLabel: labels.gauges.textChars,
  };
}

function burrowsWheelerParts(state: BurrowsWheelerTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const comparing = state.rotations.some((row) => row.tone === 'compare');
  const active = state.rotations.some((row) => row.tone === 'active');
  const outputDone = complete || (state.output.length > 0 && state.output.length >= state.source.length);
  const tone: LedColor = outputDone ? 'lime' : comparing ? 'pink' : active ? 'cyan' : 'slate';
  return {
    meters: [
      meter('rotations', labels, state.rotations.length),
      meter('output', labels, state.output.length, state.source.length),
      meter('runs', labels, state.runGroups.length),
    ],
    tone,
    registers: [],
    gauge: gauge(state.source.length, outputDone ? state.source.length : state.output.length),
    gaugeLabel: labels.gauges.output,
  };
}

const HUFFMAN_TONES: Readonly<Record<HuffmanTraceState['phase'], LedColor>> = {
  freq: 'cyan',
  heap: 'amber',
  merge: 'pink',
  codes: 'lime',
};

function huffmanParts(state: HuffmanTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const nodeCount = Math.max(1, state.allNodes.length);
  return {
    meters: [
      meter('symbols', labels, state.charFreqs.length),
      meter('heap', labels, state.heapItems.length),
      meter('bits', labels, state.totalCompressedBits, state.totalOriginalBits || null, 2),
    ],
    tone: complete ? 'lime' : HUFFMAN_TONES[state.phase],
    registers: [],
    gauge: gauge(nodeCount, complete ? nodeCount : state.visibleNodeIds.length),
    gaugeLabel: labels.gauges.treeNodes,
  };
}

function ahoCorasickParts(state: AhoCorasickTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const done = complete || state.phase === 'complete';
  const matchedHere = state.currentTextIndex !== null && state.matches.some((match) => match.endIndex === state.currentTextIndex);
  const tone: LedColor = done
    ? 'lime'
    : state.phase === 'build'
      ? 'amber'
      : state.phase === 'link'
        ? 'violet'
        : state.failurePath.length > 0
          ? 'pink'
          : matchedHere
            ? 'lime'
            : 'cyan';
  const activeNode = state.nodes.find((node) => node.id === state.activeNodeId) ?? null;
  return {
    meters: [
      meter('textIndex', labels, state.currentTextIndex ?? EMPTY, state.text.length),
      meter('nodes', labels, state.nodes.length),
      meter('matches', labels, state.matches.length),
    ],
    tone,
    registers: [
      register('i', labels, state.currentTextIndex),
      register('char', labels, state.currentChar),
      register('node', labels, activeNode ? activeNode.index : null),
    ],
    gauge: gauge(state.text.length, scannedCount(state.text.length, state.currentTextIndex, done)),
    gaugeLabel: labels.gauges.textChars,
  };
}

const SUFFIX_ARRAY_TONES: Readonly<Record<SuffixArrayConstructionTraceState['phase'], LedColor>> = {
  seed: 'slate',
  sort: 'pink',
  rank: 'cyan',
  complete: 'lime',
};

function suffixArrayParts(state: SuffixArrayConstructionTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const total = state.source.length;
  return {
    meters: [
      meter('round', labels, state.round),
      meter('span', labels, state.stepSize),
      meter('ranks', labels, state.distinctRanks, total),
    ],
    tone: complete ? 'lime' : SUFFIX_ARRAY_TONES[state.phase],
    registers: state.activeSuffixes.slice(0, 2).map((start, position) => register(position === 0 ? 'i' : 'j', labels, start)),
    gauge: gauge(Math.max(1, total), complete ? total : state.distinctRanks),
    gaugeLabel: labels.gauges.ranks,
  };
}

function suffixArrayLcpParts(state: SuffixArrayLcpTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const done = complete || state.phase === 'complete';
  const computed = state.rows.filter((row) => row.lcp !== null).length;
  const tone: LedColor = done ? 'lime' : state.phase === 'scan' ? 'cyan' : 'slate';
  return {
    meters: [
      meter('row', labels, state.activeOrder === null ? EMPTY : state.activeOrder + 1, state.rows.length),
      meter('lcp', labels, state.currentMatchLength),
      meter('computed', labels, computed, state.rows.length),
    ],
    tone,
    registers: [
      register('i', labels, state.activeSuffixes[0] ?? null),
      register('j', labels, state.compareWith),
      register('matchLength', labels, state.currentMatchLength),
    ],
    gauge: gauge(Math.max(1, state.rows.length), done ? state.rows.length : computed),
    gaugeLabel: labels.gauges.rows,
  };
}

const PALINDROMIC_TREE_TONES: Readonly<Record<PalindromicTreeTraceState['phase'], LedColor>> = {
  roots: 'slate',
  followLink: 'pink',
  reuse: 'cyan',
  insert: 'lime',
  complete: 'lime',
};

function palindromicTreeParts(state: PalindromicTreeTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  const done = complete || state.phase === 'complete';
  const processed = state.processedIndex >= 0 ? state.processedIndex : null;
  return {
    meters: [
      meter('textIndex', labels, processed ?? EMPTY, state.source.length),
      meter('palindromes', labels, state.distinctCount),
      meter('longest', labels, state.longestSuffix.length, state.source.length),
    ],
    tone: done ? 'lime' : PALINDROMIC_TREE_TONES[state.phase],
    registers: [register('i', labels, processed), register('char', labels, state.currentChar)],
    gauge: gauge(state.source.length, scannedCount(state.source.length, processed, done)),
    gaugeLabel: labels.gauges.textChars,
  };
}

function stringParts(state: StringTraceState, labels: FamilyReadoutLabels, complete: boolean): StringReadoutParts {
  switch (state.mode) {
    case 'kmp':
      return kmpParts(state, labels, complete);
    case 'rabin-karp':
      return rabinKarpParts(state, labels, complete);
    case 'z-algorithm':
      return zAlgorithmParts(state, labels, complete);
    case 'manacher':
      return manacherParts(state, labels, complete);
    case 'rle':
      return rleParts(state, labels, complete);
    case 'burrows-wheeler-transform':
      return burrowsWheelerParts(state, labels, complete);
    case 'huffman':
      return huffmanParts(state, labels, complete);
    case 'aho-corasick':
      return ahoCorasickParts(state, labels, complete);
    case 'suffix-array-construction':
      return suffixArrayParts(state, labels, complete);
    case 'suffix-array-lcp-kasai':
      return suffixArrayLcpParts(state, labels, complete);
    case 'palindromic-tree':
      return palindromicTreeParts(state, labels, complete);
  }
}

export function stringReadout(state: StringTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const parts = stringParts(state, labels, index >= lastIndex);
  return {
    meters: parts.meters,
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, parts.tone),
    registers: parts.registers,
    gauge: parts.gauge,
    gaugeLabel: parts.gaugeLabel,
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

export function scratchpadReadout(
  state: ScratchpadLabTraceState,
  registersState: NumberLabTraceState | null,
  ctx: FamilyReadoutContext,
): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const isPhaseHead = notebookPhaseHead(state.lines);
  const phaseCount = Math.max(1, state.lines.filter(isPhaseHead).length);
  const currentIndex = state.lines.findIndex((line) => line.state === 'current');
  const complete = currentIndex < 0 || index >= lastIndex;
  const currentPhase = Math.max(1, state.lines.slice(0, complete ? state.lines.length : currentIndex + 1).filter(isPhaseHead).length);
  const donePhases = complete ? currentPhase : currentPhase - 1;
  const equations = state.lines.filter((line) => line.kind === 'equation' || line.kind === 'substitute').length;
  const results = notebookResultCount(state.lines);
  const registerMeters: StageMeter[] = (registersState?.registers ?? [])
    .slice(0, 3)
    .map((item) => ({ id: item.id, label: labels.translate(item.label), value: item.value, total: null, pad: 2 }));
  return {
    meters:
      registerMeters.length > 0
        ? registerMeters
        : [meter('lines', labels, equations), meter('phases', labels, currentPhase, phaseCount), meter('result', labels, results)],
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
      const rejectedIds = hullDrawnRejectedIds(state);
      const processed = new Set([
        ...state.stackIds,
        ...rejectedIds,
        ...state.points.filter((point) => point.status === 'hull').map((point) => point.id),
      ]).size;
      const rejected = rejectedIds.size;
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
        meters: [meter('hits', labels, state.foundCount), meter('events', labels, done, state.events.length), meter('active', labels, state.activeOrder.length)],
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
        meters: [meter('area', labels, Math.round(state.coveredArea), null, 3), meter('events', labels, done, state.events.length), meter('spans', labels, state.spans.length)],
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
        meters: [meter('cells', labels, state.closedCells, state.points.length), meter('events', labels, done, state.events.length), meter('visited', labels, state.events.filter((event) => event.tone !== 'queued').length, state.points.length)],
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
        meters: [meter('triangles', labels, state.triangleCount), meter('events', labels, done, state.events.length), meter('visited', labels, delaunayMeshIds(state).size, state.points.length)],
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
  const aStar = state.mode === 'a-star';
  return {
    meters: [
      meter('frontier', labels, state.frontierCount),
      meter(aStar ? 'closed' : 'visited', labels, state.visitedCount, total, 3),
      meter(aStar ? 'path' : 'painted', labels, state.resultCount, null, 3),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.statusLabel)),
    tone: edgeTone(index, lastIndex, state.cells.some((cell) => cell.status === 'path') ? 'lime' : active ? 'cyan' : 'slate'),
    registers: active ? [register('row', labels, active.row), register('col', labels, active.col)] : [],
    gauge: gauge(total, state.visitedCount),
    gaugeLabel: aStar ? labels.gauges.closed : labels.gauges.visited,
  };
}

export function matrixResultCount(state: MatrixTraceState): number | null {
  const count = isI18nText(state.resultLabel) ? state.resultLabel.params?.['count'] : undefined;
  return typeof count === 'number' ? count : null;
}

function floydWarshallReadout(state: MatrixTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const improved = matrixResultCount(state) ?? state.cells.filter((cell) => cell.status === 'improved').length;
  const size = state.rowHeaders.length;
  const pivotIndex = matrixPivotIndex(state);
  const pivotFinished = ctx.step.phase === 'pass-complete';
  const done = pivotIndex < 0 ? (index >= lastIndex ? size : 0) : pivotFinished ? pivotIndex + 1 : pivotIndex;
  const focus = matrixFocus(state);
  const updating = state.cells.some((cell) => cell.status === 'improved');
  return {
    meters: [
      meter('pivot', labels, state.pivotLabel ?? EMPTY, state.rowHeaders.length),
      meter('improved', labels, improved, null, 3),
      meter('rows', labels, state.rowHeaders.length),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, updating ? 'pink' : focus ? 'cyan' : 'slate'),
    registers: focus
      ? [register('row', labels, state.rowHeaders[focus.row]?.label ?? null), register('col', labels, state.colHeaders[focus.col]?.label ?? null)]
      : [],
    gauge: gauge(size, done, pivotIndex < 0 ? done : pivotIndex + 1),
    gaugeLabel: labels.gauges.rows,
  };
}

function hungarianReadout(state: MatrixTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const size = state.rowHeaders.length;
  const assigned = state.cells.filter((cell) => cell.status === 'assignment').length;
  const matched = matrixResultCount(state) ?? assigned;
  const lines = [...state.rowHeaders, ...state.colHeaders].filter((header) => header.status === 'covered').length;
  const zeros = state.cells.filter((cell) => cell.valueLabel === '0').length;
  const activeRow = state.rowHeaders.find((header) => header.status === 'active') ?? null;
  const activeCol = state.colHeaders.find((header) => header.status === 'active') ?? null;
  const adjusting = state.cells.some((cell) => cell.status === 'adjusted');
  const registers: OpLineRegister[] = [];
  if (activeRow) registers.push(register('row', labels, activeRow.label));
  if (activeCol) registers.push(register('col', labels, activeCol.label));
  return {
    meters: [meter('matched', labels, matched, size), meter('lines', labels, lines, size), meter('zeros', labels, zeros)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, adjusting ? 'pink' : lines > 0 ? 'amber' : activeRow || activeCol ? 'cyan' : 'slate'),
    registers,
    gauge: gauge(size, matched),
    gaugeLabel: labels.gauges.matched,
  };
}

export function matrixReadout(state: MatrixTraceState, ctx: FamilyReadoutContext): StageReadout {
  return state.mode === 'hungarian' ? hungarianReadout(state, ctx) : floydWarshallReadout(state, ctx);
}

const MATRIX_GRID_TONES: Readonly<Record<MatrixGridTraceState['tone'], LedColor>> = {
  idle: 'slate',
  compute: 'cyan',
  pivot: 'cyan',
  eliminate: 'pink',
  complete: 'lime',
  fail: 'red',
};

const SUBSCRIPT_DIGITS = /[₀-₉]/g;

function plainDigits(label: string): string {
  return label.replace(SUBSCRIPT_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x2080));
}

export function isMatrixGridOperation(state: MatrixGridTraceState, previous: MatrixGridTraceState | null): boolean {
  if (state.mode === 'simplex') {
    const pivot = state.cells.find((cell) => cell.state === 'pivot' && cell.row < state.rows - 1);
    if (!pivot) return false;
    return !previous?.cells.some((cell) => cell.state === 'pivot' && cell.row === pivot.row && cell.col === pivot.col);
  }
  return isRowOperationLabel(state.operationLabel) && state.operationLabel !== previous?.operationLabel;
}

export function matrixGridOperationCounts(history: readonly SortStep[]): readonly number[] {
  let count = 0;
  let previous: MatrixGridTraceState | null = null;
  return history.map((step) => {
    const state = step.matrixGrid ?? null;
    if (state && isMatrixGridOperation(state, previous)) count += 1;
    previous = state;
    return count;
  });
}

export function operationProgress(counts: readonly number[], index: number): FamilyReadoutContext['operations'] {
  const total = counts.at(-1) ?? 0;
  if (total === 0) return undefined;
  return { done: counts[index] ?? 0, total };
}

export function matrixGridReadout(state: MatrixGridTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex, operations } = ctx;
  const table = buildMatrixGridTable(state);
  const pivot = table.pivot;
  const entering = state.mode === 'simplex' ? (table.columns.find((column) => column.active) ?? null) : null;
  const columnLabel = entering?.label ?? (pivot ? matrixGridColumnLabel(state, pivot.col) : null);
  const pivotValue = columnLabel !== null ? plainDigits(columnLabel) : EMPTY;
  const registers: OpLineRegister[] = [];
  if (pivot) registers.push(register('row', labels, table.rows[pivot.row]?.label ?? null));
  if (columnLabel !== null) registers.push(register('col', labels, columnLabel));
  const leading = state.cells.filter((cell) => cell.state === 'leading').length;
  return {
    meters: [
      operations ? meter('operations', labels, operations.done, operations.total) : meter('iteration', labels, state.iteration),
      meter('pivot', labels, pivotValue),
      meter('rows', labels, state.rows),
    ],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, MATRIX_GRID_TONES[state.tone]),
    registers,
    gauge: operations ? gauge(Math.max(1, operations.total), operations.done) : gauge(state.rows, leading, pivot ? pivot.row + 1 : leading),
    gaugeLabel: operations ? labels.gauges.operations : labels.gauges.rows,
  };
}

const SIEVE_TONES: Readonly<Record<SieveGridTraceState['tone'], LedColor>> = {
  idle: 'slate',
  pick: 'cyan',
  mark: 'pink',
  settle: 'lime',
  complete: 'lime',
};

const CROSSED_STATES: ReadonlySet<SieveCellState> = new Set<SieveCellState>(['composite', 'marking', 'just-marked']);

export function isCrossedSieveCell(cell: SieveGridCell): boolean {
  return CROSSED_STATES.has(cell.state) || (cell.state === 'current' && cell.markedBy !== null);
}

export function sieveReadout(state: SieveGridTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const candidates = state.cells.filter((cell) => cell.value >= 2);
  const crossed = candidates.filter(isCrossedSieveCell).length;
  const marked = candidates.filter((cell) => cell.state !== 'unchecked').length;
  const upper = state.cells.at(-1)?.value ?? null;
  return {
    meters: [meter('prime', labels, state.activePrime ?? EMPTY), meter('bound', labels, state.bound), meter('crossed', labels, crossed, null, 2)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, SIEVE_TONES[state.tone]),
    registers: [register('p', labels, state.activePrime), register('n', labels, upper)],
    gauge: gauge(candidates.length, marked),
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
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
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
  const probeRegister: FamilyRegisterId = searchProbeLabel(state) === I18N_KEY.features.algorithms.display.registers.i ? 'i' : 'mid';
  return {
    meters: [meter('low', labels, state.low ?? EMPTY), meter('probe', labels, state.probeIndex ?? EMPTY), meter('high', labels, state.high ?? EMPTY)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.statusLabel)),
    tone: edgeTone(index, lastIndex, found ? 'lime' : state.probeIndex === null ? 'slate' : 'pink'),
    registers: [register('lo', labels, state.low), register(probeRegister, labels, state.probeIndex), register('hi', labels, state.high), register('x', labels, state.target)],
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
  return: 'lime',
  complete: 'lime',
};

export function callStackReadout(state: CallStackLabTraceState, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const depth = Math.max(0, ...state.frames.map((frame) => frame.depth + 1));
  return {
    meters: [meter('frames', labels, state.frames.length), meter('depth', labels, depth), meter('returns', labels, state.recentReturns.length)],
    phaseLabel: phaseText(labels, index, lastIndex, labels.translate(state.phaseLabel)),
    tone: edgeTone(index, lastIndex, CALL_STACK_TONES[state.tone]),
    registers: state.frames.length > 0 ? [register('depth', labels, state.frames.length)] : [],
    gauge: gauge(Math.max(1, state.frames.length + state.recentReturns.length), state.recentReturns.length),
    gaugeLabel: labels.gauges.frames,
  };
}

const CALL_TREE_TONES: Readonly<Record<CallTreeLabTraceState['tone'], LedColor>> = {
  idle: 'slate',
  descend: 'cyan',
  prune: 'pink',
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
    registers: [register('depth', labels, state.activePath.length)],
    gauge: gauge(Math.max(1, state.nodes.length), explored),
    gaugeLabel: labels.gauges.explored,
  };
}

type RadixPhase = 'idle' | 'focus-digit' | 'distribute' | 'gather' | 'pass-complete' | 'complete';

const RADIX_PHASES = I18N_KEY.features.algorithms.display.radix.phases;

const RADIX_PHASE_KEYS: Readonly<Record<RadixPhase, string>> = {
  idle: RADIX_PHASES.idle,
  'focus-digit': RADIX_PHASES.focus,
  distribute: RADIX_PHASES.distribute,
  gather: RADIX_PHASES.gather,
  'pass-complete': RADIX_PHASES.passComplete,
  complete: RADIX_PHASES.complete,
};

const RADIX_TONES: Readonly<Record<RadixPhase, LedColor>> = {
  idle: 'slate',
  'focus-digit': 'cyan',
  distribute: 'pink',
  gather: 'lime',
  'pass-complete': 'lime',
  complete: 'lime',
};

function isRadixPhase(phase: SortStep['phase']): phase is RadixPhase {
  return phase !== undefined && phase in RADIX_PHASE_KEYS;
}

export function isRadixStep(step: SortStep): boolean {
  return Array.isArray(step.buckets) && typeof step.maxDigits === 'number';
}

export function radixDigit(value: number, digitIndex: number): number {
  return Math.floor(Math.abs(value) / 10 ** digitIndex) % 10;
}

function radixActiveValue(step: SortStep): number | null {
  if (!step.activeItemId) return null;
  const pools = [step.items ?? [], step.sourceItems ?? [], ...(step.buckets ?? []).map((bucket) => bucket.items)];
  for (const pool of pools) {
    const item = pool.find((candidate) => candidate.id === step.activeItemId);
    if (item) return item.value;
  }
  return null;
}

export function radixReadout(step: SortStep, ctx: FamilyReadoutContext): StageReadout {
  const { labels, index, lastIndex } = ctx;
  const maxDigits = Math.max(1, step.maxDigits ?? 1);
  const phase: RadixPhase = isRadixPhase(step.phase) ? step.phase : 'idle';
  const digitIndex = step.digitIndex ?? null;
  const complete = phase === 'complete' || index >= lastIndex;
  const placed = (step.buckets ?? []).reduce((total, bucket) => total + bucket.items.length, 0);
  const currentDigit = complete ? maxDigits : digitIndex === null ? null : digitIndex + 1;
  const passesDone = complete ? maxDigits : phase === 'pass-complete' && digitIndex !== null ? digitIndex + 1 : (digitIndex ?? 0);
  const activeValue = radixActiveValue(step);
  const registers: OpLineRegister[] = [];
  if (activeValue !== null) {
    registers.push(register('x', labels, activeValue));
    if (digitIndex !== null) registers.push(register('digit', labels, radixDigit(activeValue, digitIndex)));
  }
  if (step.activeBucket !== null && step.activeBucket !== undefined) registers.push(register('bucket', labels, step.activeBucket));
  return {
    meters: [
      meter('digit', labels, currentDigit ?? EMPTY, maxDigits),
      meter('bucket', labels, step.activeBucket ?? EMPTY, null, 1),
      meter('placed', labels, placed, step.array.length),
    ],
    phaseLabel: labels.translate(RADIX_PHASE_KEYS[complete ? 'complete' : phase]),
    tone: edgeTone(index, lastIndex, RADIX_TONES[phase]),
    registers,
    gauge: gauge(maxDigits, passesDone, currentDigit ?? passesDone),
    gaugeLabel: labels.gauges.digits,
  };
}

export function familyStageReadout(ctx: FamilyReadoutContext): StageReadout | null {
  const { step, variant } = ctx;
  if (isRadixStep(step)) return radixReadout(step, ctx);
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
