import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

const I18N = {
  descriptions: {
    start: t('features.algorithms.runtime.sort.timSort.descriptions.start'),
    buildRun: t('features.algorithms.runtime.sort.timSort.descriptions.buildRun'),
    mergeRuns: t('features.algorithms.runtime.sort.timSort.descriptions.mergeRuns'),
    complete: t('features.algorithms.runtime.sort.timSort.descriptions.complete'),
    insertWithinRun: t('features.algorithms.runtime.sort.timSort.descriptions.insertWithinRun'),
    compareWithinRun: t('features.algorithms.runtime.sort.timSort.descriptions.compareWithinRun'),
    shiftWithinRun: t('features.algorithms.runtime.sort.timSort.descriptions.shiftWithinRun'),
    placeWithinRun: t('features.algorithms.runtime.sort.timSort.descriptions.placeWithinRun'),
    compareMerge: t('features.algorithms.runtime.sort.timSort.descriptions.compareMerge'),
    writeMergedValue: t('features.algorithms.runtime.sort.timSort.descriptions.writeMergedValue'),
  },
} as const;

export function* timSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const minRun = Math.min(size || 1, 8);
  const temp = new Array<number>(size).fill(0);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { size, minRun }),
    boundary: size,
    phase: 'init',
  });

  for (let start = 0; start < size; start += minRun) {
    const end = Math.min(start + minRun - 1, size - 1);

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.buildRun, { start, end }),
      comparing: [start, end],
      boundary: size,
      phase: 'compare',
    });

    yield* insertionSortRange(start, end);
  }

  for (let width = minRun; width < size; width *= 2) {
    for (let left = 0; left < size; left += width * 2) {
      const middle = Math.min(left + width - 1, size - 1);
      const right = Math.min(left + width * 2 - 1, size - 1);

      if (middle >= right) {
        continue;
      }

      yield createArrayStep({
        array: arr,
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.mergeRuns, {
          left,
          middle,
          right,
          nextStart: middle + 1,
        }),
        comparing: [left, right],
        boundary: size,
        phase: 'compare',
      });

      yield* mergeRuns(left, middle, right);
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

  function* insertionSortRange(left: number, right: number): Generator<SortStep> {
    for (let index = left + 1; index <= right; index++) {
      const value = arr[index]!;
      let scan = index - 1;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 15,
        description: i18nText(I18N.descriptions.insertWithinRun, { value, left, right }),
        comparing: [scan, index],
        boundary: size,
        phase: 'compare',
      });

      while (scan >= left && arr[scan]! > value) {
        yield createArrayStep({
          array: arr,
          activeCodeLine: 17,
          description: i18nText(I18N.descriptions.compareWithinRun, {
            leftValue: arr[scan] ?? '',
            value,
          }),
          comparing: [scan, scan + 1],
          boundary: size,
          phase: 'compare',
        });

        arr[scan + 1] = arr[scan]!;

        yield createArrayStep({
          array: arr,
          activeCodeLine: 17,
          description: i18nText(I18N.descriptions.shiftWithinRun, {
            value: arr[scan + 1] ?? '',
          }),
          comparing: [scan, scan + 1],
          boundary: size,
          phase: 'swap',
        });

        scan--;
      }

      arr[scan + 1] = value;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 17,
        description: i18nText(I18N.descriptions.placeWithinRun, {
          value,
          index: scan + 1,
        }),
        comparing: [scan + 1, scan + 1],
        boundary: size,
        phase: 'pass-complete',
      });
    }
  }

  function* mergeRuns(left: number, middle: number, right: number): Generator<SortStep> {
    let leftIndex = left;
    let rightIndex = middle + 1;
    let writeIndex = left;

    while (leftIndex <= middle && rightIndex <= right) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 21,
        description: i18nText(I18N.descriptions.compareMerge, {
          leftValue: arr[leftIndex] ?? '',
          rightValue: arr[rightIndex] ?? '',
        }),
        comparing: [leftIndex, rightIndex],
        boundary: size,
        phase: 'compare',
      });

      if (arr[leftIndex]! <= arr[rightIndex]!) {
        temp[writeIndex] = arr[leftIndex]!;
        leftIndex++;
      } else {
        temp[writeIndex] = arr[rightIndex]!;
        rightIndex++;
      }

      writeIndex++;
    }

    while (leftIndex <= middle) {
      temp[writeIndex] = arr[leftIndex]!;
      leftIndex++;
      writeIndex++;
    }

    while (rightIndex <= right) {
      temp[writeIndex] = arr[rightIndex]!;
      rightIndex++;
      writeIndex++;
    }

    const finalMerge = left === 0 && right === size - 1;

    for (let index = left; index <= right; index++) {
      arr[index] = temp[index]!;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 25,
        description: i18nText(I18N.descriptions.writeMergedValue, {
          value: arr[index] ?? '',
          index,
        }),
        comparing: [index, index],
        sorted: finalMerge ? prefixSorted(index + 1) : [],
        boundary: finalMerge ? index + 1 : size,
        phase: 'pass-complete',
      });
    }
  }
}
