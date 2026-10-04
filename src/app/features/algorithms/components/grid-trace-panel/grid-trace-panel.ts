import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { GridTraceCell, GridTraceState, GridTraceTag } from '../../models/grid';

const GRID_KEYS = I18N_KEY.features.algorithms.tracePanels.grid;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

type GridStatus = GridTraceCell['status'];

const STATUS_TONES: Readonly<Record<GridStatus, TraceTone | null>> = {
  idle: null,
  wall: 'slate',
  source: 'violet',
  goal: 'amber',
  frontier: 'amber',
  current: 'cyan',
  filled: 'lime',
  closed: 'lime',
  path: 'lime',
  blocked: 'red',
};

const TAG_CHIPS: Readonly<Record<GridTraceTag, { readonly label: I18nKey; readonly tone: TraceTone }>> = {
  seed: { label: GRID_KEYS.statuses.source, tone: 'violet' },
  goal: { label: GRID_KEYS.statuses.goal, tone: 'amber' },
  frontier: { label: GRID_KEYS.statuses.frontier, tone: 'amber' },
  current: { label: GRID_KEYS.statuses.current, tone: 'cyan' },
  filled: { label: GRID_KEYS.statuses.filled, tone: 'lime' },
  closed: { label: GRID_KEYS.statuses.closed, tone: 'lime' },
  path: { label: GRID_KEYS.statuses.path, tone: 'lime' },
  wall: { label: GRID_KEYS.statuses.wall, tone: 'slate' },
  blocked: { label: GRID_KEYS.statuses.blocked, tone: 'red' },
  candidate: { label: GRID_KEYS.tagLegend.candidate, tone: 'pink' },
};

const TABLE_COLUMNS: readonly TraceColumn[] = [
  { id: 'cell', header: GRID_KEYS.columns.cell, kind: 'mono' },
  { id: 'value', header: GRID_KEYS.columns.value, align: 'end' },
  { id: 'status', header: GRID_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: GRID_KEYS.columns.tags, kind: 'chips' },
];

@Component({
  selector: 'app-grid-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './grid-trace-panel.html',
  styleUrl: './grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridTracePanel {
  protected readonly keys = GRID_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly columns = TABLE_COLUMNS;

  readonly state = input<GridTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  protected readonly hintFacts = computed<readonly TraceFact[]>(() => {
    const id = this.algorithmId();
    const tutorial = id ? GRAPH_ALGORITHM_TUTORIALS[id] : undefined;
    if (!tutorial) return [];
    return [
      { id: 'idea', label: COMMON_KEYS.keyIdeaLabel, value: toTraceValue(tutorial.keyIdea), kind: 'text', wide: true },
      { id: 'watch', label: COMMON_KEYS.watchLabel, value: toTraceValue(tutorial.watch), kind: 'text', wide: true },
    ];
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const activeId = state.activeCellId;
    const active = activeId ? (state.cells.find((cell) => cell.id === activeId)?.metaLabel ?? activeId) : null;
    return [
      { id: 'mode', label: GRID_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
      { id: 'active', label: GRID_KEYS.activeLabel, value: active, kind: 'mono', tone: active ? 'cyan' : null },
      { id: 'frontier', label: GRID_KEYS.frontierLabel, value: state.frontierCount, tone: 'amber' },
      { id: 'visited', label: GRID_KEYS.visitedLabel, value: state.visitedCount },
      {
        id: 'result',
        label: GRID_KEYS.resultLabel,
        value: i18nText(state.mode === 'flood-fill' ? GRID_KEYS.filledCount : GRID_KEYS.pathCount, { count: state.resultCount }),
        tone: 'lime',
      },
    ];
  });

  protected readonly boardFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    return [
      { id: 'source', label: GRID_KEYS.sourceLabel, value: toTraceValue(state.sourceLabel), kind: 'mono', tone: 'violet' },
      { id: 'target', label: GRID_KEYS.targetLabel, value: toTraceValue(state.targetLabel), kind: 'mono' },
      { id: 'board', label: GRID_KEYS.boardLabel, value: `${state.rows}×${state.cols}`, kind: 'mono' },
      {
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(state.decision ?? GRID_KEYS.waitingDecisionLabel),
        kind: 'text',
        wide: true,
      },
    ];
  });

  protected readonly queueChips = computed<readonly TraceChip[]>(() => {
    const state = this.state();
    if (!state?.frontierOrder) return [];
    const labels = new Map(state.cells.map((cell) => [cell.id, cell.metaLabel ?? cell.id] as const));
    return state.frontierOrder.map((id, index) => ({
      id,
      label: labels.get(id) ?? id,
      tone: index === 0 ? 'cyan' : 'amber',
      active: index === 0,
    }));
  });

  protected readonly visitChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.visitOrder ?? []).map((label, index) => ({ id: index, label, tone: 'lime' })),
  );

  protected readonly rows = computed<readonly TraceRow[]>(() => {
    const state = this.state();
    if (!state) return [];
    return state.cells
      .filter((cell) => cell.status !== 'idle')
      .sort((left, right) => left.row - right.row || left.col - right.col)
      .map((cell) => {
        const tone = STATUS_TONES[cell.status];
        return {
          id: cell.id,
          tone: cell.status === 'current' || cell.status === 'path' || cell.status === 'filled' ? tone : null,
          cells: {
            cell: cell.metaLabel,
            value: cell.valueLabel || null,
            status: [{ id: cell.status, label: toTraceValue(GRID_KEYS.statuses[cell.status]), tone }],
            tags: cell.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
          },
        };
      });
  });
}
