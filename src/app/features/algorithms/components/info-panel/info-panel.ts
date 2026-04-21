import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { AlgorithmItem } from '../../models/algorithm';
import {
  SORT_ALGORITHM_TUTORIALS,
  SortAlgorithmTutorial,
} from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { UiTag } from '../../../../shared/components/ui-tag/ui-tag';

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
  readonly algorithm = input.required<AlgorithmItem>();

  readonly cards = computed<readonly ComplexityCard[]>(() => {
    const algo = this.algorithm();
    return [
      { label: 'Time best', value: algo.complexity.timeBest },
      { label: 'Time average', value: algo.complexity.timeAverage },
      { label: 'Time worst', value: algo.complexity.timeWorst },
      { label: 'Space', value: algo.complexity.space },
      this.metaCard(algo),
      { label: 'Subcategory', value: humanize(algo.subcategory) },
    ];
  });
  readonly tags = computed(() => this.algorithm().tags);

  /** Full tutorial for sorting algorithms — rendered as a separate
   *  section below the profile so the Info tab doubles as a concise
   *  reference / learning page. Null for algorithms without a
   *  catalog entry; those keep the minimal profile-only view. */
  readonly tutorial = computed<SortAlgorithmTutorial | null>(() => {
    return SORT_ALGORITHM_TUTORIALS[this.algorithm().id] ?? null;
  });

  private metaCard(algo: AlgorithmItem): ComplexityCard {
    if (algo.stable !== undefined) {
      return { label: 'Stable', value: algo.stable ? 'Yes' : 'No' };
    }

    if (algo.inPlace !== undefined) {
      return { label: 'In place', value: algo.inPlace ? 'Yes' : 'No' };
    }

    return { label: 'Category', value: humanize(algo.category) };
  }
}
