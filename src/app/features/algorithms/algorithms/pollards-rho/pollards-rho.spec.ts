import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { pollardsRhoGenerator } from './pollards-rho';
import type { SortStep } from '../../models/sort-step';
import type { PollardsRhoScenario } from '../../utils/scenarios/number-lab/pollards-rho-scenarios';

function run(opts: { n: number; c: number; x0: number; max?: number }): SortStep[] {
  const scenario: PollardsRhoScenario = {
    kind: 'pollards-rho',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    n: opts.n,
    c: opts.c,
    x0: opts.x0,
    maxIterations: opts.max ?? 50,
  };
  return [...pollardsRhoGenerator(scenario)];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  return label.key;
}

function signoffParams(step: SortStep | undefined): Record<string, unknown> | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  return { ...(label.params ?? {}) };
}

describe('pollards-rho', () => {
  it('factors 91 into 7 · 13 on the first iteration with c = 1, x0 = 2', () => {
    const steps = run({ n: 91, c: 1, x0: 2 });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffSuccess',
    );
    expect(signoffParams(steps.at(-1))).toMatchObject({ n: 91, factor: 7, quotient: 13 });
  });

  it('factors 8051 and reports a non-trivial factor (83 or 97)', () => {
    const steps = run({ n: 8051, c: 1, x0: 2 });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffSuccess',
    );
    const params = signoffParams(steps.at(-1));
    const factor = params?.['factor'] as number;
    expect([83, 97]).toContain(factor);
    expect(params?.['quotient']).toBe(8051 / factor);
  });

  it('reports failure for a prime input (n = 53): tortoise catches hare without a factor', () => {
    const steps = run({ n: 53, c: 1, x0: 2 });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffFailure',
    );
  });

  it('emits one iteration line per Floyd step taken', () => {
    const steps = run({ n: 91, c: 1, x0: 2 });
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const iterLines = lastLines.filter((l) => /^iter-\d+$/.test(l.id));
    expect(iterLines.length).toBeGreaterThanOrEqual(1);
  });

  it('respects the maxIterations cap and falls back to an exhausted outcome', () => {
    // Tiny cap forces the generator to bail before finding 97 for 8051.
    const steps = run({ n: 8051, c: 1, x0: 2, max: 1 });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffFailure',
    );
  });
});
