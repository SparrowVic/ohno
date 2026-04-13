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

  statusLabel(row: GraphTraceRow): string {
    if (row.isCurrent) return 'current';
    if (row.isSettled) return this.state()?.completionStatusLabel ?? 'visited';
    if (row.isSource) return 'source';
    if (row.isFrontier) return this.state()?.frontierStatusLabel ?? 'queued';
    return 'unseen';
  }

  formatDistance(distance: number | null): string {
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
