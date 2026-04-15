import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { buildCategoryThemeVars, getCategoryTheme } from '../../../shared/category-theme';
import { AlgorithmItem } from '../models/algorithm';

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

function createPrimaryBlobStyle(seed: string, category: string): Record<string, string> {
  const theme = getCategoryTheme(category);
  const rgb = rgbToComma(theme.accentRgb);
  return {
    top: `${numberFromSeed(seed, 12, -12, 20).toFixed(1)}%`,
    left: `${numberFromSeed(seed, 11, -6, 26).toFixed(1)}%`,
    width: `${numberFromSeed(seed, 13, 180, 260).toFixed(0)}px`,
    height: `${numberFromSeed(seed, 14, 140, 220).toFixed(0)}px`,
    background: `radial-gradient(circle, rgba(${rgb}, 0.68) 0%, rgba(${rgb}, 0.40) 30%, rgba(${rgb}, 0.14) 58%, transparent 70%)`,
  };
}

function createSecondaryBlobStyle(seed: string, category: string): Record<string, string> {
  const theme = getCategoryTheme(category);
  const rgb = rgbToComma(theme.accentAltRgb);
  return {
    top: `${numberFromSeed(seed, 16, 46, 94).toFixed(1)}%`,
    left: `${numberFromSeed(seed, 15, 72, 108).toFixed(1)}%`,
    width: `${numberFromSeed(seed, 17, 150, 228).toFixed(0)}px`,
    height: `${numberFromSeed(seed, 18, 132, 208).toFixed(0)}px`,
    background: `radial-gradient(circle, rgba(${rgb}, 0.52) 0%, rgba(${rgb}, 0.28) 28%, rgba(${rgb}, 0.08) 54%, transparent 70%)`,
  };
}

function createWashStyle(category: string): Record<string, string> {
  const theme = getCategoryTheme(category);
  const rgb1 = rgbToComma(theme.accentRgb);
  const rgb2 = rgbToComma(theme.accentAltRgb);
  return {
    background: `linear-gradient(145deg, rgba(${rgb1}, 0.28) 0%, rgba(${rgb1}, 0.14) 28%, transparent 58%, rgba(${rgb2}, 0.12) 100%)`,
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

function createCardStyleVars(seed: string, category: string): Record<string, string> {
  return {
    ...buildCategoryThemeVars(category, 'card'),
    '--card-blob-1-x': `${numberFromSeed(seed, 11, -6, 26).toFixed(1)}%`,
    '--card-blob-1-y': `${numberFromSeed(seed, 12, -12, 20).toFixed(1)}%`,
    '--card-blob-1-width': `${numberFromSeed(seed, 13, 180, 260).toFixed(0)}px`,
    '--card-blob-1-height': `${numberFromSeed(seed, 14, 140, 220).toFixed(0)}px`,
    '--card-blob-2-x': `${numberFromSeed(seed, 15, 72, 108).toFixed(1)}%`,
    '--card-blob-2-y': `${numberFromSeed(seed, 16, 46, 94).toFixed(1)}%`,
    '--card-blob-2-width': `${numberFromSeed(seed, 17, 150, 228).toFixed(0)}px`,
    '--card-blob-2-height': `${numberFromSeed(seed, 18, 132, 208).toFixed(0)}px`,
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
    createCardStyleVars(
      this.algorithm().id,
      this.algorithm().subcategory || this.algorithm().category,
    ),
  );
  readonly primaryBlobStyle = computed(() =>
    createPrimaryBlobStyle(
      this.algorithm().id,
      this.algorithm().subcategory || this.algorithm().category,
    ),
  );
  readonly secondaryBlobStyle = computed(() =>
    createSecondaryBlobStyle(
      this.algorithm().id,
      this.algorithm().subcategory || this.algorithm().category,
    ),
  );
  readonly washStyle = computed(() =>
    createWashStyle(this.algorithm().subcategory || this.algorithm().category),
  );
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
