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
  readonly vertexSlots = computed(() => {
    const vertices = this.feasiblePolygon()?.vertices ?? [];
    const slotCount = Math.max(vertices.length, 6);
    return Array.from({ length: slotCount }, (_, index) => ({
      label: `V${index + 1}`,
      vertex: vertices[index] ?? null,
    }));
  });

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

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }

  formatVertex(vertex: { readonly x: number; readonly y: number } | null): string {
    return vertex ? `(${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})` : '(—, —)';
  }
}
