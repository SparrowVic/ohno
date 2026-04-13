import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* shellSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start shell sort (n=${size})`,
    boundary: size,
    phase: 'init',
  });

  for (let gap = Math.floor(size / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield createArrayStep({
      array: arr,
      activeCodeLine: 2,
      description: `Begin gap pass with gap ${gap}.`,
      boundary: size,
      phase: 'compare',
    });

    for (let index = gap; index < size; index++) {
      const value = arr[index]!;
      let scan = index;

      yield createArrayStep({
        array: arr,
        activeCodeLine: 4,
        description: `Take ${value} from index ${index} and scan left in steps of ${gap}.`,
        comparing: [Math.max(0, index - gap), index],
        sorted: gap === 1 ? prefixSorted(index) : [],
        boundary: size,
        phase: 'compare',
      });

      while (scan >= gap && arr[scan - gap]! > value) {
        yield createArrayStep({
          array: arr,
          activeCodeLine: 6,
          description: `Compare ${arr[scan - gap]} with ${value} across gap ${gap}.`,
          comparing: [scan - gap, scan],
          sorted: gap === 1 ? prefixSorted(index) : [],
          boundary: size,
          phase: 'compare',
        });

        arr[scan] = arr[scan - gap]!;

        yield createArrayStep({
          array: arr,
          activeCodeLine: 7,
          description: `Shift ${arr[scan]} from index ${scan - gap} to ${scan}.`,
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
        description: `Insert ${value} at index ${scan} for gap ${gap}.`,
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
    description: 'Shell sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
