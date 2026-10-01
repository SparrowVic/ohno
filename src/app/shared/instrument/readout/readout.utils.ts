export function formatReadout(value: number | string, pad: number): string {
  if (typeof value === 'string') return value;
  const digits = String(Math.trunc(Math.abs(value)));
  const sign = value < 0 ? '-' : '';
  return sign + digits.padStart(pad, '0');
}
