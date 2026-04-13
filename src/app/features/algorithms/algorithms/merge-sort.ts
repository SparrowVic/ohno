import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* mergeSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const temp = new Array<number>(size).fill(0);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start merge sort (n=${size})`,
    boundary: size,
    phase: 'init',
  });

  if (size > 0) {
    yield* sortRange(0, size - 1);
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 4,
    description: 'Merge sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });

  function* sortRange(left: number, right: number): Generator<SortStep> {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);

    yield createArrayStep({
      array: arr,
      activeCodeLine: 7,
      description: `Split range [${left}, ${right}] around middle ${middle}.`,
      comparing: [left, right],
      boundary: size,
      phase: 'compare',
    });

    yield* sortRange(left, middle);
    yield* sortRange(middle + 1, right);
    yield* mergeRanges(left, middle, right);
  }

  function* mergeRanges(left: number, middle: number, right: number): Generator<SortStep> {
    let leftIndex = left;
    let rightIndex = middle + 1;
    let writeIndex = left;

    while (leftIndex <= middle && rightIndex <= right) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 15,
        description: `Compare ${arr[leftIndex]} from the left half with ${arr[rightIndex]} from the right half.`,
        comparing: [leftIndex, rightIndex],
        boundary: size,
        phase: 'compare',
      });

      if (arr[leftIndex] <= arr[rightIndex]) {
        temp[writeIndex] = arr[leftIndex];
        leftIndex++;
      } else {
        temp[writeIndex] = arr[rightIndex];
        rightIndex++;
      }
      writeIndex++;
    }

    while (leftIndex <= middle) {
      temp[writeIndex] = arr[leftIndex];
      leftIndex++;
      writeIndex++;
    }

    while (rightIndex <= right) {
      temp[writeIndex] = arr[rightIndex];
      rightIndex++;
      writeIndex++;
    }

    for (let index = left; index <= right; index++) {
      arr[index] = temp[index];

      yield createArrayStep({
        array: arr,
        activeCodeLine: 19,
        description: `Write merged value ${arr[index]} back to index ${index}.`,
        comparing: [index, index],
        boundary: size,
        phase: 'pass-complete',
      });
    }
  }
}
