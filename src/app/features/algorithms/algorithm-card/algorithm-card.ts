import { NgStyle, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
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
import { InsaneShaderPoolService } from '../../../shared/insane-shader-pool.service';
import { RoadmapOverlayDirective } from '../../../shared/directives/roadmap-overlay/roadmap-overlay.directive';
import { ShaderCardEffect } from '../../../shared/components/shader-card-effect/shader-card-effect';
import { AlgorithmCardPreview } from './algorithm-card-preview/algorithm-card-preview';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import {
  buildSemanticTags,
  CardMetric,
  createCardStyleVars,
  createPrimaryBlobStyle,
  createWashStyle,
  formatFacetLabel,
} from './algorithm-card.utils/algorithm-card.utils';

@Component({
  selector: 'app-algorithm-card',
  imports: [NgStyle, NgTemplateOutlet, RouterLink, ShaderCardEffect, AlgorithmCardPreview, RoadmapOverlayDirective],
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
  readonly cardLink = computed(() => ['/algorithms', this.algorithm().id]);
  readonly isInsane = computed(() => this.algorithm().difficulty === Difficulty.UltraHard);
  readonly isImplemented = computed(() => this.algorithm().implemented);
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
      ? null
      : this.language.activeLang() === APP_LANG.EN
        ? 'Interactive walkthrough planned'
        : 'Planowana interaktywna wizualizacja',
  );
  readonly roadmapChipLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Roadmap' : 'Roadmap',
  );
  readonly roadmapTitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Implementation planned'
      : 'Implementacja planowana',
  );
  readonly roadmapHint = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'This visualization is already on the roadmap, but the interactive build is still locked.'
      : 'Ta wizualizacja jest już na roadmapie, ale interaktywna implementacja jest jeszcze zablokowana.',
  );
  readonly semanticTags = computed(() => buildSemanticTags(this.algorithm()));
  readonly displayTags = computed(() => this.semanticTags().slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.semanticTags().length - this.displayTags().length,
  );
  readonly cardStyle = computed<Record<string, string>>(() =>
    createCardStyleVars(this.algorithm().id, this.algorithm().difficulty),
  );
  readonly insaneShaderColor = '#ff7a2f';
  readonly insaneShaderPositionX = 0.5;
  readonly insaneShaderPositionY = 0.052;
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
