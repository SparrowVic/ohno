import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { VoronoiDiagramStepState } from '../../models/geometry';

@Component({
  selector: 'app-voronoi-trace-panel',
  imports: [],
  templateUrl: './voronoi-trace-panel.html',
  styleUrl: './voronoi-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiTracePanel {
  readonly state = input<VoronoiDiagramStepState | null>(null);

  readonly activeSite = computed(() =>
    this.state()?.points.find((point) => point.id === this.state()?.activeSiteId) ?? null,
  );
}
