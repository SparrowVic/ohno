import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { Difficulty } from '../../features/algorithms/models/algorithm';
import { AppLang, APP_LANG } from './app-lang';

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, string> = {
  [Difficulty.Easy]: t('shared.difficulty.easy'),
  [Difficulty.Medium]: t('shared.difficulty.medium'),
  [Difficulty.Hard]: t('shared.difficulty.hard'),
  [Difficulty.UltraHard]: t('shared.difficulty.insane'),
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

export function getDifficultyLabelKey(difficulty: Difficulty): string {
  return DIFFICULTY_LABEL_KEYS[difficulty];
}

export function getDifficultyLabel(difficulty: Difficulty, lang: AppLang): string {
  return lang === APP_LANG.EN ? EN_LABELS[difficulty] : PL_LABELS[difficulty];
}
