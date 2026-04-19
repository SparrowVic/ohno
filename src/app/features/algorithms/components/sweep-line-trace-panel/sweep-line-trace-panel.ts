import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SweepLineStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const SPAN_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-sweep-line-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './sweep-line-trace-panel.html',
  styleUrl: './sweep-line-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineTracePanel {
  readonly state = input<SweepLineStepState | null>(null);
  readonly spanColumns = SPAN_COLUMNS;
  readonly spanRows = computed<readonly TableRow[]>(() =>
    (this.state()?.spans ?? []).map((span) => ({
      id: span.id,
      cells: {
        label: span.id,
        value: `[${span.y0.toFixed(1)}, ${span.y1.toFixed(1)}]`,
      },
    })),
  );
}
