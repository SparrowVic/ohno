import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
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
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './minkowski-sum-trace-panel.html',
  styleUrl: './minkowski-sum-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinkowskiSumTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
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
        return this.translate(I18N_KEY.features.algorithms.tracePanels.minkowskiSum.phases.init);
      case 'reflect':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.minkowskiSum.phases.reflect);
      case 'seed':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.minkowskiSum.phases.seed);
      case 'merge':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.minkowskiSum.phases.merge);
      case 'complete':
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.minkowskiSum.phases.complete,
        );
      default:
        return phase;
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
