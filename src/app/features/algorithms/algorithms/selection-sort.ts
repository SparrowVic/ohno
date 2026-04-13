import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* selectionSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start selection sort (n=${size})`,
    boundary: 0,
    phase: 'init',
  });

  for (let index = 0; index < size - 1; index++) {
    let minIndex = index;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 3,
      description: `Scan the unsorted suffix to find the minimum for slot ${index}.`,
      comparing: [index, index],
      sorted: prefixSorted(index),
      boundary: index,
      phase: 'compare',
    });

    for (let scan = index + 1; scan < size; scan++) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 5,
        description: `Compare current minimum ${arr[minIndex]} with ${arr[scan]} at index ${scan}.`,
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
          description: `${arr[minIndex]} becomes the new minimum candidate.`,
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
        description: `Swap ${left} with ${right} to lock the next smallest value at index ${index}.`,
        swapping: [index, minIndex],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'swap',
      });
    }

    yield createArrayStep({
      array: arr,
      activeCodeLine: 12,
      description: `Index ${index} is now fixed in the sorted prefix.`,
      sorted: prefixSorted(index + 1),
      boundary: index + 1,
      phase: 'pass-complete',
    });
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 13,
    description: 'Selection sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
