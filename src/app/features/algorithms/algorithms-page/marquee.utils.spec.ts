import { describe, expect, it } from 'vitest';

import { marqueeFontSize } from './marquee.utils';

describe('marqueeFontSize', () => {
  it('keeps short labels at the full 58px', () => {
    expect(marqueeFontSize('SORTOWANIE')).toBe(58);
    expect(marqueeFontSize('WYSZUKIWANIE')).toBe(58);
    expect(marqueeFontSize('')).toBe(58);
  });

  it('shrinks long labels to fit the screen and never below 26px', () => {
    expect(marqueeFontSize('PROGRAMOWANIE DYNAMICZNE')).toBe(32);
    expect(marqueeFontSize('A'.repeat(40))).toBe(26);
    expect(marqueeFontSize('DYNAMIC PROG.', 300)).toBe(29);
  });
});
