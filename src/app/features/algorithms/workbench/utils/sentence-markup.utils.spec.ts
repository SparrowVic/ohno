import { describe, expect, it } from 'vitest';

import { markupSentence, plainSentence, sentenceParts, texToPlain } from './sentence-markup.utils';

describe('markupSentence', () => {
  it('wraps whole numbers, negative and decimal numbers in em', () => {
    expect(markupSentence('Porównaj 74 na indeksie 5 z -3 oraz 2.5.')).toBe(
      'Porównaj <em>74</em> na indeksie <em>5</em> z <em>-3</em> oraz <em>2.5</em>.',
    );
  });

  it('leaves words, identifiers and ranges alone', () => {
    expect(markupSentence('Tablica a1 ma n-1 elementów i 10 kroków.')).toBe(
      'Tablica a1 ma n-1 elementów i <em>10</em> kroków.',
    );
  });

  it('escapes html before wrapping and never wraps digits inside entities', () => {
    expect(markupSentence("<b>1</b> & 'x'")).toBe('&lt;b&gt;<em>1</em>&lt;/b&gt; &amp; &apos;x&apos;');
  });

  it('returns a sentence without numbers unchanged', () => {
    expect(markupSentence('Gotowe.')).toBe('Gotowe.');
  });
});

describe('texToPlain', () => {
  it('turns operators, spacing and roman text into readable symbols', () => {
    expect(texToPlain('4^2 \\;\\mathrm{mod}\\; 17')).toBe('4² mod 17');
    expect(texToPlain('a \\cdot b \\equiv 1 \\pmod{7}')).toBe('a · b ≡ 1 (mod 7)');
    expect(texToPlain('k \\in \\mathbb{Z}')).toBe('k ∈ ℤ');
  });

  it('flattens fractions, roots and scripts', () => {
    expect(texToPlain('\\frac{n}{2}')).toBe('(n)/(2)');
    expect(texToPlain('\\sqrt{x+1}')).toBe('√(x+1)');
    expect(texToPlain('x_{i} + y^{n+1}')).toBe('xᵢ + yⁿ⁺¹');
    expect(texToPlain('a_{left}')).toBe('a_left');
  });

  it('writes matrices as bracketed rows', () => {
    expect(texToPlain('\\left[\\begin{array}{cc|c} 1 & 1 & 5 \\\\ 0 & -2 & -4 \\end{array}\\right]')).toBe(
      '[1 1 5; 0 -2 -4]',
    );
  });

  it('keeps unknown commands as their bare name', () => {
    expect(texToPlain('\\foo(x)')).toBe('foo(x)');
  });
});

describe('plainSentence', () => {
  it('replaces every math segment with plain text and leaves prose untouched', () => {
    expect(plainSentence('Liczymy [[math]]fib(5) = 3 + 2 = 5[[/math]] i dalej.')).toBe('Liczymy fib(5) = 3 + 2 = 5 i dalej.');
  });

  it('returns sentences without math as they are', () => {
    expect(plainSentence('Porównaj 74 z 12.')).toBe('Porównaj 74 z 12.');
  });
});

describe('sentenceParts', () => {
  it('splits prose into marked-up html and math into tex parts', () => {
    expect(sentenceParts('Krok 3: [[math]]a^2[[/math]] gotowe')).toEqual([
      { kind: 'html', html: 'Krok <em>3</em>: ' },
      { kind: 'tex', tex: 'a^{2}' },
      { kind: 'html', html: ' gotowe' },
    ]);
  });

  it('keeps a plain sentence as a single html part', () => {
    expect(sentenceParts('Gotowe.')).toEqual([{ kind: 'html', html: 'Gotowe.' }]);
  });

  it('reads != as an inequality instead of a factorial', () => {
    expect(plainSentence('Check 31 != 36.')).toBe('Check 31 ≠ 36.');
    expect(sentenceParts('Check 31 != 36.').some((part) => part.kind === 'tex' && part.tex.includes('!'))).toBe(false);
  });
});
