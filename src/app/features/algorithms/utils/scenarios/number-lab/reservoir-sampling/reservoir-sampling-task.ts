import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface ReservoirSamplingTaskValues {
  readonly k?: number;
  readonly stream?: string;
  readonly random?: string;
  readonly draws?: string;
  readonly predicate?: string;
  readonly draws_for_real_items?: string;
  readonly items?: string;
  readonly key_formula?: string;
  readonly priority_mode?: string;
  readonly shardA?: string;
  readonly shardB?: string;
  readonly shardC?: string;
}

export type ReservoirSamplingNotebookFlow =
  | { readonly kind: 'k-one' }
  | { readonly kind: 'fixed-k-updates' }
  | { readonly kind: 'predicate-reservoir' }
  | { readonly kind: 'weighted-reservoir' }
  | { readonly kind: 'distributed-merge' };

export interface ReservoirSamplingTask extends NotebookTask<ReservoirSamplingTaskValues> {
  readonly notebookFlow: ReservoirSamplingNotebookFlow;
}

const K_FIELD = { kind: 'int' as const, label: 'k', min: 1, max: 32 };
const STREAM_FIELD = {
  kind: 'string' as const,
  label: 'stream',
  minLength: 1,
  maxLength: 320,
};

export const RESERVOIR_SAMPLING_K_ONE_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> = {
  k: K_FIELD,
  stream: STREAM_FIELD,
  random: {
    kind: 'string',
    label: 'random',
    minLength: 1,
    maxLength: 320,
  },
};

export const RESERVOIR_SAMPLING_FIXED_K_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> =
  {
    k: K_FIELD,
    stream: STREAM_FIELD,
    draws: {
      kind: 'string',
      label: 'draws',
      minLength: 1,
      maxLength: 320,
    },
  };

export const RESERVOIR_SAMPLING_PREDICATE_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> =
  {
    k: K_FIELD,
    predicate: {
      kind: 'string',
      label: 'predicate',
      minLength: 1,
      maxLength: 120,
    },
    stream: STREAM_FIELD,
    draws_for_real_items: {
      kind: 'string',
      label: 'draws_for_real_items',
      minLength: 1,
      maxLength: 240,
    },
  };

export const RESERVOIR_SAMPLING_WEIGHTED_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> =
  {
    k: K_FIELD,
    items: {
      kind: 'string',
      label: 'items',
      minLength: 1,
      maxLength: 420,
    },
    key_formula: {
      kind: 'string',
      label: 'key_formula',
      minLength: 1,
      maxLength: 120,
    },
  };

export const RESERVOIR_SAMPLING_DISTRIBUTED_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> =
  {
    k: K_FIELD,
    priority_mode: {
      kind: 'string',
      label: 'priority_mode',
      minLength: 1,
      maxLength: 120,
    },
    shardA: {
      kind: 'string',
      label: 'shardA',
      minLength: 1,
      maxLength: 320,
    },
    shardB: {
      kind: 'string',
      label: 'shardB',
      minLength: 1,
      maxLength: 320,
    },
    shardC: {
      kind: 'string',
      label: 'shardC',
      minLength: 1,
      maxLength: 320,
    },
  };

export interface PredicateStreamItem {
  readonly label: string;
  readonly status: string;
}

export interface WeightedReservoirItem {
  readonly label: string;
  readonly weight: number;
  readonly u: number;
}

export interface PriorityItem {
  readonly label: string;
  readonly priority: number;
}

export function parseLabelStream(input: string | undefined): readonly string[] {
  if (!input?.trim()) return [];
  return input
    .replace(/^\s*\[/, '')
    .replace(/\]\s*$/, '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

export function parseNumberMap(input: string | undefined): Readonly<Record<number, number>> {
  if (!input?.trim()) return {};
  const result: Record<number, number> = {};
  const pairPattern = /(-?\d+)\s*:\s*(-?\d+(?:\.\d+)?)/g;
  for (const match of input.matchAll(pairPattern)) {
    result[Number.parseInt(match[1], 10)] = Number.parseFloat(match[2]);
  }
  return result;
}

export function parsePredicateStream(input: string | undefined): readonly PredicateStreamItem[] {
  if (!input?.trim()) return [];
  const result: PredicateStreamItem[] = [];
  const tuplePattern = /\(([^,]+),\s*([^)]+)\)/g;
  for (const match of input.matchAll(tuplePattern)) {
    const id = match[1].trim();
    const status = match[2].trim();
    result.push({ label: `(${id}, ${status})`, status });
  }
  return result;
}

export function parseWeightedItems(input: string | undefined): readonly WeightedReservoirItem[] {
  if (!input?.trim()) return [];
  const result: WeightedReservoirItem[] = [];
  const tuplePattern = /\(([^,]+),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g;
  for (const match of input.matchAll(tuplePattern)) {
    result.push({
      label: match[1].trim(),
      weight: Number.parseFloat(match[2]),
      u: Number.parseFloat(match[3]),
    });
  }
  return result;
}

export function parsePriorityItems(input: string | undefined): readonly PriorityItem[] {
  if (!input?.trim()) return [];
  const result: PriorityItem[] = [];
  const tuplePattern = /\(([^,]+),\s*(-?\d+(?:\.\d+)?)\)/g;
  for (const match of input.matchAll(tuplePattern)) {
    result.push({
      label: match[1].trim(),
      priority: Number.parseFloat(match[2]),
    });
  }
  return result;
}

export function formatLabelList(values: readonly string[]): string {
  return `[${values.join(', ')}]`;
}

export function formatPriorityList(values: readonly PriorityItem[]): string {
  return `[${values.map((item) => `(${item.label}, ${formatDecimal(item.priority)})`).join(', ')}]`;
}

export function formatPredicateList(values: readonly PredicateStreamItem[]): string {
  return `[${values.map((item) => item.label).join(', ')}]`;
}

export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits);
}
