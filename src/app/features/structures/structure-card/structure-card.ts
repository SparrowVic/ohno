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

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { buildDifficultyThemeVars, getDifficultyTheme } from '../../../shared/difficulty-theme';
import { InsaneShaderPoolService } from '../../../shared/insane-shader-pool.service';
import { RoadmapOverlayDirective } from '../../../shared/directives/roadmap-overlay/roadmap-overlay.directive';
import { ShaderCardEffect } from '../../../shared/components/shader-card-effect/shader-card-effect';
import { UiTag } from '../../../shared/components/ui-tag/ui-tag';
import { Difficulty } from '../../algorithms/models/algorithm';
import { StructureCardPreview } from './structure-card-preview/structure-card-preview';
import { StructureItem } from '../models/structure';

function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
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
  const rgb = rgbToComma(theme.accentRgb);
  return {
    background: `linear-gradient(145deg, rgba(${rgb}, 0.06) 0%, rgba(${rgb}, 0.03) 32%, transparent 58%, rgba(${rgb}, 0.015) 100%)`,
  };
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
  selector: 'app-structure-card',
  imports: [StructureCardPreview, NgStyle, ShaderCardEffect, RoadmapOverlayDirective, UiTag],
  templateUrl: './structure-card.html',
  styleUrl: './structure-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCard implements AfterViewInit {
  private readonly language = inject(AppLanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly shaderPool = inject(InsaneShaderPoolService);
  private readonly inViewportState = signal(false);
  private intersectionObserver: IntersectionObserver | null = null;

  readonly structure = input.required<StructureItem>();
  readonly shaderSeed = computed(() => `structure:${this.structure().id}`);
  readonly isInsane = computed(() => this.structure().difficulty === Difficulty.UltraHard);
  readonly showShader = computed(
    () =>
      this.isInsane() &&
      this.inViewportState() &&
      this.shaderPool.has(this.shaderSeed()),
  );
  readonly facetLabel = computed(() =>
    formatFacetLabel(this.structure().subcategory || this.structure().category),
  );
  readonly difficultyLabel = computed(() =>
    getDifficultyLabel(this.structure().difficulty, this.language.activeLang()),
  );
  readonly statusLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Interactive'
        : 'Coming soon'
      : this.structure().implemented
        ? 'Interaktywna'
        : 'Wkrótce',
  );
  readonly ctaLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Open module'
        : 'In roadmap'
      : this.structure().implemented
        ? 'Otwórz moduł'
        : 'W roadmapie',
  );
  readonly previewHint = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Interactive model ready'
        : 'Planned deep-dive module'
      : this.structure().implemented
        ? 'Interaktywny model gotowy'
        : 'Planowany moduł deep-dive',
  );
  readonly roadmapChipLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Roadmap' : 'Roadmap',
  );
  readonly roadmapTitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Module locked for now'
      : 'Moduł chwilowo zablokowany',
  );
  readonly roadmapHint = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'This structure is planned and visible in the roadmap, but its interactive module is not ready yet.'
      : 'Ta struktura jest już widoczna na roadmapie, ale jej interaktywny moduł nie jest jeszcze gotowy.',
  );
  readonly displayTags = computed(() => this.structure().tags.slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.structure().tags.length - this.displayTags().length,
  );
  readonly cardStyle = computed<Record<string, string>>(() =>
    createCardStyleVars(this.structure().id, this.structure().difficulty),
  );
  readonly primaryBlobStyle = computed(() =>
    createPrimaryBlobStyle(this.structure().id, this.structure().difficulty),
  );
  readonly washStyle = computed(() => createWashStyle(this.structure().difficulty));

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.intersectionObserver?.disconnect();
      this.shaderPool.deactivate(this.shaderSeed());
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
        const shaderId = this.shaderSeed();
        const shouldActivate = this.isInsane() && this.inViewportState();
        this.shaderPool.activeIds();

        if (shouldActivate) {
          this.shaderPool.activate(shaderId);
        } else {
          this.shaderPool.deactivate(shaderId);
        }
      },
      { injector: this.injector },
    );
  }
}
