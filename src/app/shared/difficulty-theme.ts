import { Difficulty } from '../features/algorithms/models/algorithm';

export interface DifficultyTheme {
  readonly accentRgb: string;
  readonly accentAltRgb: string;
  readonly accentStrong: string;
  readonly accentAltStrong: string;
  readonly ink: string;
}

const DEFAULT_DIFFICULTY_THEME: DifficultyTheme = {
  accentRgb: '184 213 110',
  accentAltRgb: '141 123 255',
  accentStrong: '#d7eaa3',
  accentAltStrong: '#ddd7ff',
  ink: '#f4f3ee',
};

const DIFFICULTY_THEME_MAP: Record<Difficulty, DifficultyTheme> = {
  [Difficulty.Easy]: {
    accentRgb: '120 216 159',
    accentAltRgb: '96 198 173',
    accentStrong: '#d7f5e3',
    accentAltStrong: '#d7f0ea',
    ink: '#effcf5',
  },
  [Difficulty.Medium]: {
    accentRgb: '212 181 109',
    accentAltRgb: '224 153 102',
    accentStrong: '#f4e5bf',
    accentAltStrong: '#f6ddcb',
    ink: '#fff7e9',
  },
  [Difficulty.Hard]: {
    accentRgb: '239 140 140',
    accentAltRgb: '231 111 130',
    accentStrong: '#ffd7d7',
    accentAltStrong: '#ffd3db',
    ink: '#fff1f1',
  },
  [Difficulty.UltraHard]: {
    accentRgb: '168 85 247',
    accentAltRgb: '205 92 255',
    accentStrong: '#ead8ff',
    accentAltStrong: '#f3ddff',
    ink: '#faf3ff',
  },
};

export function getDifficultyTheme(difficulty?: Difficulty | null): DifficultyTheme {
  if (!difficulty) {
    return DEFAULT_DIFFICULTY_THEME;
  }

  return DIFFICULTY_THEME_MAP[difficulty] ?? DEFAULT_DIFFICULTY_THEME;
}

export function buildDifficultyThemeVars(
  difficulty: Difficulty | null | undefined,
  prefix: string,
): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);

  return {
    [`--${prefix}-accent-rgb`]: theme.accentRgb,
    [`--${prefix}-accent-alt-rgb`]: theme.accentAltRgb,
    [`--${prefix}-accent-strong`]: theme.accentStrong,
    [`--${prefix}-accent-alt-strong`]: theme.accentAltStrong,
    [`--${prefix}-ink`]: theme.ink,
  };
}
