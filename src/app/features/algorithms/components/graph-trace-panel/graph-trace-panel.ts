import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { GraphStepState, GraphTraceRow } from '../../models/graph';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

@Component({
  selector: 'app-graph-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TraceHint, TranslocoPipe],
  templateUrl: './graph-trace-panel.html',
  styleUrl: './graph-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<GraphStepState | null>(null);
  readonly algorithmId = input<string | null>(null);
  readonly focusTargetLabel = input<string | null>(null);
  readonly focusPathLabel = input<string | null>(null);
  readonly focusModeLabel = input<string | null>(null);
  readonly focusHint = input<string | null>(null);

  readonly hintKeyIdea = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? (GRAPH_ALGORITHM_TUTORIALS[id]?.keyIdea ?? null) : null;
  });
  readonly hintWatch = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? (GRAPH_ALGORITHM_TUTORIALS[id]?.watch ?? null) : null;
  });
  readonly sourceLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    const source =
      state.traceRows.find((item) => item.isSource) ??
      state.traceRows.find((item) => item.nodeId === state.sourceId);
    return source?.label ?? '—';
  });
  readonly sourceCardLabel = computed(() => {
    if (this.state()?.detailLabel.startsWith('Euler')) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.startLabel);
    }
    if (this.state()?.detailLabel === 'Steiner tree') {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.terminalLabel);
    }
    if (this.state()?.detailLabel === 'Dominator tree') {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.entryLabel);
    }
    switch (this.state()?.detailLabel) {
      case 'MST tree':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.startLabel);
      case 'Component sweep':
      case 'Partition check':
      case 'Critical links':
      case 'Tarjan SCC map':
      case 'Finish stack':
      case 'Kosaraju SCC map':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.seedLabel);
      default:
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.sourceLabel);
    }
  });

  readonly currentLabel = computed(() => {
    const row = this.state()?.traceRows.find((item) => item.isCurrent);
    return row?.label ?? '—';
  });

  readonly settledCount = computed(
    () => this.state()?.traceRows.filter((item) => item.isSettled).length ?? 0,
  );
  readonly queueLength = computed(() => this.state()?.queue.length ?? 0);
  readonly hasComputation = computed(() => this.state()?.computation !== null);
  readonly completionLabel = computed(
    () =>
      this.state()?.completionLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.completionFallbackLabel),
  );
  readonly frontierLabel = computed(
    () =>
      this.state()?.frontierLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.frontierFallbackLabel),
  );
  readonly metricLabel = computed(
    () =>
      this.state()?.metricLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.metricFallbackLabel),
  );
  readonly secondaryLabel = computed(
    () =>
      this.state()?.secondaryLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.secondaryFallbackLabel),
  );
  readonly tableColumns = computed<readonly TableColumn[]>(() => [
    { id: 'node', headerKey: I18N_KEY.features.algorithms.tracePanels.graph.columns.node },
    { id: 'metric', header: this.metricLabel(), kind: 'mono' },
    { id: 'secondary', header: this.secondaryLabel(), kind: 'mono' },
    {
      id: 'status',
      headerKey: I18N_KEY.features.algorithms.tracePanels.graph.columns.status,
      width: '92px',
      kind: 'tag',
    },
  ]);
  readonly visitOrderLabel = computed(
    () =>
      this.state()?.visitOrderLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.visitOrderLabel),
  );
  readonly hasFocusedRoute = computed(
    () => this.focusTargetLabel() !== null && this.focusPathLabel() !== null,
  );
  readonly focusSummaryLabel = computed(() =>
    this.hasFocusedRoute()
      ? this.translate(I18N_KEY.features.algorithms.tracePanels.graph.focusedTargetLabel)
      : this.translate(I18N_KEY.features.algorithms.tracePanels.graph.contextLabel),
  );
  readonly focusSummaryValue = computed(() => {
    if (this.hasFocusedRoute()) return this.focusTargetLabel() ?? '—';
    return this.state()?.detailLabel ?? '—';
  });
  readonly focusCardPath = computed(() => {
    if (this.hasFocusedRoute()) return this.focusPathLabel() ?? '—';
    return (
      this.state()?.detailValue ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.noDetailLabel)
    );
  });
  readonly focusCardHint = computed(() => {
    if (this.hasFocusedRoute()) {
      return (
        this.focusHint() ??
        this.translate(I18N_KEY.features.algorithms.tracePanels.graph.focusedRouteHint)
      );
    }
    return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.graphContextHint);
  });
  readonly focusCardBadge = computed(() =>
    this.hasFocusedRoute()
      ? this.translate(I18N_KEY.features.algorithms.tracePanels.graph.uiLensBadgeLabel)
      : this.translate(I18N_KEY.features.algorithms.tracePanels.graph.graphStateBadgeLabel),
  );
  readonly focusCardMuted = computed(() => {
    if (this.hasFocusedRoute()) return false;
    return !this.state()?.detailValue;
  });
  readonly computationLabel = computed(
    () =>
      this.state()?.computation?.candidateLabel ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.stepCalculationLabel),
  );
  readonly computationExpression = computed(
    () =>
      this.state()?.computation?.expression ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.noEdgeUpdateLabel),
  );
  readonly computationResult = computed(() => this.state()?.computation?.result ?? null);
  readonly computationDecision = computed(() => {
    return (
      this.state()?.computation?.decision ??
      this.translate(I18N_KEY.features.algorithms.tracePanels.graph.waitingDecisionLabel)
    );
  });
  readonly decisionBadge = computed(() => {
    switch (this.decisionTone()) {
      case 'improve':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.relaxBadgeLabel);
      case 'keep':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.keepBadgeLabel);
      default:
        return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.idleBadgeLabel);
    }
  });
  readonly tableRows = computed<readonly TableRow[]>(() =>
    (this.state()?.traceRows ?? []).map((row) => ({
      id: row.nodeId,
      tone: row.isCurrent ? 'active' : row.isSettled ? 'success' : 'default',
      cells: {
        node: row.label,
        metric: this.formatDistance(row.distance),
        secondary: this.formatSecondary(row.secondaryText),
        status: this.statusTag(row),
      },
    })),
  );

  statusLabel(row: GraphTraceRow): string {
    if (row.isCurrent) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.statuses.current);
    }
    if (row.isSettled) {
      return (
        this.state()?.completionStatusLabel ??
        this.translate(I18N_KEY.features.algorithms.tracePanels.graph.statuses.visited)
      );
    }
    if (row.isSource) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.statuses.source);
    }
    if (row.isFrontier) {
      return (
        this.state()?.frontierStatusLabel ??
        this.translate(I18N_KEY.features.algorithms.tracePanels.graph.statuses.queued)
      );
    }
    return this.translate(I18N_KEY.features.algorithms.tracePanels.graph.statuses.unseen);
  }

  formatDistance(distance: number | null): string {
    if (distance === null && (this.metricLabel() === 'Color' || this.metricLabel() === 'Dom#')) {
      return '—';
    }
    return distance === null ? '∞' : String(distance);
  }

  formatSecondary(value: string | null): string {
    return value ?? '—';
  }

  decisionTone(): 'improve' | 'keep' | 'idle' {
    const decision = this.state()?.computation?.decision;
    if (!decision) return 'idle';
    if (decision.startsWith('keep')) return 'keep';
    return 'improve';
  }

  private statusTag(row: GraphTraceRow): UiTagModel {
    return {
      label: this.statusLabel(row),
      tone: row.isCurrent
        ? 'warning'
        : row.isSettled
          ? 'success'
          : row.isSource
            ? 'accent'
            : row.isFrontier
              ? 'window'
              : 'neutral',
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
