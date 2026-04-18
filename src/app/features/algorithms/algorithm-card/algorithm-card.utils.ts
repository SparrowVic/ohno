import { buildDifficultyThemeVars, getDifficultyTheme } from '../../../shared/difficulty-theme';
import { AlgorithmItem, Difficulty } from '../models/algorithm';

export interface CardMetric {
  readonly label: string;
  readonly value: string;
}

function normalizeCardValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, '')
    .trim();
}

function isComplexityNotation(value: string): boolean {
  return /(?:^|[^a-z])(o|θ|ω)\s*\(/iu.test(value);
}

function rgbToComma(spaceSep: string): string {
  return spaceSep.trim().replace(/\s+/g, ', ');
}

function hashSeed(value: string, salt: number): number {
  let hash = 2166136261 ^ salt;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function numberFromSeed(seed: string, salt: number, min: number, max: number): number {
  const ratio = hashSeed(seed, salt) / 4294967295;
  return min + ratio * (max - min);
}

export function buildSemanticTags(algorithm: AlgorithmItem): readonly string[] {
  const complexityValues = new Set(
    [
      algorithm.complexity.timeBest,
      algorithm.complexity.timeAverage,
      algorithm.complexity.timeWorst,
      algorithm.complexity.space,
    ].map(normalizeCardValue),
  );

  const seen = new Set<string>();

  return algorithm.tags.filter((tag) => {
    const normalized = normalizeCardValue(tag);

    if (!normalized || isComplexityNotation(tag) || complexityValues.has(normalized) || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => {
      if (chunk === 'dp') return 'DP';
      if (chunk === 'mst') return 'MST';
      return chunk.charAt(0).toUpperCase() + chunk.slice(1);
    })
    .join(' ');
}

export function createPrimaryBlobStyle(seed: string, difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb = rgbToComma(theme.accentRgb);
  const fromRight = hashSeed(seed, 31) % 2 === 0;

  return {
    top: `${numberFromSeed(seed, 12, 18, 82).toFixed(1)}%`,
    left: fromRight
      ? `${numberFromSeed(seed, 11, 92, 108).toFixed(1)}%`
      : `${numberFromSeed(seed, 11, -8, 10).toFixed(1)}%`,
    width: `${numberFromSeed(seed, 13, 228, 320).toFixed(0)}px`,
    height: `${numberFromSeed(seed, 14, 196, 286).toFixed(0)}px`,
    background: `radial-gradient(ellipse at center, rgba(${rgb}, 0.24) 0%, rgba(${rgb}, 0.13) 36%, rgba(${rgb}, 0.05) 58%, transparent 76%)`,
  };
}

export function createWashStyle(difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb = rgbToComma(theme.accentRgb);
  return {
    background: `linear-gradient(145deg, rgba(${rgb}, 0.06) 0%, rgba(${rgb}, 0.03) 32%, transparent 58%, rgba(${rgb}, 0.015) 100%)`,
  };
}

export function createCardStyleVars(seed: string, difficulty: Difficulty): Record<string, string> {
  const fromRight = hashSeed(seed, 31) % 2 === 0;

  return {
    ...buildDifficultyThemeVars(difficulty, 'card'),
    '--card-blob-1-x': fromRight
      ? `${numberFromSeed(seed, 11, 92, 108).toFixed(1)}%`
      : `${numberFromSeed(seed, 11, -8, 10).toFixed(1)}%`,
    '--card-blob-1-y': `${numberFromSeed(seed, 12, 18, 82).toFixed(1)}%`,
    '--card-blob-1-width': `${numberFromSeed(seed, 13, 228, 320).toFixed(0)}px`,
    '--card-blob-1-height': `${numberFromSeed(seed, 14, 196, 286).toFixed(0)}px`,
    '--card-grid-size': `${numberFromSeed(seed, 19, 18, 25).toFixed(0)}px`,
    '--card-preview-angle': `${numberFromSeed(seed, 20, 144, 196).toFixed(0)}deg`,
  };
}
