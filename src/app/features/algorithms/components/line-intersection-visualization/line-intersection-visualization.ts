import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { LineIntersectionStepState, isLineIntersectionState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-line-intersection-visualization',
  imports: [],
  templateUrl: './line-intersection-visualization.html',
  styleUrl: './line-intersection-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineIntersectionVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<LineIntersectionStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isLineIntersectionState(geometry) ? geometry : null;
  });
  readonly segments = computed(() => this.geoState()?.segments ?? []);
  readonly intersections = computed(() => this.geoState()?.intersections ?? []);
  readonly events = computed(() => this.geoState()?.events ?? []);

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Sweep Setup';
      case 'activate': return 'Endpoint Insert';
      case 'retire': return 'Endpoint Remove';
      case 'intersection': return 'Crossing Found';
      case 'complete': return 'Sweep Complete';
      default: return phase;
    }
  }
}
