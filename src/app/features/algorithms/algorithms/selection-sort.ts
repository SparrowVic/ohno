import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.selectionSort.descriptions.start'),
    scanSuffix: t('features.algorithms.runtime.sort.selectionSort.descriptions.scanSuffix'),
    compareMinimum: t(
      'features.algorithms.runtime.sort.selectionSort.descriptions.compareMinimum',
    ),
    newMinimum: t('features.algorithms.runtime.sort.selectionSort.descriptions.newMinimum'),
    swap: t('features.algorithms.runtime.sort.selectionSort.descriptions.swap'),
    indexFixed: t('features.algorithms.runtime.sort.selectionSort.descriptions.indexFixed'),
    complete: t('features.algorithms.runtime.sort.selectionSort.descriptions.complete'),
  },
} as const;

export function* selectionSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size }),
    boundary: 0,
    phase: 'init',
  });

  for (let index = 0; index < size - 1; index++) {
    let minIndex = index;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.scanSuffix, { index }),
      comparing: [index, index],
      sorted: prefixSorted(index),
      boundary: index,
      phase: 'compare',
    });

    for (let scan = index + 1; scan < size; scan++) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.compareMinimum, {
          currentMinimum: arr[minIndex] ?? '',
          candidate: arr[scan] ?? '',
          scan,
        }),
        comparing: [minIndex, scan],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'compare',
      });

      if (arr[scan] < arr[minIndex]) {
        minIndex = scan;
        yield createArrayStep({
          array: arr,
          activeCodeLine: 6,
          description: i18nText(I18N.descriptions.newMinimum, {
            value: arr[minIndex] ?? '',
          }),
          comparing: [index, minIndex],
          sorted: prefixSorted(index),
          boundary: index,
          phase: 'compare',
        });
      }
    }

    if (minIndex !== index) {
      const left = arr[index];
      const right = arr[minIndex];
      [arr[index], arr[minIndex]] = [arr[minIndex], arr[index]];

      yield createArrayStep({
        array: arr,
        activeCodeLine: 10,
        description: i18nText(I18N.descriptions.swap, {
          left,
          right,
          index,
        }),
        swapping: [index, minIndex],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'swap',
      });
    }

    yield createArrayStep({
      array: arr,
      activeCodeLine: 12,
      description: i18nText(I18N.descriptions.indexFixed, { index }),
      sorted: prefixSorted(index + 1),
      boundary: index + 1,
      phase: 'pass-complete',
    });
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 13,
    description: I18N.descriptions.complete,
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
