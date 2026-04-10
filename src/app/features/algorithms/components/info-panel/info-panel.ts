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
      { label: 'Stable', value: this.stableLabel(algo.stable) },
    ];
  });

  private stableLabel(stable: boolean | undefined): string {
    if (stable === undefined) return '—';
    return stable ? 'Yes' : 'No';
  }
}
