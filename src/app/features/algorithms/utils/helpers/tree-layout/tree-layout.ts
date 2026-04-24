import { TreeEdge, TreeNode, TreeNodeStatus } from '../../../models/tree';

/** Logical description of a tree used to build a layout. Parent ids
 *  can be null (root). Nodes are laid out left-to-right so sibling
 *  order matters — pass them in the order you want them rendered. */
export interface TreeSeedNode {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly parentId: string | null;
}

export interface TreeLayoutNode extends TreeNode {}

/** Viewport box in logical tree coordinates. Used by the SVG to set
 *  `viewBox` so the whole tree fits regardless of depth. */
export interface TreeLayoutBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

/** Logical gap between adjacent leaves. Sized so that r=22 node
 *  bodies still get visible breathing room at the deepest supported
 *  tree (depth 5 = 16 leaves): 16 × 62 = 992 logical units, giving
 *  each leaf ~18px of clear space between body circles. */
const HORIZONTAL_GAP = 62;
/** Vertical separation between depth levels. Matches the DSU forest
 *  LEVEL_GAP so tree-traversals and Union-Find read at the same
 *  rhythm. */
const LEVEL_HEIGHT = 82;
const PADDING = 36;

/** Compute an x/y position for every node in the seed list. Layout
 *  is a simple Reingold–Tilford variant: leaves get sequential x
 *  slots (post-order), internal nodes center over their children.
 *  Works for any shape (binary or n-ary) — pass children in display
 *  order and the layout respects it. */
export function layoutTree(seeds: readonly TreeSeedNode[]): readonly TreeLayoutNode[] {
  if (seeds.length === 0) return [];

  const byId = new Map<string, TreeSeedNode>();
  const children = new Map<string, string[]>();
  for (const node of seeds) {
    byId.set(node.id, node);
    if (node.parentId !== null) {
      const siblings = children.get(node.parentId) ?? [];
      siblings.push(node.id);
      children.set(node.parentId, siblings);
    }
  }

  const depth = new Map<string, number>();
  const resolveDepth = (id: string): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    const seed = byId.get(id);
    if (!seed) return 0;
    const value = seed.parentId === null ? 0 : resolveDepth(seed.parentId) + 1;
    depth.set(id, value);
    return value;
  };

  const roots = seeds.filter((node) => node.parentId === null);
  const x = new Map<string, number>();
  let leafSlot = 0;

  const assign = (id: string): number => {
    const kids = children.get(id) ?? [];
    if (kids.length === 0) {
      const slot = leafSlot * HORIZONTAL_GAP;
      leafSlot += 1;
      x.set(id, slot);
      return slot;
    }
    const kidX = kids.map(assign);
    const center = (kidX[0] + kidX[kidX.length - 1]) / 2;
    x.set(id, center);
    return center;
  };

  for (const root of roots) {
    assign(root.id);
  }

  return seeds.map((seed) => {
    const d = resolveDepth(seed.id);
    return {
      id: seed.id,
      label: seed.label,
      value: seed.value,
      parentId: seed.parentId,
      depth: d,
      x: (x.get(seed.id) ?? 0) + PADDING,
      y: d * LEVEL_HEIGHT + PADDING,
      status: 'idle' satisfies TreeNodeStatus,
    };
  });
}

export function computeTreeBounds(nodes: readonly TreeLayoutNode[]): TreeLayoutBounds {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 200, minY: 0, maxY: 120, width: 200, height: 120 };
  }
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PADDING;
  const maxX = Math.max(...xs) + PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxY = Math.max(...ys) + PADDING;
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/** Build the edge list by linking each child to its parent. The
 *  `isOnPath` / `isTraversed` flags start false; the generator toggles
 *  them per-step. */
export function buildTreeEdges(nodes: readonly TreeLayoutNode[]): readonly TreeEdge[] {
  return nodes
    .filter((node) => node.parentId !== null)
    .map((node) => ({
      id: `${node.parentId}->${node.id}`,
      fromId: node.parentId as string,
      toId: node.id,
      isOnPath: false,
      isTraversed: false,
    }));
}
