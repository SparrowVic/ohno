import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { MinkowskiSumStepState } from '../../models/geometry';
import { geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const SUM_KEYS = I18N_KEY.features.algorithms.tracePanels.minkowskiSum;

const PHASE_KEYS: Readonly<Record<string, I18nKey>> = {
  init: SUM_KEYS.phases.init,
  reflect: SUM_KEYS.phases.reflect,
  seed: SUM_KEYS.phases.seed,
  merge: SUM_KEYS.phases.merge,
  complete: SUM_KEYS.phases.complete,
};

const SOURCE_LABELS: Readonly<Record<NonNullable<MinkowskiSumStepState['activeSource']>, string>> = {
  a: 'A',
  b: 'B',
  both: 'A + B',
};

const VECTOR_COLUMNS: readonly TraceColumn[] = [
  { id: 'label', header: SUM_KEYS.vectorColumn, kind: 'mono' },
  { id: 'value', header: SUM_KEYS.deltaColumn, kind: 'mono', align: 'end' },
];

@Component({
  selector: 'app-minkowski-sum-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './minkowski-sum-trace-panel.html',
  styleUrl: './minkowski-sum-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinkowskiSumTracePanel {
  protected readonly keys = SUM_KEYS;
  protected readonly vectorColumns = VECTOR_COLUMNS;

  readonly state = input<MinkowskiSumStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const phaseKey = PHASE_KEYS[geo.phase];
    return [
      { id: 'phase', label: SUM_KEYS.phaseLabel, value: phaseKey ? toTraceValue(phaseKey) : geo.phase, kind: 'mono' },
      { id: 'merged', label: SUM_KEYS.mergedLabel, value: geo.mergedEdgeCount, total: geo.totalEdges, tone: 'lime' },
      { id: 'total', label: SUM_KEYS.totalLabel, value: geo.totalEdges },
      { id: 'area', label: SUM_KEYS.areaLabel, value: geo.resultArea !== null ? geo.resultArea.toFixed(1) : null },
      { id: 'source', label: SUM_KEYS.currentMergeSourceLabel, value: geo.activeSource ? SOURCE_LABELS[geo.activeSource] : null, kind: 'mono', tone: 'cyan' },
      { id: 'vector', label: SUM_KEYS.vectorColumn, value: geo.currentVectorLabel, kind: 'mono' },
    ];
  });

  protected readonly eventChips = computed<readonly TraceChip[]>(() => geometryEventChips(this.state()?.events ?? []));

  protected readonly vectorRows = computed<readonly TraceRow[]>(() =>
    (this.state()?.vectors ?? [])
      .filter((vector) => vector.tone === 'current')
      .map((vector) => ({
        id: vector.id,
        tone: 'cyan',
        cells: { label: vector.label, value: `(${vector.dx.toFixed(1)}, ${vector.dy.toFixed(1)})` },
      })),
  );
}
