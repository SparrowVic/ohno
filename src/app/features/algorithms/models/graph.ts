import { TranslatableText } from '../../../core/i18n/translatable-text';

export interface WeightedGraphNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface WeightedGraphEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly weight: number;
  readonly directed?: boolean;
}

export interface WeightedGraphData {
  readonly nodes: readonly WeightedGraphNode[];
  readonly edges: readonly WeightedGraphEdge[];
  readonly sourceId: string;
}

export type GraphTone =
  | 'left'
  | 'right'
  | 'critical'
  | 'bridge'
  | 'terminal'
  | 'steiner'
  | 'component-a'
  | 'component-b'
  | 'component-c'
  | 'component-d';

export interface GraphNodeSnapshot extends WeightedGraphNode {
  readonly distance: number | null;
  readonly previousId: string | null;
  readonly secondaryText: TranslatableText | null;
  readonly isSource: boolean;
  readonly isCurrent: boolean;
  readonly isSettled: boolean;
  readonly isFrontier: boolean;
  readonly tone?: GraphTone | null;
}

export interface GraphEdgeSnapshot extends WeightedGraphEdge {
  readonly isActive: boolean;
  readonly isRelaxed: boolean;
  readonly isTree: boolean;
  readonly tone?: GraphTone | null;
}

export interface GraphQueueEntry {
  readonly nodeId: string;
  readonly label: string;
  readonly distance: number | null;
}

export interface GraphTraceRow {
  readonly nodeId: string;
  readonly label: string;
  readonly distance: number | null;
  readonly secondaryText: TranslatableText | null;
  readonly isSource: boolean;
  readonly isCurrent: boolean;
  readonly isSettled: boolean;
  readonly isFrontier: boolean;
}

export interface GraphComputation {
  readonly candidateLabel: TranslatableText;
  readonly expression: TranslatableText;
  readonly result: TranslatableText;
  readonly decision: TranslatableText;
}

export interface GraphStepState {
  readonly nodes: readonly GraphNodeSnapshot[];
  readonly edges: readonly GraphEdgeSnapshot[];
  readonly sourceId: string;
  readonly phaseLabel: TranslatableText;
  readonly metricLabel: TranslatableText;
  readonly secondaryLabel: TranslatableText;
  readonly frontierLabel: TranslatableText;
  readonly frontierHeadLabel: TranslatableText;
  readonly completionLabel: TranslatableText;
  readonly frontierStatusLabel: TranslatableText;
  readonly completionStatusLabel: TranslatableText;
  readonly showEdgeWeights: boolean;
  readonly detailLabel: TranslatableText;
  readonly detailValue: TranslatableText;
  readonly visitOrderLabel: TranslatableText;
  readonly currentNodeId: string | null;
  readonly activeEdgeId: string | null;
  readonly queue: readonly GraphQueueEntry[];
  readonly visitOrder: readonly TranslatableText[];
  readonly traceRows: readonly GraphTraceRow[];
  readonly computation: GraphComputation | null;
}
