import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { HalfPlaneIntersectionStepState } from '../../models/geometry';
import { formatCoordPair, geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const HALF_KEYS = I18N_KEY.features.algorithms.tracePanels.halfPlane;
const GEOMETRY_KEYS = I18N_KEY.features.algorithms.tracePanels.geometry;

const PHASE_KEYS: Readonly<Record<string, I18nKey>> = {
  init: HALF_KEYS.phases.init,
  constraint: HALF_KEYS.phases.constraint,
  clip: HALF_KEYS.phases.clip,
  infeasible: HALF_KEYS.phases.infeasible,
  complete: HALF_KEYS.phases.complete,
};

const STATUS: Readonly<Record<HalfPlaneIntersectionStepState['status'], { readonly label: I18nKey; readonly tone: TraceTone }>> = {
  feasible: { label: HALF_KEYS.feasibleStatus, tone: 'cyan' },
  empty: { label: HALF_KEYS.emptyStatus, tone: 'red' },
  complete: { label: HALF_KEYS.completeStatus, tone: 'lime' },
};

const VERTEX_COLUMNS: readonly TraceColumn[] = [
  { id: 'label', header: GEOMETRY_KEYS.columns.vertex, kind: 'mono', width: '64px' },
  { id: 'value', header: GEOMETRY_KEYS.columns.coords, kind: 'mono', align: 'end' },
];

const MIN_VERTEX_SLOTS = 6;

@Component({
  selector: 'app-half-plane-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './half-plane-trace-panel.html',
  styleUrl: './half-plane-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneTracePanel {
  protected readonly keys = HALF_KEYS;
  protected readonly vertexColumns = VERTEX_COLUMNS;

  readonly state = input<HalfPlaneIntersectionStepState | null>(null);

  protected readonly feasiblePolygon = computed(
    () => this.state()?.polygons.find((polygon) => polygon.tone === 'feasible' || polygon.tone === 'result') ?? null,
  );

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const phaseKey = PHASE_KEYS[geo.phase];
    const status = STATUS[geo.status];
    return [
      { id: 'phase', label: HALF_KEYS.phaseLabel, value: phaseKey ? toTraceValue(phaseKey) : geo.phase, kind: 'mono' },
      { id: 'verts', label: HALF_KEYS.vertsLabel, value: geo.vertexCount },
      { id: 'area', label: HALF_KEYS.areaLabel, value: (geo.feasibleArea ?? 0).toFixed(1), tone: 'lime' },
      { id: 'status', label: HALF_KEYS.statusLabel, value: toTraceValue(status.label), kind: 'mono', tone: status.tone },
      { id: 'boundary', label: HALF_KEYS.currentBoundaryLabel, value: toTraceValue(geo.currentConstraintLabel), kind: 'mono', wide: true },
    ];
  });

  protected readonly eventChips = computed<readonly TraceChip[]>(() => geometryEventChips(this.state()?.events ?? []));

  protected readonly vertexRows = computed<readonly TraceRow[]>(() => {
    const vertices = this.feasiblePolygon()?.vertices ?? [];
    const slots = Math.max(vertices.length, MIN_VERTEX_SLOTS);
    return Array.from({ length: slots }, (_, index) => {
      const vertex = vertices[index];
      return {
        id: index,
        dim: !vertex,
        cells: { label: `V${index + 1}`, value: formatCoordPair(vertex?.x, vertex?.y) },
      };
    });
  });
}
