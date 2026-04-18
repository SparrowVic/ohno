import { describe, expect, it } from 'vitest';

import { DEFAULT_SORTING_LEGEND } from './sorting-legend';

describe('sorting-legend', () => {
  it('keeps the default visual states compact and ordered', () => {
    expect(DEFAULT_SORTING_LEGEND).toEqual([
      { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
      { label: 'Comparing', color: 'var(--compare-color)' },
      { label: 'Swapping', color: 'var(--swap-color)' },
      { label: 'Sorted', color: 'var(--sorted-color)' },
      { label: 'Pivot', color: 'var(--accent)' },
    ]);
  });
});
