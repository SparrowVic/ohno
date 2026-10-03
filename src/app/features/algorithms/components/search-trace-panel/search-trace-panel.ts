import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { SearchTraceRow, SearchTraceState, SearchTraceTag } from '../../models/search';

const SEARCH_KEYS = I18N_KEY.features.algorithms.tracePanels.search;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const STATUS_TONES: Readonly<Record<SearchTraceRow['status'], TraceTone | null>> = {
  idle: null,
  window: 'violet',
  probe: 'cyan',
  visited: 'slate',
  eliminated: 'red',
  bound: 'amber',
  found: 'lime',
};

const TAG_CHIPS: Readonly<Record<SearchTraceTag, { readonly label: I18nKey; readonly tone: TraceTone | null }>> = {
  pending: { label: SEARCH_KEYS.statuses.idle, tone: null },
  candidate: { label: SEARCH_KEYS.statuses.window, tone: 'violet' },
  compare: { label: SEARCH_KEYS.statuses.probe, tone: 'cyan' },
  checked: { label: SEARCH_KEYS.statuses.visited, tone: 'slate' },
  pruned: { label: SEARCH_KEYS.statuses.eliminated, tone: 'red' },
  bound: { label: SEARCH_KEYS.statuses.bound, tone: 'amber' },
  match: { label: SEARCH_KEYS.statuses.found, tone: 'lime' },
};

const TABLE_COLUMNS: readonly TraceColumn[] = [
  { id: 'index', header: SEARCH_KEYS.columns.index, align: 'end', width: '56px' },
  { id: 'value', header: SEARCH_KEYS.columns.value, align: 'end', width: '72px' },
  { id: 'status', header: SEARCH_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: SEARCH_KEYS.columns.tags, kind: 'chips' },
];

@Component({
  selector: 'app-search-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './search-trace-panel.html',
  styleUrl: './search-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTracePanel {
  protected readonly keys = SEARCH_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly columns = TABLE_COLUMNS;

  readonly state = input<SearchTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const probe =
      state.probeIndex === null ? null : `${state.probeIndex}${state.probeValue === null ? '' : ` · ${state.probeValue}`}`;
    const window =
      state.low === null || state.high === null ? toTraceValue(COMMON_KEYS.emptyValueLabel) : `[${state.low}, ${state.high}]`;
    return [
      { id: 'target', label: SEARCH_KEYS.targetLabel, value: state.target, tone: 'violet' },
      { id: 'probe', label: SEARCH_KEYS.probeLabel, value: probe, kind: 'mono', tone: probe ? 'cyan' : null },
      { id: 'window', label: SEARCH_KEYS.windowLabel, value: window, kind: 'mono' },
    ];
  });

  protected readonly calculationFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const hits = state.resultIndices;
    const hitLabel = hits.length === 0 ? null : hits.length === 1 ? hits[0] : `${hits[0]}..${hits[hits.length - 1]}`;
    return [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
      { id: 'status', label: COMMON_KEYS.statusLabel, value: toTraceValue(state.statusLabel), kind: 'mono' },
      { id: 'hits', label: SEARCH_KEYS.hitsLabel, value: hitLabel, tone: hits.length > 0 ? 'lime' : null },
      {
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(state.decision ?? SEARCH_KEYS.waitingDecisionLabel),
        kind: 'text',
        wide: true,
      },
    ];
  });

  protected readonly visitedChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.visitedOrder ?? []).map((index, position) => ({ id: position, label: index, tone: 'slate' })),
  );

  protected readonly hitChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.resultIndices ?? []).map((index) => ({ id: index, label: index, tone: 'lime' })),
  );

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    (this.state()?.rows ?? []).map((row) => {
      const tone = STATUS_TONES[row.status];
      return {
        id: row.index,
        tone: row.status === 'probe' || row.status === 'found' ? tone : null,
        dim: row.status === 'eliminated',
        cells: {
          index: row.index,
          value: row.value,
          status: [{ id: row.status, label: toTraceValue(SEARCH_KEYS.statuses[row.status]), tone }],
          tags: row.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
        },
      };
    }),
  );
}
