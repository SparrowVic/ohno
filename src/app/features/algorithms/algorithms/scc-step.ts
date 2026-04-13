import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTone,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

export interface SccStepArgs {
  readonly graph: WeightedGraphData;
  readonly viewGraph?: WeightedGraphData;
  readonly sourceId: string;
  readonly indexMap: ReadonlyMap<string, number | null>;
  readonly secondaryMap: ReadonlyMap<string, string | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly settled: ReadonlySet<string>;
  readonly frontierOrder: readonly string[];
  readonly visitOrder: readonly string[];
  readonly metricLabel: string;
  readonly secondaryLabel: string;
  readonly frontierLabel: string;
  readonly frontierHeadLabel: string;
  readonly completionLabel: string;
  readonly frontierStatusLabel: string;
  readonly completionStatusLabel: string;
  readonly detailLabel: string;
  readonly detailValue: string;
  readonly visitOrderLabel: string;
  readonly phaseLabel: string;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly componentMap?: ReadonlyMap<string, number | null>;
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}

export function createSccStep(args: SccStepArgs): SortStep {
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const relaxedEdgeId = args.relaxedEdgeId ?? null;
  const labelMap = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const frontierSet = new Set(args.frontierOrder);
  const viewGraph = args.viewGraph ?? args.graph;

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.indexMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.secondaryMap.get(node.id) ?? null,
    isSource: node.id === args.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.settled.has(node.id),
    isFrontier: frontierSet.has(node.id),
    tone: componentTone(args.componentMap?.get(node.id) ?? null),
  }));

  const edges: GraphEdgeSnapshot[] = viewGraph.edges.map((edge) => {
    const fromComponent = args.componentMap?.get(edge.from) ?? null;
    const toComponent = args.componentMap?.get(edge.to) ?? null;
    const sharedComponent =
      fromComponent !== null && toComponent !== null && fromComponent === toComponent ? fromComponent : null;

    return {
      ...edge,
      isActive: edge.id === activeEdgeId,
      isRelaxed: edge.id === relaxedEdgeId,
      isTree: edge.directed
        ? args.previousMap.get(edge.to) === edge.from
        : args.previousMap.get(edge.to) === edge.from || args.previousMap.get(edge.from) === edge.to,
      tone:
        edge.id === activeEdgeId || edge.id === relaxedEdgeId
          ? null
          : componentTone(sharedComponent),
    };
  });

  const queue: GraphQueueEntry[] = args.frontierOrder.map((nodeId) => ({
    nodeId,
    label: labelMap.get(nodeId) ?? nodeId,
    distance: args.indexMap.get(nodeId) ?? null,
  }));

  const traceRows: GraphTraceRow[] = nodes.map((node) => ({
    nodeId: node.id,
    label: node.label,
    distance: node.distance,
    secondaryText: node.secondaryText,
    isSource: node.isSource,
    isCurrent: node.isCurrent,
    isSettled: node.isSettled,
    isFrontier: node.isFrontier,
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
    graph: {
      nodes,
      edges,
      sourceId: args.sourceId,
      phaseLabel: args.phaseLabel,
      metricLabel: args.metricLabel,
      secondaryLabel: args.secondaryLabel,
      frontierLabel: args.frontierLabel,
      frontierHeadLabel: args.frontierHeadLabel,
      completionLabel: args.completionLabel,
      frontierStatusLabel: args.frontierStatusLabel,
      completionStatusLabel: args.completionStatusLabel,
      showEdgeWeights: false,
      detailLabel: args.detailLabel,
      detailValue: args.detailValue,
      visitOrderLabel: args.visitOrderLabel,
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder],
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function componentTone(componentId: number | null): GraphTone | null {
  if (componentId === null) return null;
  switch ((componentId - 1) % 4) {
    case 0:
      return 'component-a';
    case 1:
      return 'component-b';
    case 2:
      return 'component-c';
    default:
      return 'component-d';
  }
}
