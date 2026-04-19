import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SweepLineStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-sweep-line-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection],
  templateUrl: './sweep-line-trace-panel.html',
  styleUrl: './sweep-line-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineTracePanel {
  readonly state = input<SweepLineStepState | null>(null);
}
