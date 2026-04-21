import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

/** Radius of a rendered node body. Edges are trimmed by this amount
 *  so arrow tips land on the node's border instead of being swallowed
 *  by its fill. Keep in sync with the `r` attribute on `.node__body`. */
const NODE_RADIUS = 22;
/** Extra breathing room between the arrow tip and the node border. */
const ARROW_TIP_INSET = 2;

interface ArrowMarker {
  readonly id: string;
  readonly fill: string;
}

/** Palette of marker-end arrow heads used on directed edges. Rendered
 *  as `<marker>` definitions in the template and picked per-edge
 *  based on its current state. */
const ARROW_MARKERS: readonly ArrowMarker[] = [
  { id: 'graphArrowDefault', fill: 'rgba(255, 255, 255, 0.52)' },
  { id: 'graphArrowTree', fill: 'rgba(94, 234, 212, 0.66)' },
  { id: 'graphArrowActive', fill: 'rgba(124, 110, 240, 0.82)' },
  { id: 'graphArrowRelaxed', fill: 'rgba(94, 234, 212, 0.94)' },
];

interface RenderedEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly weight: number;
  readonly directed: boolean;
  readonly isTree: boolean;
  readonly isActive: boolean;
  readonly isRelaxed: boolean;
  readonly tone: string | null | undefined;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
}

const I18N = I18N_KEY.features.algorithms.visualizations.graph;

@Component({
  selector: 'app-graph-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './graph-visualization.html',
  styleUrl: './graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphVisualization {
  protected readonly I18N = I18N;
  readonly graph = input<WeightedGraphData | null>(null);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly focusedNodeId = input<string | null>(null);
  readonly focusedNodeIdChange = output<string | null>();

  private readonly selectedNodeIdState = signal<string | null>(null);

  readonly graphState = computed(() => this.step()?.graph ?? null);
  readonly nodes = computed(() => this.graphState()?.nodes ?? []);
  readonly arrowMarkers = ARROW_MARKERS;

  /** Enriched edges: pre-computes trimmed endpoints so arrow tips
   *  touch the node border instead of sinking into the fill, and
   *  also carries the midpoint for placing weight badges. */
  readonly edges = computed<readonly RenderedEdge[]>(() => {
    const nodes = this.nodes();
    const base = this.graphState()?.edges ?? [];
    return base.map((edge) => {
      const from = nodes.find((node) => node.id === edge.from);
      const to = nodes.find((node) => node.id === edge.to);
      const fromX = from?.x ?? 0;
      const fromY = from?.y ?? 0;
      const toX = to?.x ?? 0;
      const toY = to?.y ?? 0;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.hypot(dx, dy) || 1;
      const trim = Math.min(NODE_RADIUS + ARROW_TIP_INSET, dist / 2 - 0.5);
      const ux = dx / dist;
      const uy = dy / dist;
      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        directed: edge.directed ?? false,
        isTree: edge.isTree,
        isActive: edge.isActive,
        isRelaxed: edge.isRelaxed,
        tone: edge.tone,
        x1: fromX + ux * trim,
        y1: fromY + uy * trim,
        x2: toX - ux * trim,
        y2: toY - uy * trim,
        midX: (fromX + toX) / 2,
        midY: (fromY + toY) / 2,
      };
    });
  });

  readonly metricLabel = computed(() => this.graphState()?.metricLabel ?? 'Distance');
  readonly secondaryLabel = computed(() => this.graphState()?.secondaryLabel ?? 'Prev');
  readonly showEdgeWeights = computed(() => this.graphState()?.showEdgeWeights ?? true);

  /** Suppress the distance/secondary labels above and below each
   *  node when they'd just duplicate state already conveyed by the
   *  node's tone. Bipartite / chromatic colourings are the clear
   *  examples — the partition is already obvious from the fill, so
   *  floating chips only add collision noise on tightly-packed
   *  layouts. */
  readonly showNodeLabels = computed(
    () => this.metricLabel() !== 'Color' && this.metricLabel() !== 'Side',
  );

  /** Phase label — passed straight into VizHeader. Generators emit
   *  either a plain string or an i18n key; the `i18nText` pipe
   *  inside VizHeader resolves whichever it turns out to be. */
  readonly phaseLabel = computed<TranslatableText>(() => {
    return this.graphState()?.phaseLabel ?? I18N.initializeLabel;
  });

  /** Action sentence for the header — a single line answering "what
   *  did this step just do?". Picks the most specific fact available
   *  without layering multiple hints into one crowded string:
   *
   *    1. Generator-provided `decision` — the richest per-step text.
   *    2. Active edge label — "A → B · 5".
   *    3. Current node — "Inspecting X".
   *    4. Detail value — prose fallback from the generator.
   *    5. "Scanning" — when nothing interesting is happening. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.graphState();
    if (!state) return I18N.initializeLabel;

    const decision = state.computation?.decision;
    if (decision) return decision;

    const activeEdgeId = state.activeEdgeId;
    if (activeEdgeId) {
      const edge = this.edges().find((item) => item.id === activeEdgeId);
      if (edge) return this.formatEdgeLabel(edge);
    }

    const currentNodeId = state.currentNodeId;
    if (currentNodeId) {
      return i18nText(I18N.inspectingLabel, { node: this.nodeLabel(currentNodeId) });
    }

    const detailValue = state.detailValue;
    if (detailValue) return detailValue;

    return I18N.scanningLabel;
  });

  /** Tone for the header's accent rail — a purely structural
   *  heuristic driven by edge / node state flags (no brittle text
   *  inspection, so it survives i18n cleanly):
   *
   *    - relaxed / tree edge → lime (improvement / locked in)
   *    - active edge         → pink (acting now)
   *    - any other edge      → cyan (attending)
   *    - current node only   → cyan
   *    - idle                → neutral */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.graphState();
    if (!state) return 'default';

    const activeEdgeId = state.activeEdgeId;
    if (activeEdgeId) {
      const edge = this.edges().find((item) => item.id === activeEdgeId);
      if (edge?.isRelaxed || edge?.isTree) return 'sorted';
      if (edge?.isActive) return 'swap';
      return 'compare';
    }

    if (state.currentNodeId) return 'compare';

    return 'default';
  });

  readonly routeMode = computed<'shortest-tree' | 'bfs-tree' | 'dfs-tree' | null>(() => {
    const metric = this.metricLabel();
    const detail = this.graphState()?.detailLabel ?? '';
    if (metric === 'Distance') return 'shortest-tree';
    if (metric === 'Level') return 'bfs-tree';
    if (metric === 'Depth' && detail === 'Depth path') return 'dfs-tree';
    return null;
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

  /** Chip visible when route-focus is active AND it resolves to a
   *  multi-hop path — a single-node "path" carries no information
   *  worth the UI real estate. */
  readonly focusChipVisible = computed(() => {
    if (!this.routeMode()) return false;
    return this.focusedPathNodeIds().size > 1;
  });

  /** Human-readable path for the focus chip — joined with a right
   *  arrow so it reads as a route. Plain text; no i18n needed, node
   *  labels are single-letter identifiers. */
  readonly focusedPathText = computed(() => {
    const focusedNodeId = this.selectedNodeId();
    if (!focusedNodeId || !this.routeMode()) return '';
    return this.describePath(focusedNodeId);
  });

  readonly focusChipLabel = computed<TranslatableText>(() =>
    i18nText(I18N.focusedRouteLabel, { path: this.focusedPathText() }),
  );

  constructor() {
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

  edgeMarker(edge: RenderedEdge): string | null {
    if (!edge.directed) return null;
    if (edge.isRelaxed) return 'url(#graphArrowRelaxed)';
    if (edge.isActive) return 'url(#graphArrowActive)';
    if (edge.isTree) return 'url(#graphArrowTree)';
    return 'url(#graphArrowDefault)';
  }

  formatDistance(distance: number | null): string {
    if (distance === null && (this.metricLabel() === 'Color' || this.metricLabel() === 'Dom#')) {
      return '—';
    }
    return distance === null ? '∞' : String(distance);
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

  selectNode(nodeId: string): void {
    if (!this.routeMode()) return;
    this.selectedNodeIdState.set(nodeId);
    this.focusedNodeIdChange.emit(nodeId);
  }

  clearFocus(): void {
    if (!this.routeMode()) return;
    this.selectedNodeIdState.set(null);
    this.focusedNodeIdChange.emit(null);
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
    return this.nodes().some(
      (node) => node.id === nodeId && (node.previousId !== null || node.isSource),
    );
  }

  private nodeLabel(nodeId: string): string {
    return this.nodes().find((node) => node.id === nodeId)?.label ?? nodeId;
  }

  /** Compose an edge descriptor like "A → B · 5" (with weight) or
   *  "A → B" (weightless). Returned as a plain string — node labels
   *  are single identifiers and the arrow glyph is universal, so no
   *  i18n template is required. */
  private formatEdgeLabel(edge: RenderedEdge): string {
    const from = this.nodeLabel(edge.from);
    const to = this.nodeLabel(edge.to);
    if (!this.showEdgeWeights()) return `${from} → ${to}`;
    return `${from} → ${to} · ${edge.weight}`;
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
