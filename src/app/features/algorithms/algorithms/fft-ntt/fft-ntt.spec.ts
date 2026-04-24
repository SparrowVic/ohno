import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { fftNttGenerator } from './fft-ntt';
import type { SortStep } from '../../models/sort-step';
import type { FftNttScenario } from '../../utils/scenarios/number-lab/fft-ntt-scenarios';

function run(input: readonly number[]): SortStep[] {
  const scenario: FftNttScenario = {
    kind: 'fft-ntt',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    input,
  };
  return [...fftNttGenerator(scenario)];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label) return null;
  if (typeof label === 'string') return label;
  return isI18nText(label) ? label.key : null;
}

function signoffSpectrum(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  const params = label.params;
  return typeof params?.['spectrum'] === 'string'
    ? (params['spectrum'] as string)
    : null;
}

describe('fft-ntt', () => {
  it('computes the canonical 4-point DFT of [1, 2, 3, 4] to [10, -2+2i, -2, -2-2i]', () => {
    const steps = run([1, 2, 3, 4]);
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.fftNtt.result.signoff',
    );
    const spectrum = signoffSpectrum(steps.at(-1));
    expect(spectrum).toContain('10');
    expect(spectrum).toContain('-2 + 2i');
    expect(spectrum).toContain('-2 - 2i');
  });

  it('returns a real-valued DC bin equal to the sum of inputs for any power-of-two input', () => {
    const steps = run([2, 4, 6, 8, 10, 12, 14, 16]);
    // DC bin = sum = 72.
    const spectrum = signoffSpectrum(steps.at(-1));
    expect(spectrum).toContain('72');
  });

  it('rejects non-power-of-two input lengths with the invalid-result branch', () => {
    const steps = run([1, 2, 3]);
    const lastLine = steps.at(-1)?.scratchpadLab?.lines.at(-1);
    expect(lastLine?.id).toBe('result-invalid');
  });

  it('emits one butterfly line per (stage, block, j) triple for a 4-point run', () => {
    const steps = run([1, 2, 3, 4]);
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const butterflies = lastLines.filter((l) =>
      /^stage-\d+-block-\d+-j-\d+$/.test(l.id),
    );
    // N=4: stage 1 has 2 blocks × 1 butterfly = 2; stage 2 has 1
    // block × 2 butterflies = 2. Total = 4.
    expect(butterflies.length).toBe(4);
  });
});
