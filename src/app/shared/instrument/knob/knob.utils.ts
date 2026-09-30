const SWEEP_DEGREES = 270;
const PIXELS_PER_STEP = 24;

export function clampKnobValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function knobAngle(value: number, min: number, max: number): number {
  const ratio = max === min ? 0 : (value - min) / (max - min);
  return -SWEEP_DEGREES / 2 + ratio * SWEEP_DEGREES;
}

export function knobTicks(min: number, max: number): readonly number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

export function knobValueFromPointer(startValue: number, deltaY: number, min: number, max: number): number {
  return clampKnobValue(startValue + deltaY / PIXELS_PER_STEP, min, max);
}
