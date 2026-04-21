import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  DsuEdgeStatus,
  DsuEdgeTrace,
  DsuGroupTrace,
  DsuMode,
  DsuNodeStatus,
  DsuNodeTrace,
  DsuTraceState,
} from '../../models/dsu';
import { SortStep } from '../../models/sort-step';

const NODE_RADIUS = 22;
const ARROW_TIP_INSET = 2;

// Layout constants — kept simple, tuned for the typical 6-10 node
// scenarios the DSU algorithms ship with.
const FOREST_ROOT_Y = 80;
const FOREST_LEVEL_GAP = 82;
const FOREST_SIBLING_GAP = 74;
const FOREST_GROUP_GAP = 48;
const FOREST_GROUP_INSET = 40;

const CIRCLE_CENTER_X = 480;
const CIRCLE_CENTER_Y = 310;
const CIRCLE_MIN_RADIUS = 140;
const CIRCLE_NODE_SPACING = 42;

interface Position {
  readonly x: number;
  readonly y: number;
}

interface RenderedNode {
  readonly id: string;
  readonly label: string;
  readonly status: DsuNodeStatus;
  readonly isRoot: boolean;
  readonly rank: number;
  readonly size: number;
  readonly x: number;
  readonly y: number;
}

interface RenderedEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
  readonly weight: number | null;
  readonly status: DsuEdgeStatus | 'parent';
  readonly directed: boolean;
}

interface ArrowMarker {
  readonly id: string;
  readonly fill: string;
}

const ARROW_MARKERS: readonly ArrowMarker[] = [
  { id: 'dsuArrowParent', fill: 'rgb(var(--chrome-accent-alt-rgb) / 0.7)' },
  { id: 'dsuArrowActive', fill: 'rgb(var(--chrome-accent-warm-rgb) / 0.85)' },
  { id: 'dsuArrowAccepted', fill: 'rgb(var(--accent-rgb) / 0.85)' },
];

@Component({
  selector: 'app-dsu-graph-visualization',
  imports: [],
  templateUrl: './dsu-graph-visualization.html',
  styleUrl: './dsu-graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuGraphVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);
  readonly mode = computed<DsuMode>(() => this.state()?.mode ?? 'union-find');
  readonly modeLabel = computed(() => this.state()?.modeLabel ?? 'Union-Find');
  readonly statusLabel = computed(() => this.state()?.statusLabel ?? '—');
  readonly componentCount = computed(() => this.state()?.componentCount ?? 0);
  readonly resultLabel = computed(() => this.state()?.resultLabel ?? '—');
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly decision = computed(() => this.state()?.decision ?? 'Awaiting next state change.');

  readonly arrowMarkers = ARROW_MARKERS;

  /** Map of `nodeId -> {x, y}`. The layout strategy depends on mode:
   *  Union-Find lays each group out as a rooted tree (root on top,
   *  children fanned below); Kruskal places all nodes on a single
   *  circle so the ring of edges is scannable at a glance. */
  readonly nodePositions = computed<ReadonlyMap<string, Position>>(() => {
    const state = this.state();
    if (!state) return new Map();
    return state.mode === 'union-find'
      ? layoutForest(state.nodes, state.groups)
      : layoutCircle(state.nodes);
  });

  readonly renderedNodes = computed<readonly RenderedNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.nodePositions();
    return state.nodes.map((node) => {
      const pos = positions.get(node.id) ?? { x: 0, y: 0 };
      return {
        id: node.id,
        label: node.label,
        status: node.status,
        isRoot: node.parentId === node.id,
        rank: node.rank,
        size: node.size,
        x: pos.x,
        y: pos.y,
      };
    });
  });

  /** Union-Find emits no candidate edges, so we synthesise one per
   *  non-root node pointing to its parent. Kruskal emits the full
   *  edge list with per-edge status — we just pass it through,
   *  tagging its endpoints with the current layout positions. */
  readonly renderedEdges = computed<readonly RenderedEdge[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.nodePositions();

    if (state.mode === 'union-find') {
      return state.nodes
        .filter((node) => node.parentId !== node.id)
        .map((node) => {
          const from = positions.get(node.id);
          const to = positions.get(node.parentId);
          return makeRenderedEdge(
            `uf-${node.id}`,
            node.id,
            node.parentId,
            from,
            to,
            null,
            statusForUnionFindEdge(node.status),
            true,
          );
        })
        .filter((edge): edge is RenderedEdge => edge !== null);
    }

    return state.edges
      .map((edge) => {
        const from = positions.get(edge.fromId);
        const to = positions.get(edge.toId);
        return makeRenderedEdge(
          edge.id,
          edge.fromId,
          edge.toId,
          from,
          to,
          edge.weight,
          edge.status,
          false,
        );
      })
      .filter((edge): edge is RenderedEdge => edge !== null);
  });

  edgeMarker(edge: RenderedEdge): string | null {
    if (!edge.directed) return null;
    if (edge.status === 'active') return 'url(#dsuArrowActive)';
    if (edge.status === 'accepted') return 'url(#dsuArrowAccepted)';
    return 'url(#dsuArrowParent)';
  }
}

function layoutForest(
  nodes: readonly DsuNodeTrace[],
  groups: readonly DsuGroupTrace[],
): ReadonlyMap<string, Position> {
  const positions = new Map<string, Position>();
  if (groups.length === 0) return positions;

  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  let cursorX = FOREST_GROUP_INSET;

  for (const group of groups) {
    // Children-of-parent map restricted to this group's members.
    const childrenOf = new Map<string, string[]>();
    for (const nodeId of group.members) {
      const node = nodesById.get(nodeId);
      if (!node || node.id === group.rootId) continue;
      const bucket = childrenOf.get(node.parentId) ?? [];
      bucket.push(node.id);
      childrenOf.set(node.parentId, bucket);
    }

    // BFS from root, recording each node's depth + order-within-level.
    const depthOf = new Map<string, number>();
    const byLevel: string[][] = [[group.rootId]];
    depthOf.set(group.rootId, 0);

    let queue = [group.rootId];
    while (queue.length > 0) {
      const next: string[] = [];
      for (const parentId of queue) {
        const kids = childrenOf.get(parentId) ?? [];
        for (const kidId of kids) {
          if (depthOf.has(kidId)) continue;
          const d = (depthOf.get(parentId) ?? 0) + 1;
          depthOf.set(kidId, d);
          if (!byLevel[d]) byLevel[d] = [];
          byLevel[d]!.push(kidId);
          next.push(kidId);
        }
      }
      queue = next;
    }

    // Width of this group's bounding box = widest level.
    const widestCount = Math.max(1, ...byLevel.map((level) => level.length));
    const groupWidth = Math.max(
      widestCount * FOREST_SIBLING_GAP,
      FOREST_SIBLING_GAP,
    );

    byLevel.forEach((levelIds, levelIndex) => {
      const levelY = FOREST_ROOT_Y + levelIndex * FOREST_LEVEL_GAP;
      const count = levelIds.length;
      levelIds.forEach((nodeId, i) => {
        const localX = ((i - (count - 1) / 2) * groupWidth) / Math.max(count, widestCount);
        positions.set(nodeId, {
          x: cursorX + groupWidth / 2 + localX,
          y: levelY,
        });
      });
    });

    cursorX += groupWidth + FOREST_GROUP_GAP;
  }

  return positions;
}

function layoutCircle(nodes: readonly DsuNodeTrace[]): ReadonlyMap<string, Position> {
  const positions = new Map<string, Position>();
  const count = nodes.length;
  if (count === 0) return positions;

  const radius = Math.max(CIRCLE_MIN_RADIUS, count * CIRCLE_NODE_SPACING);

  nodes.forEach((node, index) => {
    const theta = (2 * Math.PI * index) / count - Math.PI / 2; // start at top
    positions.set(node.id, {
      x: CIRCLE_CENTER_X + radius * Math.cos(theta),
      y: CIRCLE_CENTER_Y + radius * Math.sin(theta),
    });
  });

  return positions;
}

function makeRenderedEdge(
  id: string,
  fromId: string,
  toId: string,
  from: Position | undefined,
  to: Position | undefined,
  weight: number | null,
  status: DsuEdgeStatus | 'parent',
  directed: boolean,
): RenderedEdge | null {
  if (!from || !to) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const trim = Math.min(NODE_RADIUS + ARROW_TIP_INSET, dist / 2 - 0.5);
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    id,
    fromId,
    toId,
    x1: from.x + ux * trim,
    y1: from.y + uy * trim,
    x2: to.x - ux * trim,
    y2: to.y - uy * trim,
    midX: (from.x + to.x) / 2,
    midY: (from.y + to.y) / 2,
    weight,
    status,
    directed,
  };
}

function statusForUnionFindEdge(nodeStatus: DsuNodeStatus): DsuEdgeStatus | 'parent' {
  // Highlight parent-pointer edges based on their child's status: a
  // node that's currently being path-compressed or just got merged
  // carries an interesting edge; everything else is a quiet pointer.
  if (nodeStatus === 'active' || nodeStatus === 'query') return 'active';
  if (nodeStatus === 'merged' || nodeStatus === 'compressed') return 'accepted';
  return 'parent';
}
