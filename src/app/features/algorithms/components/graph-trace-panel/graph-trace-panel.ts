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

  statusLabel(row: GraphTraceRow): string {
    if (row.isCurrent) return 'current';
    if (row.isSettled) return 'settled';
    if (row.isSource) return 'source';
    if (row.isFrontier) return 'queued';
    return 'unseen';
  }

  formatDistance(distance: number | null): string {
    return distance === null ? '∞' : String(distance);
  }

  decisionTone(): 'improve' | 'keep' | 'idle' {
    const decision = this.state()?.computation?.decision;
    if (!decision) return 'idle';
    if (decision.startsWith('keep')) return 'keep';
    return 'improve';
  }
}
