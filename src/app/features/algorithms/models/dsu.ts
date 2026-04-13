export type DsuMode = 'union-find' | 'kruskal';

export type DsuNodeStatus = 'idle' | 'active' | 'root' | 'merged' | 'compressed' | 'query';

export type DsuEdgeStatus = 'pending' | 'active' | 'accepted' | 'rejected';

export type DsuTraceTag = 'root' | 'active' | 'merged' | 'compressed' | 'query' | 'accepted' | 'rejected';

export interface DsuNodeTrace {
  readonly id: string;
  readonly label: string;
  readonly parentId: string;
  readonly parentLabel: string;
  readonly rootId: string;
  readonly rootLabel: string;
  readonly rank: number;
  readonly size: number;
  readonly status: DsuNodeStatus;
  readonly tags: readonly DsuTraceTag[];
}

export interface DsuGroupTrace {
  readonly rootId: string;
  readonly rootLabel: string;
  readonly size: number;
  readonly members: readonly string[];
  readonly active: boolean;
}

export interface DsuEdgeTrace {
  readonly id: string;
  readonly fromId: string;
  readonly fromLabel: string;
  readonly toId: string;
  readonly toLabel: string;
  readonly weight: number | null;
  readonly status: DsuEdgeStatus;
}

export interface DsuTraceState {
  readonly mode: DsuMode;
  readonly modeLabel: string;
  readonly statusLabel: string;
  readonly decision: string | null;
  readonly activePairLabel: string | null;
  readonly componentCount: number;
  readonly resultLabel: string;
  readonly operationsLabel: string;
  readonly nodes: readonly DsuNodeTrace[];
  readonly groups: readonly DsuGroupTrace[];
  readonly edges: readonly DsuEdgeTrace[];
}
