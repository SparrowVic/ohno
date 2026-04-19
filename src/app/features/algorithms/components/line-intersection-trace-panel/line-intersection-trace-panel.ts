import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { LineIntersectionStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const INTERSECTION_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-line-intersection-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './line-intersection-trace-panel.html',
  styleUrl: './line-intersection-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineIntersectionTracePanel {
  readonly state = input<LineIntersectionStepState | null>(null);
  readonly intersectionColumns = INTERSECTION_COLUMNS;

  readonly currentEvent = computed(
    () => this.state()?.events.find((event) => event.tone === 'current') ?? null,
  );
  readonly upcomingEvents = computed(
    () =>
      this.state()
        ?.events.filter((event) => event.tone !== 'done')
        .slice(0, 8) ?? [],
  );
  readonly intersectionRows = computed<readonly TableRow[]>(() =>
    (this.state()?.intersections ?? []).map((marker) => ({
      id: marker.id,
      cells: {
        label: marker.label,
        value: `(${marker.x.toFixed(1)}, ${marker.y.toFixed(1)})`,
      },
    })),
  );

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init':
        return 'Sweep Setup';
      case 'activate':
        return 'Insert Segment';
      case 'retire':
        return 'Remove Segment';
      case 'intersection':
        return 'Crossing Event';
      case 'complete':
        return 'Sweep Complete';
      default:
        return phase;
    }
  }
}
