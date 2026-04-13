import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SweepLineStepState } from '../../models/geometry';

@Component({
  selector: 'app-sweep-line-trace-panel',
  imports: [],
  templateUrl: './sweep-line-trace-panel.html',
  styleUrl: './sweep-line-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineTracePanel {
  readonly state = input<SweepLineStepState | null>(null);
}
