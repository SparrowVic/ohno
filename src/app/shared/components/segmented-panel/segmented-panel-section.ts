import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-segmented-panel-section',
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
}
