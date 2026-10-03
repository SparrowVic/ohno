import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { DpCell, DpTraceState, DpTraceTag } from '../../models/dp';

const DP_KEYS = I18N_KEY.features.algorithms.tracePanels.dp;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;
const DISPLAY_DP_KEYS = I18N_KEY.features.algorithms.display.dp;

const STATUS_TONES: Readonly<Record<DpCell['status'], TraceTone | null>> = {
  idle: null,
  base: 'slate',
  blocked: 'red',
  active: 'cyan',
  candidate: 'pink',
  improved: 'lime',
  chosen: 'lime',
  backtrack: 'lime',
  match: 'amber',
};

const TAG_CHIPS: Readonly<Record<DpTraceTag, { readonly label: I18nKey; readonly tone: TraceTone }>> = {
  active: { label: DP_KEYS.statuses.active, tone: 'cyan' },
  base: { label: DP_KEYS.statuses.base, tone: 'slate' },
  take: { label: DISPLAY_DP_KEYS.labels.take, tone: 'pink' },
  skip: { label: DP_KEYS.skipTagLabel, tone: 'pink' },
  match: { label: DISPLAY_DP_KEYS.tags.match, tone: 'amber' },
  insert: { label: DISPLAY_DP_KEYS.tags.insert, tone: 'pink' },
  delete: { label: DISPLAY_DP_KEYS.tags.delete, tone: 'pink' },
  replace: { label: DISPLAY_DP_KEYS.tags.replace, tone: 'pink' },
  split: { label: DISPLAY_DP_KEYS.tags.split, tone: 'violet' },
  best: { label: DISPLAY_DP_KEYS.labels.best, tone: 'lime' },
  path: { label: DP_KEYS.pathTagLabel, tone: 'lime' },
  blocked: { label: DP_KEYS.statuses.blocked, tone: 'red' },
};

const TABLE_COLUMNS: readonly TraceColumn[] = [
  { id: 'cell', header: DP_KEYS.columns.cell, kind: 'mono' },
  { id: 'value', header: DP_KEYS.columns.value, align: 'end' },
  { id: 'meta', header: DP_KEYS.columns.meta, kind: 'mono' },
  { id: 'status', header: DP_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: DP_KEYS.columns.tags, kind: 'chips' },
];

@Component({
  selector: 'app-dp-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './dp-trace-panel.html',
  styleUrl: './dp-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpTracePanel {
  protected readonly keys = DP_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly columns = TABLE_COLUMNS;

  readonly state = input<DpTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const facts: TraceFact[] = [{ id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' }];
    if (state.presetLabel) {
      facts.push({ id: 'preset', label: DP_KEYS.presetLabel, value: toTraceValue(state.presetLabel), kind: 'mono', tone: 'violet' });
    }
    facts.push(
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(state.phaseLabel), kind: 'mono' },
      { id: 'active', label: COMMON_KEYS.activeLabel, value: toTraceValue(state.activeLabel), kind: 'math', tone: 'cyan' },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(state.resultLabel), kind: 'math', tone: 'lime' },
    );
    return facts;
  });

  protected readonly calculationFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const computation = state.computation;
    return [
      { id: 'preset', label: DP_KEYS.presetNoteLabel, value: toTraceValue(state.presetDescription), kind: 'math', wide: true },
      { id: 'path', label: COMMON_KEYS.routeLabel, value: toTraceValue(state.pathLabel), kind: 'mono', wide: true },
      {
        id: 'expression',
        label: computation?.label || DP_KEYS.currentTransitionLabel,
        value: toTraceValue(computation?.expression ?? DP_KEYS.waitingTransitionLabel),
        kind: 'math',
        wide: true,
        tone: computation ? 'cyan' : null,
      },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(computation?.result ?? null), kind: 'math', tone: 'lime' },
      {
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(computation?.decision ?? DP_KEYS.noActiveTransitionLabel),
        kind: 'text',
        wide: true,
      },
    ];
  });

  protected readonly primaryChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.primaryItems ?? []).map((item, index) => ({ id: index, label: toTraceValue(item), kind: 'math', tone: 'cyan' })),
  );

  protected readonly secondaryChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.secondaryItems ?? []).map((item, index) => ({ id: index, label: toTraceValue(item), kind: 'math' })),
  );

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.status !== 'idle' || cell.tags.length > 0)
      .sort((left, right) => left.row - right.row || left.col - right.col)
      .map((cell) => {
        const tone = STATUS_TONES[cell.status];
        const highlighted = ['active', 'candidate', 'improved', 'chosen', 'backtrack'].includes(cell.status);
        return {
          id: cell.id,
          tone: highlighted ? tone : null,
          cells: {
            cell: `${cell.rowLabel} × ${cell.colLabel}`,
            value: cell.valueLabel,
            meta: cell.metaLabel,
            status: [{ id: cell.status, label: toTraceValue(DP_KEYS.statuses[cell.status]), tone }],
            tags: cell.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
          },
        };
      }),
  );
}
