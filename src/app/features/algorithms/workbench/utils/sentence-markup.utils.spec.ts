import { describe, expect, it } from 'vitest';

import { markupSentence } from './sentence-markup.utils';

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
