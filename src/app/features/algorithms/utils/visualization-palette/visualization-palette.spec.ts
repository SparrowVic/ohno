import { describe, expect, it } from 'vitest';

import {
  VIZ_BUCKET_COLORS,
  VIZ_COLOR,
  VIZ_HEX,
} from './visualization-palette';

describe('visualization-palette', () => {
  it('keeps named palette tokens aligned between raw hexes and css vars', () => {
    expect(Object.keys(VIZ_HEX)).toEqual(Object.keys(VIZ_COLOR));
    expect(VIZ_HEX.accent).toBe('#95a9bf');
    expect(VIZ_COLOR.accent).toBe('var(--viz-accent)');
  });

  it('exposes a full bucket palette for radix-style visualizations', () => {
    expect(VIZ_BUCKET_COLORS).toHaveLength(10);
    expect(new Set(VIZ_BUCKET_COLORS).size).toBe(VIZ_BUCKET_COLORS.length);
  });
});
