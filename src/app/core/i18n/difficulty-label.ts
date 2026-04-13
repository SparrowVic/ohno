import { Difficulty } from '../../features/algorithms/models/algorithm';
import { AppLang, APP_LANG } from './app-lang';

const EN_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Medium]: 'Medium',
  [Difficulty.Hard]: 'Hard',
  [Difficulty.UltraHard]: 'Insane',
};

const PL_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Łatwe',
  [Difficulty.Medium]: 'Średnie',
  [Difficulty.Hard]: 'Trudne',
  [Difficulty.UltraHard]: 'Przejebane',
};

export function getDifficultyLabel(difficulty: Difficulty, lang: AppLang): string {
  return lang === APP_LANG.EN ? EN_LABELS[difficulty] : PL_LABELS[difficulty];
}
