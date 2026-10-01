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

describe('gaugeLeds above the LED limit', () => {
  it('caps the strip at the limit and scales lit and done proportionally', () => {
    const leds = gaugeLeds(48, 24, 12);
    expect(leds).toHaveLength(12);
    expect(leds.filter((led) => led !== 'off')).toHaveLength(6);
    expect(leds.filter((led) => led === 'done')).toHaveLength(3);
  });

  it('keeps one LED lit for any progress and one dark until the end', () => {
    expect(gaugeLeds(200, 1, 0).filter((led) => led === 'lit')).toHaveLength(1);
    expect(gaugeLeds(200, 199, 0).filter((led) => led === 'off')).toHaveLength(1);
    expect(gaugeLeds(200, 200, 200).every((led) => led === 'done')).toBe(true);
  });

  it('accepts a custom limit', () => {
    expect(gaugeLeds(10, 5, 0, 4)).toEqual(['lit', 'lit', 'off', 'off']);
  });
});
