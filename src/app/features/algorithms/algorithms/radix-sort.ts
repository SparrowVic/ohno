import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import {
  SortBucketSnapshot,
  SortItemSnapshot,
  SortStep,
} from '../models/sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.radixSort.descriptions.start'),
    focusDigit: t('features.algorithms.runtime.sort.radixSort.descriptions.focusDigit'),
    distributeToBucket: t(
      'features.algorithms.runtime.sort.radixSort.descriptions.distributeToBucket',
    ),
    gatherFromBucket: t('features.algorithms.runtime.sort.radixSort.descriptions.gatherFromBucket'),
    finalPassComplete: t(
      'features.algorithms.runtime.sort.radixSort.descriptions.finalPassComplete',
    ),
    passComplete: t('features.algorithms.runtime.sort.radixSort.descriptions.passComplete'),
  },
} as const;

const EMPTY_SORTED: readonly number[] = [];
const EMPTY_BUCKETS: readonly SortBucketSnapshot[] = Array.from({ length: 10 }, (_, bucket) => ({
  bucket,
  items: [],
}));

export function* radixSortGenerator(input: readonly number[]): Generator<SortStep> {
  const items = input.map((value, index) => ({ id: `rdx-${index}`, value }));
  const maxValue = Math.max(0, ...input);
  const maxDigits = Math.max(1, String(maxValue).length);
  let current = [...items];

  yield createStep({
    array: valuesOf(current),
    items: current,
    sourceItems: current,
    buckets: EMPTY_BUCKETS,
    phase: 'idle',
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { maxDigits }),
    maxDigits,
  });

  for (let digitIndex = 0; digitIndex < maxDigits; digitIndex++) {
    const source = [...current];
    const buckets = createBuckets();

    yield createStep({
      array: valuesOf(source),
      items: source,
      sourceItems: source,
      buckets: snapshotBuckets(buckets),
      phase: 'focus-digit',
      digitIndex,
      maxDigits,
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.focusDigit, {
        digitPower: digitIndex,
        count: source.length,
      }),
    });

    for (const item of source) {
      const bucket = digitAt(item.value, digitIndex);
      buckets[bucket].push(item);

      yield createStep({
        array: valuesOf(source),
        items: source,
        sourceItems: source,
        buckets: snapshotBuckets(buckets),
        phase: 'distribute',
        digitIndex,
        maxDigits,
        activeItemId: item.id,
        activeBucket: bucket,
        activeCodeLine: 7,
        description: i18nText(I18N.descriptions.distributeToBucket, {
          value: item.value,
          bucket,
          digitPower: digitIndex,
        }),
      });
    }

    const next: SortItemSnapshot[] = [];
    for (let bucket = 0; bucket < buckets.length; bucket++) {
      while (buckets[bucket].length > 0) {
        const item = buckets[bucket].shift();
        if (!item) break;
        next.push(item);

        yield createStep({
          array: valuesOf(source),
          items: next,
          sourceItems: source,
          buckets: snapshotBuckets(buckets),
          phase: 'gather',
          digitIndex,
          maxDigits,
          activeItemId: item.id,
          activeBucket: bucket,
          activeCodeLine: 11,
          description: i18nText(I18N.descriptions.gatherFromBucket, {
            value: item.value,
            bucket,
          }),
        });
      }
    }

    current = next;

    yield createStep({
      array: valuesOf(current),
      items: current,
      sourceItems: current,
      buckets: EMPTY_BUCKETS,
      phase: digitIndex === maxDigits - 1 ? 'complete' : 'pass-complete',
      digitIndex,
      maxDigits,
      activeCodeLine: 13,
      description:
        digitIndex === maxDigits - 1
          ? I18N.descriptions.finalPassComplete
          : i18nText(I18N.descriptions.passComplete, {
              pass: digitIndex + 1,
              maxDigits,
              digitPower: digitIndex,
            }),
      sorted: digitIndex === maxDigits - 1 ? current.map((_, index) => index) : EMPTY_SORTED,
      boundary: digitIndex === maxDigits - 1 ? 0 : current.length,
    });
  }
}

function createStep(config: {
  readonly array: readonly number[];
  readonly items: readonly SortItemSnapshot[];
  readonly sourceItems: readonly SortItemSnapshot[];
  readonly buckets: readonly SortBucketSnapshot[];
  readonly phase: SortStep['phase'];
  readonly activeCodeLine: number;
  readonly description: SortStep['description'];
  readonly digitIndex?: number | null;
  readonly maxDigits: number;
  readonly activeItemId?: string | null;
  readonly activeBucket?: number | null;
  readonly sorted?: readonly number[];
  readonly boundary?: number;
}): SortStep {
  return {
    array: config.array,
    comparing: null,
    swapping: null,
    sorted: [...(config.sorted ?? EMPTY_SORTED)],
    boundary: config.boundary ?? config.array.length,
    activeCodeLine: config.activeCodeLine,
    description: config.description,
    phase: config.phase,
    items: [...config.items],
    sourceItems: [...config.sourceItems],
    buckets: config.buckets.map((bucket) => ({
      bucket: bucket.bucket,
      items: [...bucket.items],
    })),
    digitIndex: config.digitIndex ?? null,
    maxDigits: config.maxDigits,
    activeItemId: config.activeItemId ?? null,
    activeBucket: config.activeBucket ?? null,
  };
}

function createBuckets(): SortItemSnapshot[][] {
  return Array.from({ length: 10 }, () => []);
}

function snapshotBuckets(buckets: readonly (readonly SortItemSnapshot[])[]): readonly SortBucketSnapshot[] {
  return buckets.map((items, bucket) => ({
    bucket,
    items: [...items],
  }));
}

function valuesOf(items: readonly SortItemSnapshot[]): readonly number[] {
  return items.map((item) => item.value);
}

function digitAt(value: number, digitIndex: number): number {
  return Math.floor(value / 10 ** digitIndex) % 10;
}
