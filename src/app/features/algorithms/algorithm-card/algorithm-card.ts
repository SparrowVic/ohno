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
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { getAlgorithmFacetLabelKey } from '../../../core/i18n/catalog-labels';
import { InsaneShaderPoolService } from '../../../shared/insane-shader-pool.service';
import { RoadmapOverlayDirective } from '../../../shared/directives/roadmap-overlay/roadmap-overlay.directive';
import { ShaderCardEffect } from '../../../shared/components/shader-card-effect/shader-card-effect';
import { UiTag } from '../../../shared/components/ui-tag/ui-tag';
import { MathText } from '../../../shared/components/math-text/math-text';
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
  imports: [
    NgStyle,
    NgTemplateOutlet,
    RouterLink,
    ShaderCardEffect,
    AlgorithmCardPreview,
    RoadmapOverlayDirective,
    MathText,
    UiTag,
  ],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard implements AfterViewInit {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
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
    () => this.isInsane() && this.inViewportState() && this.shaderPool.has(this.algorithm().id),
  );
  readonly facetLabel = computed(() => {
    const facet = this.algorithm().subcategory || this.algorithm().category;
    const key = getAlgorithmFacetLabelKey(facet);
    return key ? this.translate(key) : formatFacetLabel(facet);
  });
  readonly difficultyLabel = computed(() =>
    this.translate(getDifficultyLabelKey(this.algorithm().difficulty)),
  );
  readonly statusLabel = computed(() =>
    this.translate(
      this.algorithm().implemented
        ? t('features.algorithms.card.status.interactive')
        : t('features.algorithms.card.status.comingSoon'),
    ),
  );
  readonly ctaLabel = computed(() =>
    this.translate(
      this.algorithm().implemented
        ? t('features.algorithms.card.cta.openVisualization')
        : t('features.algorithms.card.cta.inRoadmap'),
    ),
  );
  readonly previewLabel = computed(() =>
    this.translate(
      this.algorithm().implemented
        ? t('features.algorithms.card.preview.liveSignal')
        : t('features.algorithms.card.preview.roadmap'),
    ),
  );
  readonly previewHint = computed(() =>
    this.algorithm().implemented
      ? null
      : this.translate(t('features.algorithms.card.preview.plannedHint')),
  );
  readonly roadmapChipLabel = computed(() => this.translate(t('shared.roadmap.chip')));
  readonly roadmapTitle = computed(() =>
    this.translate(t('features.algorithms.card.roadmap.title')),
  );
  readonly roadmapHint = computed(() => this.translate(t('features.algorithms.card.roadmap.hint')));
  readonly semanticTags = computed(() => buildSemanticTags(this.algorithm()));
  readonly displayTags = computed(() => this.semanticTags().slice(0, 3));
  readonly hiddenTagsCount = computed(() => this.semanticTags().length - this.displayTags().length);
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
    return [
      {
        label: this.translate(t('features.algorithms.card.metrics.time')),
        value: this.algorithm().complexity.timeAverage,
      },
      {
        label: this.translate(t('features.algorithms.card.metrics.space')),
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

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
