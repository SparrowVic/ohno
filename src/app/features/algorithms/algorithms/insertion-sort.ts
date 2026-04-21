import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.insertionSort.descriptions.start'),
    takeValue: t('features.algorithms.runtime.sort.insertionSort.descriptions.takeValue'),
    compare: t('features.algorithms.runtime.sort.insertionSort.descriptions.compare'),
    shift: t('features.algorithms.runtime.sort.insertionSort.descriptions.shift'),
    insert: t('features.algorithms.runtime.sort.insertionSort.descriptions.insert'),
    complete: t('features.algorithms.runtime.sort.insertionSort.descriptions.complete'),
  },
} as const;

export function* insertionSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size }),
    sorted: size > 0 ? [0] : [],
    boundary: Math.min(1, size),
    phase: 'init',
  });

  for (let index = 1; index < size; index++) {
    const value = arr[index];
    let scan = index - 1;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.takeValue, { value, index }),
      comparing: [scan, index],
      sorted: prefixSorted(index),
      boundary: index,
      phase: 'compare',
    });

    while (scan >= 0 && arr[scan] > value) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.compare, {
          current: arr[scan] ?? '',
          value,
        }),
        comparing: [scan, scan + 1],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'compare',
      });

      arr[scan + 1] = arr[scan];

      yield createArrayStep({
        array: arr,
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.shift, {
          value: arr[scan + 1] ?? '',
        }),
        comparing: [scan, scan + 1],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'swap',
      });

      scan--;
    }

    arr[scan + 1] = value;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 9,
      description: i18nText(I18N.descriptions.insert, {
        value,
        index: scan + 1,
      }),
      comparing: [scan + 1, scan + 1],
      sorted: prefixSorted(index + 1),
      boundary: index + 1,
      phase: 'pass-complete',
    });
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 11,
    description: I18N.descriptions.complete,
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
