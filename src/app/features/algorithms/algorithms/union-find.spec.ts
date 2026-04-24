import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { unionFindGenerator } from './union-find';
import type { SortStep } from '../models/sort-step';
import type { UnionFindScenario } from '../utils/scenarios/dsu/dsu-scenarios';

function collectSteps(scenario: UnionFindScenario): SortStep[] {
  return [...unionFindGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('union-find', () => {
  it('merges components and compresses paths across the operation queue', () => {
    const steps = collectSteps({
      kind: 'union-find',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      operations: [
        { kind: 'union', a: 'a', b: 'b' },
        { kind: 'find', a: 'b' },
        { kind: 'union', a: 'b', b: 'c' },
      ],
    });

    expect(steps[0]?.phase).toBeUndefined();
    expect(steps.at(-1)?.phase).toBe('graph-complete');
    expect(keyOf(steps.at(-1)?.dsu?.resultLabel)).toBe(
      'features.algorithms.runtime.dsu.unionFind.labels.activeSets',
    );
    expect(paramsOf(steps.at(-1)?.dsu?.resultLabel)?.count).toBe(1);
    expect(keyOf(steps.at(-1)?.dsu?.statusLabel)).toBe(
      'features.algorithms.runtime.dsu.unionFind.statuses.complete',
    );
    expect(
      steps.some(
        (step) =>
          keyOf(step.dsu?.statusLabel) ===
          'features.algorithms.runtime.dsu.unionFind.statuses.pathCompression',
      ),
    ).toBe(true);
  });
});
