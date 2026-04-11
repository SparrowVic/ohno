export interface SortStep {
  readonly array: readonly number[];
  readonly comparing: readonly [number, number] | null;
  readonly swapping: readonly [number, number] | null;
  readonly sorted: readonly number[];
  readonly boundary: number;
  readonly activeCodeLine: number;
  readonly description: string;
}
