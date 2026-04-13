import { DsuEdgeTrace, DsuNodeTrace, DsuTraceState, DsuTraceTag } from '../models/dsu';
import { SortPhase, SortStep } from '../models/sort-step';

export interface DsuBaseNode {
  readonly id: string;
  readonly label: string;
}

export interface DsuStepArgs {
  readonly mode: DsuTraceState['mode'];
  readonly nodes: readonly DsuBaseNode[];
  readonly parent: ReadonlyMap<string, string>;
  readonly rank: ReadonlyMap<string, number>;
  readonly size: ReadonlyMap<string, number>;
  readonly edges: readonly DsuEdgeTrace[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortPhase;
  readonly statusLabel: string;
  readonly decision: string | null;
  readonly resultLabel: string;
  readonly operationsLabel: string;
  readonly activeIds?: readonly string[];
  readonly mergedIds?: readonly string[];
  readonly compressedIds?: readonly string[];
  readonly queryIds?: readonly string[];
}

export function createDsuStep(args: DsuStepArgs): SortStep {
  const active = new Set(args.activeIds ?? []);
  const merged = new Set(args.mergedIds ?? []);
  const compressed = new Set(args.compressedIds ?? []);
  const query = new Set(args.queryIds ?? []);

  const traces: DsuNodeTrace[] = args.nodes.map((node) => {
    const rootId = resolveRoot(node.id, args.parent);
    const rootLabel = args.nodes.find((item) => item.id === rootId)?.label ?? rootId;
    const parentId = args.parent.get(node.id) ?? node.id;
    const parentLabel = args.nodes.find((item) => item.id === parentId)?.label ?? parentId;
    const status = active.has(node.id)
      ? 'active'
      : query.has(node.id)
        ? 'query'
        : merged.has(node.id)
          ? 'merged'
          : compressed.has(node.id)
            ? 'compressed'
            : rootId === node.id
              ? 'root'
              : 'idle';

    return {
      id: node.id,
      label: node.label,
      parentId,
      parentLabel,
      rootId,
      rootLabel,
      rank: args.rank.get(rootId) ?? 0,
      size: args.size.get(rootId) ?? 1,
      status,
      tags: tagsForStatus(status),
    };
  });

  const groups = [...groupByRoot(traces).entries()].map(([rootId, members]) => ({
    rootId,
    rootLabel: members[0]?.rootLabel ?? rootId,
    size: members.length,
    members: members.map((item) => item.label).sort(),
    active: members.some((item) =>
      item.status === 'active' || item.status === 'query' || item.status === 'merged' || item.status === 'compressed',
    ),
  }));

  const activePairLabel =
    args.activeIds && args.activeIds.length > 0
      ? args.activeIds
          .map((id) => args.nodes.find((node) => node.id === id)?.label ?? id)
          .join(' ↔ ')
      : null;

  const modeLabel = args.mode === 'union-find' ? 'Union-Find' : "Kruskal's MST";

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    dsu: {
      mode: args.mode,
      modeLabel,
      statusLabel: args.statusLabel,
      decision: args.decision,
      activePairLabel,
      componentCount: groups.length,
      resultLabel: args.resultLabel,
      operationsLabel: args.operationsLabel,
      nodes: traces,
      groups,
      edges: args.edges,
    },
  };
}

function resolveRoot(nodeId: string, parent: ReadonlyMap<string, string>): string {
  let current = nodeId;
  let hops = 0;
  while ((parent.get(current) ?? current) !== current && hops < parent.size + 1) {
    current = parent.get(current) ?? current;
    hops++;
  }
  return current;
}

function groupByRoot(nodes: readonly DsuNodeTrace[]): Map<string, DsuNodeTrace[]> {
  const result = new Map<string, DsuNodeTrace[]>();
  for (const node of nodes) {
    const members = result.get(node.rootId) ?? [];
    members.push(node);
    result.set(node.rootId, members);
  }
  return result;
}

function tagsForStatus(status: DsuNodeTrace['status']): readonly DsuTraceTag[] {
  switch (status) {
    case 'root':
      return ['root'];
    case 'active':
      return ['active'];
    case 'merged':
      return ['merged'];
    case 'compressed':
      return ['compressed'];
    case 'query':
      return ['query'];
    default:
      return [];
  }
}
