import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import {
  createRadixDigitBadges,
  createRadixViewState,
  digitName,
  digitPowerLabel,
  digitsForValue,
  findActiveValue,
  phaseLabel,
} from './radix-visualization';

describe('radix-visualization', () => {
  it('creates a fallback radix view state when no step is available', () => {
    const state = createRadixViewState(null, [7, 42]);

    expect(state.maxDigits).toBe(2);
    expect(state.topItems).toEqual([
      { id: 'rdx-0', value: 7 },
      { id: 'rdx-1', value: 42 },
    ]);
    expect(state.activeDigitIndex).toBe(0);
    expect(state.activeDigitCharIndex).toBe(1);
    expect(state.passNumber).toBe(1);
  });

  it('removes already bucketed items from the top row during distribution', () => {
    const step: SortStep = {
      array: [12, 7],
      comparing: null,
      swapping: null,
      sorted: [],
      boundary: 0,
      activeCodeLine: 0,
      description: 'Routing digits',
      phase: 'distribute',
      digitIndex: 0,
      maxDigits: 2,
      sourceItems: [
        { id: 'rdx-0', value: 12 },
        { id: 'rdx-1', value: 7 },
      ],
      items: [
        { id: 'rdx-0', value: 12 },
        { id: 'rdx-1', value: 7 },
      ],
      buckets: [{ bucket: 2, items: [{ id: 'rdx-0', value: 12 }] }],
      activeItemId: 'rdx-0',
      activeBucket: 2,
    };

    const state = createRadixViewState(step, step.array);

    expect(state.topItems).toEqual([{ id: 'rdx-1', value: 7 }]);
    expect(findActiveValue(state, 'rdx-0')).toBe(12);
  });

  it('builds digit badges and labels for each pass', () => {
    expect(createRadixDigitBadges(3, 1)).toEqual([
      { exponent: 2, label: '100s', active: false },
      { exponent: 1, label: '10s', active: true },
      { exponent: 0, label: '1s', active: false },
    ]);
    expect(digitsForValue(7, 3)).toEqual(['0', '0', '7']);
    expect(digitName(2)).toBe('hundreds digit');
    expect(digitPowerLabel(3)).toBe('10^3');
    expect(phaseLabel('gather')).toBe('Stable Gather');
  });
});
