import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
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

function line(step: SortStep | undefined, id: string) {
  return step?.scratchpadLab?.lines.find((candidate) => candidate.id === id);
}

function lineExpression(step: SortStep | undefined, id: string): string | null {
  const content = line(step, id)?.content;
  if (!isI18nText(content)) return null;
  return typeof content.params?.['expression'] === 'string' ? content.params['expression'] : null;
}

describe('extendedEuclideanGenerator', () => {
  it('uses the short Bézout task as the default scenario', () => {
    const generated = createExtendedEuclideanScenario(1, null);
    expect(generated.presetId).toBe('short');
    expect(generated.a).toBe(60);
    expect(generated.b).toBe(48);

    const steps = run(generated);
    expect(lineExpression(steps.at(-1), 'result-line')).toBe('12 = 1 \\cdot 60 + (-1) \\cdot 48');
    expect(lineIds(steps.at(-1))).not.toContain('result-check');
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
        'section-rsa-conclusion',
        'rsa-gcd-conclusion',
        'rsa-inverse-check',
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
    expect(lineExpression(steps.at(-1), 'back-substitute-1')).toBe(
      '1 = 35 - 2 \\cdot (192 - 5 \\cdot 35)',
    );
  });

  it('stops the modular-equation trap after gcd divisibility fails', () => {
    const steps = run(
      scenario({ a: 221, b: 143, notebookFlow: { kind: 'modular-equation', rhs: 55 } }),
    );
    expect(steps.at(-1)?.scratchpadLab?.resultLabel).toBeNull();
    const finalLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    expect(finalLines.some((line) => line.id.startsWith('back-'))).toBe(false);
    expect(finalLines.some((line) => line.id === 'modular-equation-no-solution-result')).toBe(
      false,
    );
    expect(lineIds(steps.at(-1))).toEqual(
      expect.arrayContaining([
        'modular-equation-condition-formula',
        'modular-equation-gcd-check',
        'modular-equation-not-divides',
        'section-no-result',
      ]),
    );
    expect(line(steps.at(-1), 'section-no-result')?.kind).toBe('result');
    expect(line(steps.at(-1), 'section-no-result')?.marker).toBe('×');
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
        'diophantine-target-multiple',
        'diophantine-back-target',
        'diophantine-general-template-x',
        'diophantine-general-template-y',
        'diophantine-general-x',
        'diophantine-general-y',
        'section-result',
        'diophantine-minimal-x',
        'diophantine-minimal',
      ]),
    );
    expect(line(steps.at(-1), 'section-result')?.marker).toBe('✓');
  });

  it('keeps the Fibonacci chain written out like the task sheet', () => {
    const steps = run(createExtendedEuclideanScenario(1, 'fibonacci-chain'));
    expect(steps.at(-1)?.scratchpadLab?.resultLabel).toBeNull();
    expect(lineExpression(steps.at(-1), 'back-substitute-2')).toBe(
      '1 = 2 \\cdot (8 - 1 \\cdot 5) - 1 \\cdot 5',
    );
    expect(lineExpression(steps.at(-1), 'result-line')).toBe('1 = (-21) \\cdot 89 + 34 \\cdot 55');
    expect(lineExpression(steps.at(-1), 'result-check')).toBe(
      '(-21) \\cdot 89 + 34 \\cdot 55 = -1869 + 1870 = 1',
    );
  });
});
