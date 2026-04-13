import { SortStep } from '../models/sort-step';
import { createSearchStep } from './search-step';

export function* binarySearchGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const visited: number[] = [];
  const eliminated = new Set<number>();
  let low = 0;
  let high = arr.length - 1;

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: `Start binary search for ${args.target} in a sorted array.`,
    modeLabel: 'Binary search',
    statusLabel: 'Ready',
    low: arr.length > 0 ? low : null,
    high: arr.length > 0 ? high : null,
    phase: 'init',
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 3,
      description: `Probe middle index ${mid}: compare ${arr[mid]} with target ${args.target}.`,
      modeLabel: 'Binary search',
      statusLabel: 'Comparing',
      decision: `${arr[mid]} ${arr[mid] === args.target ? '=' : arr[mid] < args.target ? '<' : '>'} ${
        args.target
      }`,
      probeIndex: mid,
      low,
      high,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] === args.target) {
      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 5,
        description: `Found target ${args.target} at middle index ${mid}.`,
        modeLabel: 'Binary search',
        statusLabel: 'Found',
        decision: `window collapsed on index ${mid}`,
        probeIndex: mid,
        low: mid,
        high: mid,
        resultIndices: [mid],
        visitedOrder: visited,
        phase: 'complete',
      });
      return;
    }

    if (arr[mid] < args.target) {
      for (let index = low; index <= mid; index++) {
        eliminated.add(index);
      }
      low = mid + 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 8,
        description: `${arr[mid]} is smaller than ${args.target}, so keep only the right half.`,
        modeLabel: 'Binary search',
        statusLabel: 'Move right',
        decision: `new window [${low}, ${high}]`,
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        eliminated: [...eliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = mid; index <= high; index++) {
      eliminated.add(index);
    }
    high = mid - 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 10,
      description: `${arr[mid]} is larger than ${args.target}, so keep only the left half.`,
      modeLabel: 'Binary search',
      statusLabel: 'Move left',
      decision: `new window [${low}, ${high}]`,
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 12,
    description: `Binary search exhausted the window. ${args.target} was not found.`,
    modeLabel: 'Binary search',
    statusLabel: 'Not found',
    decision: 'candidate window became empty',
    low: null,
    high: null,
    eliminated: [...eliminated],
    visitedOrder: visited,
    phase: 'complete',
  });
}
