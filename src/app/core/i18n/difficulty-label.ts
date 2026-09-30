import { Difficulty } from '../../features/algorithms/models/algorithm';
import { I18N_KEY, I18nKey } from './i18n-keys';

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, I18nKey> = {
  [Difficulty.Easy]: I18N_KEY.shared.difficulty.easy,
  [Difficulty.Medium]: I18N_KEY.shared.difficulty.medium,
  [Difficulty.Hard]: I18N_KEY.shared.difficulty.hard,
  [Difficulty.UltraHard]: I18N_KEY.shared.difficulty.insane,
};

export function getDifficultyLabelKey(difficulty: Difficulty): I18nKey {
  return DIFFICULTY_LABEL_KEYS[difficulty];
}
