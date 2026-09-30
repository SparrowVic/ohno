import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { moduleId } from './module-id';

const byId = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id)!;

describe('moduleId', () => {
  it('numbers modules within their category in catalog order', () => {
    expect(moduleId(byId('bubble-sort'), ALGORITHM_CATALOG)).toBe('SRT-01');
    expect(moduleId(byId('tim-sort'), ALGORITHM_CATALOG)).toBe('SRT-11');
    expect(moduleId(byId('linear-search'), ALGORITHM_CATALOG)).toBe('SRC-01');
    expect(moduleId(byId('tree-traversals'), ALGORITHM_CATALOG)).toBe('TRE-01');
    expect(moduleId(byId('bfs'), ALGORITHM_CATALOG)).toBe('GRF-01');
    expect(moduleId(byId('knapsack-01'), ALGORITHM_CATALOG)).toBe('DYN-01');
    expect(moduleId(byId('kmp-pattern-matching'), ALGORITHM_CATALOG)).toBe('STR-01');
    expect(moduleId(byId('convex-hull'), ALGORITHM_CATALOG)).toBe('GEO-01');
    expect(moduleId(byId('extended-euclidean'), ALGORITHM_CATALOG)).toBe('MSC-21');
  });

  it('gives every catalog entry a unique id', () => {
    const ids = ALGORITHM_CATALOG.map((item) => moduleId(item, ALGORITHM_CATALOG));
    expect(new Set(ids).size).toBe(ALGORITHM_CATALOG.length);
  });

  it('falls back to a generic prefix for an unknown category', () => {
    const stray = { ...byId('bubble-sort'), id: 'stray', category: 'quantum' };
    expect(moduleId(stray, [...ALGORITHM_CATALOG, stray])).toBe('MOD-01');
  });
});
