import { describe, expect, it } from 'vitest';

import { euclideanGcdGenerator } from './euclidean-gcd';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import type { SortStep } from '../../models/sort-step';
import {
  createEuclideanGcdScenario,
  DEFAULT_EUCLIDEAN_GCD_TASK_ID,
  EUCLIDEAN_GCD_TASKS,
} from '../../utils/scenarios/number-lab/number-lab-scenarios';

function run(presetId: string = DEFAULT_EUCLIDEAN_GCD_TASK_ID): SortStep[] {
  return [...euclideanGcdGenerator(createEuclideanGcdScenario(0, presetId))];
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

describe('euclidean-gcd', () => {
  it('uses the short basic gcd task as default', () => {
    expect(DEFAULT_EUCLIDEAN_GCD_TASK_ID).toBe('short');
    expect(EUCLIDEAN_GCD_TASKS.map((task) => task.id)).toEqual([
      'short',
      'fibonacci-worst-case',
      'multi-number-fold',
      'fraction-reduction',
      'subtractive-to-division',
    ]);
  });

  it('exposes per-task popup fields', () => {
    expect(Object.keys(EUCLIDEAN_GCD_TASKS[0].inputSchema ?? {})).toEqual(['a', 'b']);
    expect(Object.keys(EUCLIDEAN_GCD_TASKS[1].inputSchema ?? {})).toEqual(['a', 'b']);
    expect(Object.keys(EUCLIDEAN_GCD_TASKS[2].inputSchema ?? {})).toEqual(['values']);
    expect(Object.keys(EUCLIDEAN_GCD_TASKS[3].inputSchema ?? {})).toEqual([
      'numerator',
      'denominator',
    ]);
    expect(Object.keys(EUCLIDEAN_GCD_TASKS[4].inputSchema ?? {})).toEqual(['a', 'b']);
  });

  it('renders the short Euclidean division flow', () => {
    const steps = run('short');
    const last = steps.at(-1)?.scratchpadLab;
    const lines = finalLines(steps);

    expect(last?.margins).toEqual([]);
    expect(last?.resultLabel).toBeNull();
    expect(lines.find((line) => line.id === 'section-result')).toMatchObject({
      marker: '✓',
      content: 'Wynik',
    });
    expectContains(lines, '60 = 1 * 48 + 12');
    expectContains(lines, '48 = 4 * 12 + 0');
    expectContains(lines, 'gcd(60, 48) = 12');
    expectContains(lines, '60 / 12 = 5');
    expectContains(lines, '48 / 12 = 4');
  });

  it('renders the Fibonacci worst-case chain', () => {
    const lines = finalLines(run('fibonacci-worst-case'));

    expectContains(lines, '144 = 1 * 89 + 55');
    expectContains(lines, '89 = 1 * 55 + 34');
    expectContains(lines, '3 = 1 * 2 + 1');
    expectContains(lines, '2 = 2 * 1 + 0');
    expectContains(lines, 'gcd(144, 89) = 1');
    expectContains(lines, '144, 89, 55, 34, 21, 13, 8, 5, 3, 2, 1');
  });

  it('renders multi-number gcd as pairwise folding', () => {
    const lines = finalLines(run('multi-number-fold'));

    expectContains(lines, 'Krok 1: gcd(252, 198)');
    expectContains(lines, '252 = 1 * 198 + 54');
    expectContains(lines, 'gcd(252, 198) = 18');
    expectContains(lines, 'Krok 2: gcd(18, 126)');
    expectContains(lines, '126 = 7 * 18 + 0');
    expectContains(lines, 'Krok 3: gcd(18, 90)');
    expectContains(lines, '90 = 5 * 18 + 0');
    expectContains(lines, 'gcd(252, 198, 126, 90) = 18');
    expectContains(lines, '198 / 18 = 11');
  });

  it('renders fraction reduction through gcd', () => {
    const lines = finalLines(run('fraction-reduction'));

    expectContains(lines, '4620 = 4 * 1078 + 308');
    expectContains(lines, '1078 = 3 * 308 + 154');
    expectContains(lines, '308 = 2 * 154 + 0');
    expectContains(lines, 'gcd(4620, 1078) = 154');
    expectContains(lines, '4620 / 154 = 30');
    expectContains(lines, '1078 / 154 = 7');
    expectContains(lines, '4620 / 1078 = 30 / 7');
  });

  it('renders subtractive gcd and compressed division form', () => {
    const lines = finalLines(run('subtractive-to-division'));

    expectContains(lines, '168 - 72 = 96');
    expectContains(lines, '96 - 72 = 24');
    expectContains(lines, '72 - 24 = 48');
    expectContains(lines, '24 - 24 = 0');
    expectContains(lines, '168 = 2 * 72 + 24');
    expectContains(lines, '72 = 3 * 24 + 0');
    expectContains(lines, 'gcd(168, 72) = 24');
    expectContains(lines, '168 / 24 = 7');
    expectContains(lines, '7 * 3 = 21');
    expectContains(lines, 'liczba\\ kafelków = 21');
  });
});
