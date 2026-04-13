import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { GeometryPoint, GeometryStepState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-convex-hull-visualization',
  imports: [],
  templateUrl: './convex-hull-visualization.html',
  styleUrl: './convex-hull-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvexHullVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<GeometryStepState | null>(() => this.step()?.geometry ?? null);
  readonly points = computed(() => this.geoState()?.points ?? []);
  readonly edges = computed(() => this.geoState()?.edges ?? []);
  readonly isComplete = computed(() => this.geoState()?.phase === 'complete');

  private readonly pointMap = computed(() => {
    const map = new Map<number, GeometryPoint>();
    for (const pt of this.points()) {
      map.set(pt.id, pt);
    }
    return map;
  });

  ptSvgX(id: number): number {
    return this.pointMap().get(id)?.x ?? 0;
  }

  ptSvgY(id: number): number {
    return 100 - (this.pointMap().get(id)?.y ?? 0);
  }

  ptTransform(pt: GeometryPoint): string {
    return `translate(${pt.x}, ${100 - pt.y})`;
  }

  hullPolyPoints(): string {
    const geo = this.geoState();
    if (!geo) return '';
    return geo.stackIds
      .map((id) => {
        const pt = this.pointMap().get(id);
        return pt ? `${pt.x},${100 - pt.y}` : '';
      })
      .filter(Boolean)
      .join(' ');
  }

  turnTriPoints(): string | null {
    const geo = this.geoState();
    if (!geo?.turnCheck) return null;
    const [a, b, c] = geo.turnCheck;
    const ptA = this.pointMap().get(a);
    const ptB = this.pointMap().get(b);
    const ptC = this.pointMap().get(c);
    if (!ptA || !ptB || !ptC) return null;
    return [ptA, ptB, ptC].map((pt) => `${pt.x},${100 - pt.y}`).join(' ');
  }

  showGlow(pt: GeometryPoint): boolean {
    return pt.status === 'pivot' || pt.status === 'checking' || pt.status === 'stack' || pt.status === 'hull';
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Initialize';
      case 'pivot': return 'Find Pivot';
      case 'sort': return 'Polar Sort';
      case 'init-stack': return 'Init Stack';
      case 'checking': return 'Cross Check';
      case 'pop': return 'Pop';
      case 'push': return 'Push';
      case 'complete': return 'Hull Done ✓';
      default: return phase;
    }
  }
}
