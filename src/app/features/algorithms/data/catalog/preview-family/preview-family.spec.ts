import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { previewFamily } from './preview-family';

const byId = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id)!;

describe('previewFamily', () => {
  it('maps categories and subcategories onto the eight drawings', () => {
    expect(previewFamily(byId('bubble-sort'))).toBe('bars');
    expect(previewFamily(byId('counting-sort'))).toBe('buckets');
    expect(previewFamily(byId('binary-search'))).toBe('bars');
    expect(previewFamily(byId('tree-traversals'))).toBe('graph');
    expect(previewFamily(byId('dijkstra'))).toBe('graph');
    expect(previewFamily(byId('knapsack-01'))).toBe('matrix');
    expect(previewFamily(byId('kmp-pattern-matching'))).toBe('tape');
    expect(previewFamily(byId('convex-hull'))).toBe('xy');
    expect(previewFamily(byId('euclidean-gcd'))).toBe('notebook');
    expect(previewFamily(byId('recursion-call-stack'))).toBe('stack');
  });

  it('covers the whole catalog', () => {
    const families = new Set(ALGORITHM_CATALOG.map(previewFamily));
    expect([...families].sort()).toEqual(['bars', 'buckets', 'graph', 'matrix', 'notebook', 'stack', 'tape', 'xy']);
  });
});
