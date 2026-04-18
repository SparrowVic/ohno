import {
  SortBucketSnapshot,
  SortItemSnapshot,
  SortStep,
} from '../../models/sort-step';

export interface RadixDigitBadge {
  readonly exponent: number;
  readonly label: string;
  readonly active: boolean;
}

export interface RadixViewState {
  readonly items: readonly SortItemSnapshot[];
  readonly sourceItems: readonly SortItemSnapshot[];
  readonly topItems: readonly SortItemSnapshot[];
  readonly buckets: readonly SortBucketSnapshot[];
  readonly maxDigits: number;
  readonly activeDigitIndex: number | null;
  readonly activeDigitCharIndex: number | null;
  readonly activeItemId: string | null;
  readonly activeBucket: number | null;
  readonly phase: SortStep['phase'];
  readonly description: string;
  readonly passNumber: number;
}

export function createRadixViewState(
  step: SortStep | null,
  array: readonly number[],
): RadixViewState {
  const fallbackItems = array.map((value, index) => ({ id: `rdx-${index}`, value }));
  const maxDigits =
    step?.maxDigits ?? Math.max(1, String(Math.max(0, ...array)).length);
  const items = step?.items?.length ? step.items : fallbackItems;
  const sourceItems = step?.sourceItems?.length ? step.sourceItems : items;
  const buckets = normalizeBuckets(step?.buckets);
  const topItems = resolveTopItems(step, sourceItems, items, buckets);
  const activeDigitIndex = step?.digitIndex ?? 0;

  return {
    items,
    sourceItems,
    topItems,
    buckets,
    maxDigits,
    activeDigitIndex,
    activeDigitCharIndex:
      activeDigitIndex === null ? null : maxDigits - activeDigitIndex - 1,
    activeItemId: step?.activeItemId ?? null,
    activeBucket: step?.activeBucket ?? null,
    phase: step?.phase ?? 'idle',
    description: step?.description ?? 'Preparing radix sort',
    passNumber:
      step?.digitIndex === null || step?.digitIndex === undefined ? 1 : step.digitIndex + 1,
  };
}

export function createRadixDigitBadges(
  maxDigits: number,
  activeDigitIndex: number | null,
): readonly RadixDigitBadge[] {
  return Array.from({ length: maxDigits }, (_, index) => {
    const exponent = maxDigits - index - 1;
    return {
      exponent,
      label: digitPowerLabel(exponent),
      active: activeDigitIndex === exponent,
    };
  });
}

export function digitsForValue(value: number, maxDigits: number): readonly string[] {
  return String(value).padStart(maxDigits, '0').split('');
}

export function findActiveValue(
  state: RadixViewState,
  activeItemId: string | null,
): number | null {
  if (!activeItemId) return null;
  for (const item of collectUniqueItems(state)) {
    if (item.id === activeItemId) return item.value;
  }
  return null;
}

export function digitName(exponent: number): string {
  if (exponent === 0) return 'ones digit';
  if (exponent === 1) return 'tens digit';
  if (exponent === 2) return 'hundreds digit';
  return `10^${exponent} place`;
}

export function digitPowerLabel(exponent: number): string {
  if (exponent === 0) return '1s';
  if (exponent === 1) return '10s';
  if (exponent === 2) return '100s';
  return `10^${exponent}`;
}

export function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'focus-digit':
      return 'Digit Focus';
    case 'distribute':
      return 'Bucket Routing';
    case 'gather':
      return 'Stable Gather';
    case 'pass-complete':
      return 'Pass Complete';
    case 'complete':
      return 'Sorted';
    default:
      return 'Ready';
  }
}

function normalizeBuckets(
  buckets: readonly SortBucketSnapshot[] | null | undefined,
): readonly SortBucketSnapshot[] {
  return Array.from({ length: 10 }, (_, bucket) => ({
    bucket,
    items: buckets?.find((entry) => entry.bucket === bucket)?.items ?? [],
  }));
}

function resolveTopItems(
  step: SortStep | null,
  sourceItems: readonly SortItemSnapshot[],
  items: readonly SortItemSnapshot[],
  buckets: readonly SortBucketSnapshot[],
): readonly SortItemSnapshot[] {
  if (step?.phase === 'distribute') {
    const inBuckets = new Set<string>();
    buckets.forEach((bucket) => {
      bucket.items.forEach((item) => inBuckets.add(item.id));
    });
    return sourceItems.filter((item) => !inBuckets.has(item.id));
  }
  if (step?.phase === 'gather') {
    return items;
  }
  return items.length ? items : sourceItems;
}

function collectUniqueItems(state: RadixViewState): readonly SortItemSnapshot[] {
  const byId = new Map<string, SortItemSnapshot>();
  state.items.forEach((item) => byId.set(item.id, item));
  state.sourceItems.forEach((item) => byId.set(item.id, item));
  state.buckets.forEach((bucket) => {
    bucket.items.forEach((item) => byId.set(item.id, item));
  });
  return [...byId.values()];
}
