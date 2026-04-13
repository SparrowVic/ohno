import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
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
  readonly focusedNodeId = input<string | null>(null);
  readonly focusedNodeIdChange = output<string | null>();

  private previousHighlights: Record<string, string> | null = null;
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly changedCardsState = signal<ReadonlySet<string>>(new Set());
  private readonly selectedNodeIdState = signal<string | null>(null);

  readonly graphState = computed(() => this.step()?.graph ?? null);
  readonly nodes = computed(() => this.graphState()?.nodes ?? []);
  readonly edges = computed(() => this.graphState()?.edges ?? []);
  readonly metricLabel = computed(() => this.graphState()?.metricLabel ?? 'Distance');
  readonly secondaryLabel = computed(() => this.graphState()?.secondaryLabel ?? 'Prev');
  readonly frontierLabel = computed(() => this.graphState()?.frontierLabel ?? 'Queue');
  readonly frontierHeadLabel = computed(() => this.graphState()?.frontierHeadLabel ?? 'Queue head');
  readonly completionLabel = computed(() => this.graphState()?.completionLabel ?? 'Visited');
  readonly showEdgeWeights = computed(() => this.graphState()?.showEdgeWeights ?? true);
  readonly detailLabel = computed(() => this.graphState()?.detailLabel ?? 'Path');
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
    return this.graphState()?.phaseLabel ?? 'Initialize graph';
  });
  readonly settledCount = computed(() => this.nodes().filter((node) => node.isSettled).length);
  readonly frontierCount = computed(() => this.nodes().filter((node) => node.isFrontier).length);
  readonly activeEdgeLabel = computed(() => {
    const edgeId = this.graphState()?.activeEdgeId;
    if (!edgeId) return '—';
    const edge = this.edges().find((item) => item.id === edgeId);
    if (!edge) return '—';
    if (!this.showEdgeWeights()) {
      return `${this.nodeLabel(edge.from)} → ${this.nodeLabel(edge.to)}`;
    }
    return `${this.nodeLabel(edge.from)} → ${this.nodeLabel(edge.to)} · ${edge.weight}`;
  });
  readonly queueLead = computed(() => {
    const entry = this.graphState()?.queue[0];
    if (!entry) return 'empty';
    return `${entry.label} · ${this.formatDistance(entry.distance)}`;
  });
  readonly detailValue = computed(() => {
    const value = this.graphState()?.detailValue;
    if (value) return value;
    const currentNodeId = this.graphState()?.currentNodeId;
    if (!currentNodeId) return 'No active node';
    return this.describePath(currentNodeId);
  });
  readonly selectedNodeId = computed(() => {
    const nodes = this.nodes();
    const routeMode = this.routeMode();
    if (!routeMode || nodes.length === 0) return null;

    const selected = this.focusedNodeId() ?? this.selectedNodeIdState();
    if (selected && nodes.some((node) => node.id === selected)) {
      return selected;
    }

    const currentNodeId = this.graphState()?.currentNodeId;
    if (currentNodeId) return currentNodeId;

    return this.defaultFocusNodeId();
  });
  readonly focusedPathNodeIds = computed(() => {
    const focusedNodeId = this.selectedNodeId();
    if (!focusedNodeId || !this.routeMode()) return new Set<string>();
    return new Set(this.pathNodeIds(focusedNodeId));
  });
  readonly focusedPathEdgeIds = computed(() => {
    const focusedNodeId = this.selectedNodeId();
    if (!focusedNodeId || !this.routeMode()) return new Set<string>();
    const path = this.pathNodeIds(focusedNodeId);
    const ids = new Set<string>();
    for (let index = 0; index < path.length - 1; index++) {
      const from = path[index];
      const to = path[index + 1];
      const edge = this.edges().find(
        (item) => (item.from === from && item.to === to) || (item.from === to && item.to === from),
      );
      if (edge) ids.add(edge.id);
    }
    return ids;
  });
  readonly routeMode = computed<'shortest-tree' | 'bfs-tree' | 'dfs-tree' | null>(() => {
    const metric = this.metricLabel();
    const detail = this.detailLabel();
    if (metric === 'Distance') return 'shortest-tree';
    if (metric === 'Level') return 'bfs-tree';
    if (metric === 'Depth' && detail === 'Depth path') return 'dfs-tree';
    return null;
  });
  readonly structureLabel = computed(() => {
    switch (this.routeMode()) {
      case 'shortest-tree':
        return 'Shortest-path tree';
      case 'bfs-tree':
        return 'BFS discovery tree';
      case 'dfs-tree':
        return 'DFS discovery tree';
      default:
        if (this.detailLabel() === 'Component sweep') return 'Component partition';
        if (this.detailLabel() === 'Partition check') return 'Two-color validation';
        if (this.detailLabel() === 'MST tree') return 'Minimum spanning tree';
        if (this.detailLabel() === 'Critical links') return 'Low-link analysis';
        if (this.detailLabel() === 'Cycle') return 'Cycle witness';
        if (this.detailLabel() === 'Topo order') return 'Ordering flow';
        return 'Graph state';
    }
  });
  readonly structureHint = computed(() => {
    switch (this.routeMode()) {
      case 'shortest-tree':
        return 'Teal edges show all finalized shortest routes from the source. Click a node to focus one route.';
      case 'bfs-tree':
        return 'Tree edges show first discovery in BFS. Click a node to inspect one shortest unweighted route.';
      case 'dfs-tree':
        return 'Tree edges show DFS discovery order. Click a node to inspect one explored branch.';
      default:
        if (this.detailLabel() === 'Component sweep') {
          return 'The algorithm expands one disconnected component at a time and labels every reached node.';
        }
        if (this.detailLabel() === 'Partition check') {
          return 'Blue and amber nodes should only connect across sides. A red edge marks an odd-cycle conflict.';
        }
        if (this.detailLabel() === 'MST tree') {
          return 'Teal edges belong to the growing minimum spanning tree. Candidate costs compete to connect the next node.';
        }
        if (this.detailLabel() === 'Critical links') {
          return 'Red nodes or edges are articulation points and bridges whose removal disconnects the graph.';
        }
        if (this.detailLabel() === 'Cycle') return 'This view explains DFS state and the detected cycle, not a single source-to-target path.';
        if (this.detailLabel() === 'Topo order') return 'This view explains how nodes enter topological order, not source-to-target routes.';
        return 'The graph highlights the algorithm state step by step.';
    }
  });
  readonly focusedNodeLabel = computed(() => {
    const focusedNodeId = this.selectedNodeId();
    if (!focusedNodeId) return '—';
    return this.nodeLabel(focusedNodeId);
  });
  readonly focusedPathLabel = computed(() => {
    const focusedNodeId = this.selectedNodeId();
    if (!focusedNodeId || !this.routeMode()) return '—';
    return this.describePath(focusedNodeId);
  });
  readonly treeRouteCount = computed(() => {
    if (!this.routeMode()) return 0;
    return this.nodes().filter((node) => node.previousId !== null).length;
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
        detail: this.detailValue(),
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

    effect(() => {
      const resolved = this.selectedNodeId();
      const incoming = this.focusedNodeId();
      untracked(() => {
        if (resolved !== incoming) {
          this.focusedNodeIdChange.emit(resolved);
        }
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

  edgeMarker(edgeId: string): string {
    const edge = this.edges().find((item) => item.id === edgeId);
    if (!edge?.directed) return '';
    if (edge.isRelaxed) return 'url(#graphArrowRelaxed)';
    if (edge.isActive) return 'url(#graphArrowActive)';
    if (edge.isTree) return 'url(#graphArrowTree)';
    return 'url(#graphArrowDefault)';
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

  secondaryText(nodeId: string): string {
    return this.nodes().find((node) => node.id === nodeId)?.secondaryText ?? '—';
  }

  isEdgeMuted(edgeId: string): boolean {
    if (this.routeMode() && this.focusedPathEdgeIds().size > 0) {
      return !this.focusedPathEdgeIds().has(edgeId) && !this.isTreeEdge(edgeId);
    }
    const activeEdgeId = this.graphState()?.activeEdgeId;
    if (!activeEdgeId) return false;
    return edgeId !== activeEdgeId;
  }

  isNodeMuted(nodeId: string): boolean {
    if (this.routeMode() && this.focusedPathNodeIds().size > 0) {
      return !this.focusedPathNodeIds().has(nodeId) && !this.isNodeInTree(nodeId);
    }
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

  selectNode(nodeId: string): void {
    if (!this.routeMode()) return;
    this.selectedNodeIdState.set(nodeId);
    this.focusedNodeIdChange.emit(nodeId);
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeId() === nodeId;
  }

  isNodeInFocusedPath(nodeId: string): boolean {
    return this.focusedPathNodeIds().has(nodeId);
  }

  isEdgeFocused(edgeId: string): boolean {
    return this.focusedPathEdgeIds().has(edgeId);
  }

  isTreeEdge(edgeId: string): boolean {
    return this.edges().find((edge) => edge.id === edgeId)?.isTree ?? false;
  }

  isNodeInTree(nodeId: string): boolean {
    return this.nodes().some((node) => node.id === nodeId && (node.previousId !== null || node.isSource));
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

  private defaultFocusNodeId(): string | null {
    const routeMode = this.routeMode();
    const sourceId = this.graphState()?.sourceId ?? null;
    if (!routeMode || !sourceId) return null;

    const candidates = this.nodes()
      .filter((node) => node.id !== sourceId && node.distance !== null)
      .sort((left, right) => {
        const leftDistance = left.distance ?? Number.NEGATIVE_INFINITY;
        const rightDistance = right.distance ?? Number.NEGATIVE_INFINITY;
        if (leftDistance !== rightDistance) return rightDistance - leftDistance;
        return left.label.localeCompare(right.label);
      });

    return candidates[0]?.id ?? sourceId;
  }

  private pathNodeIds(nodeId: string): string[] {
    const path: string[] = [];
    let currentId: string | null = nodeId;
    let hops = 0;
    while (currentId && hops < this.nodes().length + 1) {
      path.unshift(currentId);
      currentId = this.nodes().find((node) => node.id === currentId)?.previousId ?? null;
      hops++;
    }
    return path;
  }
}
