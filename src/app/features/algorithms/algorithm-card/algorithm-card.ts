import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { getAlgorithmFacetLabelKey } from '../../../core/i18n/catalog-labels';
import { RoadmapOverlayDirective } from '../../../shared/directives/roadmap-overlay/roadmap-overlay.directive';
import { UiTag } from '../../../shared/components/ui-tag/ui-tag';
import { MathText } from '../../../shared/components/math-text/math-text';
import { AlgorithmCardPreview } from './algorithm-card-preview/algorithm-card-preview';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import {
  buildSemanticTags,
  CardMetric,
  createCardStyleVars,
  formatFacetLabel,
} from './algorithm-card.utils/algorithm-card.utils';

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  [Difficulty.Easy]: 1,
  [Difficulty.Medium]: 2,
  [Difficulty.Hard]: 3,
  [Difficulty.UltraHard]: 4,
};

@Component({
  selector: 'app-algorithm-card',
  imports: [
    NgStyle,
    NgTemplateOutlet,
    RouterLink,
    AlgorithmCardPreview,
    RoadmapOverlayDirective,
    MathText,
    UiTag,
  ],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly algorithm = input.required<AlgorithmItem>();
  readonly cardLink = computed(() => ['/algorithms', this.algorithm().id]);
  readonly isInsane = computed(() => this.algorithm().difficulty === Difficulty.UltraHard);
  readonly isImplemented = computed(() => this.algorithm().implemented);
  readonly difficultyRank = computed(() => DIFFICULTY_RANK[this.algorithm().difficulty] ?? 1);
  readonly difficultyPips = computed(() => {
    const filled = this.difficultyRank();
    return [0, 1, 2, 3].map((index) => index < filled);
  });
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

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
