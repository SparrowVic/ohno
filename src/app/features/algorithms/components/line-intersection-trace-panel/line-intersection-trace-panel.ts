import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { LineIntersectionStepState } from '../../models/geometry';
import { lineEventText } from '../geo-canvas/geometry-labels.utils';
import { formatCoordPair, geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const LINE_KEYS = I18N_KEY.features.algorithms.tracePanels.lineIntersection;
const GEOMETRY_KEYS = I18N_KEY.features.algorithms.tracePanels.geometry;

const PHASE_KEYS: Readonly<Record<string, I18nKey>> = {
  init: LINE_KEYS.phases.init,
  activate: LINE_KEYS.phases.activate,
  retire: LINE_KEYS.phases.retire,
  intersection: LINE_KEYS.phases.intersection,
  complete: LINE_KEYS.phases.complete,
};

const UPCOMING_LIMIT = 8;

const INTERSECTION_COLUMNS: readonly TraceColumn[] = [
  { id: 'label', header: GEOMETRY_KEYS.columns.point, kind: 'mono' },
  { id: 'value', header: GEOMETRY_KEYS.columns.coords, kind: 'mono', align: 'end' },
];

@Component({
  selector: 'app-line-intersection-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './line-intersection-trace-panel.html',
  styleUrl: './line-intersection-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineIntersectionTracePanel {
  protected readonly keys = LINE_KEYS;
  protected readonly intersectionColumns = INTERSECTION_COLUMNS;

  readonly state = input<LineIntersectionStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const phaseKey = PHASE_KEYS[geo.phase];
    return [
      { id: 'phase', label: LINE_KEYS.phaseLabel, value: phaseKey ? toTraceValue(phaseKey) : geo.phase, kind: 'mono' },
      { id: 'sweep', label: LINE_KEYS.sweepXLabel, value: geo.sweepX !== null ? geo.sweepX.toFixed(1) : null, tone: 'cyan' },
      { id: 'hits', label: LINE_KEYS.hitsLabel, value: geo.foundCount, tone: 'pink' },
      { id: 'active', label: LINE_KEYS.activeLabel, value: geo.activeOrder.length },
    ];
  });

  protected readonly eventFacts = computed<readonly TraceFact[]>(() => {
    const event = this.state()?.events.find((item) => item.tone === 'current') ?? null;
    return [
      {
        id: 'event',
        label: LINE_KEYS.currentEventLabel,
        value: toTraceValue(event ? lineEventText(event.label) : LINE_KEYS.betweenCheckpointsLabel),
        kind: 'mono',
        tone: event ? 'cyan' : null,
      },
      { id: 'x', label: 'x', value: event ? event.x.toFixed(1) : null },
    ];
  });

  protected readonly orderChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.activeOrder ?? []).map((label, index) => ({ id: `${index}-${label}`, label, tone: 'violet' })),
  );

  protected readonly upcomingChips = computed<readonly TraceChip[]>(() =>
    geometryEventChips(
      (this.state()?.events ?? []).filter((event) => event.tone !== 'done').slice(0, UPCOMING_LIMIT),
      (event) => lineEventText(event.label),
    ),
  );

  protected readonly intersectionRows = computed<readonly TraceRow[]>(() =>
    (this.state()?.intersections ?? []).map((marker) => ({
      id: marker.id,
      tone: 'pink',
      cells: { label: marker.label, value: formatCoordPair(marker.x, marker.y) },
    })),
  );
}
