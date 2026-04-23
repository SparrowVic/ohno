import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MathText } from '../math-text/math-text';

@Component({
  selector: 'app-segmented-panel-section',
  imports: [MathText],
  templateUrl: './segmented-panel-section.html',
  styleUrl: './segmented-panel-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.segmented-panel-section]': 'true',
  },
})
export class SegmentedPanelSection {
  readonly eyebrow = input<string | null>(null);
  readonly value = input<string | number | null>(null);
  readonly badge = input<string | number | null>(null);
  readonly valueMono = input(false);

  readonly valueText = computed(() => {
    const value = this.value();
    return value === null || value === undefined ? null : String(value);
  });
}
