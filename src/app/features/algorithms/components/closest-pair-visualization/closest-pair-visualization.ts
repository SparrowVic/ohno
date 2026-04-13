import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  ClosestPairStepState,
  GeometryBand,
  GeometryPairLine,
  GeometryPoint,
  isClosestPairState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-closest-pair-visualization',
  imports: [],
  templateUrl: './closest-pair-visualization.html',
  styleUrl: './closest-pair-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosestPairVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<ClosestPairStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isClosestPairState(geometry) ? geometry : null;
  });

  readonly points = computed(() => this.geoState()?.points ?? []);
  readonly bands = computed(() => this.geoState()?.bands ?? []);
  readonly dividers = computed(() => this.geoState()?.dividers ?? []);
  readonly pairLines = computed(() => this.geoState()?.pairLines ?? []);

  private readonly pointMap = computed(() => {
    const map = new Map<number, GeometryPoint>();
    for (const point of this.points()) {
      map.set(point.id, point);
    }
    return map;
  });

  ptSvgX(id: number): number {
    return this.pointMap().get(id)?.x ?? 0;
  }

  ptSvgY(id: number): number {
    return 100 - (this.pointMap().get(id)?.y ?? 0);
  }

  ptTransform(point: GeometryPoint): string {
    return `translate(${point.x}, ${100 - point.y})`;
  }

  pairMidX(pair: GeometryPairLine): number {
    const [left, right] = pair.pointIds;
    return (this.ptSvgX(left) + this.ptSvgX(right)) / 2;
  }

  pairMidY(pair: GeometryPairLine): number {
    const [left, right] = pair.pointIds;
    return (this.ptSvgY(left) + this.ptSvgY(right)) / 2 - 3.4;
  }

  showGlow(point: GeometryPoint): boolean {
    return point.status === 'compare' || point.status === 'best' || point.status === 'strip';
  }

  bandOpacity(band: GeometryBand): number {
    const depth = band.depth ?? 0;
    switch (band.tone) {
      case 'left':
      case 'right':
        return Math.max(0.08, 0.16 - depth * 0.02);
      case 'strip':
        return 0.2;
      default:
        return Math.max(0.04, 0.08 - depth * 0.01);
    }
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Point Field';
      case 'sort': return 'Dual Sorting';
      case 'divide': return 'Split';
      case 'base': return 'Base Case';
      case 'merge': return 'Merge';
      case 'strip': return 'Strip Build';
      case 'compare':
      case 'compare-strip':
        return 'Distance Check';
      case 'update': return 'Best Update';
      case 'complete': return 'Closest Pair';
      default: return phase;
    }
  }

  formatDistance(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toFixed(2);
  }
}
