import { describe, expect, it } from 'vitest';

import { DEFAULT_SORTING_LEGEND } from './sorting-legend';

describe('sorting-legend', () => {
  it('keeps the default visual states compact and ordered', () => {
    expect(DEFAULT_SORTING_LEGEND).toEqual([
      { label: 'Unsorted', color: 'var(--viz-state-default)', opacity: 0.55 },
      { label: 'Comparing', color: 'var(--viz-state-compare)' },
      { label: 'Swapping', color: 'var(--viz-state-swap)' },
      { label: 'Sorted', color: 'var(--viz-state-sorted)' },
      { label: 'Pivot', color: 'var(--chrome-accent)' },
    ]);
  });
});
