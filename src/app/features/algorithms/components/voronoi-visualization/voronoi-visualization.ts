import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  GeometryPolygonRegion,
  VoronoiDiagramStepState,
  isVoronoiDiagramState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-voronoi-visualization',
  imports: [],
  templateUrl: './voronoi-visualization.html',
  styleUrl: './voronoi-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<VoronoiDiagramStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isVoronoiDiagramState(geometry) ? geometry : null;
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }

  cellColor(id: string): string {
    const index = Number(id.replace('cell-', '')) || 0;
    const hues = [192, 330, 40, 145, 260, 15, 90, 210];
    return `hsla(${hues[index % hues.length]}, 78%, 66%, 0.15)`;
  }

  cellStroke(id: string): string {
    const index = Number(id.replace('cell-', '')) || 0;
    const hues = [192, 330, 40, 145, 260, 15, 90, 210];
    return `hsla(${hues[index % hues.length]}, 82%, 72%, 0.68)`;
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Site Field';
      case 'site': return 'Site Event';
      case 'cell': return 'Cell Freeze';
      case 'complete': return 'Diagram Ready';
      default: return phase;
    }
  }
}
