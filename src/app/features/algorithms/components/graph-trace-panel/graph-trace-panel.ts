import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey, RUNTIME_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, translatableKey } from '../../../../core/i18n/translatable-text';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { GraphStepState, GraphTraceRow } from '../../models/graph';

const GRAPH_KEYS = I18N_KEY.features.algorithms.tracePanels.graph;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const LABELS = I18N_KEY.features.algorithms.display.graph.labels;
const RUNTIME = RUNTIME_KEY.graph;

const SEED_DETAILS: ReadonlySet<string> = new Set([
  LABELS.componentSweep,
  LABELS.partitionCheck,
  LABELS.criticalLinks,
  LABELS.tarjanSccMap,
  LABELS.finishStack,
  LABELS.kosarajuSccMap,
]);

const START_DETAILS: ReadonlySet<string> = new Set([LABELS.eulerCircuit, LABELS.eulerPath, LABELS.mstTree]);

const KEEP_DECISIONS: ReadonlySet<string> = new Set([
  RUNTIME.common.keep,
  RUNTIME.common.keepDiscovery,
  RUNTIME.common.keepUnreachable,
  RUNTIME.connectedComponents.decisions.keepLabel,
  RUNTIME.bipartiteCheck.decisions.keepColoring,
  RUNTIME.kosaraju.decisions.keepBoundary,
]);

const UNBOUNDED_METRICS: ReadonlySet<string> = new Set([LABELS.color, LABELS.dominatorCount]);

function sourceCardKey(detail: TranslatableText | undefined): I18nKey {
  const key = translatableKey(detail);
  if (!key) return GRAPH_KEYS.sourceLabel;
  if (START_DETAILS.has(key)) return GRAPH_KEYS.startLabel;
  if (key === LABELS.steinerTree) return GRAPH_KEYS.terminalLabel;
  if (key === LABELS.dominatorTree) return GRAPH_KEYS.entryLabel;
  if (SEED_DETAILS.has(key)) return GRAPH_KEYS.seedLabel;
  return GRAPH_KEYS.sourceLabel;
}

@Component({
  selector: 'app-graph-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './graph-trace-panel.html',
  styleUrl: './graph-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphTracePanel {
  protected readonly keys = GRAPH_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<GraphStepState | null>(null);
  readonly algorithmId = input<string | null>(null);
  readonly focusTargetLabel = input<string | null>(null);
  readonly focusPathLabel = input<string | null>(null);
  readonly focusModeLabel = input<string | null>(null);
  readonly focusHint = input<string | null>(null);

  private readonly metricLabel = computed<TranslatableText | null>(() => this.state()?.metricLabel ?? null);
  protected readonly frontierLabel = computed<TranslatableText>(
    () => this.labelOr(this.state()?.frontierLabel, GRAPH_KEYS.frontierFallbackLabel),
  );
  protected readonly visitOrderLabel = computed<TranslatableText>(
    () => this.labelOr(this.state()?.visitOrderLabel, GRAPH_KEYS.visitOrderLabel),
  );

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
    const source =
      state.traceRows.find((item) => item.isSource) ?? state.traceRows.find((item) => item.nodeId === state.sourceId);
    const current = state.traceRows.find((item) => item.isCurrent);
    return [
      { id: 'source', label: sourceCardKey(state.detailLabel), value: source?.label, kind: 'mono', tone: 'violet' },
      { id: 'current', label: GRAPH_KEYS.currentLabel, value: current?.label, kind: 'mono', tone: current ? 'cyan' : null },
      {
        id: 'settled',
        label: this.labelOr(state.completionLabel, GRAPH_KEYS.completionFallbackLabel),
        value: state.traceRows.filter((item) => item.isSettled).length,
        tone: 'lime',
      },
      { id: 'frontier', label: this.frontierLabel(), value: state.queue.length, tone: 'amber' },
    ];
  });

  protected readonly decisionTone = computed<TraceTone | null>(() => {
    const decision = translatableKey(this.state()?.computation?.decision);
    if (!decision) return null;
    return KEEP_DECISIONS.has(decision) ? 'slate' : 'pink';
  });

  protected readonly decisionFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const computation = state.computation;
    const tone = this.decisionTone();
    const badge = tone === 'pink' ? GRAPH_KEYS.relaxBadgeLabel : tone === 'slate' ? GRAPH_KEYS.keepBadgeLabel : GRAPH_KEYS.idleBadgeLabel;
    return [
      {
        id: 'candidate',
        label: GRAPH_KEYS.currentDecisionLabel,
        value: toTraceValue(computation?.candidateLabel ?? GRAPH_KEYS.stepCalculationLabel),
        kind: 'mono',
        tone,
      },
      { id: 'badge', label: COMMON_KEYS.statusLabel, value: toTraceValue(badge), kind: 'mono' },
      {
        id: 'expression',
        label: GRAPH_KEYS.calculationAriaLabel,
        value: toTraceValue(computation?.expression ?? GRAPH_KEYS.noEdgeUpdateLabel),
        kind: 'mono',
        wide: true,
      },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: computation?.result ?? null },
      {
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(computation?.decision ?? GRAPH_KEYS.waitingDecisionLabel),
        kind: 'text',
        wide: true,
      },
    ];
  });

  protected readonly contextFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const focused = this.focusTargetLabel() !== null && this.focusPathLabel() !== null;
    if (focused) {
      return [
        { id: 'target', label: GRAPH_KEYS.focusedTargetLabel, value: this.focusTargetLabel(), kind: 'mono', tone: 'cyan' },
        { id: 'lens', label: GRAPH_KEYS.uiLensBadgeLabel, value: this.focusModeLabel(), kind: 'mono' },
        { id: 'path', label: COMMON_KEYS.routeLabel, value: this.focusPathLabel(), kind: 'mono', wide: true },
        {
          id: 'hint',
          label: COMMON_KEYS.watchLabel,
          value: toTraceValue(this.focusHint() ?? GRAPH_KEYS.focusedRouteHint),
          kind: 'text',
          wide: true,
        },
      ];
    }
    return [
      {
        id: 'detail',
        label: this.labelOr(state.detailLabel, GRAPH_KEYS.graphStateBadgeLabel),
        value: toTraceValue(state.detailValue || GRAPH_KEYS.noDetailLabel),
        kind: 'mono',
        wide: true,
      },
      { id: 'hint', label: COMMON_KEYS.watchLabel, value: toTraceValue(GRAPH_KEYS.graphContextHint), kind: 'text', wide: true },
    ];
  });

  protected readonly queueChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.queue ?? []).map((entry, index) => ({
      id: entry.nodeId,
      label: `${entry.label} · ${this.formatDistance(entry.distance)}`,
      tone: index === 0 ? 'cyan' : 'amber',
      active: index === 0,
    })),
  );

  protected readonly visitChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.visitOrder ?? []).map((label, index) => ({ id: index, label: toTraceValue(label), tone: 'lime' })),
  );

  protected readonly columns = computed<readonly TraceColumn[]>(() => [
    { id: 'node', header: GRAPH_KEYS.columns.node },
    { id: 'metric', header: this.labelOr(this.metricLabel(), GRAPH_KEYS.metricFallbackLabel), kind: 'mono', align: 'end' },
    { id: 'secondary', header: this.labelOr(this.state()?.secondaryLabel, GRAPH_KEYS.secondaryFallbackLabel), kind: 'mono' },
    { id: 'status', header: GRAPH_KEYS.columns.status, kind: 'chips' },
  ]);

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    (this.state()?.traceRows ?? []).map((row) => {
      const tone = this.rowTone(row);
      return {
        id: row.nodeId,
        tone: row.isCurrent || row.isSettled ? tone : null,
        cells: {
          node: row.label,
          metric: this.formatDistance(row.distance),
          secondary: toTraceValue(row.secondaryText),
          status: [{ id: 'status', label: this.statusLabel(row), tone }],
        },
      };
    }),
  );

  private rowTone(row: GraphTraceRow): TraceTone | null {
    if (row.isCurrent) return 'cyan';
    if (row.isSettled) return 'lime';
    if (row.isSource) return 'violet';
    if (row.isFrontier) return 'amber';
    return null;
  }

  private statusLabel(row: GraphTraceRow) {
    const state = this.state();
    if (row.isCurrent) return toTraceValue(GRAPH_KEYS.statuses.current);
    if (row.isSettled) return toTraceValue(this.labelOr(state?.completionStatusLabel, GRAPH_KEYS.statuses.visited));
    if (row.isSource) return toTraceValue(GRAPH_KEYS.statuses.source);
    if (row.isFrontier) return toTraceValue(this.labelOr(state?.frontierStatusLabel, GRAPH_KEYS.statuses.queued));
    return toTraceValue(GRAPH_KEYS.statuses.unseen);
  }

  private labelOr(label: TranslatableText | null | undefined, fallback: I18nKey): TranslatableText {
    return label || fallback;
  }

  private formatDistance(distance: number | null): string {
    const metric = translatableKey(this.metricLabel());
    if (distance === null && metric !== null && UNBOUNDED_METRICS.has(metric)) return '—';
    return distance === null ? '∞' : String(distance);
  }
}
