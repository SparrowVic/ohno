import { SortStep } from '../../models/sort-step';
import { createSearchStep } from '../search-step';

export function* linearSearchGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const size = arr.length;
  const visited: number[] = [];
  const eliminated: number[] = [];

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: `Start linear search for ${args.target} across ${size} items.`,
    modeLabel: 'Linear scan',
    statusLabel: 'Ready',
    low: size > 0 ? 0 : null,
    high: size > 0 ? size - 1 : null,
    phase: 'init',
  });

  for (let index = 0; index < size; index++) {
    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 2,
      description: `Inspect index ${index}: compare ${arr[index]} with target ${args.target}.`,
      modeLabel: 'Linear scan',
      statusLabel: 'Comparing',
      decision: `${arr[index]} ${arr[index] === args.target ? '=' : '≠'} ${args.target}`,
      probeIndex: index,
      low: index,
      high: size - 1,
      eliminated,
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(index);

    if (arr[index] === args.target) {
      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 3,
        description: `Found target ${args.target} at index ${index}.`,
        modeLabel: 'Linear scan',
        statusLabel: 'Found',
        decision: `stop at index ${index}`,
        probeIndex: index,
        low: index,
        high: index,
        resultIndices: [index],
        visitedOrder: visited,
        phase: 'complete',
      });
      return;
    }

    eliminated.push(index);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 5,
      description: `${arr[index]} is not the target, continue to the next slot.`,
      modeLabel: 'Linear scan',
      statusLabel: 'Advance',
      decision: `discard index ${index}`,
      low: index + 1 < size ? index + 1 : null,
      high: index + 1 < size ? size - 1 : null,
      eliminated,
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 7,
    description: `Target ${args.target} is not present in the array.`,
    modeLabel: 'Linear scan',
    statusLabel: 'Not found',
    decision: 'all slots exhausted',
    low: null,
    high: null,
    eliminated,
    visitedOrder: visited,
    phase: 'complete',
  });
}
