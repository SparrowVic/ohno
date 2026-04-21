import { Difficulty } from '../../features/algorithms/models/algorithm';
import { AppLang, APP_LANG } from './app-lang';
import { I18N_KEY, I18nKey } from './i18n-keys';

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, I18nKey> = {
  [Difficulty.Easy]: I18N_KEY.shared.difficulty.easy,
  [Difficulty.Medium]: I18N_KEY.shared.difficulty.medium,
  [Difficulty.Hard]: I18N_KEY.shared.difficulty.hard,
  [Difficulty.UltraHard]: I18N_KEY.shared.difficulty.insane,
};

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

export function getDifficultyLabelKey(difficulty: Difficulty): I18nKey {
  return DIFFICULTY_LABEL_KEYS[difficulty];
}

export function getDifficultyLabel(difficulty: Difficulty, lang: AppLang): string {
  return lang === APP_LANG.EN ? EN_LABELS[difficulty] : PL_LABELS[difficulty];
}
