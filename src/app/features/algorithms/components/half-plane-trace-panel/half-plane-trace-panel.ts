import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
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
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './half-plane-trace-panel.html',
  styleUrl: './half-plane-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
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
        return this.translate(I18N_KEY.features.algorithms.tracePanels.halfPlane.phases.init);
      case 'constraint':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.halfPlane.phases.constraint);
      case 'clip':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.halfPlane.phases.clip);
      case 'infeasible':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.halfPlane.phases.infeasible);
      case 'complete':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.halfPlane.phases.complete);
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

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
