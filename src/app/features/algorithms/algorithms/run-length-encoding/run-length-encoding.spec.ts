import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { RleScenario } from '../../utils/scenarios/string/string-scenarios';
import { runLengthEncodingGenerator } from './run-length-encoding';

function collectSteps(scenario: RleScenario): SortStep[] {
  return [...runLengthEncodingGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('run-length-encoding', () => {
  it('emits compressed runs and reports a positive compression ratio', () => {
    const steps = collectSteps({
      kind: 'run-length-encoding',
      presetId: 'spec-runs',
      presetLabel: 'Spec Runs',
      presetDescription: 'Long repeated runs should shrink the output.',
      source: 'AAABBCCCC',
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.string?.resultLabel).toBe('3A2B4C');
    expect(keyOf(steps.at(-1)?.string?.decisionLabel)).toBe(
      'features.algorithms.runtime.string.runLengthEncoding.decisions.compressionSaves',
    );
    expect(steps.at(-1)?.string?.compressionRatio).toBeLessThan(1);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.runLengthEncoding.phases.extend',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.runLengthEncoding.phases.emit',
      ),
    ).toBe(true);
  });

  it('surfaces the no-gain path for singleton-heavy input', () => {
    const steps = collectSteps({
      kind: 'run-length-encoding',
      presetId: 'spec-no-gain',
      presetLabel: 'Spec No Gain',
      presetDescription: 'Every character forms its own run.',
      source: 'ABC',
    });

    expect(steps.at(-1)?.string?.resultLabel).toBe('1A1B1C');
    expect(keyOf(steps.at(-1)?.string?.decisionLabel)).toBe(
      'features.algorithms.runtime.string.runLengthEncoding.decisions.noCompressionGain',
    );
    expect(steps.at(-1)?.string?.completedRuns).toHaveLength(3);
  });
});
