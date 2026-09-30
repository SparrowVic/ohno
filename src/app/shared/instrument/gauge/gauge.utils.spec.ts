import { describe, expect, it } from 'vitest';

import { gaugeLeds } from './gauge.utils';

describe('gaugeLeds', () => {
  it('lights the first lit LEDs and marks the done ones', () => {
    expect(gaugeLeds(5, 3, 2)).toEqual(['done', 'done', 'lit', 'off', 'off']);
  });

  it('clamps lit and done to the count', () => {
    expect(gaugeLeds(3, 9, 9)).toEqual(['done', 'done', 'done']);
  });

  it('handles a zero count', () => {
    expect(gaugeLeds(0, 2, 1)).toEqual([]);
  });
});
