import type { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { TreeEdge, TreeNode, TreeNodeStatus, TreeTraversalTraceState } from '../../models/tree';

export type TreeNodeTone = 'cyan' | 'lime' | 'amber' | 'pink' | 'slate';
export type TreeEdgeTone = 'cyan' | 'lime' | 'idle';
export type TreeOutputTone = 'cyan' | 'lime';

export interface TreeViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TreeGaps {
  readonly horizontal: number;
  readonly vertical: number;
}

export interface TreeGlyphMetrics {
  readonly ringPx: number;
  readonly valuePx: number;
  readonly valueDot: boolean;
  readonly showTags: boolean;
}

export interface TreeRackRow {
  readonly id: string;
  readonly label: string;
  readonly showLabel: boolean;
  readonly value: string;
  readonly valueDot: boolean;
  readonly depth: number;
  readonly tone: RackRowTone;
}

export interface TreeOutputCell {
  readonly key: string;
  readonly text: string;
  readonly dot: boolean;
  readonly tone: TreeOutputTone;
}

export const TREE_NODE_TONES: Readonly<Record<TreeNodeStatus, TreeNodeTone>> = {
  current: 'cyan',
  visited: 'lime',
  onStack: 'amber',
  queued: 'amber',
  backtrack: 'pink',
  idle: 'slate',
};

const DEFAULT_GAPS: TreeGaps = { horizontal: 62, vertical: 82 };
const EMPTY_VIEW_BOX: TreeViewBox = { x: 0, y: 0, width: 320, height: 200 };
const MIN_SPAN = { width: 160, height: 80 };
const RING_MIN_PX = 9;
const RING_MAX_PX = 18;
const RING_SHARE_H = 0.4;
const RING_SHARE_V = 0.3;
const DOT_MIN_RING_PX = 13;
const DOT_MIN_PX = 14;
const DOT_MAX_PX = 16;
const DOT_RING_RATIO = 0.88;
const MONO_MIN_PX = 9;
const MONO_RING_RATIO = 0.95;
const TAG_ROOM_V = 26;
const TAG_ROOM_H = 8;

export function treeNodeTone(status: TreeNodeStatus): TreeNodeTone {
  return TREE_NODE_TONES[status];
}

export function treeIsFrontier(status: TreeNodeStatus): boolean {
  return status === 'onStack' || status === 'queued';
}

export function treeNodeValueText(node: Pick<TreeNode, 'label' | 'value'>): string {
  return node.value === null ? node.label : String(node.value);
}

export function treeShowsTag(node: Pick<TreeNode, 'label' | 'value'>): boolean {
  return node.value !== null && node.label !== String(node.value);
}

export function treeEdgeTone(
  edge: Pick<TreeEdge, 'isOnPath' | 'isTraversed'>,
  levelOrder: boolean,
  childStatus: TreeNodeStatus | null,
): TreeEdgeTone {
  if (edge.isOnPath) return 'cyan';
  if (edge.isTraversed) return 'lime';
  if (levelOrder && childStatus !== null && childStatus !== 'idle') return 'lime';
  return 'idle';
}

export function treeIsComplete(state: TreeTraversalTraceState): boolean {
  return state.totalNodes > 0 && state.output.length >= state.totalNodes && state.currentNodeId === null;
}

export function treeGaps(nodes: readonly Pick<TreeNode, 'x' | 'y' | 'depth'>[]): TreeGaps {
  const rows = new Map<number, number[]>();
  for (const node of nodes) {
    const row = rows.get(node.depth) ?? [];
    row.push(node.x);
    rows.set(node.depth, row);
  }
  let horizontal = Infinity;
  for (const xs of rows.values()) {
    const sorted = [...xs].sort((a, b) => a - b);
    for (let index = 1; index < sorted.length; index++) {
      horizontal = Math.min(horizontal, sorted[index] - sorted[index - 1]);
    }
  }
  const levels = [...rows.keys()].sort((a, b) => a - b);
  let vertical = Infinity;
  for (let index = 1; index < levels.length; index++) {
    const above = nodes.find((node) => node.depth === levels[index - 1]);
    const below = nodes.find((node) => node.depth === levels[index]);
    if (above && below) vertical = Math.min(vertical, Math.abs(below.y - above.y));
  }
  return {
    horizontal: Number.isFinite(horizontal) && horizontal > 0 ? horizontal : DEFAULT_GAPS.horizontal,
    vertical: Number.isFinite(vertical) && vertical > 0 ? vertical : DEFAULT_GAPS.vertical,
  };
}

export function treeBounds(
  nodes: readonly Pick<TreeNode, 'x' | 'y'>[],
  padding: { readonly x: number; readonly top: number; readonly bottom: number },
): TreeViewBox {
  if (nodes.length === 0) return EMPTY_VIEW_BOX;
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, MIN_SPAN.width);
  const spanY = Math.max(maxY - minY, MIN_SPAN.height);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    x: centerX - spanX / 2 - padding.x,
    y: centerY - spanY / 2 - padding.top,
    width: spanX + padding.x * 2,
    height: spanY + padding.top + padding.bottom,
  };
}

export function treeFitScale(box: TreeViewBox, width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  return Math.min(width / box.width, height / box.height);
}

export function treeCapScale(box: TreeViewBox, width: number, height: number, maxScale: number): TreeViewBox {
  const scale = treeFitScale(box, width, height);
  if (width <= 0 || height <= 0 || scale <= maxScale) return box;
  const nextWidth = Math.max(box.width, width / maxScale);
  const nextHeight = Math.max(box.height, height / maxScale);
  return {
    x: box.x - (nextWidth - box.width) / 2,
    y: box.y - (nextHeight - box.height) / 2,
    width: nextWidth,
    height: nextHeight,
  };
}

export function treeGlyphMetrics(gaps: TreeGaps, pxPerUnit: number): TreeGlyphMetrics {
  const horizontalPx = gaps.horizontal * pxPerUnit;
  const verticalPx = gaps.vertical * pxPerUnit;
  const ringPx = clamp(Math.min(horizontalPx * RING_SHARE_H, verticalPx * RING_SHARE_V), RING_MIN_PX, RING_MAX_PX);
  const valueDot = ringPx >= DOT_MIN_RING_PX;
  const valuePx = valueDot
    ? clamp(ringPx * DOT_RING_RATIO, DOT_MIN_PX, DOT_MAX_PX)
    : Math.max(MONO_MIN_PX, ringPx * MONO_RING_RATIO);
  const showTags = verticalPx >= ringPx * 2 + TAG_ROOM_V && horizontalPx >= ringPx * 2 + TAG_ROOM_H;
  return { ringPx, valuePx, valueDot, showTags };
}

export function treePendingRows(state: TreeTraversalTraceState | null): TreeRackRow[] {
  if (!state) return [];
  const ids = state.order === 'level-order' ? state.queue : [...state.stack].reverse();
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  return ids.map((id, index) => {
    const node = byId.get(id);
    return {
      id,
      label: node?.label ?? id,
      showLabel: node ? treeShowsTag(node) : false,
      value: node ? treeNodeValueText(node) : id,
      valueDot: node?.value !== null && node?.value !== undefined,
      depth: node?.depth ?? 0,
      tone: index === 0 ? 'head' : 'default',
    };
  });
}

export function treeOutputCells(state: TreeTraversalTraceState | null): TreeOutputCell[] {
  if (!state) return [];
  const byLabel = new Map<string, TreeNode>();
  for (const node of state.nodes) {
    if (!byLabel.has(node.label)) byLabel.set(node.label, node);
  }
  const lastIndex = state.output.length - 1;
  const settled = treeIsComplete(state);
  return state.output.map((label, index) => {
    const node = byLabel.get(label);
    return {
      key: `${index}:${label}`,
      text: node ? treeNodeValueText(node) : label,
      dot: node?.value !== null && node?.value !== undefined,
      tone: index === lastIndex && !settled ? 'cyan' : 'lime',
    };
  });
}

export interface TreeSegment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export function treeSegment(
  from: Pick<TreeNode, 'x' | 'y'>,
  to: Pick<TreeNode, 'x' | 'y'>,
  inset: number,
): TreeSegment {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const trim = Math.min(inset, Math.max(0, length / 2 - 0.5));
  const ux = dx / length;
  const uy = dy / length;
  return {
    x1: from.x + ux * trim,
    y1: from.y + uy * trim,
    x2: to.x - ux * trim,
    y2: to.y - uy * trim,
  };
}

export function treeViewBoxAttr(box: TreeViewBox): string {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
