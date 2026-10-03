import { describe, expect, it } from 'vitest';

import { factorialGenerator } from '../../algorithms/factorial/factorial';
import { fibonacciIterativeGenerator } from '../../algorithms/fibonacci-iterative/fibonacci-iterative';
import { NumberLabHistoryEntry } from '../../models/number-lab';
import { createFactorialScenario, createFibonacciScenario } from '../../utils/scenarios/number-lab/number-lab-scenarios';
import { numberLabCellWidth, numberLabFormula, numberLabHistory } from './number-lab-display.utils';

function entry(id: string, value: string, isCurrent = false): NumberLabHistoryEntry {
  return { id, label: id, value, isCurrent };
}

describe('number lab display', () => {
  it('colours formula parts by role', () => {
    const view = numberLabFormula({
      lhs: [{ text: 'F(5)', role: 'result' }],
      rhs: [
        { text: 'F(4)', role: 'active' },
        { text: '+', role: 'operator' },
        { text: 'F(3)', role: 'operand' },
      ],
    });
    expect(view?.lhs.map((part) => part.tone)).toEqual(['lime']);
    expect(view?.rhs.map((part) => part.tone)).toEqual(['cyan', 'dim', 'idle']);
    expect(numberLabFormula(null)).toBeNull();
    expect(numberLabFormula({ lhs: [], rhs: [] })).toBeNull();
  });

  it('keeps one current history cell and marks numeric values for Doto', () => {
    const cells = numberLabHistory([entry('a', '1', true), entry('b', 'zastąp', true), entry('c', '(2, 3)')]);
    expect(cells.map((cell) => [cell.current, cell.numeric])).toEqual([
      [false, true],
      [true, false],
      [false, false],
    ]);
  });

  it('sizes tape cells from the longest value within bounds', () => {
    expect(numberLabCellWidth(numberLabHistory([entry('a', '1')]))).toBe(44);
    expect(numberLabCellWidth(numberLabHistory([entry('a', '3628800')]))).toBe(100);
    expect(numberLabCellWidth(numberLabHistory([entry('a', '12345678901234567890')]))).toBe(132);
  });

  it('reads the Fibonacci and factorial runs without losing a current cell', () => {
    const runs = [
      [...fibonacciIterativeGenerator(createFibonacciScenario(10, 'classic'))],
      [...factorialGenerator(createFactorialScenario(6, 'small'))],
    ];
    for (const steps of runs) {
      const states = steps.map((step) => step.numberLab).filter((state) => state !== undefined);
      expect(states.length).toBeGreaterThan(0);
      for (const state of states) {
        expect(numberLabHistory(state.history).filter((cell) => cell.current).length).toBeLessThanOrEqual(1);
      }
      expect(states.some((state) => numberLabFormula(state.formula) !== null)).toBe(true);
    }
  });
});
