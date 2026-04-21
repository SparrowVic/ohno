import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
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
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './line-intersection-trace-panel.html',
  styleUrl: './line-intersection-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineIntersectionTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
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
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.lineIntersection.phases.init,
        );
      case 'activate':
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.lineIntersection.phases.activate,
        );
      case 'retire':
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.lineIntersection.phases.retire,
        );
      case 'intersection':
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.lineIntersection.phases.intersection,
        );
      case 'complete':
        return this.translate(
          I18N_KEY.features.algorithms.tracePanels.lineIntersection.phases.complete,
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
