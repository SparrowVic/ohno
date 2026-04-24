import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import {
  DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
  GAUSSIAN_ELIMINATION_TASKS,
  createGaussianEliminationScenario,
} from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';
import { gaussianEliminationGenerator } from './gaussian-elimination';

function runTask(taskId: string): SortStep[] {
  const scenario = createGaussianEliminationScenario(0, taskId);
  return [...gaussianEliminationGenerator(scenario)];
}

function finalContents(steps: readonly SortStep[]): string {
  return (steps.at(-1)?.scratchpadLab?.lines ?? [])
    .map((line) => (typeof line.content === 'string' ? line.content : line.content.key))
    .join('\n');
}

function finalLines(steps: readonly SortStep[]) {
  return steps.at(-1)?.scratchpadLab?.lines ?? [];
}

describe('gaussian-elimination tasks', () => {
  it('keeps the intended task order and default task', () => {
    expect(DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID).toBe('short');
    expect(GAUSSIAN_ELIMINATION_TASKS.map((task) => task.id)).toEqual([
      'short',
      'row-swap',
      'fraction-pivots',
      'infinite-solutions',
      'inconsistent-system',
    ]);
  });

  it('formats task prompts as multiline equation blocks', () => {
    const scenario = createGaussianEliminationScenario(0, 'row-swap');
    const prompt =
      typeof scenario.taskPrompt === 'string'
        ? scenario.taskPrompt
        : (scenario.taskPrompt?.key ?? '');

    expect(prompt).toContain('[[math]]y + z = 5[[/math]]');
    expect(prompt).toContain('\n[[math]]x + y + z = 6[[/math]]');
    expect(scenario.notebookFlow.kind).toBe('row-swap');
  });
});

describe('gaussian-elimination notebook', () => {
  it('solves the start task with forward elimination, back elimination and final result', () => {
    const contents = finalContents(runTask('short'));

    expect(contents).toContain('Eliminacja w przód');
    expect(contents).toContain('R_2 \\leftarrow R_2 - R_1');
    expect(contents).toContain('Eliminacja wstecz');
    expect(contents).toContain('R_1 \\leftarrow R_1 - R_2');
    expect(contents).toContain('Wynik');
    expect(contents).toContain('x = 3');
    expect(contents).toContain('y = 2');
  });

  it('shows the row swap flow before solving the 3x3 system', () => {
    const contents = finalContents(runTask('row-swap'));

    expect(contents).toContain('R_1 \\leftrightarrow R_2');
    expect(contents).toContain('R_3 \\leftarrow R_3 + 3R_2');
    expect(contents).toContain('x = 1');
    expect(contents).toContain('y = 2');
    expect(contents).toContain('z = 3');
  });

  it('keeps fractional pivot calculations visible', () => {
    const contents = finalContents(runTask('fraction-pivots'));

    expect(contents).toContain('R_1 \\leftarrow R_1 / 2');
    expect(contents).toContain('1/2');
    expect(contents).toContain('R_3 \\leftarrow R_3 / (-1)');
    expect(contents).toContain('x = 2');
    expect(contents).toContain('y = 3');
    expect(contents).toContain('z = -1');
  });

  it('renders a parametric result for infinitely many solutions', () => {
    const contents = finalContents(runTask('infinite-solutions'));

    expect(contents).toContain('Zmienne wolne');
    expect(contents).toContain('z = t');
    expect(contents).toContain('x = 3 - (1/2)t');
    expect(contents).toContain('y = 3 - (1/2)t');
    expect(contents).toContain('t \\in \\mathbb{R}');
  });

  it('stops with a no-result marker for an inconsistent system', () => {
    const steps = runTask('inconsistent-system');
    const contents = finalContents(steps);
    const noResultLine = finalLines(steps).find((line) => line.id === 'section-no-result');

    expect(contents).toContain('Sprzeczność');
    expect(contents).toContain('0 = 1');
    expect(contents).toContain('Brak rozwiązania');
    expect(noResultLine?.marker).toBe('×');
  });

  it('does not emit legacy margins or result labels', () => {
    for (const task of GAUSSIAN_ELIMINATION_TASKS) {
      const steps = runTask(task.id);
      for (const step of steps) {
        expect(step.scratchpadLab?.margins).toEqual([]);
        expect(step.scratchpadLab?.resultLabel).toBeNull();
      }
    }
  });
});
