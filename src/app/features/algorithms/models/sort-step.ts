import { DpTraceState } from './dp';
import { DsuTraceState } from './dsu';
import { GeometryStepState } from './geometry';
import { GraphStepState } from './graph';
import { GridTraceState } from './grid';
import { MatrixTraceState } from './matrix';
import { NetworkTraceState } from './network';
import { SearchTraceState } from './search';

export type SortPhase =
  | 'idle'
  | 'compare'
  | 'swap'
  | 'focus-digit'
  | 'distribute'
  | 'gather'
  | 'pass-complete'
  | 'complete'
  | 'init'
  | 'pick-node'
  | 'inspect-edge'
  | 'relax'
  | 'skip-relax'
  | 'settle-node'
  | 'graph-complete'
  | 'search-complete';

export interface SortItemSnapshot {
  readonly id: string;
  readonly value: number;
}

export interface SortBucketSnapshot {
  readonly bucket: number;
  readonly items: readonly SortItemSnapshot[];
}

export interface SortStep {
  readonly array: readonly number[];
  readonly comparing: readonly [number, number] | null;
  readonly swapping: readonly [number, number] | null;
  readonly sorted: readonly number[];
  readonly boundary: number;
  readonly activeCodeLine: number;
  readonly description: string;
  readonly phase?: SortPhase;
  readonly items?: readonly SortItemSnapshot[];
  readonly sourceItems?: readonly SortItemSnapshot[];
  readonly buckets?: readonly SortBucketSnapshot[];
  readonly digitIndex?: number | null;
  readonly maxDigits?: number | null;
  readonly activeItemId?: string | null;
  readonly activeBucket?: number | null;
  readonly graph?: GraphStepState | null;
  readonly dp?: DpTraceState | null;
  readonly dsu?: DsuTraceState | null;
  readonly grid?: GridTraceState | null;
  readonly matrix?: MatrixTraceState | null;
  readonly network?: NetworkTraceState | null;
  readonly search?: SearchTraceState | null;
  readonly geometry?: GeometryStepState | null;
}
