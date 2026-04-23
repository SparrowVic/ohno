import { describe, expect, it } from 'vitest';

import {
  autoTextToTex,
  looksMathishContent,
  splitMathTextSegments,
} from './math-text.utils';

describe('math-text.utils', () => {
  it('detects complexity notation as math-ish content', () => {
    expect(looksMathishContent('O(n²)')).toBe(true);
    expect(looksMathishContent('O(α(n)) amortized')).toBe(true);
    expect(looksMathishContent('Varies')).toBe(false);
  });

  it('converts common complexity notation to TeX', () => {
    expect(autoTextToTex('O(n²)')).toBe('\\mathsf{O}\\left(n^{2}\\right)');
    expect(autoTextToTex('O(E√V)')).toBe('\\mathsf{O}\\left(E\\sqrt{V}\\right)');
    expect(autoTextToTex('O(n²·2ⁿ)')).toBe('\\mathsf{O}\\left(n^{2}\\cdot 2^{n}\\right)');
  });

  it('keeps function-style notation readable inside complexity strings', () => {
    expect(autoTextToTex('O(α(n)) amortized')).toBe(
      '\\mathsf{O}\\left(\\alpha\\left(n\\right)\\right)\\,\\text{amortized}',
    );
    expect(autoTextToTex('O(log min(a, b))')).toBe(
      '\\mathsf{O}\\left(\\log \\min\\left(a, b\\right)\\right)',
    );
  });

  it('splits explicitly marked inline math segments', () => {
    expect(splitMathTextSegments('Enter [[math]]fib(6)[[/math]] and [[math]]fib(5)[[/math]].')).toEqual([
      { kind: 'text', content: 'Enter ' },
      { kind: 'math', content: 'fib(6)' },
      { kind: 'text', content: ' and ' },
      { kind: 'math', content: 'fib(5)' },
      { kind: 'text', content: '.' },
    ]);
  });
});
