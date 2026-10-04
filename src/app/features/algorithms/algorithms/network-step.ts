import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkLane,
  NetworkNodeSnapshot,
  NetworkNodeStatus,
  NetworkTraceRow,
  NetworkTraceState,
  NetworkTraceTag,
} from '../models/network';
import { SortPhase, SortStep } from '../models/sort-step';
import { LayeredNetworkNode } from '../utils/scenarios/network/network-scenarios';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.network.common;

const MODE_NAMES = {
  dinic: 'dinic',
  'min-cost-max-flow': 'minCostMaxFlow',
  'edmonds-karp': 'edmondsKarp',
  'hopcroft-karp': 'hopcroftKarp',
} as const satisfies Readonly<Record<NetworkTraceState['mode'], string>>;

export interface NetworkStepNodeState {
  readonly level: number | null;
  readonly linkLabel: string | null;
  readonly status: NetworkNodeStatus;
  readonly tags?: readonly NetworkTraceTag[];
}

export interface NetworkStepArgs {
  readonly mode: NetworkTraceState['mode'];
  readonly nodes: readonly LayeredNetworkNode[];
  readonly nodeState: ReadonlyMap<string, NetworkStepNodeState>;
  readonly edges: readonly NetworkEdgeSnapshot[];
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
  readonly computation: NetworkComputation | null;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase?: SortPhase;
}

export function createNetworkStep(args: NetworkStepArgs): SortStep {
  const nodes: NetworkNodeSnapshot[] = args.nodes.map((node) => {
    const state = args.nodeState.get(node.id);
    const tags = new Set<NetworkTraceTag>(state?.tags ?? []);
    const laneTag = defaultLaneTag(node.lane);
    if (laneTag) tags.add(laneTag);
    if (state?.level !== null && state?.level !== undefined) {
      tags.add('level');
    }
    return {
      ...node,
      level: state?.level ?? null,
      linkLabel: state?.linkLabel ?? null,
      status: state?.status ?? defaultLaneStatus(node.lane),
      tags: [...tags],
    };
  });

  const traceRows: NetworkTraceRow[] = nodes.map((node) => ({
    nodeId: node.id,
    label: node.label,
    laneLabel: laneLabel(node.lane),
    level: node.level,
    linkLabel: node.linkLabel,
    status: node.status,
    tags: node.tags,
  }));

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    network: {
      mode: args.mode,
      modeLabel: i18nText(TEXT.modes[MODE_NAMES[args.mode]]),
      phaseLabel: args.phaseLabel,
      statusLabel: args.statusLabel,
      resultLabel: args.resultLabel,
      frontierLabel: args.frontierLabel,
      frontierCount: args.frontierCount,
      queueLabel: args.queueLabel,
      queue: args.queue,
      activeRouteLabel: args.activeRouteLabel,
      focusItemsLabel: args.focusItemsLabel,
      focusItems: args.focusItems,
      nodes,
      edges: args.edges,
      traceRows,
      computation: args.computation,
    },
  };
}

function defaultLaneTag(lane: NetworkLane): NetworkTraceTag | null {
  switch (lane) {
    case 'source':
      return 'source';
    case 'sink':
      return 'sink';
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    default:
      return null;
  }
}

function defaultLaneStatus(lane: NetworkLane): NetworkNodeStatus {
  switch (lane) {
    case 'source':
      return 'source';
    case 'sink':
      return 'sink';
    default:
      return 'idle';
  }
}

function laneLabel(lane: NetworkLane): TranslatableText {
  return i18nText(TEXT.lanes[lane]);
}
