export type NetworkMode = 'dinic' | 'hopcroft-karp' | 'edmonds-karp';

export type NetworkLane = 'source' | 'sink' | 'left' | 'right' | 'inner';

export type NetworkNodeStatus = 'idle' | 'frontier' | 'current' | 'linked' | 'visited' | 'blocked' | 'source' | 'sink';

export type NetworkEdgeStatus =
  | 'base'
  | 'candidate'
  | 'active'
  | 'augment'
  | 'matched'
  | 'flow'
  | 'saturated'
  | 'blocked';

export type NetworkTraceTag =
  | 'source'
  | 'sink'
  | 'left'
  | 'right'
  | 'free'
  | 'matched'
  | 'frontier'
  | 'current'
  | 'level'
  | 'augment'
  | 'blocked'
  | 'saturated'
  | 'flow';

export interface NetworkNodeSnapshot {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly lane: NetworkLane;
  readonly level: number | null;
  readonly linkLabel: string | null;
  readonly status: NetworkNodeStatus;
  readonly tags: readonly NetworkTraceTag[];
}

export interface NetworkEdgeSnapshot {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly directed: boolean;
  readonly primaryText: string;
  readonly secondaryText: string | null;
  readonly status: NetworkEdgeStatus;
}

export interface NetworkTraceRow {
  readonly nodeId: string;
  readonly label: string;
  readonly laneLabel: string;
  readonly level: number | null;
  readonly linkLabel: string | null;
  readonly status: NetworkNodeStatus;
  readonly tags: readonly NetworkTraceTag[];
}

export interface NetworkComputation {
  readonly label: string;
  readonly expression: string;
  readonly result: string | null;
  readonly decision: string;
}

export interface NetworkTraceState {
  readonly mode: NetworkMode;
  readonly modeLabel: string;
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly frontierLabel: string;
  readonly frontierCount: number;
  readonly queueLabel: string;
  readonly queue: readonly string[];
  readonly activeRouteLabel: string | null;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly nodes: readonly NetworkNodeSnapshot[];
  readonly edges: readonly NetworkEdgeSnapshot[];
  readonly traceRows: readonly NetworkTraceRow[];
  readonly computation: NetworkComputation | null;
}
