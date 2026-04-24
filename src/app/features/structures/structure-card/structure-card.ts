import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getStructureFacetLabelKey } from '../../../core/i18n/catalog-labels';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { buildDifficultyThemeVars } from '../../../shared/difficulty-theme';
import { RoadmapOverlayDirective } from '../../../shared/directives/roadmap-overlay/roadmap-overlay.directive';
import { UiTag } from '../../../shared/components/ui-tag/ui-tag';
import { Difficulty } from '../../algorithms/models/algorithm';
import { StructureCardPreview } from './structure-card-preview/structure-card-preview';
import { StructureItem } from '../models/structure';

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  [Difficulty.Easy]: 1,
  [Difficulty.Medium]: 2,
  [Difficulty.Hard]: 3,
  [Difficulty.UltraHard]: 4,
};

function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
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
    '--card-grid-size': `${numberFromSeed(seed, 19, 18, 25).toFixed(0)}px`,
    '--card-preview-angle': `${numberFromSeed(seed, 20, 144, 196).toFixed(0)}deg`,
  };
}

@Component({
  selector: 'app-structure-card',
  imports: [StructureCardPreview, NgStyle, RoadmapOverlayDirective, UiTag],
  templateUrl: './structure-card.html',
  styleUrl: './structure-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCard {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly structure = input.required<StructureItem>();
  readonly isInsane = computed(() => this.structure().difficulty === Difficulty.UltraHard);
  readonly difficultyRank = computed(() => DIFFICULTY_RANK[this.structure().difficulty] ?? 1);
  readonly difficultyPips = computed(() => {
    const filled = this.difficultyRank();
    return [0, 1, 2, 3].map((index) => index < filled);
  });
  readonly facetLabel = computed(() => {
    const facet = this.structure().subcategory || this.structure().category;
    const key = getStructureFacetLabelKey(facet);
    return key ? this.translate(key) : formatFacetLabel(facet);
  });
  readonly difficultyLabel = computed(() =>
    this.translate(getDifficultyLabelKey(this.structure().difficulty)),
  );
  readonly statusLabel = computed(() =>
    this.translate(
      this.structure().implemented
        ? t('features.structures.card.status.interactive')
        : t('features.structures.card.status.comingSoon'),
    ),
  );
  readonly ctaLabel = computed(() =>
    this.translate(
      this.structure().implemented
        ? t('features.structures.card.cta.openModule')
        : t('features.structures.card.cta.inRoadmap'),
    ),
  );
  readonly previewHint = computed(() =>
    this.translate(
      this.structure().implemented
        ? t('features.structures.card.preview.readyHint')
        : t('features.structures.card.preview.plannedHint'),
    ),
  );
  readonly roadmapChipLabel = computed(() => this.translate(t('shared.roadmap.chip')));
  readonly roadmapTitle = computed(() =>
    this.translate(t('features.structures.card.roadmap.title')),
  );
  readonly roadmapHint = computed(() => this.translate(t('features.structures.card.roadmap.hint')));
  readonly displayTags = computed(() => this.structure().tags.slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.structure().tags.length - this.displayTags().length,
  );
  readonly cardStyle = computed<Record<string, string>>(() =>
    createCardStyleVars(this.structure().id, this.structure().difficulty),
  );

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
