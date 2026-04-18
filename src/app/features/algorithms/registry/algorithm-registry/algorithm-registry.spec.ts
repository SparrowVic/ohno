import { describe, expect, it } from 'vitest';

import { AlgorithmRegistry } from './algorithm-registry';
import { Difficulty } from '../../models/algorithm';
import { ALGORITHM_CATALOG } from '../../data/catalog/catalog';

describe('algorithm-registry', () => {
  it('exposes the full catalog through its signal-backed collection', () => {
    const registry = new AlgorithmRegistry();
    const bubble = ALGORITHM_CATALOG.find((item) => item.id === 'bubble-sort');

    expect(registry.all()).toEqual(ALGORITHM_CATALOG);
    expect(registry.getById('bubble-sort')?.name).toBe(bubble?.name);
  });

  it('filters by difficulty and sidebar filter metadata', () => {
    const registry = new AlgorithmRegistry();
    const easyItems = registry.filterByDifficulty(Difficulty.Easy);
    const graphPathfinding = registry.filter({ category: 'graphs', subcategory: 'pathfinding' });

    expect(easyItems.every((item) => item.difficulty === Difficulty.Easy)).toBe(true);
    expect(graphPathfinding.every((item) => item.category === 'graphs')).toBe(true);
    expect(graphPathfinding.every((item) => item.subcategory === 'pathfinding')).toBe(true);
    expect(registry.count({ category: 'graphs', subcategory: 'pathfinding' })).toBe(
      graphPathfinding.length,
    );
  });

  it('returns the full collection when no filter is provided', () => {
    const registry = new AlgorithmRegistry();

    expect(registry.filter()).toHaveLength(ALGORITHM_CATALOG.length);
  });
});
