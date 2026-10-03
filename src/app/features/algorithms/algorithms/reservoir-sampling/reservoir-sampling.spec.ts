import { describe, expect, it } from 'vitest';

import { reservoirSamplingGenerator } from './reservoir-sampling';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import type { SortStep } from '../../models/sort-step';
import {
  createReservoirSamplingScenario,
  DEFAULT_RESERVOIR_SAMPLING_TASK_ID,
  RESERVOIR_SAMPLING_TASKS,
} from '../../utils/scenarios/number-lab/reservoir-sampling-scenarios';

function run(presetId: string = DEFAULT_RESERVOIR_SAMPLING_TASK_ID): SortStep[] {
  return [...reservoirSamplingGenerator(createReservoirSamplingScenario(0, presetId))];
}

function finalLines(steps: readonly SortStep[]): readonly ScratchpadLine[] {
  return steps.at(-1)?.scratchpadLab?.lines ?? [];
}

function contentOf(line: ScratchpadLine): string {
  return typeof line.content === 'string' ? line.content : `${line.content.key} ${JSON.stringify(line.content.params ?? {})}`;
}

function expectContains(lines: readonly ScratchpadLine[], fragment: string): void {
  expect(lines.map(contentOf).some((content) => content.includes(fragment))).toBe(true);
}

describe('reservoir-sampling', () => {
  it('uses short k=1 sampling as the default task', () => {
    expect(DEFAULT_RESERVOIR_SAMPLING_TASK_ID).toBe('short');
    expect(RESERVOIR_SAMPLING_TASKS.map((task) => task.id)).toEqual([
      'short',
      'fixed-k-updates',
      'predicate-reservoir',
      'weighted-reservoir',
      'distributed-merge',
    ]);
  });

  it('exposes per-task popup fields', () => {
    expect(Object.keys(RESERVOIR_SAMPLING_TASKS[0].inputSchema ?? {})).toEqual([
      'k',
      'stream',
      'random',
    ]);
    expect(Object.keys(RESERVOIR_SAMPLING_TASKS[1].inputSchema ?? {})).toEqual([
      'k',
      'stream',
      'draws',
    ]);
    expect(Object.keys(RESERVOIR_SAMPLING_TASKS[2].inputSchema ?? {})).toEqual([
      'k',
      'predicate',
      'stream',
      'draws_for_real_items',
    ]);
    expect(Object.keys(RESERVOIR_SAMPLING_TASKS[3].inputSchema ?? {})).toEqual([
      'k',
      'items',
      'key_formula',
    ]);
    expect(Object.keys(RESERVOIR_SAMPLING_TASKS[4].inputSchema ?? {})).toEqual([
      'k',
      'priority_mode',
      'shardA',
      'shardB',
      'shardC',
    ]);
  });

  it('renders the short k=1 reservoir sampling flow', () => {
    const steps = run('short');
    const last = steps.at(-1)?.scratchpadLab;
    const lines = finalLines(steps);

    expect(last?.margins).toEqual([]);
    expect(last?.resultLabel).toBeNull();
    expect(lines.find((line) => line.id === 'section-result')).toMatchObject({
      marker: '✓',
      content: { key: 'features.algorithms.runtime.scratchpadLab.sections.result' },
    });
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.stream {"stream":"[A, B, C, D, E, F]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneCompare {"i":3,"item":"C","draw":"0.20","threshold":"0.333..."}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneAccept {"draw":"0.10","threshold":"0.20","reservoir":"[E]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkAResult');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkEResult');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[E]"}');
  });

  it('renders fixed k updates with replacement indices', () => {
    const lines = finalLines(run('fixed-k-updates'));

    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[a, b, c]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedReplace {"draw":2,"k":3,"reservoir":"[a, d, c]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedSkip {"draw":5,"k":3,"reservoir":"[a, d, c]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedReplace {"draw":1,"k":3,"reservoir":"[f, d, c]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedReplace {"draw":3,"k":3,"reservoir":"[f, d, g]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[f, d, g]"}');
  });

  it('renders predicate reservoir sampling with a real counter', () => {
    const lines = finalLines(run('predicate-reservoir'));

    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicate {"predicate":"status == ERROR"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateIgnore {"index":1,"item":"(1, OK)","r":0');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateReplace {"index":5,"item":"(5, ERROR)","r":3,"draw":1,"k":2');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateSkip {"index":7,"item":"(7, ERROR)","r":4,"draw":4');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[(5, ERROR), (4, ERROR)]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.predicateCounter');
  });

  it('renders weighted reservoir sampling by priority keys', () => {
    const lines = finalLines(run('weighted-reservoir'));

    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.keyFormula {"formula":"u^(1 / weight)"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.weightedKey {"label":"A","weight":"1","u":"0.64","key":"0.6400"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.weightedKey {"label":"C","weight":"4","u":"0.81","key":"0.9487"}');
    expectContains(lines, 'C: 0.9487');
    expectContains(lines, 'E: 0.9000');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[C, E]"}');
  });

  it('renders distributed reservoir merge by global priority', () => {
    const lines = finalLines(run('distributed-merge'));

    expectContains(lines, 'A_local = [(a4, 0.05), (a2, 0.15)]');
    expectContains(lines, 'B_local = [(b3, 0.11), (b1, 0.20)]');
    expectContains(lines, 'C_local = [(c5, 0.02), (c2, 0.07)]');
    expectContains(lines, 'c5: 0.02');
    expectContains(lines, 'a4: 0.05');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir {"reservoir":"[(c5, 0.02), (a4, 0.05)]"}');
  });
});
