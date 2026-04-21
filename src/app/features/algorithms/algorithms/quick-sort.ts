import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.quickSort.descriptions.start'),
    complete: t('features.algorithms.runtime.sort.quickSort.descriptions.complete'),
    singleElement: t('features.algorithms.runtime.sort.quickSort.descriptions.singleElement'),
    choosePivot: t('features.algorithms.runtime.sort.quickSort.descriptions.choosePivot'),
    comparePivot: t('features.algorithms.runtime.sort.quickSort.descriptions.comparePivot'),
    swapPartition: t('features.algorithms.runtime.sort.quickSort.descriptions.swapPartition'),
    placePivot: t('features.algorithms.runtime.sort.quickSort.descriptions.placePivot'),
    pivotSettled: t('features.algorithms.runtime.sort.quickSort.descriptions.pivotSettled'),
  },
} as const;

export function* quickSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const settled = new Set<number>();

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size }),
    boundary: size,
    phase: 'init',
  });

  if (size > 0) {
    yield* sortRange(0, size - 1);
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 3,
    description: I18N.descriptions.complete,
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });

  function* sortRange(low: number, high: number): Generator<SortStep> {
    if (low > high) {
      return;
    }

    if (low === high) {
      settled.add(low);
      yield createArrayStep({
        array: arr,
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.singleElement, {
          value: arr[low] ?? '',
          index: low,
        }),
        sorted: [...settled].sort((left, right) => left - right),
        boundary: size,
        phase: 'pass-complete',
      });
      return;
    }

    const pivot = arr[high];
    let storeIndex = low;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 6,
      description: i18nText(I18N.descriptions.choosePivot, { pivot, index: high }),
      comparing: [high, high],
      sorted: [...settled].sort((left, right) => left - right),
      boundary: size,
      phase: 'compare',
    });

    for (let index = low; index < high; index++) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.comparePivot, {
          value: arr[index] ?? '',
          pivot,
        }),
        comparing: [index, high],
        sorted: [...settled].sort((left, right) => left - right),
        boundary: size,
        phase: 'compare',
      });

      if (arr[index] < pivot) {
        if (index !== storeIndex) {
          const left = arr[storeIndex];
          const right = arr[index];
          [arr[storeIndex], arr[index]] = [arr[index], arr[storeIndex]];

          yield createArrayStep({
            array: arr,
            activeCodeLine: 10,
            description: i18nText(I18N.descriptions.swapPartition, { left, right }),
            swapping: [storeIndex, index],
            sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
            boundary: size,
            phase: 'swap',
          });
        }

        storeIndex++;
      }
    }

    if (storeIndex !== high) {
      const left = arr[storeIndex];
      const right = arr[high];
      [arr[storeIndex], arr[high]] = [arr[high], arr[storeIndex]];
      settled.add(storeIndex);

      yield createArrayStep({
        array: arr,
        activeCodeLine: 14,
        description: i18nText(I18N.descriptions.placePivot, {
          pivot: right,
          index: storeIndex,
          left,
        }),
        swapping: [storeIndex, high],
        sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
        boundary: size,
        phase: 'swap',
      });
    } else {
      settled.add(storeIndex);
      yield createArrayStep({
        array: arr,
        activeCodeLine: 14,
        description: i18nText(I18N.descriptions.pivotSettled, {
          pivot,
          index: storeIndex,
        }),
        comparing: [storeIndex, storeIndex],
        sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
        boundary: size,
        phase: 'pass-complete',
      });
    }

    yield* sortRange(low, storeIndex - 1);
    yield* sortRange(storeIndex + 1, high);
  }
}
