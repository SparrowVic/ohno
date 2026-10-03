import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { radixSortGenerator } from '../../algorithms/radix-sort';
import { SortStep } from '../../models/sort-step';
import {
  RADIX_BUCKET_COUNT,
  isRadixPhase,
  isSettledPhase,
  radixBins,
  radixDigitAt,
  radixDigitCount,
  radixDigits,
  radixPad,
  radixPlaceLabel,
  radixState,
} from './radix-digits.utils';

const PLACES = I18N_KEY.features.algorithms.display.radix.digitPlace;

function run(values: readonly number[]): SortStep[] {
  return [...radixSortGenerator(values)];
}

describe('radix digit utils', () => {
  it('counts digits and reads one digit at an exponent', () => {
    expect(radixDigitCount(0)).toBe(1);
    expect(radixDigitCount(7)).toBe(1);
    expect(radixDigitCount(42)).toBe(2);
    expect(radixDigitCount(999)).toBe(3);
    expect(radixDigitAt(432, 0)).toBe(2);
    expect(radixDigitAt(432, 1)).toBe(3);
    expect(radixDigitAt(432, 2)).toBe(4);
    expect(radixDigitAt(32, 2)).toBe(0);
  });

  it('pads digits to the widest value and flags leading zeros', () => {
    expect(radixDigits(32, 3)).toEqual([
      { digit: 0, exponent: 2, lead: true },
      { digit: 3, exponent: 1, lead: false },
      { digit: 2, exponent: 0, lead: false },
    ]);
    expect(radixDigits(0, 2)).toEqual([
      { digit: 0, exponent: 1, lead: true },
      { digit: 0, exponent: 0, lead: false },
    ]);
    expect(radixDigits(5, 0)).toEqual([{ digit: 5, exponent: 0, lead: false }]);
  });

  it('names digit places through the shared keys', () => {
    expect(radixPlaceLabel(0)).toEqual({ key: PLACES.ones, params: undefined });
    expect(radixPlaceLabel(1)).toEqual({ key: PLACES.tens, params: undefined });
    expect(radixPlaceLabel(2)).toEqual({ key: PLACES.hundreds, params: undefined });
    expect(radixPlaceLabel(4)).toEqual({ key: PLACES.power, params: { power: 4 } });
  });

  it('pads positions and recognises the radix phases', () => {
    expect(radixPad(5, 2)).toBe('05');
    expect(radixPad(12, 2)).toBe('12');
    expect(isRadixPhase('gather')).toBe(true);
    expect(isRadixPhase('compare')).toBe(false);
    expect(isRadixPhase(undefined)).toBe(false);
    expect(isSettledPhase('pass-complete')).toBe(true);
    expect(isSettledPhase('complete')).toBe(true);
    expect(isSettledPhase('distribute')).toBe(false);
  });

  it('falls back to the input array before the first step', () => {
    const state = radixState(null, [7, 42]);
    expect(state.phase).toBe('idle');
    expect(state.exponent).toBeNull();
    expect(state.maxDigits).toBe(2);
    expect(state.source).toEqual([
      { id: 'rdx-0', value: 7 },
      { id: 'rdx-1', value: 42 },
    ]);
    expect(state.output).toEqual(state.source);
    expect(state.buckets).toHaveLength(RADIX_BUCKET_COUNT);
    expect(state.buckets.every((items) => items.length === 0)).toBe(true);
    expect(state.activeId).toBeNull();
    expect(state.activeBucket).toBeNull();
  });

  it('treats a step without a radix phase as idle', () => {
    const step: SortStep = {
      array: [3, 1],
      comparing: [0, 1],
      swapping: null,
      sorted: [],
      boundary: 2,
      activeCodeLine: 1,
      description: 'x',
      phase: 'compare',
      digitIndex: 1,
    };
    const state = radixState(step, step.array);
    expect(state.phase).toBe('idle');
    expect(state.exponent).toBeNull();
    expect(state.maxDigits).toBe(1);
  });

  it('mirrors every generator step', () => {
    const steps = run([170, 45, 75, 90, 802, 24, 2, 66]);
    for (const step of steps) {
      const state = radixState(step, step.array);
      expect(state.phase).toBe(step.phase);
      expect(state.exponent).toBe(step.phase === 'idle' ? null : step.digitIndex);
      expect(state.maxDigits).toBe(3);
      expect(state.buckets).toHaveLength(RADIX_BUCKET_COUNT);
      expect(state.source).toHaveLength(8);
    }
  });

  it('lights the destination bin pink while scattering and the read bin cyan while gathering', () => {
    const steps = run([31, 12, 42, 5]);
    const scatter = steps.find((step) => step.phase === 'distribute' && step.activeItemId === 'rdx-2')!;
    const bins = radixBins(radixState(scatter, scatter.array));
    expect(bins[2]).toMatchObject({ tone: 'pink', count: 2 });
    expect(bins[2]!.cards.map((card) => [card.value, card.fresh])).toEqual([
      [12, false],
      [42, true],
    ]);
    expect(bins[1]).toMatchObject({ tone: 'idle', count: 1 });
    expect(bins[0]).toMatchObject({ tone: 'empty', count: 0 });

    const gather = steps.find((step) => step.phase === 'gather' && step.activeItemId === 'rdx-1')!;
    const read = radixBins(radixState(gather, gather.array));
    expect(read[2]).toMatchObject({ tone: 'cyan', count: 1 });
    expect(read[2]!.cards.every((card) => !card.fresh)).toBe(true);
    expect(read[2]!.cards[0]!.digits).toEqual(radixDigits(42, 2));

    const settled = steps[steps.length - 1]!;
    expect(radixBins(radixState(settled, settled.array)).every((bin) => bin.tone === 'empty')).toBe(true);
  });
});
