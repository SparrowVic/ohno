import { describe, expect, it } from 'vitest';

import { Difficulty, type AlgorithmItem } from '../../models/algorithm';
import {
  buildSemanticTags,
  createCardStyleVars,
  createPrimaryBlobStyle,
  createWashStyle,
  formatFacetLabel,
} from './algorithm-card.utils';

function makeAlgorithm(overrides: Partial<AlgorithmItem> = {}): AlgorithmItem {
  return {
    id: 'heap-sort',
    name: 'Heap Sort',
    description: 'Uses a heap and priority queue ideas.',
    difficulty: Difficulty.Hard,
    category: 'sorting',
    subcategory: 'comparison',
    tags: ['O(n log n)', 'Stable', 'stable', 'heap', 'priority queue'],
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(1)',
    },
    implemented: true,
    ...overrides,
  };
}

describe('algorithm-card.utils', () => {
  it('buildSemanticTags removes complexity tags and duplicates', () => {
    expect(buildSemanticTags(makeAlgorithm())).toEqual(['Stable', 'heap', 'priority queue']);
  });

  it('formatFacetLabel humanizes common abbreviations', () => {
    expect(formatFacetLabel('dp-optimization')).toBe('DP Optimization');
    expect(formatFacetLabel('mst')).toBe('MST');
  });

  it('creates deterministic style vars for the same seed', () => {
    const first = createCardStyleVars('heap-sort', Difficulty.Hard);
    const second = createCardStyleVars('heap-sort', Difficulty.Hard);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      '--card-accent-rgb': '239 140 140',
    });
    expect(first['--card-preview-angle']).toMatch(/deg$/);
  });

  it('creates blob and wash styles from the difficulty palette', () => {
    const blob = createPrimaryBlobStyle('heap-sort', Difficulty.Hard);
    const wash = createWashStyle(Difficulty.Hard);

    expect(blob.background).toContain('rgba(239, 140, 140');
    expect(wash.background).toContain('linear-gradient');
  });
});
