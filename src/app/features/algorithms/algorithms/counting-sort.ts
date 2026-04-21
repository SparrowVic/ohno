import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.countingSort.descriptions.start'),
    countValue: t('features.algorithms.runtime.sort.countingSort.descriptions.countValue'),
    writeValue: t('features.algorithms.runtime.sort.countingSort.descriptions.writeValue'),
    complete: t('features.algorithms.runtime.sort.countingSort.descriptions.complete'),
  },
} as const;

export function* countingSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const max = Math.max(0, ...arr);
  const counts = new Array<number>(max + 1).fill(0);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size, max }),
    boundary: 0,
    phase: 'init',
  });

  for (let index = 0; index < size; index++) {
    counts[arr[index]] += 1;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.countValue, {
        value: arr[index] ?? '',
        index,
        count: counts[arr[index] ?? 0],
      }),
      comparing: [index, index],
      boundary: 0,
      phase: 'compare',
    });
  }

  let writeIndex = 0;
  for (let value = 0; value <= max; value++) {
    while (counts[value] > 0) {
      arr[writeIndex] = value;
      counts[value] -= 1;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 10,
        description: i18nText(I18N.descriptions.writeValue, {
          value,
          index: writeIndex,
        }),
        comparing: [writeIndex, writeIndex],
        sorted: prefixSorted(writeIndex + 1),
        boundary: writeIndex + 1,
        phase: 'pass-complete',
      });

      writeIndex++;
    }
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 15,
    description: I18N.descriptions.complete,
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
