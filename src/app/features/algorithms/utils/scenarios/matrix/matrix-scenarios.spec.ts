import { describe, expect, it } from 'vitest';

import {
  createFloydWarshallScenario,
  createHungarianScenario,
} from './matrix-scenarios';

describe('matrix-scenarios', () => {
  it('switches between compact and large Floyd-Warshall matrices by size', () => {
    const compact = createFloydWarshallScenario(5);
    const large = createFloydWarshallScenario(6);

    expect(compact.labels).toHaveLength(5);
    expect(compact.matrix).toHaveLength(5);
    expect(compact.matrix[0]).toContain(null);

    expect(large.labels).toHaveLength(6);
    expect(large.matrix).toHaveLength(6);
    expect(large.matrix[5]?.[0]).toBe(5);
  });

  it('returns square Hungarian cost tables for both layouts', () => {
    const compact = createHungarianScenario(4);
    const large = createHungarianScenario(5);

    expect(compact.rowLabels).toHaveLength(4);
    expect(compact.colLabels).toHaveLength(4);
    expect(compact.costs.every((row) => row.length === 4)).toBe(true);

    expect(large.rowLabels).toHaveLength(5);
    expect(large.colLabels).toHaveLength(5);
    expect(large.costs.every((row) => row.length === 5)).toBe(true);
  });
});
