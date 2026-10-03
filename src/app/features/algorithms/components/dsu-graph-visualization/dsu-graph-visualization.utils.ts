import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  DsuEdgeStatus,
  DsuEdgeTrace,
  DsuGroupTrace,
  DsuNodeStatus,
  DsuNodeTrace,
} from '../../models/dsu';

export type DsuNodeTone = 'cyan' | 'pink' | 'amber' | 'violet' | 'slate';

export type DsuEdgeTone = 'cyan' | 'pink' | 'amber' | 'lime' | 'red' | 'idle';

export type DsuChipTone = 'pink' | 'lime' | 'red' | 'slate';

export type DsuOperationMark = 'accepted' | 'rejected' | 'active' | 'pending';

export interface DsuSetRow {
  readonly rootId: string;
  readonly rootLabel: string;
  readonly members: string;
  readonly size: number;
  readonly tone: RackRowTone;
}

export interface DsuEdgeRow {
  readonly id: string;
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly weight: number | null;
  readonly tone: RackRowTone;
}

export interface DsuOperationRow {
  readonly id: string;
  readonly kind: 'union' | 'find';
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly mark: DsuOperationMark;
  readonly tone: RackRowTone;
}

export const DSU_EDGE_ARROW_TONES: readonly DsuEdgeTone[] = ['idle', 'cyan', 'pink', 'amber', 'lime'];

export function dsuIsRoot(node: DsuNodeTrace): boolean {
  return node.parentId === node.id;
}

export function dsuNodeTone(status: DsuNodeStatus, isRoot: boolean): DsuNodeTone {
  if (status === 'active' || status === 'query') return 'cyan';
  if (status === 'merged') return 'pink';
  if (status === 'compressed') return 'amber';
  if (status === 'root' || isRoot) return 'violet';
  return 'slate';
}

export function dsuCurrentNodeId(nodes: readonly DsuNodeTrace[]): string | null {
  return nodes.find((node) => node.status === 'active')?.id ?? null;
}

export function dsuParentEdgeTone(childStatus: DsuNodeStatus): DsuEdgeTone {
  if (childStatus === 'merged') return 'pink';
  if (childStatus === 'compressed') return 'amber';
  if (childStatus === 'active' || childStatus === 'query') return 'cyan';
  return 'idle';
}

export function dsuKruskalEdgeTone(status: DsuEdgeStatus): DsuEdgeTone {
  if (status === 'active') return 'pink';
  if (status === 'accepted') return 'lime';
  if (status === 'rejected') return 'red';
  return 'idle';
}

export function dsuWeightChipTone(status: DsuEdgeStatus): DsuChipTone {
  if (status === 'active') return 'pink';
  if (status === 'accepted') return 'lime';
  if (status === 'rejected') return 'red';
  return 'slate';
}

export const DSU_CHIP_EDGE_FRACTION = 0.4;

export function dsuChipPoint(
  edge: { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number },
  fraction = DSU_CHIP_EDGE_FRACTION,
): { readonly x: number; readonly y: number } {
  return {
    x: edge.x1 + (edge.x2 - edge.x1) * fraction,
    y: edge.y1 + (edge.y2 - edge.y1) * fraction,
  };
}

export function dsuWeightChipWidth(weight: number): number {
  return 10 + String(weight).length * 6;
}

export interface DsuGraphPoint {
  readonly x: number;
  readonly y: number;
}

export interface DsuGraphSegment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface DsuGraphPadding {
  readonly x: number;
  readonly top: number;
  readonly bottom: number;
}

export interface DsuGraphFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly unit: number;
}

export interface DsuGraphGlyphs {
  readonly ring: number;
  readonly crown: number;
  readonly halo: number;
  readonly valueY: number;
  readonly rankX: number;
  readonly rankY: number;
  readonly chipHeight: number;
  readonly marker: number;
  readonly edgeInset: number;
}

export const DSU_GRAPH_VIEW_PADDING_PX: DsuGraphPadding = { x: 56, top: 46, bottom: 30 };

const DSU_GRAPH_FALLBACK_SIZE = { width: 960, height: 620 };
const DSU_GRAPH_MAX_PX_PER_UNIT = 1;
const DSU_GRAPH_MIN_PX_PER_UNIT = 0.05;
const RING_PX = 14;
const CROWN_PX = 18;
const HALO_PX = 22;
const VALUE_GAP_PX = 6;
const RANK_GAP_PX = 4;
const RANK_RISE_PX = 10;
const CHIP_HEIGHT_PX = 16;
const MARKER_PX = 8;
const ARROW_GAP_PX = 2;

export function dsuGraphFrame(
  points: Iterable<DsuGraphPoint>,
  width: number,
  height: number,
  padding: DsuGraphPadding = DSU_GRAPH_VIEW_PADDING_PX,
): DsuGraphFrame {
  const list = [...points];
  const viewWidth = width > 0 ? width : DSU_GRAPH_FALLBACK_SIZE.width;
  const viewHeight = height > 0 ? height : DSU_GRAPH_FALLBACK_SIZE.height;
  if (list.length === 0) return { x: 0, y: 0, width: viewWidth, height: viewHeight, unit: 1 };
  const xs = list.map((point) => point.x);
  const ys = list.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const fitX = maxX > minX ? (viewWidth - padding.x * 2) / (maxX - minX) : Infinity;
  const fitY = maxY > minY ? (viewHeight - padding.top - padding.bottom) / (maxY - minY) : Infinity;
  const pxPerUnit = Math.min(
    DSU_GRAPH_MAX_PX_PER_UNIT,
    Math.max(DSU_GRAPH_MIN_PX_PER_UNIT, Math.min(fitX, fitY)),
  );
  const unit = 1 / pxPerUnit;
  const frameWidth = viewWidth * unit;
  const frameHeight = viewHeight * unit;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY - padding.top * unit + maxY + padding.bottom * unit) / 2;
  return { x: centerX - frameWidth / 2, y: centerY - frameHeight / 2, width: frameWidth, height: frameHeight, unit };
}

export interface DsuGraphScreen {
  readonly width: number;
  readonly height: number;
}

export const DSU_GRAPH_NODE_CLEARANCE_PX = 40;

export function dsuGraphMinScreen(
  points: Iterable<DsuGraphPoint>,
  padding: DsuGraphPadding = DSU_GRAPH_VIEW_PADDING_PX,
  clearance = DSU_GRAPH_NODE_CLEARANCE_PX,
): DsuGraphScreen {
  const list = [...points];
  let closest = Infinity;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const distance = Math.hypot(list[i]!.x - list[j]!.x, list[i]!.y - list[j]!.y);
      if (distance > 0 && distance < closest) closest = distance;
    }
  }
  if (!Number.isFinite(closest)) return { width: 0, height: 0 };
  const pxPerUnit = clearance / closest;
  const xs = list.map((point) => point.x);
  const ys = list.map((point) => point.y);
  return {
    width: Math.ceil((Math.max(...xs) - Math.min(...xs)) * pxPerUnit + padding.x * 2),
    height: Math.ceil((Math.max(...ys) - Math.min(...ys)) * pxPerUnit + padding.top + padding.bottom),
  };
}

export function dsuGraphViewBoxAttr(frame: DsuGraphFrame): string {
  return `${frame.x} ${frame.y} ${frame.width} ${frame.height}`;
}

export function dsuGraphGlyphs(unit: number): DsuGraphGlyphs {
  return {
    ring: RING_PX * unit,
    crown: CROWN_PX * unit,
    halo: HALO_PX * unit,
    valueY: -(CROWN_PX + VALUE_GAP_PX) * unit,
    rankX: (CROWN_PX + RANK_GAP_PX) * unit,
    rankY: -RANK_RISE_PX * unit,
    chipHeight: CHIP_HEIGHT_PX * unit,
    marker: MARKER_PX * unit,
    edgeInset: (RING_PX + ARROW_GAP_PX) * unit,
  };
}

export function dsuTrimSegment(from: DsuGraphPoint, to: DsuGraphPoint, inset: number): DsuGraphSegment {
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

export function dsuGroupsByNodeId(
  nodes: readonly DsuNodeTrace[],
  groups: readonly DsuGroupTrace[],
): readonly DsuGroupTrace[] {
  return groups.map((group) => ({
    ...group,
    members: nodes.filter((node) => node.rootId === group.rootId).map((node) => node.id),
  }));
}

export function dsuSetRows(groups: readonly DsuGroupTrace[]): readonly DsuSetRow[] {
  return [...groups]
    .sort((left, right) => right.size - left.size || left.rootLabel.localeCompare(right.rootLabel))
    .map((group) => ({
      rootId: group.rootId,
      rootLabel: group.rootLabel,
      members: group.members.filter((member) => member !== group.rootLabel).join(' '),
      size: group.size,
      tone: group.active ? 'now' : group.size > 1 ? 'default' : 'dim',
    }));
}

function rowToneForEdge(status: DsuEdgeStatus): RackRowTone {
  if (status === 'active') return 'head';
  if (status === 'accepted') return 'done';
  if (status === 'rejected') return 'dim';
  return 'default';
}

export function dsuEdgeRows(edges: readonly DsuEdgeTrace[]): readonly DsuEdgeRow[] {
  return edges.map((edge) => ({
    id: edge.id,
    fromLabel: edge.fromLabel,
    toLabel: edge.toLabel,
    weight: edge.weight,
    tone: rowToneForEdge(edge.status),
  }));
}

export function dsuOperationRows(edges: readonly DsuEdgeTrace[]): readonly DsuOperationRow[] {
  return edges.map((edge) => ({
    id: edge.id,
    kind: edge.fromId === edge.toId ? 'find' : 'union',
    fromLabel: edge.fromLabel,
    toLabel: edge.toLabel,
    mark: edge.status,
    tone: rowToneForEdge(edge.status),
  }));
}

export function dsuSpreadRing<T extends { readonly x: number; readonly y: number }>(
  positions: ReadonlyMap<string, T>,
  targetRadius: number,
): ReadonlyMap<string, { readonly x: number; readonly y: number }> {
  if (positions.size < 2) return positions;
  const points = [...positions.values()];
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const radius = Math.max(...points.map((point) => Math.hypot(point.x - cx, point.y - cy)));
  if (radius <= 0) return positions;
  const factor = targetRadius / radius;
  return new Map(
    [...positions.entries()].map(([id, point]) => [
      id,
      { x: cx + (point.x - cx) * factor, y: cy + (point.y - cy) * factor },
    ]),
  );
}

export function dsuArrowMarkerId(prefix: string, tone: DsuEdgeTone): string {
  return `${prefix}-arrow-${tone}`;
}
