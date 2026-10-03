import { DsuGroupTrace, DsuNodeTrace } from '../../../models/dsu';

export const DSU_GRAPH_FOREST_ROOT_Y = 80;
export const DSU_GRAPH_FOREST_LEVEL_GAP = 82;
export const DSU_GRAPH_FOREST_SIBLING_GAP = 74;
export const DSU_GRAPH_FOREST_GROUP_GAP = 48;
export const DSU_GRAPH_FOREST_GROUP_INSET = 40;

export const DSU_GRAPH_CIRCLE_CENTER_X = 480;
export const DSU_GRAPH_CIRCLE_CENTER_Y = 310;
export const DSU_GRAPH_CIRCLE_MIN_RADIUS = 140;
export const DSU_GRAPH_CIRCLE_ARC_SPACING = 92;

const FOREST_MIN_SIBLING_GAP = 44;
const FOREST_CROWDED_SPAN = 520;

export interface DsuGraphPosition {
  readonly x: number;
  readonly y: number;
}

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
        for (const kidId of childrenOf.get(parentId) ?? []) {
          if (depthOf.has(kidId)) continue;
          const depth = (depthOf.get(parentId) ?? 0) + 1;
          depthOf.set(kidId, depth);
          (byLevel[depth] ??= []).push(kidId);
          next.push(kidId);
        }
      }
      queue = next;
    }

    const widestCount = Math.max(1, ...byLevel.map((level) => level.length));
    const siblingGap = Math.max(
      FOREST_MIN_SIBLING_GAP,
      Math.min(DSU_GRAPH_FOREST_SIBLING_GAP, FOREST_CROWDED_SPAN / Math.max(widestCount, 3)),
    );
    const groupWidth = Math.max(widestCount * siblingGap, siblingGap);

    byLevel.forEach((levelIds, levelIndex) => {
      const levelY = DSU_GRAPH_FOREST_ROOT_Y + levelIndex * DSU_GRAPH_FOREST_LEVEL_GAP;
      const count = levelIds.length;
      levelIds.forEach((nodeId, index) => {
        const localX = ((index - (count - 1) / 2) * groupWidth) / Math.max(count, widestCount);
        positions.set(nodeId, { x: cursorX + groupWidth / 2 + localX, y: levelY });
      });
    });

    cursorX += groupWidth + DSU_GRAPH_FOREST_GROUP_GAP;
  }

  return positions;
}

export function layoutDsuCircle(nodes: readonly DsuNodeTrace[]): ReadonlyMap<string, DsuGraphPosition> {
  const positions = new Map<string, DsuGraphPosition>();
  const count = nodes.length;
  if (count === 0) return positions;

  const radius = Math.max(DSU_GRAPH_CIRCLE_MIN_RADIUS, (count * DSU_GRAPH_CIRCLE_ARC_SPACING) / (2 * Math.PI));

  nodes.forEach((node, index) => {
    const theta = (2 * Math.PI * index) / count - Math.PI / 2;
    positions.set(node.id, {
      x: DSU_GRAPH_CIRCLE_CENTER_X + radius * Math.cos(theta),
      y: DSU_GRAPH_CIRCLE_CENTER_Y + radius * Math.sin(theta),
    });
  });

  return positions;
}
