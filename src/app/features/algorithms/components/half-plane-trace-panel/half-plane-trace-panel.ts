import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { HalfPlaneIntersectionStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-half-plane-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection],
  templateUrl: './half-plane-trace-panel.html',
  styleUrl: './half-plane-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneTracePanel {
  readonly state = input<HalfPlaneIntersectionStepState | null>(null);

  readonly feasiblePolygon = computed(
    () =>
      this.state()?.polygons.find(
        (polygon) => polygon.tone === 'feasible' || polygon.tone === 'result',
      ) ?? null,
  );

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init':
        return 'Initial Region';
      case 'constraint':
        return 'Constraint Insert';
      case 'clip':
        return 'Clipped Region';
      case 'infeasible':
        return 'Infeasible';
      case 'complete':
        return 'Intersection Ready';
      default:
        return phase;
    }
  }
}
