import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { kruskalsMstGenerator } from './kruskals-mst';
import type { SortStep } from '../models/sort-step';
import type { KruskalScenario } from '../utils/dsu-scenarios/dsu-scenarios';

function collectSteps(scenario: KruskalScenario): SortStep[] {
  return [...kruskalsMstGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('kruskals-mst', () => {
  it('accepts only the cheapest non-cycling edges into the MST', () => {
    const steps = collectSteps({
      kind: 'kruskal',
      graph: {
        sourceId: 'a',
        nodes: [
          { id: 'a', label: 'A', x: 0, y: 0 },
          { id: 'b', label: 'B', x: 1, y: 0 },
          { id: 'c', label: 'C', x: 2, y: 0 },
        ],
        edges: [
          { id: 'ab', from: 'a', to: 'b', weight: 1 },
          { id: 'bc', from: 'b', to: 'c', weight: 2 },
          { id: 'ac', from: 'a', to: 'c', weight: 5 },
        ],
      },
    });

    expect(steps[0]?.phase).toBeUndefined();
    expect(steps.at(-1)?.phase).toBe('graph-complete');
    expect(keyOf(steps.at(-1)?.dsu?.resultLabel)).toBe(
      'features.algorithms.runtime.dsu.kruskalsMst.labels.mstWeight',
    );
    expect(paramsOf(steps.at(-1)?.dsu?.resultLabel)?.weight).toBe(3);
    expect(keyOf(steps.at(-1)?.dsu?.statusLabel)).toBe(
      'features.algorithms.runtime.dsu.kruskalsMst.statuses.complete',
    );
    expect(steps.at(-1)?.dsu?.edges.filter((edge) => edge.status === 'accepted')).toHaveLength(2);
    expect(steps.at(-1)?.dsu?.edges.filter((edge) => edge.status === 'rejected')).toHaveLength(1);
  });
});
