import { describe, expect, it } from 'vitest';

import { VIZ_COLOR } from './visualization-palette';

describe('visualization-palette', () => {
  it('maps every named palette colour onto a css variable', () => {
    expect(VIZ_COLOR.accent).toBe('var(--viz-accent)');
    expect(Object.values(VIZ_COLOR).every((value) => /^var\(--viz-[a-z]+\)$/.test(value))).toBe(true);
  });
});
