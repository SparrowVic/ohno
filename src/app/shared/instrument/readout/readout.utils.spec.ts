import { describe, expect, it } from 'vitest';

import { formatReadout } from './readout.utils';

describe('formatReadout', () => {
  it('zero-pads numbers to the requested width', () => {
    expect(formatReadout(66, 3)).toBe('066');
    expect(formatReadout(3, 2)).toBe('03');
  });

  it('never truncates numbers wider than the pad', () => {
    expect(formatReadout(1234, 3)).toBe('1234');
  });

  it('leaves strings untouched', () => {
    expect(formatReadout('O(n log n)', 3)).toBe('O(n log n)');
    expect(formatReadout('∞', 2)).toBe('∞');
  });

  it('pads nothing when pad is 0', () => {
    expect(formatReadout(7, 0)).toBe('7');
  });
});
