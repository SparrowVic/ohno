import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { VoronoiDiagramStepState } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';

const SITE_COLUMNS: readonly TableColumn[] = [
  { id: 'label', width: '50%' },
  { id: 'value', width: '50%', kind: 'mono' },
];

@Component({
  selector: 'app-voronoi-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './voronoi-trace-panel.html',
  styleUrl: './voronoi-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<VoronoiDiagramStepState | null>(null);
  readonly siteColumns = SITE_COLUMNS;

  readonly activeSite = computed(
    () => this.state()?.points.find((point) => point.id === this.state()?.activeSiteId) ?? null,
  );
  readonly siteRows = computed<readonly TableRow[]>(() => [
    {
      id: 'active-site',
      ghost: this.activeSite() === null,
      cells: {
        label: `P${this.activeSite()?.id ?? '—'}`,
        value: `(${this.formatCoord(this.activeSite()?.x)}, ${this.formatCoord(this.activeSite()?.y)})`,
      },
    },
  ]);

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }
}
