import { describe, expect, it } from 'vitest';

import { Difficulty } from '../../../models/algorithm';
import { ALGORITHM_CATALOG } from '../catalog';
import { ALL_DIFFICULTIES, filterByDifficulty, toggleDifficulty } from './difficulty-filter';

describe('difficulty filter', () => {
  it('keeps everything when every latch is pressed', () => {
    expect(filterByDifficulty(ALGORITHM_CATALOG, ALL_DIFFICULTIES)).toHaveLength(ALGORITHM_CATALOG.length);
  });

  it('keeps only the pressed difficulties', () => {
    const easy = filterByDifficulty(ALGORITHM_CATALOG, new Set([Difficulty.Easy]));
    expect(easy.length).toBe(14);
    expect(easy.every((item) => item.difficulty === Difficulty.Easy)).toBe(true);
  });

  it('returns nothing when no latch is pressed', () => {
    expect(filterByDifficulty(ALGORITHM_CATALOG, new Set())).toEqual([]);
  });

  it('toggles a difficulty in and out without mutating the input', () => {
    const start = new Set([Difficulty.Easy]);
    const withMedium = toggleDifficulty(start, Difficulty.Medium);
    expect([...withMedium]).toEqual([Difficulty.Easy, Difficulty.Medium]);
    expect([...toggleDifficulty(withMedium, Difficulty.Easy)]).toEqual([Difficulty.Medium]);
    expect([...start]).toEqual([Difficulty.Easy]);
  });
});
