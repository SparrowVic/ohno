import { describe, expect, it } from 'vitest';

import { pollardsRhoGenerator } from './pollards-rho';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import {
  DEFAULT_POLLARDS_RHO_TASK_ID,
  POLLARDS_RHO_TASKS,
  createPollardsRhoScenario,
} from '../../utils/scenarios/number-lab/pollards-rho-scenarios';

function finalLines(taskId: string | null = null): readonly ScratchpadLine[] {
  const scenario = createPollardsRhoScenario(1, taskId, undefined);
  const steps = [...pollardsRhoGenerator(scenario)];
  return steps.at(-1)?.scratchpadLab?.lines ?? [];
}

function finalState(taskId: string | null = null) {
  const scenario = createPollardsRhoScenario(1, taskId, undefined);
  const steps = [...pollardsRhoGenerator(scenario)];
  return steps.at(-1)?.scratchpadLab ?? null;
}

function contents(lines: readonly ScratchpadLine[]): readonly string[] {
  return lines.map((line) => (typeof line.content === 'string' ? line.content : line.content.key));
}

function hasLine(lines: readonly ScratchpadLine[], fragment: string): boolean {
  return contents(lines).some((content) => content.includes(fragment));
}

describe('pollards-rho', () => {
  it('uses short as the default opening task', () => {
    const scenario = createPollardsRhoScenario(1, null, undefined);

    expect(DEFAULT_POLLARDS_RHO_TASK_ID).toBe('short');
    expect(scenario.presetId).toBe('short');
    expect(scenario.n).toBe(8051);
    expect(scenario.x0).toBe(2);
    expect(scenario.c).toBe(1);
  });

  it('exposes the expected popup fields per task type', () => {
    const byId = new Map(POLLARDS_RHO_TASKS.map((task) => [task.id, task]));

    expect(Object.keys(byId.get('short')?.inputSchema ?? {})).toEqual(['n', 'x0', 'c']);
    expect(Object.keys(byId.get('retry-after-cycle')?.inputSchema ?? {})).toEqual([
      'n',
      'x0',
      'c_fail',
      'c_retry',
    ]);
    expect(Object.keys(byId.get('brent-batch-gcd')?.inputSchema ?? {})).toEqual([
      'n',
      'x0',
      'c',
      'm',
    ]);
    expect(Object.keys(byId.get('composite-factor-split')?.inputSchema ?? {})).toEqual([
      'n',
      'x0',
      'c',
      'c_for_21',
    ]);
  });

  it('renders the short Floyd flow for 8051 = 97 * 83', () => {
    const lines = finalLines('short');

    expect(hasLine(lines, 'd = \\gcd(194, 8051) = 97')).toBe(true);
    expect(hasLine(lines, '1 < 97 < 8051')).toBe(true);
    expect(hasLine(lines, '8051 / 97 = 83')).toBe(true);
    expect(hasLine(lines, '8051 = 97 * 83')).toBe(true);
  });

  it('renders retry after d = n and then succeeds with a new constant', () => {
    const lines = finalLines('retry-after-cycle');

    expect(hasLine(lines, 'd = \\gcd(0, 299) = 299')).toBe(true);
    expect(hasLine(lines, 'd = 299 = n')).toBe(true);
    expect(hasLine(lines, 'g(x) = x^2 + 2')).toBe(true);
    expect(hasLine(lines, 'd = \\gcd(69, 299) = 23')).toBe(true);
    expect(hasLine(lines, '299 = 23 * 13')).toBe(true);
  });

  it('renders Brent batches with q accumulation and batched gcd', () => {
    const lines = finalLines('brent-batch-gcd');

    expect(hasLine(lines, 'Blok r = 4, pierwsza paczka')).toBe(true);
    expect(hasLine(lines, 'q = 8225')).toBe(true);
    expect(hasLine(lines, '\\gcd(3636, 10403) = 101')).toBe(true);
    expect(hasLine(lines, '10403 = 101 * 103')).toBe(true);
  });

  it('renders recursive factorization until all factors are prime', () => {
    const lines = finalLines('recursive-factorization');

    expect(hasLine(lines, '104663 = 97 * 1079')).toBe(true);
    expect(hasLine(lines, '1079 = 13 * 83')).toBe(true);
    expect(hasLine(lines, '104663 = 97 * 13 * 83')).toBe(true);
    expect(hasLine(lines, '104663 = 13 * 83 * 97')).toBe(true);
  });

  it('renders a composite factor split instead of stopping at the first divisor', () => {
    const lines = finalLines('composite-factor-split');

    expect(hasLine(lines, '169071 = 21 * 8051')).toBe(true);
    expect(hasLine(lines, 'Dzielnik 21 nie jest pierwszy')).toBe(true);
    expect(hasLine(lines, '21 = 3 * 7')).toBe(true);
    expect(hasLine(lines, '8051 = 97 * 83')).toBe(true);
    expect(hasLine(lines, '169071 = 3 * 7 * 83 * 97')).toBe(true);
  });

  it('does not emit old scratchpad captions, instructions, margins, or signoff', () => {
    const state = finalState('short');

    expect(state?.margins).toEqual([]);
    expect(state?.resultLabel).toBeNull();
    expect(state?.lines.every((line) => line.caption === null)).toBe(true);
    expect(state?.lines.every((line) => line.instruction === null)).toBe(true);
  });
});
