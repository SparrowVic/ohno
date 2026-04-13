import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* quickSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const settled = new Set<number>();

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start quick sort (n=${size})`,
    boundary: size,
    phase: 'init',
  });

  if (size > 0) {
    yield* sortRange(0, size - 1);
  }

  yield createArrayStep({
    array: arr,
    activeCodeLine: 3,
    description: 'Quick sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });

  function* sortRange(low: number, high: number): Generator<SortStep> {
    if (low > high) {
      return;
    }

    if (low === high) {
      settled.add(low);
      yield createArrayStep({
        array: arr,
        activeCodeLine: 5,
        description: `Single element ${arr[low]} at index ${low} is already fixed.`,
        sorted: [...settled].sort((left, right) => left - right),
        boundary: size,
        phase: 'pass-complete',
      });
      return;
    }

    const pivot = arr[high];
    let storeIndex = low;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 6,
      description: `Choose ${pivot} at index ${high} as the pivot.`,
      comparing: [high, high],
      sorted: [...settled].sort((left, right) => left - right),
      boundary: size,
      phase: 'compare',
    });

    for (let index = low; index < high; index++) {
      yield createArrayStep({
        array: arr,
        activeCodeLine: 9,
        description: `Compare ${arr[index]} with pivot ${pivot}.`,
        comparing: [index, high],
        sorted: [...settled].sort((left, right) => left - right),
        boundary: size,
        phase: 'compare',
      });

      if (arr[index] < pivot) {
        if (index !== storeIndex) {
          const left = arr[storeIndex];
          const right = arr[index];
          [arr[storeIndex], arr[index]] = [arr[index], arr[storeIndex]];

          yield createArrayStep({
            array: arr,
            activeCodeLine: 10,
            description: `Swap ${left} with ${right} to expand the lower-than-pivot partition.`,
            swapping: [storeIndex, index],
            sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
            boundary: size,
            phase: 'swap',
          });
        }

        storeIndex++;
      }
    }

    if (storeIndex !== high) {
      const left = arr[storeIndex];
      const right = arr[high];
      [arr[storeIndex], arr[high]] = [arr[high], arr[storeIndex]];
      settled.add(storeIndex);

      yield createArrayStep({
        array: arr,
        activeCodeLine: 14,
        description: `Place pivot ${right} into its final index ${storeIndex} by swapping with ${left}.`,
        swapping: [storeIndex, high],
        sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
        boundary: size,
        phase: 'swap',
      });
    } else {
      settled.add(storeIndex);
      yield createArrayStep({
        array: arr,
        activeCodeLine: 14,
        description: `Pivot ${pivot} is already at its final index ${storeIndex}.`,
        comparing: [storeIndex, storeIndex],
        sorted: [...settled].sort((leftIndex, rightIndex) => leftIndex - rightIndex),
        boundary: size,
        phase: 'pass-complete',
      });
    }

    yield* sortRange(low, storeIndex - 1);
    yield* sortRange(storeIndex + 1, high);
  }
}
