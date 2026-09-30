import { describe, expect, it } from 'vitest';

import { clampKnobValue, knobAngle, knobTicks, knobValueFromPointer } from './knob.utils';

describe('knob utils', () => {
  it('clamps to the range and rounds to integers', () => {
    expect(clampKnobValue(11, 1, 10)).toBe(10);
    expect(clampKnobValue(0, 1, 10)).toBe(1);
    expect(clampKnobValue(5.6, 1, 10)).toBe(6);
  });

  it('maps the range onto a 270-degree sweep', () => {
    expect(knobAngle(1, 1, 10)).toBe(-135);
    expect(knobAngle(10, 1, 10)).toBe(135);
    expect(knobAngle(5.5, 1, 10)).toBe(0);
  });

  it('lists one tick per integer value', () => {
    expect(knobTicks(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('turns a vertical drag into a value change of one step per 24px', () => {
    expect(knobValueFromPointer(5, 24, 1, 10)).toBe(6);
    expect(knobValueFromPointer(5, -48, 1, 10)).toBe(3);
    expect(knobValueFromPointer(10, 240, 1, 10)).toBe(10);
  });
});
