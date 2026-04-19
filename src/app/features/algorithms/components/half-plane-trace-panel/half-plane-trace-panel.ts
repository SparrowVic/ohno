import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { HalfPlaneIntersectionStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const VERTEX_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-half-plane-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './half-plane-trace-panel.html',
  styleUrl: './half-plane-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneTracePanel {
  readonly state = input<HalfPlaneIntersectionStepState | null>(null);
  readonly vertexColumns = VERTEX_COLUMNS;

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
  readonly vertexRows = computed<readonly TableRow[]>(() =>
    this.vertexSlots().map((slot) => ({
      id: slot.label,
      ghost: slot.vertex === null,
      cells: {
        label: slot.label,
        value: this.formatVertex(slot.vertex),
      },
    })),
  );

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
