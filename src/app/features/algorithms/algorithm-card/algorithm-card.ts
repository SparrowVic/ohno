import { NgStyle, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { buildDifficultyThemeVars, getDifficultyTheme } from '../../../shared/difficulty-theme';
import { InsaneShaderPoolService } from '../../../shared/insane-shader-pool.service';
import { ShaderCardEffect } from '../../../shared/shader-card-effect/shader-card-effect';
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

function createWashStyle(difficulty: Difficulty): Record<string, string> {
  const theme = getDifficultyTheme(difficulty);
  const rgb1 = rgbToComma(theme.accentRgb);
  return {
    background: `linear-gradient(145deg, rgba(${rgb1}, 0.06) 0%, rgba(${rgb1}, 0.03) 32%, transparent 58%, rgba(${rgb1}, 0.015) 100%)`,
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

@Component({
  selector: 'app-algorithm-card',
  imports: [NgStyle, RouterLink, ShaderCardEffect],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard implements AfterViewInit {
  private readonly language = inject(AppLanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly shaderPool = inject(InsaneShaderPoolService);
  private readonly inViewportState = signal(false);
  private intersectionObserver: IntersectionObserver | null = null;

  readonly algorithm = input.required<AlgorithmItem>();
  readonly isInsane = computed(() => this.algorithm().difficulty === Difficulty.UltraHard);
  readonly showShader = computed(
    () =>
      this.isInsane() &&
      this.inViewportState() &&
      this.shaderPool.has(this.algorithm().id),
  );
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
  readonly insaneShaderColor = computed(() => '#ff7a2f');
  readonly insaneShaderPositionX = computed(() => 0.5);
  readonly insaneShaderPositionY = computed(() => 0.052);
  readonly primaryBlobStyle = computed(() =>
    createPrimaryBlobStyle(this.algorithm().id, this.algorithm().difficulty),
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.intersectionObserver?.disconnect();
      this.shaderPool.deactivate(this.algorithm().id);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.inViewportState.set(entry?.isIntersecting ?? false);
      },
      {
        threshold: 0.04,
        rootMargin: '120px 0px',
      },
    );

    this.intersectionObserver.observe(this.hostRef.nativeElement);

    effect(
      () => {
        const id = this.algorithm().id;
        const shouldActivate = this.isInsane() && this.inViewportState();
        this.shaderPool.activeIds();

        if (shouldActivate) {
          this.shaderPool.activate(id);
        } else {
          this.shaderPool.deactivate(id);
        }
      },
      { injector: this.injector },
    );
  }
}
