import { SortStep } from '../../models/sort-step';

export function sortStep(partial: Partial<SortStep> & Pick<SortStep, 'array'>): SortStep {
  return {
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: partial.array.length,
    activeCodeLine: 1,
    description: 'features.algorithms.runtime.sort.fixture',
    ...partial,
  };
}

export const BUBBLE_HISTORY: readonly SortStep[] = [
  sortStep({ array: [56, 13, 74, 35], description: 'start' }),
  sortStep({ array: [56, 13, 74, 35], comparing: [0, 1], description: 'compare' }),
  sortStep({ array: [13, 56, 74, 35], swapping: [0, 1], description: 'swap' }),
  sortStep({ array: [13, 56, 74, 35], comparing: [2, 3], description: 'compare' }),
  sortStep({ array: [13, 56, 35, 74], sorted: [3], boundary: 3, description: 'pass' }),
  sortStep({ array: [13, 35, 56, 74], sorted: [0, 1, 2, 3], boundary: 0, description: 'complete' }),
];
