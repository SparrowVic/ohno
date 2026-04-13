import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

export function* connectedComponentsGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const componentMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const rootMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const closed = new Set<string>();
  const visitOrder: string[] = [];
  let activeComponent = 0;
  let queue: string[] = [];

  yield createStep({
    graph,
    componentMap,
    previousMap,
    rootMap,
    closed,
    frontierOrder: queue,
    visitOrder,
    activeComponent,
    description: 'Initialize every node as unassigned and prepare to sweep the graph component by component.',
    activeCodeLine: 2,
    phase: 'init',
  });

  for (const node of graph.nodes) {
    if (componentMap.get(node.id) !== null) {
      continue;
    }

    activeComponent += 1;
    componentMap.set(node.id, activeComponent);
    rootMap.set(node.id, node.id);
    previousMap.set(node.id, null);
    queue = [node.id];

    yield createStep({
      graph,
      componentMap,
      previousMap,
      rootMap,
      closed,
      frontierOrder: queue,
      visitOrder,
      activeComponent,
      currentNodeId: node.id,
      description: `Start component C${activeComponent} from ${labelOf(labelMap, node.id)}.`,
      activeCodeLine: 5,
      phase: 'pick-node',
    });

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;

      yield createStep({
        graph,
        componentMap,
        previousMap,
        rootMap,
        closed,
        frontierOrder: queue,
        visitOrder,
        activeComponent,
        currentNodeId,
        description: `Expand ${labelOf(labelMap, currentNodeId)} inside component C${activeComponent}.`,
        activeCodeLine: 7,
        phase: 'pick-node',
      });

      for (const edge of outgoingEdges(graph, currentNodeId)) {
        const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
        const neighborComponent = componentMap.get(neighborId) ?? null;

        yield createStep({
          graph,
          componentMap,
          previousMap,
          rootMap,
          closed,
          frontierOrder: queue,
          visitOrder,
          activeComponent,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Inspect edge ${labelOf(labelMap, currentNodeId)} → ${labelOf(labelMap, neighborId)}.`,
          activeCodeLine: 8,
          phase: 'inspect-edge',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `component C${activeComponent}`,
            result: neighborComponent === null ? 'unassigned' : `C${neighborComponent}`,
            decision: neighborComponent === null ? 'claim node for this component' : 'already assigned',
          },
        });

        if (neighborComponent !== null) {
          yield createStep({
            graph,
            componentMap,
            previousMap,
            rootMap,
            closed,
            frontierOrder: queue,
            visitOrder,
            activeComponent,
            currentNodeId,
            activeEdgeId: edge.id,
            description: `Skip ${labelOf(labelMap, neighborId)} because it already belongs to component C${neighborComponent}.`,
            activeCodeLine: 9,
            phase: 'skip-relax',
            computation: {
              candidateLabel: labelOf(labelMap, neighborId),
              expression: `C${activeComponent}`,
              result: `C${neighborComponent}`,
              decision: 'keep existing component label',
            },
          });
          continue;
        }

        componentMap.set(neighborId, activeComponent);
        previousMap.set(neighborId, currentNodeId);
        rootMap.set(neighborId, rootMap.get(currentNodeId) ?? currentNodeId);
        queue.push(neighborId);

        yield createStep({
          graph,
          componentMap,
          previousMap,
          rootMap,
          closed,
          frontierOrder: queue,
          visitOrder,
          activeComponent,
          currentNodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: `Assign ${labelOf(labelMap, neighborId)} to component C${activeComponent} and enqueue it.`,
          activeCodeLine: 10,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `C${activeComponent}`,
            result: `C${activeComponent}`,
            decision: 'added to component frontier',
          },
        });
      }

      closed.add(currentNodeId);
      visitOrder.push(currentNodeId);

      yield createStep({
        graph,
        componentMap,
        previousMap,
        rootMap,
        closed,
        frontierOrder: queue,
        visitOrder,
        activeComponent,
        currentNodeId,
        description: `Close ${labelOf(labelMap, currentNodeId)} and continue filling component C${activeComponent}.`,
        activeCodeLine: 12,
        phase: 'settle-node',
      });
    }
  }

  yield createStep({
    graph,
    componentMap,
    previousMap,
    rootMap,
    closed,
    frontierOrder: [],
    visitOrder,
    activeComponent,
    description: `Connected-components complete. Found ${activeComponent} disconnected groups.`,
    activeCodeLine: 15,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly componentMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly rootMap: ReadonlyMap<string, string | null>;
  readonly closed: ReadonlySet<string>;
  readonly frontierOrder: readonly string[];
  readonly visitOrder: readonly string[];
  readonly activeComponent: number;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const relaxedEdgeId = args.relaxedEdgeId ?? null;
  const labelMap = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const frontierSet = new Set(args.frontierOrder);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const component = args.componentMap.get(node.id) ?? null;
    const rootId = args.rootMap.get(node.id) ?? null;
    return {
      ...node,
      distance: component,
      previousId: args.previousMap.get(node.id) ?? null,
      secondaryText: rootId ? labelOf(labelMap, rootId) : null,
      isSource: node.id === args.graph.sourceId,
      isCurrent: node.id === currentNodeId,
      isSettled: args.closed.has(node.id),
      isFrontier: frontierSet.has(node.id),
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => {
    const fromPrev = args.previousMap.get(edge.from);
    const toPrev = args.previousMap.get(edge.to);
    return {
      ...edge,
      isActive: edge.id === activeEdgeId,
      isRelaxed: edge.id === relaxedEdgeId,
      isTree: fromPrev === edge.to || toPrev === edge.from,
    };
  });

  const queue: GraphQueueEntry[] = args.frontierOrder.map((nodeId) => ({
    nodeId,
    label: labelOf(labelMap, nodeId),
    distance: args.componentMap.get(nodeId) ?? null,
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
      sourceId: args.graph.sourceId,
      phaseLabel: phaseLabel(args.phase),
      metricLabel: 'Comp',
      secondaryLabel: 'Seed',
      frontierLabel: 'Component queue',
      frontierHeadLabel: 'Queue head',
      completionLabel: 'Assigned',
      frontierStatusLabel: 'queued',
      completionStatusLabel: 'assigned',
      showEdgeWeights: false,
      detailLabel: 'Component sweep',
      detailValue: describeComponents(args.componentMap, labelMap, args.activeComponent),
      visitOrderLabel: 'Assignment order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: args.visitOrder.map((nodeId) => labelOf(labelMap, nodeId)),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function describeComponents(
  componentMap: ReadonlyMap<string, number | null>,
  labelMap: ReadonlyMap<string, string>,
  total: number,
): string {
  if (total === 0) return 'Waiting for the first seed';
  const groups = new Map<number, string[]>();
  for (const [nodeId, component] of componentMap.entries()) {
    if (component === null) continue;
    const members = groups.get(component) ?? [];
    members.push(labelOf(labelMap, nodeId));
    groups.set(component, members);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([component, members]) => `C${component}: ${members.sort().join(', ')}`)
    .join(' · ');
}

function outgoingEdges(graph: WeightedGraphData, nodeId: string) {
  return graph.edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .sort((left, right) => {
      const leftNeighbor = left.from === nodeId ? left.to : left.from;
      const rightNeighbor = right.from === nodeId ? right.to : right.from;
      return leftNeighbor.localeCompare(rightNeighbor);
    });
}

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return 'Seed or dequeue node';
    case 'inspect-edge':
      return 'Inspect neighbor edge';
    case 'relax':
      return 'Assign component';
    case 'skip-relax':
      return 'Keep current component';
    case 'settle-node':
      return 'Close assigned node';
    case 'graph-complete':
      return 'Components ready';
    default:
      return 'Initialize component scan';
  }
}
