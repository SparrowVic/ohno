import { describe, expect, it } from 'vitest';

import {
  ALGORITHM_TRAIT_GROUPS,
  ALGORITHM_TRAITS,
  deriveAlgorithmTraits,
} from './algorithm-traits';
import { Difficulty, type AlgorithmItem } from '../models/algorithm';

function makeAlgorithm(overrides: Partial<AlgorithmItem> = {}): AlgorithmItem {
  return {
    id: 'demo',
    name: 'Demo',
    description: 'Demonstration algorithm',
    difficulty: Difficulty.Medium,
    category: 'sorting',
    subcategory: 'comparison',
    tags: [],
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
    },
    implemented: true,
    ...overrides,
  };
}

describe('algorithm-traits', () => {
  it('keeps trait ids unique and mapped to declared groups', () => {
    const groupIds = new Set(ALGORITHM_TRAIT_GROUPS.map((group) => group.id));
    const traitIds = ALGORITHM_TRAITS.map((trait) => trait.id);

    expect(new Set(traitIds).size).toBe(traitIds.length);
    expect(ALGORITHM_TRAITS.every((trait) => groupIds.has(trait.group))).toBe(true);
  });

  it('derives traits from explicit flags, categories and textual cues without duplicates', () => {
    const traits = deriveAlgorithmTraits(
      makeAlgorithm({
        name: 'Monte Carlo Heap Geometry',
        description:
          'Greedy priority queue union-find shortest path compression for palindrome hull triangulation with dp table, backtracking and prime tricks.',
        category: 'geometry',
        subcategory: 'pathfinding',
        tags: ['stable', 'stable', 'in-place', 'matching', 'bitmask', 'probabilistic'],
        stable: true,
        inPlace: true,
      }),
    );

    expect(traits).toEqual(
      expect.arrayContaining([
        'stable',
        'in-place',
        'probabilistic',
        'greedy',
        'dynamic-programming',
        'backtracking',
        'randomized',
        'heap',
        'dsu',
        'priority-queue',
        'bitmask',
        'shortest-path',
        'matching',
        'compression',
        'palindromes',
        'number-theory',
        'geometry',
      ]),
    );
    expect(new Set(traits).size).toBe(traits.length);
  });

  it('uses subcategory shortcuts for graph and string-specific domains', () => {
    const traits = deriveAlgorithmTraits(
      makeAlgorithm({
        category: 'graphs',
        subcategory: 'flow-matching',
        description: 'Trie-based MST helper',
        tags: ['union find'],
      }),
    );

    expect(traits).toEqual(expect.arrayContaining(['matching', 'mst', 'trie', 'dsu']));
  });
});
