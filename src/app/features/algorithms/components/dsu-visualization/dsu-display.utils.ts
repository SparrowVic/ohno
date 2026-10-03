import type { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import type { DsuEdgeStatus, DsuEdgeTrace, DsuNodeStatus, DsuNodeTrace, DsuTraceState } from '../../models/dsu';

export type DsuTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';

export interface DsuChip {
  readonly id: string;
  readonly label: string;
  readonly tone: DsuTone;
  readonly query: boolean;
  readonly parentHint: string | null;
}

export interface DsuGroupRow {
  readonly rootId: string;
  readonly root: DsuChip;
  readonly rank: number;
  readonly size: number;
  readonly active: boolean;
  readonly members: readonly DsuChip[];
}

export type DsuOperationKind = 'find' | 'union' | 'edge';

export type DsuVerdict = 'accepted' | 'rejected' | null;

export interface DsuOperationRow {
  readonly id: string;
  readonly order: string;
  readonly kind: DsuOperationKind;
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly weight: number | null;
  readonly tone: RackRowTone;
  readonly verdict: DsuVerdict;
}

const NODE_TONES: Record<DsuNodeStatus, DsuTone> = {
  active: 'cyan',
  query: 'cyan',
  merged: 'pink',
  compressed: 'amber',
  root: 'violet',
  idle: 'slate',
};

const EDGE_ROW_TONES: Record<DsuEdgeStatus, RackRowTone> = {
  pending: 'default',
  active: 'head',
  accepted: 'done',
  rejected: 'dim',
};

export function dsuNodeTone(status: DsuNodeStatus): DsuTone {
  return NODE_TONES[status];
}

export function dsuChip(node: DsuNodeTrace): DsuChip {
  const nested = node.parentId !== node.id && node.parentId !== node.rootId;
  return {
    id: node.id,
    label: node.label,
    tone: dsuNodeTone(node.status),
    query: node.status === 'query',
    parentHint: nested ? node.parentLabel : null,
  };
}

export function dsuGroupRows(state: DsuTraceState): DsuGroupRow[] {
  const order = new Map(state.nodes.map((node, index) => [node.id, index]));
  const byRoot = new Map<string, DsuNodeTrace[]>();
  for (const node of state.nodes) {
    const members = byRoot.get(node.rootId) ?? [];
    members.push(node);
    byRoot.set(node.rootId, members);
  }

  return state.groups
    .map((group) => {
      const members = byRoot.get(group.rootId) ?? [];
      const rootNode = members.find((node) => node.id === group.rootId);
      const firstIndex = Math.min(...members.map((node) => order.get(node.id) ?? Number.MAX_SAFE_INTEGER));
      const row: DsuGroupRow = {
        rootId: group.rootId,
        root: rootNode
          ? dsuChip(rootNode)
          : { id: group.rootId, label: group.rootLabel, tone: 'violet', query: false, parentHint: null },
        rank: rootNode?.rank ?? 0,
        size: group.size,
        active: group.active,
        members: members.filter((node) => node.id !== group.rootId).map(dsuChip),
      };
      return { row, firstIndex };
    })
    .sort((left, right) => left.firstIndex - right.firstIndex)
    .map(({ row }) => row);
}

export function dsuOperationKind(edge: DsuEdgeTrace): DsuOperationKind {
  if (edge.weight !== null) return 'edge';
  return edge.toId === edge.fromId ? 'find' : 'union';
}

export function dsuOperationRows(state: DsuTraceState): DsuOperationRow[] {
  return state.edges.map((edge, index) => ({
    id: edge.id,
    order: String(index + 1).padStart(2, '0'),
    kind: dsuOperationKind(edge),
    fromLabel: edge.fromLabel,
    toLabel: edge.toLabel,
    weight: edge.weight,
    tone: EDGE_ROW_TONES[edge.status],
    verdict: edge.status === 'accepted' || edge.status === 'rejected' ? edge.status : null,
  }));
}

export function dsuDecidedCount(state: DsuTraceState): number {
  return state.edges.filter((edge) => edge.status === 'accepted' || edge.status === 'rejected').length;
}

export function dsuFocusOperationId(state: DsuTraceState): string | null {
  const active = state.edges.find((edge) => edge.status === 'active');
  if (active) return active.id;
  for (let index = state.edges.length - 1; index >= 0; index--) {
    const edge = state.edges[index]!;
    if (edge.status === 'accepted' || edge.status === 'rejected') return edge.id;
  }
  return null;
}

export function dsuNoteTone(state: DsuTraceState): DsuTone {
  if (state.nodes.some((node) => node.status === 'merged')) return 'pink';
  if (state.nodes.some((node) => node.status === 'compressed')) return 'amber';
  if (state.edges.some((edge) => edge.status === 'active')) return 'cyan';
  const hasLiveNode = dsuHasLiveNode(state);
  const focusId = dsuFocusOperationId(state);
  const focus = state.edges.find((edge) => edge.id === focusId);
  if (hasLiveNode && focus?.status === 'rejected') return 'red';
  if (dsuComplete(state)) return 'lime';
  return hasLiveNode ? 'cyan' : 'violet';
}

export function dsuComplete(state: DsuTraceState): boolean {
  return (
    !dsuHasLiveNode(state) &&
    state.edges.length > 0 &&
    state.edges.every((edge) => edge.status === 'accepted' || edge.status === 'rejected')
  );
}

function dsuHasLiveNode(state: DsuTraceState): boolean {
  return state.nodes.some((node) => node.status !== 'idle' && node.status !== 'root');
}

export function dsuMovedNodeIds(previous: DsuTraceState | null, current: DsuTraceState): string[] {
  if (!previous) return [];
  const previousRoots = new Map(previous.nodes.map((node) => [node.id, node.rootId]));
  return current.nodes
    .filter((node) => {
      const prior = previousRoots.get(node.id);
      return prior !== undefined && prior !== node.rootId;
    })
    .map((node) => node.id);
}

export interface DsuVerticalSpan {
  readonly top: number;
  readonly bottom: number;
}

export function dsuRevealScrollDelta(container: DsuVerticalSpan, target: DsuVerticalSpan, margin = 8): number {
  if (target.top < container.top + margin) return target.top - (container.top + margin);
  if (target.bottom > container.bottom - margin) {
    return Math.min(target.bottom - (container.bottom - margin), target.top - (container.top + margin));
  }
  return 0;
}

export function dsuActivePairChanged(previous: DsuTraceState | null, current: DsuTraceState): boolean {
  if (current.activePairLabel === null) return false;
  return JSON.stringify(current.activePairLabel) !== JSON.stringify(previous?.activePairLabel ?? null);
}
