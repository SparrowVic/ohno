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
}

export interface WeightedGraphData {
  readonly nodes: readonly WeightedGraphNode[];
  readonly edges: readonly WeightedGraphEdge[];
  readonly sourceId: string;
}

export interface GraphNodeSnapshot extends WeightedGraphNode {
  readonly distance: number | null;
  readonly previousId: string | null;
  readonly isSource: boolean;
  readonly isCurrent: boolean;
  readonly isSettled: boolean;
  readonly isFrontier: boolean;
}

export interface GraphEdgeSnapshot extends WeightedGraphEdge {
  readonly isActive: boolean;
  readonly isRelaxed: boolean;
  readonly isTree: boolean;
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
  readonly previousLabel: string | null;
  readonly isSource: boolean;
  readonly isCurrent: boolean;
  readonly isSettled: boolean;
  readonly isFrontier: boolean;
}

export interface GraphComputation {
  readonly candidateLabel: string;
  readonly expression: string;
  readonly result: string;
  readonly decision: string;
}

export interface GraphStepState {
  readonly nodes: readonly GraphNodeSnapshot[];
  readonly edges: readonly GraphEdgeSnapshot[];
  readonly sourceId: string;
  readonly phaseLabel: string;
  readonly metricLabel: string;
  readonly frontierLabel: string;
  readonly frontierHeadLabel: string;
  readonly completionLabel: string;
  readonly frontierStatusLabel: string;
  readonly completionStatusLabel: string;
  readonly showEdgeWeights: boolean;
  readonly currentNodeId: string | null;
  readonly activeEdgeId: string | null;
  readonly queue: readonly GraphQueueEntry[];
  readonly visitOrder: readonly string[];
  readonly traceRows: readonly GraphTraceRow[];
  readonly computation: GraphComputation | null;
}
