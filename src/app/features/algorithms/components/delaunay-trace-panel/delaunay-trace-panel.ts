import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
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
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './delaunay-trace-panel.html',
  styleUrl: './delaunay-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<DelaunayTriangulationStepState | null>(null);
  readonly circleColumns = CIRCLE_COLUMNS;

  readonly currentCircle = computed(() => this.state()?.circles[0] ?? null);
  readonly circleRows = computed<readonly TableRow[]>(() => [
    {
      id: 'center',
      ghost: this.currentCircle() === null,
      cells: {
        label: this.translate(I18N_KEY.features.algorithms.tracePanels.delaunay.centerLabel),
        value: `(${this.formatCoord(this.currentCircle()?.cx)}, ${this.formatCoord(this.currentCircle()?.cy)})`,
      },
    },
    {
      id: 'radius',
      ghost: this.currentCircle() === null,
      cells: {
        label: this.translate(I18N_KEY.features.algorithms.tracePanels.delaunay.radiusLabel),
        value: this.formatCoord(this.currentCircle()?.r),
      },
    },
  ]);

  formatCoord(value: number | undefined): string {
    return value !== undefined ? value.toFixed(1) : '—';
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
