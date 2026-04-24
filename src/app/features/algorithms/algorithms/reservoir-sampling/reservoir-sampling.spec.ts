import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { reservoirSamplingGenerator } from './reservoir-sampling';
import type { SortStep } from '../../models/sort-step';
import type { ReservoirSamplingScenario } from '../../utils/scenarios/number-lab/reservoir-sampling-scenarios';

function run(
  stream: readonly number[],
  reservoirSize: number,
  seed: number,
): SortStep[] {
  const scenario: ReservoirSamplingScenario = {
    kind: 'reservoir-sampling',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    stream,
    reservoirSize,
    seed,
  };
  return [...reservoirSamplingGenerator(scenario)];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label) return null;
  if (typeof label === 'string') return label;
  return isI18nText(label) ? label.key : null;
}

function signoffReservoir(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  const params = label.params;
  return typeof params?.['reservoir'] === 'string'
    ? (params['reservoir'] as string)
    : null;
}

describe('reservoir-sampling', () => {
  it('produces a deterministic k=3 sample from the canonical stream', () => {
    const steps = run([5, 3, 8, 1, 9, 2, 7, 4], 3, 42);
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.result.signoff',
    );
    // Same seed + same stream = same output across runs.
    const again = run([5, 3, 8, 1, 9, 2, 7, 4], 3, 42);
    expect(signoffReservoir(steps.at(-1))).toBe(signoffReservoir(again.at(-1)));
  });

  it('keeps the entire stream when k >= stream.length (fill phase covers all)', () => {
    const steps = run([11, 22, 33], 5, 7);
    const reservoirDisplay = signoffReservoir(steps.at(-1));
    expect(reservoirDisplay).toContain('11');
    expect(reservoirDisplay).toContain('22');
    expect(reservoirDisplay).toContain('33');
  });

  it('emits exactly k fill lines + (n - k) sample-iteration headers', () => {
    const steps = run([1, 2, 3, 4, 5], 2, 1);
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const fillLines = lastLines.filter((l) => /^fill-\d+$/.test(l.id));
    const sampleHeaders = lastLines.filter((l) => /^sample-\d+-header$/.test(l.id));
    expect(fillLines.length).toBe(2);
    expect(sampleHeaders.length).toBe(3);
  });

  it('different seeds can yield different samples on the same stream', () => {
    const stepsA = run([1, 2, 3, 4, 5, 6, 7, 8], 2, 1);
    const stepsB = run([1, 2, 3, 4, 5, 6, 7, 8], 2, 99999);
    const a = signoffReservoir(stepsA.at(-1));
    const b = signoffReservoir(stepsB.at(-1));
    // Not strictly guaranteed for every (seed_a, seed_b) pair, but our
    // LCG + these specific seeds produce different reservoirs.
    expect(a).not.toBe(b);
  });
});
