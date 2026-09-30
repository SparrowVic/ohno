const MAX_MARKS = 5;

export function slotPercent(step: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (step / total) * 100));
}

function niceStride(total: number): number {
  const raw = total / MAX_MARKS;
  if (raw >= 10) return Math.max(10, Math.round(raw / 10) * 10);
  return Math.max(1, Math.round(raw));
}

export function slotMarks(total: number): readonly number[] {
  if (total <= 0) return [0];
  const stride = niceStride(total);
  const marks: number[] = [];
  for (let mark = 0; mark < total; mark += stride) marks.push(mark);
  return [...marks.slice(0, MAX_MARKS), total];
}
