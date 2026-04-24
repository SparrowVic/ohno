import { describe, expect, it } from 'vitest';

import { fftNttGenerator } from './fft-ntt';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import type { SortStep } from '../../models/sort-step';
import {
  createFftNttScenario,
  DEFAULT_FFT_NTT_TASK_ID,
  FFT_NTT_TASKS,
} from '../../utils/scenarios/number-lab/fft-ntt-scenarios';

function run(presetId: string = DEFAULT_FFT_NTT_TASK_ID): SortStep[] {
  return [...fftNttGenerator(createFftNttScenario(0, presetId))];
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

describe('fft-ntt', () => {
  it('uses short NTT convolution as the default task', () => {
    expect(DEFAULT_FFT_NTT_TASK_ID).toBe('short');
    expect(FFT_NTT_TASKS.map((task) => task.id)).toEqual([
      'short',
      'recursive-fft-split',
      'cyclic-vs-linear-trap',
      'big-integer-convolution',
      'primitive-root-check',
    ]);
  });

  it('exposes per-task popup fields', () => {
    expect(Object.keys(FFT_NTT_TASKS[0].inputSchema ?? {})).toEqual([
      'mod',
      'n',
      'omega',
      'A',
      'B',
    ]);
    expect(Object.keys(FFT_NTT_TASKS[1].inputSchema ?? {})).toEqual(['n', 'omega', 'A']);
    expect(Object.keys(FFT_NTT_TASKS[2].inputSchema ?? {})).toEqual([
      'mod',
      'A',
      'B',
      'bad_n',
      'good_n',
      'omega4',
      'omega8',
    ]);
    expect(Object.keys(FFT_NTT_TASKS[3].inputSchema ?? {})).toEqual([
      'left',
      'right',
      'base',
      'mod',
      'n',
      'omega',
    ]);
    expect(Object.keys(FFT_NTT_TASKS[4].inputSchema ?? {})).toEqual([
      'mod',
      'n',
      'omega_bad',
      'omega_good',
    ]);
  });

  it('renders the short NTT convolution flow like the task sheet', () => {
    const steps = run('short');
    const last = steps.at(-1)?.scratchpadLab;
    const lines = finalLines(steps);

    expect(last?.margins).toEqual([]);
    expect(last?.resultLabel).toBeNull();
    expect(lines.find((line) => line.id === 'section-result')).toMatchObject({
      marker: '✓',
      content: 'Wynik',
    });
    expectContains(lines, '4^2 \\;\\mathrm{mod}\\; 17 = 16 = -1');
    expectContains(lines, 'NTT(A) = [6, 6, 2, 7]');
    expectContains(lines, 'NTT(B) = [9, 7, 16, 1]');
    expectContains(lines, 'C_hat = [3, 8, 15, 7]');
    expectContains(lines, 'INTT(C_hat) = [4, 13, 5, 15]');
    expectContains(lines, 'C(x) = 4 + 13x + 5x^2 + 15x^3');
    expectContains(lines, '[4, 13, 22, 15] \\;\\mathrm{mod}\\; 17 = [4, 13, 5, 15]');
  });

  it('renders the recursive FFT split flow', () => {
    const lines = finalLines(run('recursive-fft-split'));

    expectContains(lines, 'A_even = [1, 3]');
    expectContains(lines, 'A_odd = [2, 4]');
    expectContains(lines, 'FFT([1, 3]) = [4, -2]');
    expectContains(lines, 'FFT([2, 4]) = [6, -2]');
    expectContains(lines, 'X_1 = E_1 + \\omega^1 * O_1 = -2 + i * (-2) = -2 - 2i');
    expectContains(lines, 'FFT([1, 2, 3, 4]) = [10, -2 - 2i, -2, -2 + 2i]');
  });

  it('renders the cyclic versus linear convolution trap', () => {
    const lines = finalLines(run('cyclic-vs-linear-trap'));

    expectContains(lines, 'NTT(A) = [10, 7, 15, 6]');
    expectContains(lines, 'NTT(B) = [4, 0, 0, 0]');
    expectContains(lines, 'INTT(C_hat) = [10, 10, 10, 10]');
    expectContains(lines, 'len(A) + len(B) - 1 = 4 + 4 - 1 = 7');
    expectContains(lines, 'INTT(NTT(A) * NTT(B)) = [1, 3, 6, 10, 9, 7, 4, 0]');
    expectContains(lines, 'A * B = [1, 3, 6, 10, 9, 7, 4]');
  });

  it('renders big integer multiplication by digit convolution', () => {
    const lines = finalLines(run('big-integer-convolution'));

    expectContains(lines, '123 \\to [3, 2, 1, 0]');
    expectContains(lines, '12 \\to [2, 1, 0, 0]');
    expectContains(lines, 'NTT([3, 2, 1, 0]) = [6, 10, 2, 11]');
    expectContains(lines, 'C_hat = [1, 9, 2, 12]');
    expectContains(lines, 'INTT(C_hat) = [6, 7, 4, 1]');
    expectContains(lines, 'c_3 = 1 \\to digit 1, carry 0');
    expectContains(lines, '123 * 12 = 1476');
  });

  it('renders primitive root validation and collision repair', () => {
    const lines = finalLines(run('primitive-root-check'));

    expectContains(lines, '4^8 \\;\\mathrm{mod}\\; 17 = 1');
    expectContains(lines, '4^4 \\;\\mathrm{mod}\\; 17 = 1');
    expectContains(lines, 'NTT_bad(A) = [1, 1, 1, 1, 1, 1, 1, 1]');
    expectContains(lines, 'NTT_bad(B) = [1, 1, 1, 1, 1, 1, 1, 1]');
    expectContains(lines, '2^4 \\;\\mathrm{mod}\\; 17 = 16 = -1');
    expectContains(lines, 'NTT_good(B) = [1, 16, 1, 16, 1, 16, 1, 16]');
    expectContains(lines, '\\omega = 4 \\to niepoprawny pierwiastek dla n = 8');
    expectContains(lines, '\\omega = 2 \\to poprawny pierwiastek dla n = 8');
  });
});
