import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

export function* countingSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const max = Math.max(0, ...arr);
  const counts = new Array<number>(max + 1).fill(0);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start counting sort (n=${size}, max=${max})`,
    boundary: 0,
    phase: 'init',
  });

  for (let index = 0; index < size; index++) {
    counts[arr[index]] += 1;

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: `Count value ${arr[index]} at index ${index}. It has appeared ${counts[arr[index]]} time(s).`,
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
        description: `Write ${value} into sorted output slot ${writeIndex}.`,
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
    description: 'Counting sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
