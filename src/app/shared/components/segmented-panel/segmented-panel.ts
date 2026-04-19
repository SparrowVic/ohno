import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-segmented-panel',
  templateUrl: './segmented-panel.html',
  styleUrl: './segmented-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.segmented-panel]': 'true',
    '[class.segmented-panel--horizontal]': 'orientation() === "horizontal"',
    '[class.segmented-panel--vertical]': 'orientation() === "vertical"',
  },
})
export class SegmentedPanel {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
