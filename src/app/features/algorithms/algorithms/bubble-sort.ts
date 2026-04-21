import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.bubbleSort.descriptions.start'),
    compare: t('features.algorithms.runtime.sort.bubbleSort.descriptions.compare'),
    swap: t('features.algorithms.runtime.sort.bubbleSort.descriptions.swap'),
    passComplete: t('features.algorithms.runtime.sort.bubbleSort.descriptions.passComplete'),
    earlyExit: t('features.algorithms.runtime.sort.bubbleSort.descriptions.earlyExit'),
    complete: t('features.algorithms.runtime.sort.bubbleSort.descriptions.complete'),
  },
} as const;

export function* bubbleSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const n = arr.length;
  const sorted: number[] = [];
  let boundary = n;

  yield {
    array: [...arr],
    comparing: null,
    swapping: null,
    sorted: [...sorted],
    boundary,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size: n }),
  };

  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false;

    for (let j = 0; j < boundary - 1; j++) {
      yield {
        array: [...arr],
        comparing: [j, j + 1],
        swapping: null,
        sorted: [...sorted],
        boundary,
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.compare, {
          leftIndex: j,
          leftValue: arr[j] ?? '',
          rightIndex: j + 1,
          rightValue: arr[j + 1] ?? '',
        }),
      };

      if (arr[j] > arr[j + 1]) {
        const left = arr[j];
        const right = arr[j + 1];
        arr[j] = right;
        arr[j + 1] = left;
        swappedAny = true;

        yield {
          array: [...arr],
          comparing: null,
          swapping: [j, j + 1],
          sorted: [...sorted],
          boundary,
          activeCodeLine: 7,
          description: i18nText(I18N.descriptions.swap, {
            left,
            right,
            leftIndex: j,
            rightIndex: j + 1,
          }),
        };
      }
    }

    boundary--;
    sorted.unshift(boundary);

    yield {
      array: [...arr],
      comparing: null,
      swapping: null,
      sorted: [...sorted],
      boundary,
      activeCodeLine: 11,
      description: i18nText(I18N.descriptions.passComplete, {
        pass: i + 1,
        boundary,
      }),
    };

    if (!swappedAny) {
      for (let k = boundary - 1; k >= 0; k--) {
        sorted.unshift(k);
      }

      yield {
        array: [...arr],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        boundary: 0,
        activeCodeLine: 11,
        description: I18N.descriptions.earlyExit,
      };

      yield {
        array: [...arr],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        boundary: 0,
        activeCodeLine: 13,
        description: I18N.descriptions.complete,
      };
      return;
    }
  }

  if (!sorted.includes(0)) {
    sorted.unshift(0);
  }

  yield {
    array: [...arr],
    comparing: null,
    swapping: null,
    sorted: [...sorted],
    boundary: 0,
    activeCodeLine: 13,
    description: I18N.descriptions.complete,
  };
}
