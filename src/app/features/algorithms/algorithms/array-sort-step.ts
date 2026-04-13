import { SortPhase, SortStep } from '../models/sort-step';

export interface ArrayStepArgs {
  readonly array: readonly number[];
  readonly activeCodeLine: number;
  readonly description: string;
  readonly comparing?: readonly [number, number] | null;
  readonly swapping?: readonly [number, number] | null;
  readonly sorted?: readonly number[];
  readonly boundary?: number;
  readonly phase?: SortPhase;
}

export function createArrayStep(args: ArrayStepArgs): SortStep {
  return {
    array: [...args.array],
    comparing: args.comparing ?? null,
    swapping: args.swapping ?? null,
    sorted: [...(args.sorted ?? [])],
    boundary: args.boundary ?? args.array.length,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
  };
}

export function prefixSorted(length: number): readonly number[] {
  return Array.from({ length }, (_, index) => index);
}

export function suffixSorted(start: number, size: number): readonly number[] {
  return Array.from({ length: Math.max(0, size - start) }, (_, index) => start + index);
}
