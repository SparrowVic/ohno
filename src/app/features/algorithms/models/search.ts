import { TranslatableText } from '../../../core/i18n/translatable-text';

export type SearchRowStatus =
  | 'idle'
  | 'window'
  | 'probe'
  | 'visited'
  | 'eliminated'
  | 'bound'
  | 'found';

export type SearchTraceTag = 'pending' | 'candidate' | 'compare' | 'checked' | 'pruned' | 'bound' | 'match';

export interface SearchTraceRow {
  readonly index: number;
  readonly value: number;
  readonly status: SearchRowStatus;
  readonly tags: readonly SearchTraceTag[];
}

export interface SearchTraceState {
  readonly target: number;
  readonly modeLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText | null;
  readonly low: number | null;
  readonly high: number | null;
  readonly probeIndex: number | null;
  readonly probeValue: number | null;
  readonly leftBound: number | null;
  readonly rightBound: number | null;
  readonly resultIndices: readonly number[];
  readonly eliminated: readonly number[];
  readonly visitedOrder: readonly number[];
  readonly rows: readonly SearchTraceRow[];
}
