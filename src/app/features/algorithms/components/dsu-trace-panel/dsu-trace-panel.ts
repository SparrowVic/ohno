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
import { DsuEdgeStatus, DsuNodeStatus, DsuTraceState, DsuTraceTag } from '../../models/dsu';

const DSU_KEYS = I18N_KEY.features.algorithms.tracePanels.dsu;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const NODE_TONES: Readonly<Record<DsuNodeStatus, TraceTone | null>> = {
  idle: null,
  root: 'violet',
  active: 'cyan',
  query: 'cyan',
  merged: 'lime',
  compressed: 'amber',
};

const TAG_CHIPS: Readonly<Record<DsuTraceTag, { readonly label: I18nKey; readonly tone: TraceTone }>> = {
  root: { label: DSU_KEYS.statuses.root, tone: 'violet' },
  active: { label: DSU_KEYS.statuses.active, tone: 'cyan' },
  query: { label: DSU_KEYS.statuses.query, tone: 'cyan' },
  merged: { label: DSU_KEYS.statuses.merged, tone: 'lime' },
  compressed: { label: DSU_KEYS.statuses.compressed, tone: 'amber' },
  accepted: { label: DSU_KEYS.acceptedTagLabel, tone: 'lime' },
  rejected: { label: DSU_KEYS.rejectedTagLabel, tone: 'red' },
};

const EDGE_TONES: Readonly<Record<DsuEdgeStatus, TraceTone | null>> = {
  pending: null,
  active: 'cyan',
  accepted: 'lime',
  rejected: 'red',
};

const NODE_COLUMNS: readonly TraceColumn[] = [
  { id: 'node', header: DSU_KEYS.columns.node },
  { id: 'parent', header: DSU_KEYS.columns.parent },
  { id: 'root', header: DSU_KEYS.columns.root },
  { id: 'rank', header: DSU_KEYS.columns.rank, align: 'end' },
  { id: 'size', header: DSU_KEYS.columns.size, align: 'end' },
  { id: 'status', header: DSU_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: DSU_KEYS.columns.tags, kind: 'chips' },
];

const SET_COLUMNS: readonly TraceColumn[] = [
  { id: 'root', header: DSU_KEYS.columns.root, width: '72px' },
  { id: 'size', header: DSU_KEYS.columns.size, align: 'end', width: '64px' },
  { id: 'members', header: DSU_KEYS.columns.members, kind: 'mono' },
];

@Component({
  selector: 'app-dsu-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './dsu-trace-panel.html',
  styleUrl: './dsu-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuTracePanel {
  protected readonly keys = DSU_KEYS;
  protected readonly nodeColumns = NODE_COLUMNS;
  protected readonly setColumns = SET_COLUMNS;

  readonly state = input<DsuTraceState | null>(null);
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
    return [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
      { id: 'components', label: DSU_KEYS.componentsLabel, value: state.componentCount, tone: 'violet' },
      { id: 'active', label: COMMON_KEYS.activeLabel, value: toTraceValue(state.activePairLabel), kind: 'mono', tone: 'cyan' },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(state.resultLabel), kind: 'mono', tone: 'lime' },
    ];
  });

  protected readonly statusFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    return [
      { id: 'status', label: COMMON_KEYS.statusLabel, value: toTraceValue(state.statusLabel), kind: 'mono' },
      { id: 'rail', label: DSU_KEYS.railLabel, value: toTraceValue(state.operationsLabel), kind: 'mono' },
      {
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(state.decision ?? DSU_KEYS.awaitingOperationLabel),
        kind: 'text',
        wide: true,
      },
    ];
  });

  protected readonly setRows = computed<readonly TraceRow[]>(() =>
    [...(this.state()?.groups ?? [])]
      .sort((left, right) => {
        if (left.active !== right.active) return left.active ? -1 : 1;
        return left.rootLabel.localeCompare(right.rootLabel);
      })
      .map((group) => ({
        id: group.rootId,
        tone: group.active ? 'cyan' : null,
        cells: { root: group.rootLabel, size: group.size, members: group.members.join(', ') },
      })),
  );

  protected readonly edgeChips = computed<readonly TraceChip[]>(() => {
    const state = this.state();
    if (!state) return [];
    return state.edges.map((edge) => {
      const base =
        state.mode === 'union-find' && edge.toLabel === 'find'
          ? i18nText(DSU_KEYS.findOperationLabel, { label: edge.fromLabel })
          : `${edge.fromLabel}-${edge.toLabel}`;
      const label = edge.weight !== null && typeof base === 'string' ? `${base} · ${edge.weight}` : base;
      return { id: edge.id, label, tone: EDGE_TONES[edge.status], active: edge.status === 'active' };
    });
  });

  protected readonly nodeRows = computed<readonly TraceRow[]>(() =>
    [...(this.state()?.nodes ?? [])]
      .sort((left, right) => left.label.localeCompare(right.label))
      .map((node) => {
        const tone = NODE_TONES[node.status];
        return {
          id: node.id,
          tone: node.status === 'idle' || node.status === 'root' ? null : tone,
          cells: {
            node: node.label,
            parent: node.parentLabel,
            root: node.rootLabel,
            rank: node.rank,
            size: node.size,
            status: [{ id: node.status, label: toTraceValue(DSU_KEYS.statuses[node.status]), tone }],
            tags: node.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
          },
        };
      }),
  );
}
