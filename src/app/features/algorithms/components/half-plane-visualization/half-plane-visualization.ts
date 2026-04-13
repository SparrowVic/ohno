import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  GeometryPolygonRegion,
  HalfPlaneIntersectionStepState,
  isHalfPlaneIntersectionState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-half-plane-visualization',
  imports: [],
  templateUrl: './half-plane-visualization.html',
  styleUrl: './half-plane-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<HalfPlaneIntersectionStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isHalfPlaneIntersectionState(geometry) ? geometry : null;
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Initial Region';
      case 'constraint': return 'Apply Constraint';
      case 'clip': return 'Clip Result';
      case 'infeasible': return 'No Feasible Region';
      case 'complete': return 'Intersection Ready';
      default: return phase;
    }
  }
}
