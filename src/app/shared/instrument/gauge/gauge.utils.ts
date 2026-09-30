export type GaugeLed = 'off' | 'lit' | 'done';

export function gaugeLeds(count: number, lit: number, done: number): readonly GaugeLed[] {
  const safeCount = Math.max(0, count);
  const safeLit = Math.min(safeCount, Math.max(0, lit));
  const safeDone = Math.min(safeLit, Math.max(0, done));
  return Array.from({ length: safeCount }, (_, index) =>
    index < safeDone ? 'done' : index < safeLit ? 'lit' : 'off',
  );
}
