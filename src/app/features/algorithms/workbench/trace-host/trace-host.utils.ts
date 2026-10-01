import { VisualizationVariant } from '../../models/visualization-renderer';
import { WorkbenchTraces } from '../models/workbench-traces';

export type TracePanelKind =
  | 'graph'
  | 'dp'
  | 'dsu'
  | 'grid'
  | 'matrix'
  | 'network'
  | 'string'
  | 'tree'
  | 'matrixGrid'
  | 'numberLab'
  | 'scratchpadLab'
  | 'pointerLab'
  | 'sieveGrid'
  | 'callStackLab'
  | 'callTreeLab'
  | 'geometry'
  | 'sort'
  | 'search';

const SLOT_ORDER: readonly Exclude<TracePanelKind, 'matrixGrid' | 'numberLab' | 'scratchpadLab' | 'geometry' | 'search'>[] = [
  'graph',
  'dp',
  'dsu',
  'grid',
  'matrix',
  'network',
  'string',
  'tree',
  'pointerLab',
  'sieveGrid',
  'callStackLab',
  'callTreeLab',
  'sort',
];

export function pickTracePanel(traces: WorkbenchTraces, variant: VisualizationVariant): TracePanelKind {
  for (const slot of SLOT_ORDER) if (traces[slot]) return slot;
  if (variant === 'matrix-grid' && traces.matrixGrid) return 'matrixGrid';
  if (variant === 'number-lab' && traces.numberLab) return 'numberLab';
  if (traces.scratchpadLab) return 'scratchpadLab';
  if (traces.numberLab) return 'numberLab';
  if (traces.matrixGrid) return 'matrixGrid';
  if (traces.geometry) return 'geometry';
  return 'search';
}
