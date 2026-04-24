import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { millerRabinGenerator } from './miller-rabin';
import type { SortStep } from '../../models/sort-step';
import type { MillerRabinScenario } from '../../utils/scenarios/number-lab/miller-rabin-scenarios';

function run(scenario: Omit<MillerRabinScenario, 'presetId' | 'presetLabel' | 'presetDescription' | 'taskPrompt'>): SortStep[] {
  return [
    ...millerRabinGenerator({
      ...scenario,
      presetId: 'spec',
      presetLabel: 'spec',
      presetDescription: 'spec',
      taskPrompt: null,
    }),
  ];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (label == null) return null;
  if (typeof label === 'string') return label;
  return isI18nText(label) ? label.key : null;
}

describe('miller-rabin', () => {
  it('declares 29 probably prime when witness 2 is provided', () => {
    const steps = run({ kind: 'miller-rabin', n: 29, witnesses: [2] });
    expect(steps.length).toBeGreaterThan(0);
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffPrime',
    );
  });

  it('exposes 25 as composite with witness 2 (chain 8 → 14 → 21 never hits 1 or n-1)', () => {
    const steps = run({ kind: 'miller-rabin', n: 25, witnesses: [2] });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffComposite',
    );
  });

  it('treats 7 as a strong liar for 25 (witness passes, verdict inconclusive)', () => {
    const steps = run({ kind: 'miller-rabin', n: 25, witnesses: [7] });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffPrime',
    );
  });

  it('catches the Carmichael 561 with witnesses {2, 3}', () => {
    const steps = run({ kind: 'miller-rabin', n: 561, witnesses: [2, 3] });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffComposite',
    );
  });

  it('reports probably prime across multiple witnesses for 13', () => {
    const steps = run({ kind: 'miller-rabin', n: 13, witnesses: [2, 3, 5, 7, 11] });
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffPrime',
    );
  });

  it('emits a setup line before any witness work', () => {
    const steps = run({ kind: 'miller-rabin', n: 29, witnesses: [2] });
    const firstLines = steps[0]?.scratchpadLab?.lines ?? [];
    expect(firstLines.some((line) => line.id === 'setup')).toBe(true);
  });

  it('stops the witness loop as soon as a compositeness witness is found', () => {
    // Witness 2 reveals 25 composite in its first iteration — the generator
    // breaks out of the loop and never processes witness 3.
    const steps = run({ kind: 'miller-rabin', n: 25, witnesses: [2, 3] });
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const secondWitnessHeader = lastLines.find((l) => l.id === 'witness-1-header');
    expect(secondWitnessHeader).toBeUndefined();
  });
});
