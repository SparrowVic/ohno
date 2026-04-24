import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { crtGenerator } from './crt';
import type { SortStep } from '../../models/sort-step';
import type { CrtScenario } from '../../utils/scenarios/number-lab/crt-scenarios';

function run(
  congruences: readonly { residue: number; modulus: number }[],
): SortStep[] {
  const scenario: CrtScenario = {
    kind: 'crt',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    congruences,
  };
  return [...crtGenerator(scenario)];
}

function signoffParams(step: SortStep | undefined): Record<string, unknown> | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  return { ...(label.params ?? {}) };
}

describe('crt', () => {
  it('solves the classic 3-congruence system (x ≡ 2, 3, 2 mod 3, 5, 7) to 23 mod 105', () => {
    const steps = run([
      { residue: 2, modulus: 3 },
      { residue: 3, modulus: 5 },
      { residue: 2, modulus: 7 },
    ]);
    expect(signoffParams(steps.at(-1))).toEqual({ x: 23, M: 105 });
  });

  it('solves a minimal 2-congruence system (x ≡ 1, 2 mod 5, 7) to 16 mod 35', () => {
    const steps = run([
      { residue: 1, modulus: 5 },
      { residue: 2, modulus: 7 },
    ]);
    expect(signoffParams(steps.at(-1))).toEqual({ x: 16, M: 35 });
  });

  it('handles the 9·11·13 system down to x ≡ 58 mod 1287', () => {
    const steps = run([
      { residue: 4, modulus: 9 },
      { residue: 3, modulus: 11 },
      { residue: 6, modulus: 13 },
    ]);
    expect(signoffParams(steps.at(-1))).toEqual({ x: 58, M: 1287 });
  });

  it('emits a goal line anchoring the entire construction', () => {
    const steps = run([
      { residue: 1, modulus: 5 },
      { residue: 2, modulus: 7 },
    ]);
    const firstLines = steps[0]?.scratchpadLab?.lines ?? [];
    expect(firstLines.some((line) => line.id === 'goal')).toBe(true);
  });

  it('produces one partial-term block per congruence', () => {
    const steps = run([
      { residue: 2, modulus: 3 },
      { residue: 3, modulus: 5 },
      { residue: 2, modulus: 7 },
    ]);
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const termHeaders = lastLines.filter((l) => /^term-\d+-header$/.test(l.id));
    expect(termHeaders.length).toBe(3);
  });
});
