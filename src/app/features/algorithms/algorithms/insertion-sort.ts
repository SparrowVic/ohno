import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* insertionSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start insertion sort (n=${size})`,
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
      description: `Take ${value} from index ${index} and walk it left through the sorted prefix.`,
      comparing: [scan, index],
      sorted: prefixSorted(index),
      boundary: index,
      phase: 'compare',
    });

    while (scan >= 0 && arr[scan] > value) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 6,
        description: `Compare ${arr[scan]} with insertion value ${value}.`,
        comparing: [scan, scan + 1],
        sorted: prefixSorted(index),
        boundary: index,
        phase: 'compare',
      });

      arr[scan + 1] = arr[scan];

      yield createArrayStep({
        array: arr,
        activeCodeLine: 6,
        description: `Shift ${arr[scan + 1]} one slot to the right.`,
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
      description: `Insert ${value} at index ${scan + 1}.`,
      comparing: [scan + 1, scan + 1],
      sorted: prefixSorted(index + 1),
      boundary: index + 1,
      phase: 'pass-complete',
    });
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 11,
    description: 'Insertion sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
