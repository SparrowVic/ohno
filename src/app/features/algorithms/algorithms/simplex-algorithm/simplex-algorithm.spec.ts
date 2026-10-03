import { describe, expect, it } from 'vitest';

import { simplexAlgorithmGenerator } from './simplex-algorithm';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import type { SortStep } from '../../models/sort-step';
import {
  createSimplexAlgorithmScenario,
  DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
  SIMPLEX_ALGORITHM_TASKS,
} from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';

function run(presetId: string = DEFAULT_SIMPLEX_ALGORITHM_TASK_ID): SortStep[] {
  return [...simplexAlgorithmGenerator(createSimplexAlgorithmScenario(0, presetId))];
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

describe('simplex-algorithm', () => {
  it('uses the basic max-profit task as default', () => {
    expect(DEFAULT_SIMPLEX_ALGORITHM_TASK_ID).toBe('short');
    expect(SIMPLEX_ALGORITHM_TASKS.map((task) => task.id)).toEqual([
      'short',
      'slack-non-binding',
      'degenerate-tie',
      'alternative-optimum',
      'unbounded-ray',
    ]);
  });

  it('keeps objective and constraints as editable popup fields for every task', () => {
    for (const task of SIMPLEX_ALGORITHM_TASKS) {
      expect(Object.keys(task.inputSchema ?? {})).toEqual(['objective', 'constraints']);
    }
  });

  it('renders the short two-pivot optimum', () => {
    const steps = run('short');
    const last = steps.at(-1)?.scratchpadLab;
    const lines = finalLines(steps);

    expect(last?.margins).toEqual([]);
    expect(last?.resultLabel).toBeNull();
    expect(lines.find((line) => line.id === 'section-result')).toMatchObject({
      marker: '✓',
      content: { key: 'features.algorithms.runtime.scratchpadLab.sections.result' },
    });
    expectContains(lines, 'max\\ z = 40x + 30y');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.entering {"name":"x"');
    expectContains(lines, 's_2: 16 / 2 = 8');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.entering {"name":"y"');
    expectContains(lines, 's_1: 4 / 0.5 = 8');
    expectContains(lines, 'x = 4,\\; y = 8');
    expectContains(lines, 'z = 400');
  });

  it('renders a non-binding constraint via positive slack', () => {
    const lines = finalLines(run('slack-non-binding'));

    expectContains(lines, 'max\\ z = 3x + 5y');
    expectContains(lines, 's_1 = 2');
    expectContains(lines, 's_2 = 0');
    expectContains(lines, 's_3 = 0');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.notes.slackPositive {"slacks":"s_1"}');
    expectContains(lines, 'x = 2,\\; y = 6');
    expectContains(lines, 'z = 36');
  });

  it('renders degeneracy and a min-ratio tie', () => {
    const lines = finalLines(run('degenerate-tie'));

    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.notes.tie');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.notes.tie {"rows":"s_1, s_3","ratio":"2"}');
    expectContains(lines, 's_3: 0 / 1 = 0');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.notes.degenerate');
    expectContains(lines, 'x = 2,\\; y = 0');
    expectContains(lines, 'z = 4');
  });

  it('renders alternative optimum detection', () => {
    const lines = finalLines(run('alternative-optimum'));

    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.reducedCosts {"costs":"[0, 0, 1, 0, 0]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.zeroReducedCost {"name":"s_2"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.notes.alternative');
    expectContains(lines, 'x = 3,\\; y = 1');
    expectContains(lines, 'z = 4');
  });

  it('renders the unbounded case without a finite result', () => {
    const lines = finalLines(run('unbounded-ray'));

    expect(lines.find((line) => line.id === 'section-no-result')).toMatchObject({
      marker: '×',
      content: { key: 'features.algorithms.runtime.scratchpadLab.simplex.sections.noOptimum' },
    });
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.entering {"name":"x"');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.ratioSkip {"basis":"s_1","coefficient":"-1"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.ratioSkip {"basis":"s_2","coefficient":"0"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.column {"name":"x","values":"[-1, 0]"}');
    expectContains(lines, 'features.algorithms.runtime.scratchpadLab.simplex.lines.unbounded');
  });

  it('marks the entering column on the reduced-cost, entering and ratio steps', () => {
    const steps = run('short');
    const currentId = (step: SortStep) => step.scratchpadLab?.lines.find((line) => line.state === 'current')?.id ?? '';
    for (const id of ['pivot-1-reduced-costs', 'pivot-1-entering', 'ratio-1-0']) {
      const step = steps.find((candidate) => currentId(candidate) === id);
      const enteringCells = step?.matrixGrid?.cells.filter((cell) => cell.state === 'pivot-col' || cell.state === 'pivot') ?? [];
      expect(enteringCells.length).toBeGreaterThan(0);
      expect(new Set(enteringCells.map((cell) => cell.col)).size).toBe(1);
    }
  });
});
