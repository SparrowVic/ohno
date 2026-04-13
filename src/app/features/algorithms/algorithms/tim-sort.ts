import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* timSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const minRun = Math.min(size || 1, 8);
  const temp = new Array<number>(size).fill(0);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start tim sort (n=${size}, minRun=${minRun})`,
    boundary: size,
    phase: 'init',
  });

  for (let start = 0; start < size; start += minRun) {
    const end = Math.min(start + minRun - 1, size - 1);

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: `Build run [${start}, ${end}] with insertion sort.`,
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
        description: `Merge runs [${left}, ${middle}] and [${middle + 1}, ${right}].`,
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
    description: 'Tim sort complete.',
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
        description: `Insert ${value} within run [${left}, ${right}].`,
        comparing: [scan, index],
        boundary: size,
        phase: 'compare',
      });

      while (scan >= left && arr[scan]! > value) {
        yield createArrayStep({
          array: arr,
          activeCodeLine: 17,
          description: `Compare ${arr[scan]} with ${value} while extending the run.`,
          comparing: [scan, scan + 1],
          boundary: size,
          phase: 'compare',
        });

        arr[scan + 1] = arr[scan]!;

        yield createArrayStep({
          array: arr,
          activeCodeLine: 17,
          description: `Shift ${arr[scan + 1]} one slot to the right inside the run.`,
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
        description: `Place ${value} at index ${scan + 1} inside the run.`,
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
        description: `Compare ${arr[leftIndex]} with ${arr[rightIndex]} while merging runs.`,
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
        description: `Write merged value ${arr[index]} back to index ${index}.`,
        comparing: [index, index],
        sorted: finalMerge ? prefixSorted(index + 1) : [],
        boundary: finalMerge ? index + 1 : size,
        phase: 'pass-complete',
      });
    }
  }
}
