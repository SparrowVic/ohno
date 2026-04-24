import { describe, expect, it } from 'vitest';

import { crtGenerator } from './crt';
import type { ScratchpadLine } from '../../models/scratchpad-lab';
import { createCrtScenario } from '../../utils/scenarios/number-lab/crt-scenarios';
import { CRT_TASKS, DEFAULT_CRT_TASK_ID } from '../../utils/scenarios/number-lab/crt-scenarios';

function finalLines(taskId: string | null = null): readonly ScratchpadLine[] {
  const scenario = createCrtScenario(1, taskId, undefined);
  const steps = [...crtGenerator(scenario)];
  return steps.at(-1)?.scratchpadLab?.lines ?? [];
}

function contents(lines: readonly ScratchpadLine[]): readonly string[] {
  return lines.map((line) => (typeof line.content === 'string' ? line.content : line.content.key));
}

function hasLine(lines: readonly ScratchpadLine[], fragment: string): boolean {
  return contents(lines).some((content) => content.includes(fragment));
}

describe('crt', () => {
  it('uses short as the default opening task', () => {
    const scenario = createCrtScenario(1, null, undefined);

    expect(DEFAULT_CRT_TASK_ID).toBe('short');
    expect(scenario.presetId).toBe('short');
    expect(scenario.congruences).toEqual([
      { residue: 2, modulus: 3 },
      { residue: 3, modulus: 5 },
      { residue: 2, modulus: 7 },
    ]);
  });

  it('exposes per-congruence popup fields for three- and four-modulus tasks', () => {
    const short = CRT_TASKS.find((task) => task.id === 'short');
    const garner = CRT_TASKS.find((task) => task.id === 'garner-mixed-radix');

    expect(Object.keys(short?.inputSchema ?? {})).toEqual(['a1', 'm1', 'a2', 'm2', 'a3', 'm3']);
    expect(Object.keys(garner?.inputSchema ?? {})).toEqual([
      'a1',
      'm1',
      'a2',
      'm2',
      'a3',
      'm3',
      'a4',
      'm4',
    ]);
  });

  it('renders direct CRT construction for the short task', () => {
    const lines = finalLines('short');

    expect(hasLine(lines, 'M_1 = 105 / 3 = 35')).toBe(true);
    expect(hasLine(lines, 'x = 2 * 35 * 2 + 3 * 21 * 1 + 2 * 15 * 1')).toBe(true);
    expect(hasLine(lines, '233 \\bmod 105 = 23')).toBe(true);
    expect(hasLine(lines, 'x = 23 \\;(\\mathrm{mod}\\; 105)')).toBe(true);
  });

  it('renders progressive merge instead of direct CRT for progressive-merge', () => {
    const lines = finalLines('progressive-merge');

    expect(hasLine(lines, 'x = 13 \\;(\\mathrm{mod}\\; 99)')).toBe(true);
    expect(hasLine(lines, 'x = 904 + 1287u')).toBe(true);
    expect(hasLine(lines, 'x = 904 \\;(\\mathrm{mod}\\; 1287)')).toBe(true);
    expect(hasLine(lines, 'a_1 * M_1 * y_1')).toBe(false);
  });

  it('renders generalized compatible CRT with gcd reduction and lcm modulus', () => {
    const lines = finalLines('non-coprime-compatible');

    expect(hasLine(lines, '\\gcd(18, 60) = 6')).toBe(true);
    expect(hasLine(lines, '3k = 4 \\;(\\mathrm{mod}\\; 10)')).toBe(true);
    expect(hasLine(lines, 'x = 338 + 1260u')).toBe(true);
    expect(hasLine(lines, 'x = 338 \\;(\\mathrm{mod}\\; 1260)')).toBe(true);
  });

  it('stops trap tasks at a no-solutions result without inverse construction', () => {
    const lines = finalLines('non-coprime-trap');
    const noResult = lines.find((line) => line.id === 'section-no-result');

    expect(noResult?.kind).toBe('result');
    expect(noResult?.marker).toBe('×');
    expect(noResult?.content).toBe('Brak rozwiazan');
    expect(hasLine(lines, '6 \\nmid 9')).toBe(true);
    expect(hasLine(lines, '^{-1}')).toBe(false);
  });

  it('renders Garner mixed-radix reconstruction', () => {
    const lines = finalLines('garner-mixed-radix');

    expect(hasLine(lines, 'c_0 = 4')).toBe(true);
    expect(hasLine(lines, 'c_1 = 4')).toBe(true);
    expect(hasLine(lines, 'c_2 = 7')).toBe(true);
    expect(hasLine(lines, 'c_3 = 8')).toBe(true);
    expect(hasLine(lines, 'x = 2789 \\;(\\mathrm{mod}\\; 3465)')).toBe(true);
  });

  it('does not emit old scratchpad captions, instructions, margins, or signoff', () => {
    const scenario = createCrtScenario(1, 'short', undefined);
    const steps = [...crtGenerator(scenario)];
    const finalState = steps.at(-1)?.scratchpadLab;

    expect(finalState?.margins).toEqual([]);
    expect(finalState?.resultLabel).toBeNull();
    expect(finalState?.lines.every((line) => line.caption === null)).toBe(true);
    expect(finalState?.lines.every((line) => line.instruction === null)).toBe(true);
  });
});
