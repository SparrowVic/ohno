import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { LayeredNetworkEdge, MinCostMaxFlowScenario } from '../utils/network-scenarios/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';

export function* minCostMaxFlowGenerator(scenario: MinCostMaxFlowScenario): Generator<SortStep> {
  const flow = new Map<string, number>(scenario.edges.map((edge) => [edge.id, 0]));
  const labelById = new Map(scenario.nodes.map((node) => [node.id, node.label]));
  let totalFlow = 0;
  let totalCost = 0;
  let round = 0;

  yield createSnapshot({
    scenario,
    flow,
    distanceByNode: new Map(),
    parentEdgeByNode: new Map(),
    phaseLabel: 'Initialize cost flow',
    statusLabel: 'All flows start at zero',
    resultLabel: 'flow 0 · cost 0',
    frontierLabel: 'Shortest-cost frontier',
    queueLabel: 'Cost scan',
    queue: [],
    focusItemsLabel: 'Committed flow',
    focusItems: [],
    description: 'Min-Cost Max Flow repeatedly finds the cheapest residual source-to-sink route and augments along it.',
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    round += 1;
    const distanceByNode = new Map<string, number>([[scenario.sourceId, 0]]);
    const parentEdgeByNode = new Map<string, LayeredNetworkEdge>();
    const activeFrontier = new Set<string>([scenario.sourceId]);

    yield createSnapshot({
      scenario,
      flow,
      distanceByNode,
      parentEdgeByNode,
      frontierIds: new Set(activeFrontier),
      phaseLabel: `Cost path round ${round}`,
      statusLabel: 'Seed source cost',
      resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
      frontierLabel: 'Shortest-cost frontier',
      queueLabel: 'Cost scan',
      queue: [scenario.sourceId],
      focusItemsLabel: 'Committed flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'Start with zero distance at the source, then relax residual edges by cumulative cost.',
      activeCodeLine: 3,
      computation: {
        label: 'Source cost',
        expression: `${labelById.get(scenario.sourceId) ?? scenario.sourceId} = 0`,
        result: 'ready',
        decision: 'The next augmenting path should minimize added transport cost.',
      },
    });

    for (let pass = 0; pass < scenario.nodes.length - 1; pass += 1) {
      let changed = false;

      for (const edge of scenario.edges) {
        const fromDistance = distanceByNode.get(edge.fromId);
        const residual = residualCapacity(edge, flow);
        const edgeCost = edge.cost ?? 0;
        if (fromDistance === undefined || residual <= 0) {
          continue;
        }

        const candidateCost = fromDistance + edgeCost;
        const currentCost = distanceByNode.get(edge.toId);
        const improves = currentCost === undefined || candidateCost < currentCost;

        yield createSnapshot({
          scenario,
          flow,
          distanceByNode,
          parentEdgeByNode,
          activeEdgeId: edge.id,
          currentNodeId: edge.fromId,
          frontierIds: new Set(activeFrontier),
          phaseLabel: `Relax pass ${pass + 1}`,
          statusLabel: 'Inspect cost edge',
          resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
          frontierLabel: 'Shortest-cost frontier',
          queueLabel: 'Cost scan',
          queue: [...activeFrontier],
          focusItemsLabel: 'Committed flow',
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: `Check whether routing through ${labelById.get(edge.fromId) ?? edge.fromId} lowers the total cost of reaching ${labelById.get(edge.toId) ?? edge.toId}.`,
          activeCodeLine: 4,
          phase: 'inspect-edge',
          computation: {
            label: 'Cost relaxation',
            expression: `${fromDistance} + ${edgeCost}`,
            result: String(candidateCost),
            decision:
              residual <= 0
                ? 'residual capacity is zero'
                : improves
                  ? `better than ${currentCost ?? '∞'}`
                  : `keep ${currentCost}`,
          },
        });

        if (!improves) {
          continue;
        }

        distanceByNode.set(edge.toId, candidateCost);
        parentEdgeByNode.set(edge.toId, edge);
        activeFrontier.add(edge.toId);
        changed = true;

        yield createSnapshot({
          scenario,
          flow,
          distanceByNode,
          parentEdgeByNode,
          activeEdgeId: edge.id,
          currentNodeId: edge.toId,
          frontierIds: new Set(activeFrontier),
          candidateEdgeIds: new Set(Array.from(parentEdgeByNode.values(), (parentEdge) => parentEdge.id)),
          phaseLabel: `Relax pass ${pass + 1}`,
          statusLabel: 'Cheapest predecessor updated',
          resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
          frontierLabel: 'Shortest-cost frontier',
          queueLabel: 'Cost scan',
          queue: [...activeFrontier],
          focusItemsLabel: 'Committed flow',
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: `${labelById.get(edge.toId) ?? edge.toId} now keeps this edge as its cheapest known residual predecessor.`,
          activeCodeLine: 5,
          phase: 'relax',
          computation: {
            label: 'Parent update',
            expression: `${labelById.get(edge.toId) ?? edge.toId} ← ${labelById.get(edge.fromId) ?? edge.fromId}`,
            result: String(candidateCost),
            decision: 'best cumulative cost updated',
          },
        });
      }

      if (!changed) {
        break;
      }
    }

    if (!parentEdgeByNode.has(scenario.sinkId)) {
      yield createSnapshot({
        scenario,
        flow,
        distanceByNode,
        parentEdgeByNode,
        phaseLabel: `Complete after round ${round}`,
        statusLabel: 'Sink is unreachable',
        resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
        frontierLabel: 'Residual cheapest path',
        queueLabel: 'Cost scan',
        queue: [],
        focusItemsLabel: 'Final committed flow',
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: 'When no residual source-to-sink path remains, the current flow is maximum and already cost-minimized for this network.',
        activeCodeLine: 8,
        phase: 'graph-complete',
        computation: {
          label: 'Reachability',
          expression: `${labelById.get(scenario.sinkId) ?? scenario.sinkId} has no residual predecessor`,
          result: `flow ${totalFlow} · cost ${totalCost}`,
          decision: 'No more augmenting path exists.',
        },
      });
      return;
    }

    const pathEdges = reconstructPathEdges(scenario.sinkId, parentEdgeByNode);
    const pathNodeIds = edgePathToNodeIds(scenario.sourceId, pathEdges);
    const pathEdgeIds = new Set(pathEdges.map((edge) => edge.id));
    const bottleneck = Math.min(...pathEdges.map((edge) => residualCapacity(edge, flow)));
    const pathUnitCost = pathEdges.reduce((sum, edge) => sum + (edge.cost ?? 0), 0);
    const pathTotalCost = bottleneck * pathUnitCost;

    yield createSnapshot({
      scenario,
      flow,
      distanceByNode,
      parentEdgeByNode,
      activePathNodeIds: new Set(pathNodeIds),
      activePathEdgeIds: pathEdgeIds,
      candidateEdgeIds: pathEdgeIds,
      phaseLabel: `Augment round ${round}`,
      statusLabel: 'Cheapest augmenting route found',
      resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
      frontierLabel: 'Augment route',
      queueLabel: 'Cost scan',
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: 'Committed flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'The shortest-cost residual route is ready; its bottleneck defines how much additional flow can move with this unit price.',
      activeCodeLine: 6,
      computation: {
        label: 'Route price',
        expression: `${pathEdges.map((edge) => edge.cost ?? 0).join(' + ')} × ${bottleneck}`,
        result: String(pathTotalCost),
        decision: `unit cost ${pathUnitCost}, bottleneck ${bottleneck}`,
      },
    });

    for (const edge of pathEdges) {
      flow.set(edge.id, (flow.get(edge.id) ?? 0) + bottleneck);
    }
    totalFlow += bottleneck;
    totalCost += pathTotalCost;

    yield createSnapshot({
      scenario,
      flow,
      distanceByNode,
      parentEdgeByNode,
      activePathNodeIds: new Set(pathNodeIds),
      activePathEdgeIds: pathEdgeIds,
      phaseLabel: `Augment round ${round}`,
      statusLabel: 'Flow and cost committed',
      resultLabel: `flow ${totalFlow} · cost ${totalCost}`,
      frontierLabel: 'Committed flow',
      queueLabel: 'Cost scan',
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: 'Committed flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'Push the bottleneck through the cheapest route, update the accumulated cost, then search again for the next cheapest augment.',
      activeCodeLine: 7,
      phase: 'relax',
      computation: {
        label: 'Total cost',
        expression: `${totalCost - pathTotalCost} + ${pathTotalCost}`,
        result: String(totalCost),
        decision: 'The next search starts from this new cost baseline.',
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: MinCostMaxFlowScenario;
  readonly flow: ReadonlyMap<string, number>;
  readonly distanceByNode: ReadonlyMap<string, number>;
  readonly parentEdgeByNode: ReadonlyMap<string, LayeredNetworkEdge>;
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly frontierLabel: string;
  readonly queueLabel: string;
  readonly queue: readonly string[];
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly frontierIds?: ReadonlySet<string>;
  readonly activeEdgeId?: string | null;
  readonly currentNodeId?: string | null;
  readonly activeRouteLabel?: string | null;
  readonly activePathNodeIds?: ReadonlySet<string>;
  readonly activePathEdgeIds?: ReadonlySet<string>;
  readonly candidateEdgeIds?: ReadonlySet<string>;
  readonly computation?: NetworkComputation | null;
}): SortStep {
  const labelById = new Map(args.scenario.nodes.map((node) => [node.id, node.label]));
  const nodeState = new Map<string, NetworkStepNodeState>();

  for (const node of args.scenario.nodes) {
    const distance = args.distanceByNode.get(node.id) ?? null;
    const parentEdge = args.parentEdgeByNode.get(node.id) ?? null;
    const hasPositiveFlow = args.scenario.edges.some(
      (edge) => (edge.fromId === node.id || edge.toId === node.id) && (args.flow.get(edge.id) ?? 0) > 0,
    );
    const tags: NetworkTraceTag[] = [];
    if (distance !== null) tags.push('level');
    if (hasPositiveFlow) tags.push('flow');
    if (args.frontierIds?.has(node.id)) tags.push('frontier');
    if (args.currentNodeId === node.id) tags.push('current');
    if (args.activePathNodeIds?.has(node.id)) tags.push('augment');
    if (node.id === args.scenario.sourceId) tags.push('source');
    if (node.id === args.scenario.sinkId) tags.push('sink');

    let status: NetworkStepNodeState['status'] = 'idle';
    if (args.currentNodeId === node.id) {
      status = 'current';
    } else if (args.frontierIds?.has(node.id)) {
      status = 'frontier';
    } else if (node.id === args.scenario.sourceId) {
      status = 'source';
    } else if (node.id === args.scenario.sinkId) {
      status = 'sink';
    } else if (args.activePathNodeIds?.has(node.id) || hasPositiveFlow) {
      status = 'linked';
    } else if (distance !== null) {
      status = 'visited';
    }

    nodeState.set(node.id, {
      level: distance,
      linkLabel:
        node.id === args.scenario.sourceId
          ? 'start'
          : node.id === args.scenario.sinkId
            ? 'goal'
            : parentEdge
              ? `via ${labelById.get(parentEdge.fromId) ?? parentEdge.fromId}`
              : null,
      status,
      tags,
    });
  }

  const edges: NetworkEdgeSnapshot[] = args.scenario.edges.map((edge) => {
    const currentFlow = args.flow.get(edge.id) ?? 0;
    const residual = residualCapacity(edge, args.flow);
    return {
      id: edge.id,
      fromId: edge.fromId,
      toId: edge.toId,
      directed: true,
      primaryText: `${currentFlow}/${edge.capacity ?? 0}`,
      secondaryText: `c ${edge.cost ?? 0} · r ${residual}`,
      status: args.activePathEdgeIds?.has(edge.id)
        ? 'augment'
        : args.activeEdgeId === edge.id
          ? 'active'
          : currentFlow > 0
            ? 'flow'
            : residual <= 0
              ? 'saturated'
              : args.candidateEdgeIds?.has(edge.id)
                ? 'candidate'
                : 'base',
    };
  });

  return createNetworkStep({
    mode: 'min-cost-max-flow',
    nodes: args.scenario.nodes,
    nodeState,
    edges,
    phaseLabel: args.phaseLabel,
    statusLabel: args.statusLabel,
    resultLabel: args.resultLabel,
    frontierLabel: args.frontierLabel,
    frontierCount: args.frontierIds?.size ?? 0,
    queueLabel: args.queueLabel,
    queue: args.queue.map((id) => labelById.get(id) ?? id),
    activeRouteLabel: args.activeRouteLabel ?? null,
    focusItemsLabel: args.focusItemsLabel,
    focusItems: args.focusItems,
    computation: args.computation ?? null,
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
  });
}

function reconstructPathEdges(
  sinkId: string,
  parentEdgeByNode: ReadonlyMap<string, LayeredNetworkEdge>,
): readonly LayeredNetworkEdge[] {
  const edges: LayeredNetworkEdge[] = [];
  let cursor = sinkId;
  while (parentEdgeByNode.has(cursor)) {
    const edge = parentEdgeByNode.get(cursor)!;
    edges.push(edge);
    cursor = edge.fromId;
  }
  return edges.reverse();
}

function edgePathToNodeIds(sourceId: string, path: readonly LayeredNetworkEdge[]): readonly string[] {
  const nodes = [sourceId];
  for (const edge of path) {
    nodes.push(edge.toId);
  }
  return nodes;
}

function residualCapacity(edge: LayeredNetworkEdge, flow: ReadonlyMap<string, number>): number {
  return (edge.capacity ?? 0) - (flow.get(edge.id) ?? 0);
}

function positiveFlowLabels(
  scenario: MinCostMaxFlowScenario,
  flow: ReadonlyMap<string, number>,
  labelById: ReadonlyMap<string, string>,
): readonly string[] {
  return scenario.edges
    .filter((edge) => (flow.get(edge.id) ?? 0) > 0)
    .map((edge) => {
      const currentFlow = flow.get(edge.id) ?? 0;
      return `${labelById.get(edge.fromId) ?? edge.fromId} → ${labelById.get(edge.toId) ?? edge.toId} ${currentFlow}/${edge.capacity ?? 0} @ ${edge.cost ?? 0}`;
    });
}

function labelsFor(nodeIds: readonly string[], labelById: ReadonlyMap<string, string>): readonly string[] {
  return nodeIds.map((nodeId) => labelById.get(nodeId) ?? nodeId);
}
