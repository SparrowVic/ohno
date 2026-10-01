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
  return 14 + String(weight).length * 9;
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
