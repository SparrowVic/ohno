import { describe, expect, it } from 'vitest';

import { stepOption } from './window-stepper.utils';

describe('stepOption', () => {
  const options = [16, 32, 64];

  it('moves to the neighbouring option', () => {
    expect(stepOption(options, 16, 1)).toBe(32);
    expect(stepOption(options, 64, -1)).toBe(32);
  });

  it('stays at the ends without wrapping', () => {
    expect(stepOption(options, 64, 1)).toBe(64);
    expect(stepOption(options, 16, -1)).toBe(16);
  });

  it('snaps an unknown value to the first option', () => {
    expect(stepOption(options, 20, 1)).toBe(16);
  });

  it('returns the value when there are no options', () => {
    expect(stepOption([], 7, 1)).toBe(7);
  });
});
