import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, suffixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.heapSort.descriptions.start'),
    extractRoot: t('features.algorithms.runtime.sort.heapSort.descriptions.extractRoot'),
    complete: t('features.algorithms.runtime.sort.heapSort.descriptions.complete'),
    compareLeft: t('features.algorithms.runtime.sort.heapSort.descriptions.compareLeft'),
    compareRight: t('features.algorithms.runtime.sort.heapSort.descriptions.compareRight'),
    restoreHeap: t('features.algorithms.runtime.sort.heapSort.descriptions.restoreHeap'),
  },
} as const;

export function* heapSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  let heapSize = size;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size }),
    boundary: heapSize,
    phase: 'init',
  });

  for (let index = Math.floor(size / 2) - 1; index >= 0; index--) {
    yield* heapify(size, index);
  }

  for (let end = size - 1; end > 0; end--) {
    const max = arr[0];
    const tail = arr[end];
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapSize = end;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 15,
      description: i18nText(I18N.descriptions.extractRoot, {
        max,
        tail,
        end,
      }),
      swapping: [0, end],
      sorted: suffixSorted(end, size),
      boundary: heapSize,
      phase: 'swap',
    });

    yield* heapify(end, 0);
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 18,
    description: I18N.descriptions.complete,
    sorted: suffixSorted(0, size),
    boundary: size,
    phase: 'complete',
  });

  function* heapify(currentSize: number, root: number): Generator<SortStep> {
    let largest = root;
    const left = root * 2 + 1;
    const right = left + 1;

    if (left < currentSize) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.compareLeft, {
          leftChild: arr[left] ?? '',
          currentLargest: arr[largest] ?? '',
        }),
        comparing: [left, largest],
        sorted: suffixSorted(currentSize, size),
        boundary: currentSize,
        phase: 'compare',
      });

      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < currentSize) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 7,
        description: i18nText(I18N.descriptions.compareRight, {
          rightChild: arr[right] ?? '',
          currentLargest: arr[largest] ?? '',
        }),
        comparing: [right, largest],
        sorted: suffixSorted(currentSize, size),
        boundary: currentSize,
        phase: 'compare',
      });

      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== root) {
      const rootValue = arr[root];
      const largestValue = arr[largest];
      [arr[root], arr[largest]] = [arr[largest], arr[root]];

      yield createArrayStep({
        array: arr,
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.restoreHeap, {
          rootValue,
          largestValue,
        }),
        swapping: [root, largest],
        sorted: suffixSorted(currentSize, size),
        boundary: currentSize,
        phase: 'swap',
      });

      yield* heapify(currentSize, largest);
    }
  }
}
