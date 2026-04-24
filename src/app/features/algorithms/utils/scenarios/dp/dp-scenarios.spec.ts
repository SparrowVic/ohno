import { describe, expect, it } from 'vitest';

import {
  createBitmaskDpScenario,
  createEditDistanceScenario,
  createKnapsackScenario,
  createProfileDpScenario,
  createSosDpScenario,
  createTravelingSalesmanScenario,
} from './dp-scenarios';

describe('dp-scenarios', () => {
  it('builds knapsack scenarios with bounded capacity below the full weight sum', () => {
    const scenario = createKnapsackScenario(4, 'heist');
    const totalWeight = scenario.items.reduce((sum, item) => sum + item.weight, 0);

    expect(scenario.kind).toBe('knapsack-01');
    expect(scenario.items).toHaveLength(4);
    expect(scenario.capacity).toBeGreaterThanOrEqual(5);
    expect(scenario.capacity).toBeLessThan(totalWeight);
  });

  it('applies preset-specific length rules for edit distance examples', () => {
    const scenario = createEditDistanceScenario(8, 'plural');

    expect(scenario.kind).toBe('edit-distance');
    expect(scenario.source).toHaveLength(8);
    expect(scenario.target).toHaveLength(9);
  });

  it('falls back to the first bitmask preset and enforces a minimum matrix size', () => {
    const scenario = createBitmaskDpScenario(2, 'missing-preset');

    expect(scenario.presetId).toBe('robots');
    expect(scenario.workers).toHaveLength(3);
    expect(scenario.jobs).toHaveLength(3);
    expect(scenario.costs.every((row) => row.length === 3)).toBe(true);
  });

  it('clamps SOS mask dimensions and profile grid width', () => {
    const sos = createSosDpScenario(10, 'cache');
    const profile = createProfileDpScenario(2, 'lab');

    expect(sos.bitCount).toBe(4);
    expect(sos.baseValues).toHaveLength(16);
    expect(sos.focusMask).toBeLessThanOrEqual(15);

    expect(profile.columns).toBe(4);
    expect(profile.height).toBe(2);
  });

  it('creates square traveling salesman distance matrices', () => {
    const scenario = createTravelingSalesmanScenario(4, 'metro');

    expect(scenario.labels).toHaveLength(4);
    expect(scenario.distances).toHaveLength(4);
    expect(scenario.distances.every((row) => row.length === 4)).toBe(true);
    expect(scenario.startIndex).toBe(0);
  });
});
