import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MinkowskiSumStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-minkowski-sum-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection],
  templateUrl: './minkowski-sum-trace-panel.html',
  styleUrl: './minkowski-sum-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinkowskiSumTracePanel {
  readonly state = input<MinkowskiSumStepState | null>(null);

  readonly currentVectors = computed(
    () => this.state()?.vectors.filter((vector) => vector.tone === 'current') ?? [],
  );

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init':
        return 'Input Shapes';
      case 'reflect':
        return 'Robot Reflection';
      case 'seed':
        return 'Seed Vertex';
      case 'merge':
        return 'Edge Merge';
      case 'complete':
        return 'Final Polygon';
      default:
        return phase;
    }
  }
}
