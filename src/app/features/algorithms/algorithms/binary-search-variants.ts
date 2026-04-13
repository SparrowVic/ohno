import { SortStep } from '../models/sort-step';
import { createSearchStep } from './search-step';

export function* binarySearchVariantsGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const visited: number[] = [];
  const eliminated = new Set<number>();
  let leftBound: number | null = null;
  let rightBound: number | null = null;

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: `Start boundary search for the full span of ${args.target}.`,
    modeLabel: 'Lower bound',
    statusLabel: 'Ready',
    low: arr.length > 0 ? 0 : null,
    high: arr.length > 0 ? arr.length - 1 : null,
    phase: 'init',
  });

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 3,
      description: `Lower bound probe at index ${mid}: compare ${arr[mid]} with ${args.target}.`,
      modeLabel: 'Lower bound',
      statusLabel: 'Comparing',
      decision: `${arr[mid]} ${arr[mid] < args.target ? '<' : '>='} ${args.target}`,
      probeIndex: mid,
      low,
      high,
      leftBound,
      rightBound,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] >= args.target) {
      if (arr[mid] === args.target) {
        leftBound = mid;
      }

      for (let index = mid + 1; index <= high; index++) {
        eliminated.add(index);
      }
      high = mid - 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 6,
        description: `Move left to chase the first occurrence of ${args.target}.`,
        modeLabel: 'Lower bound',
        statusLabel: leftBound === null ? 'Move left' : 'First match candidate',
        decision:
          leftBound === null ? `trim right side, new high ${high}` : `candidate first index ${leftBound}`,
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        leftBound,
        rightBound,
        eliminated: [...eliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = low; index <= mid; index++) {
      eliminated.add(index);
    }
    low = mid + 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 8,
      description: `${arr[mid]} is too small, so the first occurrence must be further right.`,
      modeLabel: 'Lower bound',
      statusLabel: 'Move right',
      decision: `new low ${low}`,
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      leftBound,
      rightBound,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  if (leftBound === null) {
    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 10,
      description: `No value equal to ${args.target} exists, so there is no matching range.`,
      modeLabel: 'Bounds search',
      statusLabel: 'Not found',
      decision: 'lower bound search failed',
      low: null,
      high: null,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'complete',
    });
    return;
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 11,
    description: `Lower bound settled at index ${leftBound}. Now chase the last occurrence.`,
    modeLabel: 'Upper bound',
    statusLabel: 'Switch phase',
    decision: `first match fixed at ${leftBound}`,
    low: leftBound,
    high: arr.length - 1,
    leftBound,
    rightBound,
    eliminated: [...eliminated].filter((index) => index < leftBound),
    visitedOrder: visited,
    phase: 'compare',
  });

  low = leftBound;
  high = arr.length - 1;
  const upperEliminated = new Set<number>([...eliminated].filter((index) => index < leftBound));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 13,
      description: `Upper bound probe at index ${mid}: compare ${arr[mid]} with ${args.target}.`,
      modeLabel: 'Upper bound',
      statusLabel: 'Comparing',
      decision: `${arr[mid]} ${arr[mid] > args.target ? '>' : '<='} ${args.target}`,
      probeIndex: mid,
      low,
      high,
      leftBound,
      rightBound,
      eliminated: [...upperEliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] <= args.target) {
      if (arr[mid] === args.target) {
        rightBound = mid;
      }

      for (let index = low; index < mid; index++) {
        upperEliminated.add(index);
      }
      low = mid + 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 16,
        description: `Move right to chase the last occurrence of ${args.target}.`,
        modeLabel: 'Upper bound',
        statusLabel: rightBound === null ? 'Move right' : 'Last match candidate',
        decision:
          rightBound === null ? `advance low to ${low}` : `candidate last index ${rightBound}`,
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        leftBound,
        rightBound,
        eliminated: [...upperEliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = mid; index <= high; index++) {
      upperEliminated.add(index);
    }
    high = mid - 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 18,
      description: `${arr[mid]} is too large, so the last occurrence must stay to the left.`,
      modeLabel: 'Upper bound',
      statusLabel: 'Move left',
      decision: `new high ${high}`,
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      leftBound,
      rightBound,
      eliminated: [...upperEliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  const resultIndices =
    leftBound !== null && rightBound !== null
      ? Array.from({ length: rightBound - leftBound + 1 }, (_, index) => leftBound + index)
      : [];

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 20,
    description:
      resultIndices.length > 0
        ? `Target ${args.target} spans indices ${leftBound} through ${rightBound}.`
        : `No final range for ${args.target} was confirmed.`,
    modeLabel: 'Bounds search',
    statusLabel: resultIndices.length > 0 ? 'Range found' : 'Not found',
    decision:
      resultIndices.length > 0
        ? `range width ${resultIndices.length}`
        : 'upper bound search did not confirm a match',
    low: leftBound,
    high: rightBound,
    leftBound,
    rightBound,
    resultIndices,
    eliminated: [...upperEliminated],
    visitedOrder: visited,
    phase: 'complete',
  });
}
