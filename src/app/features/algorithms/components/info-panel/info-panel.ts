import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { getAlgorithmFacetLabelKey } from '../../../../core/i18n/catalog-labels';
import { AlgorithmItem } from '../../models/algorithm';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { SORT_ALGORITHM_TUTORIALS } from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { UiTag } from '../../../../shared/components/ui-tag/ui-tag';

interface AlgorithmTutorial {
  readonly pattern: string;
  readonly keyIdea: string;
  readonly watch: string;
  readonly howItWorks: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}

interface ComplexityCard {
  readonly label: string;
  readonly value: string;
}

function humanize(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-info-panel',
  imports: [UiTag],
  templateUrl: './info-panel.html',
  styleUrl: './info-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly algorithm = input.required<AlgorithmItem>();
  readonly briefingLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.briefing')),
  );
  readonly algorithmProfileLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.algorithmProfile')),
  );
  readonly tutorialLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.tutorial')),
  );
  readonly howItWorksLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.howItWorks')),
  );
  readonly algorithmStepsAriaLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.algorithmStepsAriaLabel')),
  );
  readonly strengthsLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.strengths')),
  );
  readonly tradeOffsLabel = computed(() =>
    this.translate(t('features.algorithms.infoPanel.tradeOffs')),
  );

  readonly cards = computed<readonly ComplexityCard[]>(() => {
    const algo = this.algorithm();
    return [
      {
        label: this.translate(t('features.algorithms.infoPanel.cards.timeBest')),
        value: algo.complexity.timeBest,
      },
      {
        label: this.translate(t('features.algorithms.infoPanel.cards.timeAverage')),
        value: algo.complexity.timeAverage,
      },
      {
        label: this.translate(t('features.algorithms.infoPanel.cards.timeWorst')),
        value: algo.complexity.timeWorst,
      },
      {
        label: this.translate(t('features.algorithms.infoPanel.cards.space')),
        value: algo.complexity.space,
      },
      this.metaCard(algo),
      {
        label: this.translate(t('features.algorithms.infoPanel.cards.subcategory')),
        value: this.translateFacet(algo.subcategory),
      },
    ];
  });
  readonly tags = computed(() => this.algorithm().tags);

  /** Full tutorial for the current algorithm — rendered as a separate
   *  section below the profile so the Info tab doubles as a concise
   *  reference / learning page. We check the sorting and graph
   *  catalogs in turn; null for algorithms without a catalog entry,
   *  which keep the minimal profile-only view. */
  readonly tutorial = computed<AlgorithmTutorial | null>(() => {
    const id = this.algorithm().id;
    return SORT_ALGORITHM_TUTORIALS[id] ?? GRAPH_ALGORITHM_TUTORIALS[id] ?? null;
  });

  private metaCard(algo: AlgorithmItem): ComplexityCard {
    if (algo.stable !== undefined) {
      return {
        label: this.translate(t('features.algorithms.infoPanel.cards.stable')),
        value: algo.stable
          ? this.translate(t('features.algorithms.infoPanel.cards.yes'))
          : this.translate(t('features.algorithms.infoPanel.cards.no')),
      };
    }

    if (algo.inPlace !== undefined) {
      return {
        label: this.translate(t('features.algorithms.infoPanel.cards.inPlace')),
        value: algo.inPlace
          ? this.translate(t('features.algorithms.infoPanel.cards.yes'))
          : this.translate(t('features.algorithms.infoPanel.cards.no')),
      };
    }

    return {
      label: this.translate(t('features.algorithms.infoPanel.cards.category')),
      value: this.translateFacet(algo.category),
    };
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }

  private translateFacet(facet: string): string {
    const key = getAlgorithmFacetLabelKey(facet);
    return key ? this.translate(key) : humanize(facet);
  }
}
