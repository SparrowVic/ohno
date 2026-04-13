import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GraphStepState, GraphTraceRow } from '../../models/graph';

@Component({
  selector: 'app-graph-trace-panel',
  imports: [],
  templateUrl: './graph-trace-panel.html',
  styleUrl: './graph-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphTracePanel {
  readonly state = input<GraphStepState | null>(null);
  readonly focusTargetLabel = input<string | null>(null);
  readonly focusPathLabel = input<string | null>(null);
  readonly focusModeLabel = input<string | null>(null);
  readonly focusHint = input<string | null>(null);
  readonly sourceLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    const source = state.traceRows.find((item) => item.isSource) ?? state.traceRows.find((item) => item.nodeId === state.sourceId);
    return source?.label ?? '—';
  });
  readonly sourceCardLabel = computed(() => {
    if (this.state()?.detailLabel.startsWith('Euler')) {
      return 'Start';
    }
    if (this.state()?.detailLabel === 'Steiner tree') {
      return 'Terminal';
    }
    if (this.state()?.detailLabel === 'Dominator tree') {
      return 'Entry';
    }
    switch (this.state()?.detailLabel) {
      case 'MST tree':
        return 'Start';
      case 'Component sweep':
      case 'Partition check':
      case 'Critical links':
      case 'Tarjan SCC map':
      case 'Finish stack':
      case 'Kosaraju SCC map':
        return 'Seed';
      default:
        return 'Source';
    }
  });

  readonly currentLabel = computed(() => {
    const row = this.state()?.traceRows.find((item) => item.isCurrent);
    return row?.label ?? '—';
  });

  readonly settledCount = computed(() => this.state()?.traceRows.filter((item) => item.isSettled).length ?? 0);
  readonly queueLength = computed(() => this.state()?.queue.length ?? 0);
  readonly hasComputation = computed(() => this.state()?.computation !== null);
  readonly completionLabel = computed(() => this.state()?.completionLabel ?? 'Visited');
  readonly frontierLabel = computed(() => this.state()?.frontierLabel ?? 'Queue');
  readonly metricLabel = computed(() => this.state()?.metricLabel ?? 'Distance');
  readonly secondaryLabel = computed(() => this.state()?.secondaryLabel ?? 'Prev');
  readonly visitOrderLabel = computed(() => this.state()?.visitOrderLabel ?? 'Visit order');
  readonly hasFocusedRoute = computed(() => this.focusTargetLabel() !== null && this.focusPathLabel() !== null);
  readonly focusSummaryLabel = computed(() => (this.hasFocusedRoute() ? 'Focused target' : 'Context'));
  readonly focusSummaryValue = computed(() => {
    if (this.hasFocusedRoute()) return this.focusTargetLabel() ?? '—';
    return this.state()?.detailLabel ?? '—';
  });
  readonly focusCardPath = computed(() => {
    if (this.hasFocusedRoute()) return this.focusPathLabel() ?? '—';
    return this.state()?.detailValue ?? 'No detail';
  });
  readonly focusCardHint = computed(() => {
    if (this.hasFocusedRoute()) {
      return this.focusHint() ?? 'The route focus is a UI lens, not always an algorithm input.';
    }
    return 'This algorithm is explained as a whole graph structure, not as one selected route.';
  });
  readonly focusCardLabelResolved = computed(() => {
    if (this.hasFocusedRoute()) return this.focusModeLabel() ?? 'Focused route';
    return this.state()?.detailLabel ?? 'Detail';
  });
  readonly focusCardBadge = computed(() => (this.hasFocusedRoute() ? 'UI lens' : 'Graph state'));
  readonly focusCardMuted = computed(() => {
    if (this.hasFocusedRoute()) return false;
    return !this.state()?.detailValue;
  });
  readonly computationLabel = computed(() => this.state()?.computation?.candidateLabel ?? 'Step calculation');
  readonly computationExpression = computed(() => this.state()?.computation?.expression ?? 'No edge update');
  readonly computationResult = computed(() => this.state()?.computation?.result ?? null);
  readonly computationDecision = computed(() => {
    return this.state()?.computation?.decision ?? 'Waiting for a compare/relax/decision step.';
  });

  statusLabel(row: GraphTraceRow): string {
    if (row.isCurrent) return 'current';
    if (row.isSettled) return this.state()?.completionStatusLabel ?? 'visited';
    if (row.isSource) return 'source';
    if (row.isFrontier) return this.state()?.frontierStatusLabel ?? 'queued';
    return 'unseen';
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
}
