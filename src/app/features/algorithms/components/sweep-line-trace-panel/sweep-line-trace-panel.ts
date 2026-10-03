import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { SweepLineStepState } from '../../models/geometry';
import { sweepEventText } from '../geo-canvas/geometry-labels.utils';
import { geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const SWEEP_KEYS = I18N_KEY.features.algorithms.tracePanels.sweepLine;

const SPAN_COLUMNS: readonly TraceColumn[] = [
  { id: 'label', header: SWEEP_KEYS.spanColumn, kind: 'mono' },
  { id: 'value', header: SWEEP_KEYS.rangeColumn, kind: 'mono', align: 'end' },
];

@Component({
  selector: 'app-sweep-line-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './sweep-line-trace-panel.html',
  styleUrl: './sweep-line-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineTracePanel {
  protected readonly keys = SWEEP_KEYS;
  protected readonly spanColumns = SPAN_COLUMNS;

  readonly state = input<SweepLineStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return [
      { id: 'scanline', label: SWEEP_KEYS.scanlineLabel, value: toTraceValue(sweepEventText(geo.currentEventLabel)), kind: 'mono', tone: 'cyan' },
      { id: 'area', label: SWEEP_KEYS.areaLabel, value: geo.coveredArea.toFixed(1), tone: 'lime' },
      { id: 'spans', label: SWEEP_KEYS.spansLabel, value: geo.spans.length },
    ];
  });

  protected readonly spanRows = computed<readonly TraceRow[]>(() =>
    (this.state()?.spans ?? []).map((span) => ({
      id: span.id,
      cells: { label: span.id, value: `[${span.y0.toFixed(1)}, ${span.y1.toFixed(1)}]` },
    })),
  );

  protected readonly eventChips = computed<readonly TraceChip[]>(() =>
    geometryEventChips(this.state()?.events ?? [], (event) => sweepEventText(event.label)),
  );
}
