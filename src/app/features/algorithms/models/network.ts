import { TranslatableText } from '../../../core/i18n/translatable-text';

export type NetworkMode = 'dinic' | 'hopcroft-karp' | 'edmonds-karp' | 'min-cost-max-flow';

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
  readonly laneLabel: TranslatableText;
  readonly level: number | null;
  readonly linkLabel: string | null;
  readonly status: NetworkNodeStatus;
  readonly tags: readonly NetworkTraceTag[];
}

export interface NetworkComputation {
  readonly label: TranslatableText;
  readonly expression: TranslatableText;
  readonly result: TranslatableText | null;
  readonly decision: TranslatableText;
}

export interface NetworkTraceState {
  readonly mode: NetworkMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly frontierLabel: TranslatableText;
  readonly frontierCount: number;
  readonly queueLabel: TranslatableText;
  readonly queue: readonly string[];
  readonly activeRouteLabel: string | null;
  readonly focusItemsLabel: TranslatableText;
  readonly focusItems: readonly string[];
  readonly nodes: readonly NetworkNodeSnapshot[];
  readonly edges: readonly NetworkEdgeSnapshot[];
  readonly traceRows: readonly NetworkTraceRow[];
  readonly computation: NetworkComputation | null;
}
