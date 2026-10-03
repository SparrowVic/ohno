import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { recursionCallStackGenerator } from '../../algorithms/recursion-call-stack/recursion-call-stack';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { createRecursiveFibonacciScenario } from '../../utils/scenarios/call-stack-lab/call-stack-lab-scenarios';
import {
  CALL_STACK_PHASE_KEYS,
  callStackFrames,
  callStackReturnRows,
  callStackTopTitle,
  frameSignature,
  localLabel,
  returnRowTone,
} from './call-stack-display.utils';

const CALL_STACK = I18N_KEY.features.algorithms.display.callStack;

function fibonacciStates(n: number, preset = 'classic'): CallStackLabTraceState[] {
  return [...recursionCallStackGenerator(createRecursiveFibonacciScenario(n, preset))].flatMap((step) =>
    step.callStackLab ? [step.callStackLab] : [],
  );
}

describe('call-stack display utils', () => {
  it('splits a call title into a name and its arguments', () => {
    expect(frameSignature('fib(5)')).toEqual({ name: 'fib', args: '5' });
    expect(frameSignature('solve(row=2, col=3)')).toEqual({ name: 'solve', args: 'row=2, col=3' });
    expect(frameSignature('main')).toEqual({ name: 'main', args: '' });
  });

  it('maps English local names onto keys and keeps identifiers', () => {
    expect(localLabel('left')).toBe(CALL_STACK.locals.left);
    expect(localLabel('right')).toBe(CALL_STACK.locals.right);
    expect(localLabel('n')).toBe('n');
  });

  it('has a key for every frame phase', () => {
    expect(Object.values(CALL_STACK_PHASE_KEYS).every((key) => key.startsWith('features.algorithms.display.callStack.phases.'))).toBe(true);
  });

  it('orders frames top first with only the top frame lit', () => {
    const states = fibonacciStates(5);
    const deepest = states.reduce((best, state) => (state.frames.length > best.frames.length ? state : best));
    const frames = callStackFrames(deepest);
    expect(frames).toHaveLength(deepest.frames.length);
    expect(frames[0]?.top).toBe(true);
    expect(frames[0]?.id).toBe(deepest.frames[deepest.frames.length - 1]?.id);
    expect(frames.filter((frame) => frame.top)).toHaveLength(1);
    expect(frames.slice(1).every((frame) => frame.tone === 'slate')).toBe(true);
    expect(frames[frames.length - 1]?.depth).toBe(0);
  });

  it('paints the returning frame lime and shows its value', () => {
    const returning = fibonacciStates(4).find((state) => state.frames.some((frame) => frame.phase === 'returning'));
    const frame = callStackFrames(returning ?? null)[0];
    expect(frame?.tone).toBe('lime');
    expect(frame?.returnValue).not.toBeNull();
    expect(frame?.phaseKey).toBe(CALL_STACK.phases.returning);
  });

  it('keeps the newest return lime in the rail and fades old ones', () => {
    expect(returnRowTone(0)).toBe('done');
    expect(returnRowTone(2)).toBe('default');
    expect(returnRowTone(5)).toBe('dim');
    const states = fibonacciStates(5);
    const last = states[states.length - 1] ?? null;
    const rows = callStackReturnRows(last);
    expect(rows[0]).toMatchObject({ name: 'fib', args: '5', value: '5', tone: 'done' });
    expect(rows.length).toBeLessThanOrEqual(6);
  });

  it('names the top frame and reports an empty stack at the end', () => {
    const states = fibonacciStates(3, 'tiny');
    expect(callStackTopTitle(states[0] ?? null)).toBe('fib(3)');
    expect(callStackTopTitle(states[states.length - 1] ?? null)).toBeNull();
    expect(callStackFrames(null)).toEqual([]);
    expect(callStackReturnRows(null)).toEqual([]);
  });
});
