import { describe, expect, it } from 'vitest';

import { slotMarks, slotPercent } from './slot.utils';

describe('slot utils', () => {
  it('maps the step onto a percentage', () => {
    expect(slotPercent(66, 196)).toBeCloseTo(33.67, 1);
    expect(slotPercent(196, 196)).toBe(100);
  });

  it('returns 0 for runs with no steps', () => {
    expect(slotPercent(0, 0)).toBe(0);
    expect(slotPercent(1, 0)).toBe(0);
  });

  it('never leaves the 0–100 range', () => {
    expect(slotPercent(300, 196)).toBe(100);
    expect(slotPercent(-3, 196)).toBe(0);
  });

  it('builds up to six evenly spaced marks ending at the total', () => {
    expect(slotMarks(196)).toEqual([0, 40, 80, 120, 160, 196]);
    expect(slotMarks(11)).toEqual([0, 2, 4, 6, 8, 11]);
    expect(slotMarks(0)).toEqual([0]);
  });
});
