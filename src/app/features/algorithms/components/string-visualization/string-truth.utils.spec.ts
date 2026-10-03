import { describe, expect, it } from 'vitest';

import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { manacherGenerator } from '../../algorithms/manacher/manacher';
import { runLengthEncodingGenerator } from '../../algorithms/run-length-encoding/run-length-encoding';
import { KmpTraceState, ManacherTraceState, RleTraceState } from '../../models/string';
import { createKmpScenario, createManacherScenario, createRleScenario } from '../../utils/scenarios/string/string-scenarios';
import { kmpTruth, manacherTruth, rleTruth } from './string-truth.utils';

describe('string truth', () => {
  it('hides KMP matches that the scan has not reached yet', () => {
    const base = createKmpScenario(20, 'default');
    const steps = [...kmpPatternMatchingGenerator({ ...base, text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' })];
    const states = steps.map((step) => step.string as KmpTraceState);
    expect(kmpTruth(states[0]!).matches).toEqual([]);
    const hit = states.find((state) => state.fallbackFrom === state.pattern.length)!;
    expect(kmpTruth(hit).matches).toEqual([10]);
    expect(kmpTruth(states.at(-1)!).matches).toEqual([10]);
  });

  it('keeps Manacher radii only up to the current center', () => {
    const steps = [...manacherGenerator(createManacherScenario(10, 'default'))];
    const state = steps.map((step) => step.string as ManacherTraceState).find((entry) => entry.currentCenter === 3)!;
    const truth = manacherTruth(state);
    expect(truth.radii.slice(4).every((value) => value === 0)).toBe(true);
    expect(truth.radii[3]).toBe(state.activeRadius);
  });

  it('keeps only the RLE runs already written to the output', () => {
    const steps = [...runLengthEncodingGenerator(createRleScenario(10, 'default'))];
    const states = steps.map((step) => step.string as RleTraceState);
    for (const state of states) {
      const truth = rleTruth(state);
      expect(truth.completedRuns.map((run) => `${run.count}${run.char}`).join('')).toBe(state.output);
    }
  });
});
