import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import {
  TraceChip,
  TraceColumn,
  TraceFact,
  TraceRow,
  TraceTone,
} from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { SORT_ALGORITHM_TUTORIALS } from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { SortPhaseTone, SortTraceState, SortTraceStatus, SortTraceTag } from '../../models/sort-trace';

const SORT_KEYS = I18N_KEY.features.algorithms.tracePanels.sort;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const PHASE_TONES: Readonly<Record<SortPhaseTone, TraceTone | null>> = {
  idle: null,
  compare: 'cyan',
  swap: 'pink',
  settle: 'lime',
  distribute: 'violet',
  complete: 'lime',
};

const STATUS_TONES: Readonly<Record<SortTraceStatus, TraceTone | null>> = {
  unsorted: null,
  comparing: 'cyan',
  swapping: 'pink',
  sorted: 'lime',
};

const STATUS_LABELS: Readonly<Record<SortTraceStatus, I18nKey>> = {
  unsorted: SORT_KEYS.statuses.unsorted,
  comparing: SORT_KEYS.statuses.comparing,
  swapping: SORT_KEYS.statuses.swapping,
  sorted: SORT_KEYS.statuses.sorted,
};

const TAG_CHIPS: Readonly<Record<SortTraceTag, { readonly label: I18nKey; readonly tone: TraceTone }>> = {
  compare: { label: SORT_KEYS.pairBadges.compare, tone: 'cyan' },
  swap: { label: SORT_KEYS.pairBadges.swap, tone: 'pink' },
  sorted: { label: SORT_KEYS.statuses.sorted, tone: 'lime' },
};

const TABLE_COLUMNS: readonly TraceColumn[] = [
  { id: 'index', header: SORT_KEYS.columns.index, align: 'end', width: '56px' },
  { id: 'value', header: SORT_KEYS.columns.value, align: 'end', width: '72px' },
  { id: 'status', header: SORT_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: SORT_KEYS.columns.tags, kind: 'chips' },
];

@Component({
  selector: 'app-sort-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './sort-trace-panel.html',
  styleUrl: './sort-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  protected readonly keys = SORT_KEYS;
  protected readonly columns = TABLE_COLUMNS;

  readonly state = input<SortTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  protected readonly hintFacts = computed<readonly TraceFact[]>(() => {
    const id = this.algorithmId();
    const tutorial = id ? SORT_ALGORITHM_TUTORIALS[id] : undefined;
    if (!tutorial) return [];
    return [
      { id: 'idea', label: COMMON_KEYS.keyIdeaLabel, value: toTraceValue(tutorial.keyIdea), kind: 'text', wide: true },
      { id: 'watch', label: COMMON_KEYS.watchLabel, value: toTraceValue(tutorial.watch), kind: 'text', wide: true },
    ];
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    return [
      {
        id: 'phase',
        label: SORT_KEYS.phaseLabel,
        value: toTraceValue(state.phaseLabel),
        kind: 'mono',
        tone: PHASE_TONES[state.phaseTone],
      },
      { id: 'sorted', label: SORT_KEYS.sortedLabel, value: state.sortedCount, total: state.rows.length, tone: 'lime' },
      { id: 'boundary', label: SORT_KEYS.boundaryLabel, value: state.boundary },
      { id: 'unsorted', label: SORT_KEYS.unsortedLabel, value: state.unsortedCount },
    ];
  });

  protected readonly stepFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const pair = state.swapping ?? state.comparing;
    const facts: TraceFact[] = [
      {
        id: 'pair',
        label: SORT_KEYS.currentPairLabel,
        value: pair ? `[${pair.indexA}, ${pair.indexB}]` : toTraceValue(COMMON_KEYS.noneLabel),
        kind: 'mono',
        tone: state.swapping ? 'pink' : state.comparing ? 'cyan' : null,
      },
      {
        id: 'values',
        label: state.swapping ? SORT_KEYS.pairBadges.swap : SORT_KEYS.pairBadges.compare,
        value: pair ? `${pair.valueA} ↔ ${pair.valueB}` : toTraceValue(COMMON_KEYS.emptyValueLabel),
        kind: 'mono',
      },
    ];
    if (state.digit) {
      facts.push({ id: 'digit', label: SORT_KEYS.digitPassLabel, value: state.digit.index + 1, total: state.digit.max, tone: 'violet' });
    }
    facts.push({ id: 'note', label: COMMON_KEYS.decisionLabel, value: toTraceValue(state.description), kind: 'math', wide: true });
    return facts;
  });

  protected readonly bucketChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.buckets ?? []).map((bucket) => ({
      id: bucket.bucket,
      label: `${bucket.bucket} · ${bucket.count}`,
      tone: bucket.active ? 'violet' : null,
      active: bucket.active,
    })),
  );

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    (this.state()?.rows ?? []).map((row) => ({
      id: row.index,
      tone: STATUS_TONES[row.status],
      cells: {
        index: row.index,
        value: row.value,
        status: [{ id: row.status, label: toTraceValue(STATUS_LABELS[row.status]), tone: STATUS_TONES[row.status] }],
        tags: row.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
      },
    })),
  );
}
