export type SortPhase =
  | 'idle'
  | 'compare'
  | 'swap'
  | 'focus-digit'
  | 'distribute'
  | 'gather'
  | 'pass-complete'
  | 'complete';

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
}
