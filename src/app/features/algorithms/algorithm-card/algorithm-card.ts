import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { buildDifficultyThemeVars, getDifficultyTheme } from '../../../shared/difficulty-theme';
import { AlgorithmItem, Difficulty } from '../models/algorithm';

interface CardMetric {
  readonly label: string;
  readonly value: string;
}

function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => {
      if (chunk === 'dp') return 'DP';
      if (chunk === 'mst') return 'MST';
      return chunk.charAt(0).toUpperCase() + chunk.slice(1);
    })
    .join(' ');
}

function rgbToComma(spaceSep: string): string {
  return spaceSep.trim().replace(/\s+/g, ', ');
}

function createPrimaryBlobStyle(seed: string, difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb = rgbToComma(theme.accentRgb);
  return {
    top: `${numberFromSeed(seed, 12, 0, 18).toFixed(1)}%`,
    left: `${numberFromSeed(seed, 11, 6, 24).toFixed(1)}%`,
    width: `${numberFromSeed(seed, 13, 168, 236).toFixed(0)}px`,
    height: `${numberFromSeed(seed, 14, 132, 196).toFixed(0)}px`,
    background: `radial-gradient(circle, rgba(${rgb}, 0.30) 0%, rgba(${rgb}, 0.16) 34%, rgba(${rgb}, 0.07) 58%, transparent 74%)`,
  };
}

function createSecondaryBlobStyle(seed: string, difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb = rgbToComma(theme.accentAltRgb);
  return {
    top: `${numberFromSeed(seed, 16, 58, 88).toFixed(1)}%`,
    left: `${numberFromSeed(seed, 15, 72, 96).toFixed(1)}%`,
    width: `${numberFromSeed(seed, 17, 132, 196).toFixed(0)}px`,
    height: `${numberFromSeed(seed, 18, 116, 176).toFixed(0)}px`,
    background: `radial-gradient(circle, rgba(${rgb}, 0.20) 0%, rgba(${rgb}, 0.11) 30%, rgba(${rgb}, 0.04) 54%, transparent 72%)`,
  };
}

function createWashStyle(difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb1 = rgbToComma(theme.accentRgb);
  const rgb2 = rgbToComma(theme.accentAltRgb);
  return {
    background: `linear-gradient(145deg, rgba(${rgb1}, 0.11) 0%, rgba(${rgb1}, 0.05) 34%, transparent 62%, rgba(${rgb2}, 0.06) 100%)`,
  };
}

function createPreviewBars(seed: string): readonly number[] {
  const source = seed.replace(/-/g, '') || 'visual';

  return Array.from({ length: 7 }, (_, index) => {
    const code = source.charCodeAt(index % source.length);
    return 26 + (code % 54);
  });
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

function createCardStyleVars(seed: string, difficulty: Difficulty): Record<string, string> {
  return {
    ...buildDifficultyThemeVars(difficulty, 'card'),
    '--card-blob-1-x': `${numberFromSeed(seed, 11, 6, 24).toFixed(1)}%`,
    '--card-blob-1-y': `${numberFromSeed(seed, 12, 0, 18).toFixed(1)}%`,
    '--card-blob-1-width': `${numberFromSeed(seed, 13, 168, 236).toFixed(0)}px`,
    '--card-blob-1-height': `${numberFromSeed(seed, 14, 132, 196).toFixed(0)}px`,
    '--card-blob-2-x': `${numberFromSeed(seed, 15, 72, 96).toFixed(1)}%`,
    '--card-blob-2-y': `${numberFromSeed(seed, 16, 58, 88).toFixed(1)}%`,
    '--card-blob-2-width': `${numberFromSeed(seed, 17, 132, 196).toFixed(0)}px`,
    '--card-blob-2-height': `${numberFromSeed(seed, 18, 116, 176).toFixed(0)}px`,
    '--card-grid-size': `${numberFromSeed(seed, 19, 18, 25).toFixed(0)}px`,
    '--card-preview-angle': `${numberFromSeed(seed, 20, 144, 196).toFixed(0)}deg`,
  };
}

@Component({
  selector: 'app-algorithm-card',
  imports: [NgStyle, RouterLink],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard {
  private readonly language = inject(AppLanguageService);

  readonly algorithm = input.required<AlgorithmItem>();
  readonly facetLabel = computed(() =>
    formatFacetLabel(this.algorithm().subcategory || this.algorithm().category),
  );
  readonly difficultyLabel = computed(() =>
    getDifficultyLabel(this.algorithm().difficulty, this.language.activeLang()),
  );
  readonly statusLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Interactive'
        : 'Coming soon'
      : this.algorithm().implemented
        ? 'Interaktywny'
        : 'Wkrótce',
  );
  readonly ctaLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Open visualization'
        : 'In roadmap'
      : this.algorithm().implemented
        ? 'Otwórz wizualizację'
        : 'W roadmapie',
  );
  readonly previewLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Live signal'
        : 'Roadmap'
      : this.algorithm().implemented
        ? 'Live signal'
        : 'Roadmap',
  );
  readonly previewHint = computed(() =>
    this.algorithm().implemented
      ? this.algorithm().complexity.timeAverage
      : this.language.activeLang() === APP_LANG.EN
        ? 'Interactive walkthrough planned'
        : 'Planowana interaktywna wizualizacja',
  );
  readonly displayTags = computed(() => this.algorithm().tags.slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.algorithm().tags.length - this.displayTags().length,
  );
  readonly previewBars = computed(() => createPreviewBars(this.algorithm().id));
  readonly cardStyle = computed<Record<string, string>>(() =>
    createCardStyleVars(this.algorithm().id, this.algorithm().difficulty),
  );
  readonly primaryBlobStyle = computed(() =>
    createPrimaryBlobStyle(this.algorithm().id, this.algorithm().difficulty),
  );
  readonly secondaryBlobStyle = computed(() =>
    createSecondaryBlobStyle(this.algorithm().id, this.algorithm().difficulty),
  );
  readonly washStyle = computed(() => createWashStyle(this.algorithm().difficulty));
  readonly metrics = computed<readonly CardMetric[]>(() => {
    const lang = this.language.activeLang();
    return [
      {
        label: lang === APP_LANG.EN ? 'Time' : 'Czas',
        value: this.algorithm().complexity.timeAverage,
      },
      {
        label: lang === APP_LANG.EN ? 'Space' : 'Pamięć',
        value: this.algorithm().complexity.space,
      },
    ];
  });
}
