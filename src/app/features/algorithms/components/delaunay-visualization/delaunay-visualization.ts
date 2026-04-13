import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  DelaunayTriangulationStepState,
  GeometryPolygonRegion,
  isDelaunayTriangulationState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-delaunay-visualization',
  imports: [],
  templateUrl: './delaunay-visualization.html',
  styleUrl: './delaunay-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<DelaunayTriangulationStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isDelaunayTriangulationState(geometry) ? geometry : null;
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Star Field';
      case 'circumcircle': return 'Circle Test';
      case 'commit': return 'Triangle Commit';
      case 'complete': return 'Mesh Ready';
      default: return phase;
    }
  }
}
