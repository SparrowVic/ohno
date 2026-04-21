import {
  DsuEdgeStatus,
  DsuGroupTrace,
  DsuNodeStatus,
  DsuNodeTrace,
} from '../../models/dsu';

/** Radius of a rendered node body. Edges are trimmed by this amount so
 *  arrow tips land on the node's border instead of being swallowed by
 *  its fill. Keep in sync with the SCSS circle radius. */
export const DSU_GRAPH_NODE_RADIUS = 22;
/** Extra breathing room between the arrow tip and the node border. */
export const DSU_GRAPH_ARROW_TIP_INSET = 2;

// Layout constants — tuned for the typical 6-10 node scenarios the
// DSU algorithms ship with. Tweak these if scenarios grow larger.
export const DSU_GRAPH_FOREST_ROOT_Y = 80;
export const DSU_GRAPH_FOREST_LEVEL_GAP = 82;
export const DSU_GRAPH_FOREST_SIBLING_GAP = 74;
export const DSU_GRAPH_FOREST_GROUP_GAP = 48;
export const DSU_GRAPH_FOREST_GROUP_INSET = 40;

export const DSU_GRAPH_CIRCLE_CENTER_X = 480;
export const DSU_GRAPH_CIRCLE_CENTER_Y = 310;
export const DSU_GRAPH_CIRCLE_MIN_RADIUS = 140;
export const DSU_GRAPH_CIRCLE_NODE_SPACING = 42;

export interface DsuGraphPosition {
  readonly x: number;
  readonly y: number;
}

/** Status flag carried by a rendered edge. Union-Find synthesises
 *  these from the child node's status; Kruskal passes through the
 *  edge's own status plus a `parent` marker for uniform plumbing. */
export type DsuGraphEdgeStatus = DsuEdgeStatus | 'parent';

export interface DsuGraphRenderedEdge {
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
  readonly status: DsuGraphEdgeStatus;
  readonly directed: boolean;
}

/** Lay a Union-Find forest out as parallel rooted trees — one per
 *  disjoint set. Each tree places its root on top and its children
 *  (BFS from the root) fanned across deeper levels. */
export function layoutDsuForest(
  nodes: readonly DsuNodeTrace[],
  groups: readonly DsuGroupTrace[],
): ReadonlyMap<string, DsuGraphPosition> {
  const positions = new Map<string, DsuGraphPosition>();
  if (groups.length === 0) return positions;

  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  let cursorX = DSU_GRAPH_FOREST_GROUP_INSET;

  for (const group of groups) {
    const childrenOf = new Map<string, string[]>();
    for (const nodeId of group.members) {
      const node = nodesById.get(nodeId);
      if (!node || node.id === group.rootId) continue;
      const bucket = childrenOf.get(node.parentId) ?? [];
      bucket.push(node.id);
      childrenOf.set(node.parentId, bucket);
    }

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

    const widestCount = Math.max(1, ...byLevel.map((level) => level.length));
    const groupWidth = Math.max(
      widestCount * DSU_GRAPH_FOREST_SIBLING_GAP,
      DSU_GRAPH_FOREST_SIBLING_GAP,
    );

    byLevel.forEach((levelIds, levelIndex) => {
      const levelY = DSU_GRAPH_FOREST_ROOT_Y + levelIndex * DSU_GRAPH_FOREST_LEVEL_GAP;
      const count = levelIds.length;
      levelIds.forEach((nodeId, i) => {
        const localX = ((i - (count - 1) / 2) * groupWidth) / Math.max(count, widestCount);
        positions.set(nodeId, {
          x: cursorX + groupWidth / 2 + localX,
          y: levelY,
        });
      });
    });

    cursorX += groupWidth + DSU_GRAPH_FOREST_GROUP_GAP;
  }

  return positions;
}

/** Lay a Kruskal candidate graph out as a simple ring. Node order is
 *  preserved so the input list's identity is reflected spatially. */
export function layoutDsuCircle(
  nodes: readonly DsuNodeTrace[],
): ReadonlyMap<string, DsuGraphPosition> {
  const positions = new Map<string, DsuGraphPosition>();
  const count = nodes.length;
  if (count === 0) return positions;

  const radius = Math.max(DSU_GRAPH_CIRCLE_MIN_RADIUS, count * DSU_GRAPH_CIRCLE_NODE_SPACING);

  nodes.forEach((node, index) => {
    const theta = (2 * Math.PI * index) / count - Math.PI / 2; // start at top
    positions.set(node.id, {
      x: DSU_GRAPH_CIRCLE_CENTER_X + radius * Math.cos(theta),
      y: DSU_GRAPH_CIRCLE_CENTER_Y + radius * Math.sin(theta),
    });
  });

  return positions;
}

/** Build a rendered edge with both its original midpoint (for weight
 *  badges) and its trimmed endpoints (so arrow tips touch the node's
 *  border rather than its centre). Returns null when either endpoint
 *  can't be located. */
export function buildDsuRenderedEdge(args: {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly from: DsuGraphPosition | undefined;
  readonly to: DsuGraphPosition | undefined;
  readonly weight: number | null;
  readonly status: DsuGraphEdgeStatus;
  readonly directed: boolean;
}): DsuGraphRenderedEdge | null {
  const { id, fromId, toId, from, to, weight, status, directed } = args;
  if (!from || !to) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const trim = Math.min(
    DSU_GRAPH_NODE_RADIUS + DSU_GRAPH_ARROW_TIP_INSET,
    dist / 2 - 0.5,
  );
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

/** Map a Union-Find child-node status to the edge status that
 *  should paint its parent pointer. Lets active/merged/compressed
 *  states propagate visually from the child to the pointer, so the
 *  user can spot which pointers are being touched this step. */
export function unionFindEdgeStatusFromChild(
  nodeStatus: DsuNodeStatus,
): DsuGraphEdgeStatus {
  if (nodeStatus === 'active' || nodeStatus === 'query') return 'active';
  if (nodeStatus === 'merged' || nodeStatus === 'compressed') return 'accepted';
  return 'parent';
}
