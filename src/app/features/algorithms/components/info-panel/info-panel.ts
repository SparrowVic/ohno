import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { AlgorithmItem } from '../../models/algorithm';

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
  imports: [],
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
