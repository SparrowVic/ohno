import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DelaunayTriangulationStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const CIRCLE_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-delaunay-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './delaunay-trace-panel.html',
  styleUrl: './delaunay-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayTracePanel {
  readonly state = input<DelaunayTriangulationStepState | null>(null);
  readonly circleColumns = CIRCLE_COLUMNS;

  readonly currentCircle = computed(() => this.state()?.circles[0] ?? null);
  readonly circleRows = computed<readonly TableRow[]>(() => [
    {
      id: 'center',
      ghost: this.currentCircle() === null,
      cells: {
        label: 'center',
        value: `(${this.formatCoord(this.currentCircle()?.cx)}, ${this.formatCoord(this.currentCircle()?.cy)})`,
      },
    },
    {
      id: 'radius',
      ghost: this.currentCircle() === null,
      cells: {
        label: 'radius',
        value: this.formatCoord(this.currentCircle()?.r),
      },
    },
  ]);

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }
}
