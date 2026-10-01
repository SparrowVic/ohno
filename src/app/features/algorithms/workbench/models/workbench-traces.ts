import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';
import { DpTraceState } from '../../models/dp';
import { DsuTraceState } from '../../models/dsu';
import { GeometryStepState } from '../../models/geometry';
import { GraphStepState } from '../../models/graph';
import { GridTraceState } from '../../models/grid';
import { MatrixTraceState } from '../../models/matrix';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { NetworkTraceState } from '../../models/network';
import { NumberLabTraceState } from '../../models/number-lab';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SearchTraceState } from '../../models/search';
import { SieveGridTraceState } from '../../models/sieve-grid';
import { SortTraceState } from '../../models/sort-trace';
import { StringTraceState } from '../../models/string';
import { TreeTraversalTraceState } from '../../models/tree';

export interface GraphFocusLabels {
  readonly targetLabel: string | null;
  readonly pathLabel: string | null;
  readonly modeLabel: string | null;
  readonly hint: string | null;
}

export interface WorkbenchTraces {
  readonly graph: GraphStepState | null;
  readonly dp: DpTraceState | null;
  readonly dsu: DsuTraceState | null;
  readonly grid: GridTraceState | null;
  readonly matrix: MatrixTraceState | null;
  readonly matrixGrid: MatrixGridTraceState | null;
  readonly network: NetworkTraceState | null;
  readonly search: SearchTraceState | null;
  readonly sort: SortTraceState | null;
  readonly string: StringTraceState | null;
  readonly tree: TreeTraversalTraceState | null;
  readonly numberLab: NumberLabTraceState | null;
  readonly pointerLab: PointerLabTraceState | null;
  readonly sieveGrid: SieveGridTraceState | null;
  readonly callStackLab: CallStackLabTraceState | null;
  readonly callTreeLab: CallTreeLabTraceState | null;
  readonly scratchpadLab: ScratchpadLabTraceState | null;
  readonly geometry: GeometryStepState | null;
  readonly graphFocus: GraphFocusLabels | null;
}

export const EMPTY_TRACES: WorkbenchTraces = {
  graph: null,
  dp: null,
  dsu: null,
  grid: null,
  matrix: null,
  matrixGrid: null,
  network: null,
  search: null,
  sort: null,
  string: null,
  tree: null,
  numberLab: null,
  pointerLab: null,
  sieveGrid: null,
  callStackLab: null,
  callTreeLab: null,
  scratchpadLab: null,
  geometry: null,
  graphFocus: null,
};

const TRACE_KEYS: readonly (keyof Omit<WorkbenchTraces, 'graphFocus'>)[] = [
  'graph',
  'matrixGrid',
  'dp',
  'dsu',
  'grid',
  'matrix',
  'network',
  'search',
  'sort',
  'string',
  'tree',
  'numberLab',
  'pointerLab',
  'sieveGrid',
  'callStackLab',
  'callTreeLab',
  'scratchpadLab',
  'geometry',
];

export function hasTrace(traces: WorkbenchTraces): boolean {
  return TRACE_KEYS.some((key) => traces[key] !== null);
}
