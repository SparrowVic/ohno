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

  it('treats bare numbers as math so grid cells render via KaTeX', () => {
    // Sieve grid number cells fall here — without this, "14" would
    // render in monospace while adjacent single-letter cells (palindrome
    // "a") would go through KaTeX, producing mixed typography.
    expect(looksMathishContent('14')).toBe(true);
    expect(looksMathishContent('0')).toBe(true);
    expect(looksMathishContent('-3')).toBe(true);
    expect(looksMathishContent('0.85')).toBe(true);
    expect(looksMathishContent('Compare')).toBe(false);
  });

  it('converts UCB1 to subscripted macro without clobbering bare UCB', () => {
    expect(autoTextToTex('UCB1 = {{ucb}}')).toBe('\\mathrm{UCB}_{1} = {{ucb}}');
    expect(autoTextToTex('UCB score')).toBe('\\mathrm{UCB} score');
  });

  it('maps modular / set-theory operators used from Stage 4 onwards', () => {
    // Stage 4 (CRT, Miller-Rabin, Pollard) lean heavily on these.
    expect(autoTextToTex('a ≠ b')).toBe('a \\ne b');
    expect(autoTextToTex('a ≡ b')).toBe('a \\equiv b');
    expect(autoTextToTex('x ∈ S')).toBe('x \\in S');
    expect(autoTextToTex('⌊n/2⌋')).toBe('\\lfloor n/2\\rfloor');
    expect(autoTextToTex('A ∪ B')).toBe('A \\cup B');
  });
});
