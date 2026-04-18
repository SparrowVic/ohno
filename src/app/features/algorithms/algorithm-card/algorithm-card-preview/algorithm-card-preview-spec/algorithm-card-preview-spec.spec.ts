import { describe, expect, it } from 'vitest';

import { Difficulty, type AlgorithmItem } from '../../../models/algorithm';
import { resolvePreviewSpec } from './algorithm-card-preview-spec';

function makeAlgorithm(overrides: Partial<AlgorithmItem> = {}): AlgorithmItem {
  return {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements.',
    difficulty: Difficulty.Easy,
    category: 'sorting',
    subcategory: 'comparison',
    tags: ['stable'],
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

describe('algorithm-card-preview-spec', () => {
  it('resolves a dedicated preview for a known algorithm id', () => {
    const spec = resolvePreviewSpec(makeAlgorithm());

    expect(spec.rects.length).toBeGreaterThan(0);
    expect(spec.lines.length).toBeGreaterThan(0);
  });

  it('falls back to a category preview when the algorithm id is unknown', () => {
    const spec = resolvePreviewSpec(
      makeAlgorithm({
        id: 'custom-graph-demo',
        category: 'graphs',
        subcategory: 'pathfinding',
      }),
    );

    expect(spec.circles.length).toBeGreaterThan(0);
    expect(spec.lines.length).toBeGreaterThan(0);
  });
});
