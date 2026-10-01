import { describe, expect, it } from 'vitest';

import { getAlgorithmViewConfig } from '../../algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import {
  configHasTasks,
  createRandomArray,
  defaultPresetId,
  presetOptionsOf,
  resolvePresetId,
  resolveTaskId,
} from './scenario.utils';

const bubble = getAlgorithmViewConfig('bubble-sort');
const knapsack = getAlgorithmViewConfig('knapsack-01');
const gcd = getAlgorithmViewConfig('euclidean-gcd');

describe('configHasTasks', () => {
  it('recognises task-based configs only', () => {
    expect(configHasTasks(gcd)).toBe(true);
    expect(configHasTasks(bubble)).toBe(false);
    expect(configHasTasks(null)).toBe(false);
  });
});

describe('presetOptionsOf', () => {
  it('returns the preset list for preset kinds and nothing for arrays or task configs', () => {
    expect(presetOptionsOf(knapsack).length).toBeGreaterThan(0);
    expect(presetOptionsOf(bubble)).toEqual([]);
    expect(presetOptionsOf(gcd)).toEqual([]);
    expect(presetOptionsOf(null)).toEqual([]);
  });
});

describe('resolvePresetId', () => {
  it('keeps a known preset and falls back to the default', () => {
    const fallback = defaultPresetId(knapsack);
    const known = presetOptionsOf(knapsack).at(-1)!.id;
    expect(resolvePresetId(knapsack, known)).toBe(known);
    expect(resolvePresetId(knapsack, 'missing')).toBe(fallback);
    expect(resolvePresetId(bubble, 'anything')).toBeNull();
  });
});

describe('resolveTaskId', () => {
  it('keeps a known task and falls back to the default or the first task', () => {
    if (!configHasTasks(gcd)) throw new Error('gcd must have tasks');
    const last = gcd.tasks.at(-1)!.id;
    expect(resolveTaskId(gcd, last)).toBe(last);
    expect(resolveTaskId(gcd, 'missing')).toBe(gcd.defaultTaskId ?? gcd.tasks[0]!.id);
  });
});

describe('createRandomArray', () => {
  it('draws values inside the range', () => {
    const values = createRandomArray(5, { min: 10, max: 12 }, () => 0.999);
    expect(values).toEqual([12, 12, 12, 12, 12]);
    expect(createRandomArray(3, { min: 1, max: 99 }, () => 0)).toEqual([1, 1, 1]);
  });
});
