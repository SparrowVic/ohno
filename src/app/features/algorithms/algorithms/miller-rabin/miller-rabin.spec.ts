import { describe, expect, it } from 'vitest';

import { millerRabinGenerator } from './miller-rabin';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import {
  DEFAULT_MILLER_RABIN_TASK_ID,
  MILLER_RABIN_TASKS,
  createMillerRabinScenario,
} from '../../utils/scenarios/number-lab/miller-rabin-scenarios';

function finalLines(taskId: string | null = null): readonly ScratchpadLine[] {
  const scenario = createMillerRabinScenario(1, taskId, undefined);
  const steps = [...millerRabinGenerator(scenario)];
  return steps.at(-1)?.scratchpadLab?.lines ?? [];
}

function finalState(taskId: string | null = null) {
  const scenario = createMillerRabinScenario(1, taskId, undefined);
  const steps = [...millerRabinGenerator(scenario)];
  return steps.at(-1)?.scratchpadLab ?? null;
}

function contents(lines: readonly ScratchpadLine[]): readonly string[] {
  return lines.map((line) => (typeof line.content === 'string' ? line.content : line.content.key));
}

function hasLine(lines: readonly ScratchpadLine[], fragment: string): boolean {
  return contents(lines).some((content) => content.includes(fragment));
}

describe('miller-rabin', () => {
  it('uses short as the default opening task', () => {
    const scenario = createMillerRabinScenario(1, null, undefined);

    expect(DEFAULT_MILLER_RABIN_TASK_ID).toBe('short');
    expect(scenario.presetId).toBe('short');
    expect(scenario.n).toBe(37);
    expect(scenario.bases).toEqual([2]);
  });

  it('exposes single-base and two-base popup fields', () => {
    const byId = new Map(MILLER_RABIN_TASKS.map((task) => [task.id, task]));

    expect(Object.keys(byId.get('short')?.inputSchema ?? {})).toEqual(['n', 'base']);
    expect(Object.keys(byId.get('single-witness')?.inputSchema ?? {})).toEqual(['n', 'base']);
    expect(Object.keys(byId.get('strong-liar-multibase')?.inputSchema ?? {})).toEqual([
      'n',
      'base1',
      'base2',
    ]);
  });

  it('renders the short prime-pass flow for 37 and base 2', () => {
    const lines = finalLines('short');

    expect(hasLine(lines, '36 = 2^2 * 9')).toBe(true);
    expect(hasLine(lines, 'x_0 = 512 \\;\\mathrm{mod}\\; 37')).toBe(true);
    expect(hasLine(lines, 'x_1 = 961 \\;\\mathrm{mod}\\; 37')).toBe(true);
    expect(hasLine(lines, 'x_1 = n - 1')).toBe(true);
    expect(hasLine(lines, '37\\;\\text{jest strong probable prime dla bazy}\\;2')).toBe(true);
  });

  it('renders a single compositeness witness for 221', () => {
    const lines = finalLines('single-witness');

    expect(hasLine(lines, '220 = 2^2 * 55')).toBe(true);
    expect(hasLine(lines, 'x_0 = 188')).toBe(true);
    expect(hasLine(lines, 'x_1 = 35344 \\;\\mathrm{mod}\\; 221')).toBe(true);
    expect(hasLine(lines, '137\\;\\text{jest świadkiem złożoności liczby}\\;221')).toBe(true);
    expect(hasLine(lines, '221\\;\\text{jest liczbą złożoną}')).toBe(true);
  });

  it('renders strong liar then second-base witness for 2047', () => {
    const lines = finalLines('strong-liar-multibase');

    expect(hasLine(lines, '2046 = 2^1 * 1023')).toBe(true);
    expect(hasLine(lines, 'x_0 = 1')).toBe(true);
    expect(hasLine(lines, 'x_0 = 1565')).toBe(true);
    expect(hasLine(lines, 'Ponieważ s = 1')).toBe(true);
    expect(hasLine(lines, '2047 = 23 * 89')).toBe(true);
  });

  it('renders gcd precheck without modular exponentiation', () => {
    const lines = finalLines('gcd-precheck');

    expect(hasLine(lines, '\\gcd(7, 91) = 7')).toBe(true);
    expect(hasLine(lines, '1 < \\gcd(a, n) < n')).toBe(true);
    expect(hasLine(lines, '91 = 7 * 13')).toBe(true);
    expect(hasLine(lines, '^d')).toBe(false);
  });

  it('renders non-trivial square root factor leak for 341', () => {
    const lines = finalLines('sqrt-factor-leak');

    expect(hasLine(lines, '340 = 2^2 * 85')).toBe(true);
    expect(hasLine(lines, 'x_0 = 32')).toBe(true);
    expect(hasLine(lines, 'x_1 = 1024 \\;\\mathrm{mod}\\; 341')).toBe(true);
    expect(hasLine(lines, '32^2 = 1\\;(\\mathrm{mod}\\; 341)')).toBe(true);
    expect(hasLine(lines, '\\gcd(32 - 1, 341) = \\gcd(31, 341) = 31')).toBe(true);
    expect(hasLine(lines, '341 = 11 * 31')).toBe(true);
  });

  it('does not emit old scratchpad captions, instructions, margins, or signoff', () => {
    const state = finalState('short');

    expect(state?.margins).toEqual([]);
    expect(state?.resultLabel).toBeNull();
    expect(state?.lines.every((line) => line.caption === null)).toBe(true);
    expect(state?.lines.every((line) => line.instruction === null)).toBe(true);
  });
});
