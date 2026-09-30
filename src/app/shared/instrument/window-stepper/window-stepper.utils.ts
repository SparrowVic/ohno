export function stepOption(options: readonly number[], value: number, direction: -1 | 1): number {
  if (options.length === 0) return value;
  const index = options.indexOf(value);
  if (index === -1) return options[0];
  const next = Math.min(options.length - 1, Math.max(0, index + direction));
  return options[next];
}
