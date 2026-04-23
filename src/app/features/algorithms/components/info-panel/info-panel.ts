import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { getAlgorithmFacetLabelKey } from '../../../../core/i18n/catalog-labels';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { AlgorithmItem } from '../../models/algorithm';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { SORT_ALGORITHM_TUTORIALS } from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { UiTag } from '../../../../shared/components/ui-tag/ui-tag';
import { MathText } from '../../../../shared/components/math-text/math-text';

interface AlgorithmTutorial {
  readonly pattern: string;
  readonly keyIdea: string;
  readonly watch: string;
  readonly howItWorks: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}

interface ComplexityCard {
  readonly labelKey: I18nKey;
  readonly value?: string;
  readonly valueKey?: I18nKey | null;
}

function humanize(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-info-panel',
  imports: [MathText, UiTag, TranslocoPipe],
  templateUrl: './info-panel.html',
  styleUrl: './info-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPanel {
  protected readonly I18N_KEY = I18N_KEY;
  protected readonly looksLikeI18nKey = looksLikeI18nKey;
  readonly algorithm = input.required<AlgorithmItem>();

  readonly cards = computed<readonly ComplexityCard[]>(() => {
    const algo = this.algorithm();
    return [
      {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.timeBest,
        value: algo.complexity.timeBest,
      },
      {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.timeAverage,
        value: algo.complexity.timeAverage,
      },
      {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.timeWorst,
        value: algo.complexity.timeWorst,
      },
      {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.space,
        value: algo.complexity.space,
      },
      this.metaCard(algo),
      {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.subcategory,
        valueKey: getAlgorithmFacetLabelKey(algo.subcategory),
        value: this.fallbackFacetLabel(algo.subcategory),
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
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.stable,
        valueKey: algo.stable
          ? I18N_KEY.features.algorithms.infoPanel.cards.yes
          : I18N_KEY.features.algorithms.infoPanel.cards.no,
      };
    }

    if (algo.inPlace !== undefined) {
      return {
        labelKey: I18N_KEY.features.algorithms.infoPanel.cards.inPlace,
        valueKey: algo.inPlace
          ? I18N_KEY.features.algorithms.infoPanel.cards.yes
          : I18N_KEY.features.algorithms.infoPanel.cards.no,
      };
    }

    return {
      labelKey: I18N_KEY.features.algorithms.infoPanel.cards.category,
      valueKey: getAlgorithmFacetLabelKey(algo.category),
      value: this.fallbackFacetLabel(algo.category),
    };
  }

  private fallbackFacetLabel(facet: string): string {
    return humanize(facet);
  }
}
