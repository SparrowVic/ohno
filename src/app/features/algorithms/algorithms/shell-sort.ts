import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.shellSort.descriptions.start'),
    beginGapPass: t('features.algorithms.runtime.sort.shellSort.descriptions.beginGapPass'),
    takeValue: t('features.algorithms.runtime.sort.shellSort.descriptions.takeValue'),
    compareGap: t('features.algorithms.runtime.sort.shellSort.descriptions.compareGap'),
    shiftGap: t('features.algorithms.runtime.sort.shellSort.descriptions.shiftGap'),
    insertGap: t('features.algorithms.runtime.sort.shellSort.descriptions.insertGap'),
    complete: t('features.algorithms.runtime.sort.shellSort.descriptions.complete'),
  },
} as const;

export function* shellSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size }),
    boundary: size,
    phase: 'init',
  });

  for (let gap = Math.floor(size / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield createArrayStep({
      array: arr,
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.beginGapPass, { gap }),
      boundary: size,
      phase: 'compare',
    });

    for (let index = gap; index < size; index++) {
      const value = arr[index]!;
      let scan = index;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 4,
        description: i18nText(I18N.descriptions.takeValue, {
          value,
          index,
          gap,
        }),
        comparing: [Math.max(0, index - gap), index],
        sorted: gap === 1 ? prefixSorted(index) : [],
        boundary: size,
        phase: 'compare',
      });

      while (scan >= gap && arr[scan - gap]! > value) {
        yield createArrayStep({
          array: arr,
          activeCodeLine: 6,
          description: i18nText(I18N.descriptions.compareGap, {
            leftValue: arr[scan - gap] ?? '',
            value,
            gap,
          }),
          comparing: [scan - gap, scan],
          sorted: gap === 1 ? prefixSorted(index) : [],
          boundary: size,
          phase: 'compare',
        });

        arr[scan] = arr[scan - gap]!;

        yield createArrayStep({
          array: arr,
          activeCodeLine: 7,
          description: i18nText(I18N.descriptions.shiftGap, {
            value: arr[scan] ?? '',
            from: scan - gap,
            to: scan,
          }),
          comparing: [scan - gap, scan],
          sorted: gap === 1 ? prefixSorted(index) : [],
          boundary: size,
          phase: 'swap',
        });

        scan -= gap;
      }

      arr[scan] = value;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.insertGap, {
          value,
          index: scan,
          gap,
        }),
        comparing: [scan, scan],
        sorted: gap === 1 ? prefixSorted(index + 1) : [],
        boundary: gap === 1 ? index + 1 : size,
        phase: 'pass-complete',
      });
    }
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 12,
    description: I18N.descriptions.complete,
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
