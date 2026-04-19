import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MinkowskiSumStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const VECTOR_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-minkowski-sum-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './minkowski-sum-trace-panel.html',
  styleUrl: './minkowski-sum-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinkowskiSumTracePanel {
  readonly state = input<MinkowskiSumStepState | null>(null);
  readonly vectorColumns = VECTOR_COLUMNS;

  readonly currentVectors = computed(
    () => this.state()?.vectors.filter((vector) => vector.tone === 'current') ?? [],
  );
  readonly vectorRows = computed<readonly TableRow[]>(() =>
    this.currentVectors().map((vector) => ({
      id: vector.id,
      cells: {
        label: vector.label,
        value: `(${vector.dx.toFixed(1)}, ${vector.dy.toFixed(1)})`,
      },
    })),
  );

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init':
        return 'Input Shapes';
      case 'reflect':
        return 'Robot Reflection';
      case 'seed':
        return 'Seed Vertex';
      case 'merge':
        return 'Edge Merge';
      case 'complete':
        return 'Final Polygon';
      default:
        return phase;
    }
  }
}
