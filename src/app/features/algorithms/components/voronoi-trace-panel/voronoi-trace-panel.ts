import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { VoronoiDiagramStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-voronoi-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection],
  templateUrl: './voronoi-trace-panel.html',
  styleUrl: './voronoi-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiTracePanel {
  readonly state = input<VoronoiDiagramStepState | null>(null);

  readonly activeSite = computed(
    () => this.state()?.points.find((point) => point.id === this.state()?.activeSiteId) ?? null,
  );
  readonly showActiveSiteDetails = computed(() => (this.state()?.phase ?? '') !== 'init');

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }
}
