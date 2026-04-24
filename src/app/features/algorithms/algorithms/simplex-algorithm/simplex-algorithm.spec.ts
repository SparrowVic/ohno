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
  return typeof line.content === 'string' ? line.content : '';
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
      content: 'Wynik',
    });
    expectContains(lines, 'max\\ z = 40x + 30y');
    expectContains(lines, 'wchodzi\\ x');
    expectContains(lines, 's_2: 16 / 2 = 8');
    expectContains(lines, 'wchodzi\\ y');
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
    expectContains(lines, 's_1 > 0');
    expectContains(lines, 'x = 2,\\; y = 6');
    expectContains(lines, 'z = 36');
  });

  it('renders degeneracy and a min-ratio tie', () => {
    const lines = finalLines(run('degenerate-tie'));

    expectContains(lines, 'Remis w teście ilorazów');
    expectContains(lines, 's_1, s_3 mają iloraz 2');
    expectContains(lines, 's_3: 0 / 1 = 0');
    expectContains(lines, 'Iloraz 0 oznacza pivot zdegenerowany');
    expectContains(lines, 'x = 2,\\; y = 0');
    expectContains(lines, 'z = 4');
  });

  it('renders alternative optimum detection', () => {
    const lines = finalLines(run('alternative-optimum'));

    expectContains(lines, 'koszty\\ zredukowane = [0, 0, 1, 0, 0]');
    expectContains(lines, 'koszt\\ zredukowany\\ s_2 = 0');
    expectContains(lines, 'może wejść do bazy bez zmiany wartości z');
    expectContains(lines, 'x = 3,\\; y = 1');
    expectContains(lines, 'z = 4');
  });

  it('renders the unbounded case without a finite result', () => {
    const lines = finalLines(run('unbounded-ray'));

    expect(lines.find((line) => line.id === 'section-no-result')).toMatchObject({
      marker: '×',
      content: 'Brak skończonego optimum',
    });
    expectContains(lines, 'wchodzi\\ x');
    expectContains(lines, 's_1: -1 \\le 0 \\to pomiń');
    expectContains(lines, 's_2: 0 \\le 0 \\to pomiń');
    expectContains(lines, 'kolumna\\ x = [-1, 0]');
    expectContains(lines, 'funkcja\\ celu\\ jest\\ nieograniczona');
  });
});
