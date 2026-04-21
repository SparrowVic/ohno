import { describe, expect, it } from 'vitest';

import type { AlgorithmTraitId } from '../../algorithm-traits/algorithm-traits';
import { Difficulty, type AlgorithmItem } from '../../models/algorithm';
import {
  buildPageStats,
  buildTraitCounts,
  buildTraitGroupsView,
  filterItemsByTraits,
  groupSelectedTraits,
} from './algorithms-page.utils';

function makeAlgorithm(overrides: Partial<AlgorithmItem> = {}): AlgorithmItem {
  return {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    description: 'Stable in-place sorting baseline.',
    difficulty: Difficulty.Easy,
    category: 'sorting',
    subcategory: 'comparison',
    tags: ['stable', 'in-place'],
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
    },
    implemented: true,
    ...overrides,
  };
}

const translate = (key: string): string =>
  (
    ({
      'features.algorithms.traits.groups.properties': 'Properties',
      'features.algorithms.traits.groups.paradigms': 'Paradigms',
      'features.algorithms.traits.groups.structures': 'Structures',
      'features.algorithms.traits.groups.domains': 'Problem types',
      'features.algorithms.traits.items.compression': 'Compression',
      'features.algorithms.page.stats.visibleNow': 'Visible now',
      'features.algorithms.page.stats.interactive': 'Interactive',
      'features.algorithms.page.stats.tracks': 'Tracks',
    }) as Record<string, string>
  )[key] ?? key;

describe('algorithms-page.utils', () => {
  const items: readonly AlgorithmItem[] = [
    makeAlgorithm(),
    makeAlgorithm({
      id: 'heap-sort',
      name: 'Heap Sort',
      difficulty: Difficulty.Medium,
      description: 'Heap-based in-place sorting.',
      tags: ['heap', 'in-place'],
      stable: false,
    }),
    makeAlgorithm({
      id: 'dijkstra',
      name: 'Dijkstra',
      category: 'graphs',
      subcategory: 'pathfinding',
      description: 'Shortest path with a priority queue.',
      tags: ['priority queue', 'greedy'],
      stable: false,
      inPlace: false,
    }),
  ];

  it('buildTraitCounts counts derived traits across visible items', () => {
    const counts = buildTraitCounts(items);

    expect(counts.get('stable')).toBe(1);
    expect(counts.get('in-place')).toBe(2);
    expect(counts.get('heap')).toBe(1);
    expect(counts.get('shortest-path')).toBe(1);
  });

  it('buildTraitGroupsView keeps selected zero-count traits visible', () => {
    const groups = buildTraitGroupsView(['compression'], buildTraitCounts(items), translate);
    const domainsGroup = groups.find((group) => group.id === 'domains');
    const compression = domainsGroup?.options.find((option) => option.id === 'compression');

    expect(compression).toMatchObject({
      id: 'compression',
      count: 0,
      selected: true,
    });
  });

  it('groupSelectedTraits and filterItemsByTraits apply OR within a group and AND across groups', () => {
    const grouped = groupSelectedTraits(['in-place', 'heap'] satisfies readonly AlgorithmTraitId[]);
    const filtered = filterItemsByTraits(items, grouped);

    expect(filtered.map((item) => item.id)).toEqual(['heap-sort']);
  });

  it('buildPageStats localizes the summary labels', () => {
    expect(buildPageStats(12, 8, 6, translate)).toEqual([
      { value: '12', label: 'Visible now', tone: 'accent' },
      { value: '8', label: 'Interactive', tone: 'success' },
      { value: '6', label: 'Tracks', tone: 'neutral' },
    ]);
  });
});
