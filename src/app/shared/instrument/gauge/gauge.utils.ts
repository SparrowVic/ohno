export type GaugeLed = 'off' | 'lit' | 'done';

export const GAUGE_LED_LIMIT = 12;

function scaledLeds(value: number, count: number, limit: number): number {
  if (count <= limit) return value;
  if (value <= 0) return 0;
  if (value >= count) return limit;
  return Math.min(limit - 1, Math.max(1, Math.round((value / count) * limit)));
}

export function gaugeLeds(count: number, lit: number, done: number, limit = GAUGE_LED_LIMIT): readonly GaugeLed[] {
  const safeCount = Math.max(0, count);
  const safeLit = Math.min(safeCount, Math.max(0, lit));
  const safeDone = Math.min(safeLit, Math.max(0, done));
  const length = Math.min(safeCount, Math.max(1, limit));
  const litLeds = scaledLeds(safeLit, safeCount, length);
  const doneLeds = Math.min(litLeds, scaledLeds(safeDone, safeCount, length));
  return Array.from({ length }, (_, index) => (index < doneLeds ? 'done' : index < litLeds ? 'lit' : 'off'));
}
