import { SortStep } from '../models/sort-step';

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
    description: `Start bubble sort (n=${n})`,
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
        description: `Compare arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
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
          description: `Swap ${left} and ${right} at indices ${j}, ${j + 1}`,
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
      description: `Pass ${i + 1} complete — index ${boundary} locked in`,
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
        description: 'No swaps — array already sorted, early exit',
      };

      yield {
        array: [...arr],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        boundary: 0,
        activeCodeLine: 13,
        description: 'Sorting complete',
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
    description: 'Sorting complete',
  };
}
