import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';

import { WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-dijkstra-graph-visualization',
  imports: [],
  templateUrl: './dijkstra-graph-visualization.html',
  styleUrl: './dijkstra-graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DijkstraGraphVisualization {
  readonly graph = input<WeightedGraphData | null>(null);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private previousHighlights: Record<string, string> | null = null;
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly changedCardsState = signal<ReadonlySet<string>>(new Set());

  readonly graphState = computed(() => this.step()?.graph ?? null);
  readonly nodes = computed(() => this.graphState()?.nodes ?? []);
  readonly edges = computed(() => this.graphState()?.edges ?? []);
  readonly sourceLabel = computed(() => {
    const sourceId = this.graphState()?.sourceId ?? this.graph()?.sourceId ?? null;
    if (!sourceId) return '—';
    return this.nodes().find((node) => node.id === sourceId)?.label ?? '—';
  });
  readonly currentLabel = computed(() => {
    const currentNodeId = this.graphState()?.currentNodeId;
    if (!currentNodeId) return 'Scanning';
    return this.nodes().find((node) => node.id === currentNodeId)?.label ?? 'Scanning';
  });
  readonly phaseLabel = computed(() => {
    const phase = this.step()?.phase;
    switch (phase) {
      case 'pick-node':
        return 'Pick next node';
      case 'inspect-edge':
        return 'Inspect edge';
      case 'relax':
        return 'Relax edge';
      case 'skip-relax':
        return 'Keep current best';
      case 'settle-node':
        return 'Finalize node';
      case 'graph-complete':
        return 'Shortest paths ready';
      default:
        return 'Initialize graph';
    }
  });
  readonly settledCount = computed(() => this.nodes().filter((node) => node.isSettled).length);
  readonly frontierCount = computed(() => this.nodes().filter((node) => node.isFrontier).length);
  readonly activeEdgeLabel = computed(() => {
    const edgeId = this.graphState()?.activeEdgeId;
    if (!edgeId) return '—';
    const edge = this.edges().find((item) => item.id === edgeId);
    if (!edge) return '—';
    return `${this.nodeLabel(edge.from)} → ${this.nodeLabel(edge.to)} · ${edge.weight}`;
  });
  readonly queueLead = computed(() => {
    const entry = this.graphState()?.queue[0];
    if (!entry) return 'empty';
    return `${entry.label} · ${this.formatDistance(entry.distance)}`;
  });
  readonly pathPreview = computed(() => {
    const currentNodeId = this.graphState()?.currentNodeId;
    if (!currentNodeId) return 'No active node';
    return this.describePath(currentNodeId);
  });

  constructor() {
    effect(() => {
      const step = this.step();
      const values = {
        source: this.sourceLabel(),
        current: this.currentLabel(),
        settled: String(this.settledCount()),
        queue: String(this.frontierCount()),
        phase: this.phaseLabel(),
        edge: this.activeEdgeLabel(),
        queueLead: this.queueLead(),
        path: this.pathPreview(),
      };

      untracked(() => {
        if (!step) {
          this.previousHighlights = values;
          this.changedCardsState.set(new Set());
          return;
        }

        if (!this.previousHighlights) {
          this.previousHighlights = values;
          this.changedCardsState.set(new Set());
          return;
        }

        const changed = new Set<string>();
        for (const [key, value] of Object.entries(values)) {
          if (this.previousHighlights[key] !== value) {
            changed.add(key);
          }
        }

        this.previousHighlights = values;
        this.changedCardsState.set(changed);

        if (this.highlightTimer !== null) {
          clearTimeout(this.highlightTimer);
          this.highlightTimer = null;
        }

        if (changed.size === 0) {
          return;
        }

        this.highlightTimer = setTimeout(() => {
          this.highlightTimer = null;
          this.changedCardsState.set(new Set());
        }, this.highlightDuration());
      });
    });
  }

  ngOnDestroy(): void {
    if (this.highlightTimer !== null) {
      clearTimeout(this.highlightTimer);
    }
  }

  edgePoint(edgeId: string, key: 'from' | 'to', axis: 'x' | 'y'): number {
    const edge = this.edges().find((item) => item.id === edgeId);
    const nodeId = edge ? edge[key] : null;
    const node = nodeId ? this.nodes().find((item) => item.id === nodeId) : null;
    return node?.[axis] ?? 0;
  }

  weightTransform(edgeId: string): string {
    const edge = this.edges().find((item) => item.id === edgeId);
    if (!edge) return 'translate(0 0)';
    const from = this.nodes().find((node) => node.id === edge.from);
    const to = this.nodes().find((node) => node.id === edge.to);
    if (!from || !to) return 'translate(0 0)';
    const x = (from.x + to.x) / 2;
    const y = (from.y + to.y) / 2;
    return `translate(${x} ${y})`;
  }

  formatDistance(distance: number | null): string {
    return distance === null ? '∞' : String(distance);
  }

  previousLabel(previousId: string | null): string {
    if (!previousId) return '—';
    return this.nodes().find((node) => node.id === previousId)?.label ?? '—';
  }

  isEdgeMuted(edgeId: string): boolean {
    const activeEdgeId = this.graphState()?.activeEdgeId;
    if (!activeEdgeId) return false;
    return edgeId !== activeEdgeId;
  }

  isNodeMuted(nodeId: string): boolean {
    const activeEdgeId = this.graphState()?.activeEdgeId;
    if (!activeEdgeId) return false;
    const edge = this.edges().find((item) => item.id === activeEdgeId);
    if (!edge) return false;
    const currentNodeId = this.graphState()?.currentNodeId;
    return nodeId !== currentNodeId && nodeId !== edge.from && nodeId !== edge.to;
  }

  isCardChanged(id: string): boolean {
    return this.changedCardsState().has(id);
  }

  private nodeLabel(nodeId: string): string {
    return this.nodes().find((node) => node.id === nodeId)?.label ?? nodeId;
  }

  private describePath(nodeId: string): string {
    const path: string[] = [];
    let currentId: string | null = nodeId;
    let hops = 0;
    while (currentId && hops < this.nodes().length + 1) {
      path.unshift(this.nodeLabel(currentId));
      currentId = this.nodes().find((node) => node.id === currentId)?.previousId ?? null;
      hops++;
    }
    return path.join(' → ');
  }

  private highlightDuration(): number {
    const speed = this.speed();
    return Math.max(280, 860 - speed * 55);
  }
}
