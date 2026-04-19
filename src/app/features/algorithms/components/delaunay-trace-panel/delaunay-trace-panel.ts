import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DelaunayTriangulationStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-delaunay-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection],
  templateUrl: './delaunay-trace-panel.html',
  styleUrl: './delaunay-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayTracePanel {
  readonly state = input<DelaunayTriangulationStepState | null>(null);

  readonly currentCircle = computed(() => this.state()?.circles[0] ?? null);
  readonly showCircleDetails = computed(() => (this.state()?.phase ?? '') !== 'init');

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }
}
