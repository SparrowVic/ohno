import { describe, expect, it } from 'vitest';

import { SORTING_ALGORITHMS } from './sorting';
import { Difficulty } from '../../models/algorithm';

describe('sorting data', () => {
  it('contains only sorting entries with expected showcase implementations', () => {
    expect(SORTING_ALGORITHMS.every((item) => item.category === 'sorting')).toBe(true);
    expect(SORTING_ALGORITHMS.find((item) => item.id === 'bubble-sort')?.implemented).toBe(true);
    expect(SORTING_ALGORITHMS.find((item) => item.id === 'radix-sort')?.implemented).toBe(true);
    expect(SORTING_ALGORITHMS.find((item) => item.id === 'selection-sort')?.stable).toBe(false);
  });

  it('keeps difficulty and complexity metadata aligned with classic expectations', () => {
    const bubble = SORTING_ALGORITHMS.find((item) => item.id === 'bubble-sort');
    const radix = SORTING_ALGORITHMS.find((item) => item.id === 'radix-sort');

    expect(bubble).toMatchObject({
      difficulty: Difficulty.Easy,
      stable: true,
      inPlace: true,
    });
    expect(radix).toMatchObject({
      difficulty: Difficulty.Hard,
      stable: true,
      inPlace: false,
      subcategory: 'non-comparison',
    });
  });
});
