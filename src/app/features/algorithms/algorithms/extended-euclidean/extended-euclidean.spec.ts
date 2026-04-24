import { describe, expect, it } from 'vitest';

import { createExtendedEuclideanScenario } from '../../utils/scenarios/number-lab/extended-euclidean-scenarios';
import { extendedEuclideanGenerator } from './extended-euclidean';
import type { SortStep } from '../../models/sort-step';
import type { ExtendedEuclideanScenario } from '../../utils/scenarios/number-lab/extended-euclidean-scenarios';

function run(scenario: ExtendedEuclideanScenario): SortStep[] {
  return [...extendedEuclideanGenerator(scenario)];
}

function scenario(
  values: Pick<ExtendedEuclideanScenario, 'a' | 'b' | 'notebookFlow'>,
): ExtendedEuclideanScenario {
  return {
    kind: 'extended-euclidean',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    ...values,
  };
}

function lineIds(step: SortStep | undefined): string[] {
  return (step?.scratchpadLab?.lines ?? []).map((line) => line.id);
}

describe('extendedEuclideanGenerator', () => {
  it('uses the short Bézout task as the default scenario', () => {
    const generated = createExtendedEuclideanScenario(1, null);
    expect(generated.presetId).toBe('short');
    expect(generated.a).toBe(60);
    expect(generated.b).toBe(48);
  });

  it('copies task-specific custom values into notebook flow parameters', () => {
    const rsa = createExtendedEuclideanScenario(1, 'rsa-inverse', {
      n: 391,
      a: 352,
      b: 3,
    });
    expect(rsa.notebookFlow).toEqual({ kind: 'rsa-inverse', n: 391 });

    const diophantine = createExtendedEuclideanScenario(1, 'diophantine-logistics', {
      a: 84,
      b: 36,
      target: 24,
    });
    expect(diophantine.notebookFlow).toEqual({
      kind: 'linear-diophantine',
      target: 24,
      minimize: true,
    });

    const modular = createExtendedEuclideanScenario(1, 'modular-equation-trap', {
      a: 221,
      b: 143,
      rhs: 26,
    });
    expect(modular.notebookFlow).toEqual({ kind: 'modular-equation', rhs: 26 });
  });

  it('derives RSA private exponent d = 11 for phi(n) = 192 and e = 35', () => {
    const steps = run(scenario({ a: 192, b: 35, notebookFlow: { kind: 'rsa-inverse', n: 221 } }));
    expect(steps.at(-1)?.scratchpadLab?.resultLabel).toBeNull();

    expect(lineIds(steps.at(-1))).toEqual(
      expect.arrayContaining([
        'section-forward',
        'fwd-0',
        'fwd-1',
        'fwd-2',
        'section-gcd',
        'section-check',
        'section-back',
        'back-seed',
        'back-source-1',
        'back-substitute-1',
        'back-expand-1',
        'back-collect-1',
        'section-result',
        'rsa-inverse-result',
        'rsa-private-key',
        'rsa-check-label',
        'rsa-product-check',
        'rsa-modulo-check',
        'rsa-interpretation-label',
        'rsa-pair',
        'rsa-identity',
      ]),
    );
    const finalLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    expect(finalLines.find((line) => line.id === 'fwd-0')?.caption).toBeNull();
    expect(finalLines.find((line) => line.id === 'back-substitute-1')?.caption).toBeNull();
    expect(finalLines.find((line) => line.id === 'section-result')?.kind).toBe('result');
    expect(finalLines.find((line) => line.id === 'rsa-private-key')?.kind).toBe('equation');
    expect(finalLines.find((line) => line.id === 'rsa-identity')?.kind).toBe('equation');
  });

  it('stops the modular-equation trap after gcd divisibility fails', () => {
    const steps = run(
      scenario({ a: 221, b: 143, notebookFlow: { kind: 'modular-equation', rhs: 55 } }),
    );
    expect(steps.at(-1)?.scratchpadLab?.resultLabel).toBeNull();
    const finalLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    expect(finalLines.some((line) => line.id.startsWith('back-'))).toBe(false);
    expect(finalLines.some((line) => line.id === 'modular-equation-no-solution-result')).toBe(true);
  });

  it('scales Bézout coefficients into the Diophantine general solution', () => {
    const steps = run(
      scenario({
        a: 84,
        b: 36,
        notebookFlow: { kind: 'linear-diophantine', target: 12, minimize: true },
      }),
    );
    expect(steps.at(-1)?.scratchpadLab?.resultLabel).toBeNull();
    expect(lineIds(steps.at(-1))).toEqual(
      expect.arrayContaining([
        'diophantine-general-x',
        'diophantine-general-y',
        'diophantine-minimal-x',
        'diophantine-minimal',
      ]),
    );
  });
});
