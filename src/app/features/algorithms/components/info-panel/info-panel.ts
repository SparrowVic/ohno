import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { AlgorithmItem } from '../../models/algorithm';

interface ComplexityCard {
  readonly label: string;
  readonly value: string;
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
      { label: 'Time worst', value: algo.complexity.timeWorst },
      { label: 'Space', value: algo.complexity.space },
      this.metaCard(algo),
    ];
  });

  private metaCard(algo: AlgorithmItem): ComplexityCard {
    if (algo.stable !== undefined) {
      return { label: 'Stable', value: algo.stable ? 'Yes' : 'No' };
    }

    if (algo.inPlace !== undefined) {
      return { label: 'In place', value: algo.inPlace ? 'Yes' : 'No' };
    }

    return { label: 'Category', value: algo.category };
  }
}
