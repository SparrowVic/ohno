import { AlgorithmItem, Difficulty } from '../../../models/algorithm';

export const ALL_DIFFICULTIES: ReadonlySet<Difficulty> = new Set([
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.UltraHard,
]);

export function filterByDifficulty(
  items: readonly AlgorithmItem[],
  active: ReadonlySet<Difficulty>,
): readonly AlgorithmItem[] {
  return items.filter((item) => active.has(item.difficulty));
}

export function toggleDifficulty(
  active: ReadonlySet<Difficulty>,
  difficulty: Difficulty,
): ReadonlySet<Difficulty> {
  const next = new Set(active);
  if (next.has(difficulty)) next.delete(difficulty);
  else next.add(difficulty);
  return next;
}
