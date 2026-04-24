import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { DinicScenario, LayeredNetworkEdge } from '../utils/scenarios/network/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';

export function* edmondsKarpGenerator(scenario: DinicScenario): Generator<SortStep> {
  const flow = new Map<string, number>(scenario.edges.map((edge) => [edge.id, 0]));
  const adjacency = buildAdjacency(scenario);
  const labelById = new Map(scenario.nodes.map((node) => [node.id, node.label]));
  let totalFlow = 0;
  let bfsRound = 0;

  yield createSnapshot({
    scenario,
    flow,
    level: new Map(),
    parentEdgeByNode: new Map(),
    phaseLabel: 'Initialize residual network',
    statusLabel: 'All flows start at zero',
    resultLabel: 'max flow 0',
    frontierLabel: 'BFS frontier',
    queueLabel: 'Residual queue',
    queue: [],
    focusItemsLabel: 'Positive flow',
    focusItems: [],
    description: 'Edmonds-Karp repeatedly runs BFS on the residual network and augments one shortest path at a time.',
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    bfsRound += 1;
    const level = new Map<string, number>([[scenario.sourceId, 0]]);
    const parentEdgeByNode = new Map<string, LayeredNetworkEdge>();
    const queue: string[] = [scenario.sourceId];
    const discovered = new Set<string>(queue);

    yield createSnapshot({
      scenario,
      flow,
      level,
      parentEdgeByNode,
      frontierIds: new Set(queue),
      phaseLabel: `BFS round ${bfsRound}`,
      statusLabel: 'Seed source layer',
      resultLabel: `max flow ${totalFlow}`,
      frontierLabel: 'BFS frontier',
      queueLabel: 'Residual queue',
      queue,
      focusItemsLabel: 'Positive flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'Start BFS from the source and only follow edges whose residual capacity stays positive.',
      activeCodeLine: 3,
      computation: {
        label: 'Start layer',
        expression: `${labelById.get(scenario.sourceId) ?? scenario.sourceId} = 0`,
        result: 'residual BFS ready',
        decision: 'The next augmenting path must be shortest in number of edges.',
      },
    });

    let queueIndex = 0;
    let sinkFound = false;
    while (queueIndex < queue.length && !sinkFound) {
      const currentNodeId = queue[queueIndex++]!;

      yield createSnapshot({
        scenario,
        flow,
        level,
        parentEdgeByNode,
        currentNodeId,
        frontierIds: new Set(queue.slice(queueIndex)),
        phaseLabel: `BFS round ${bfsRound}`,
        statusLabel: 'Expand one BFS layer',
        resultLabel: `max flow ${totalFlow}`,
        frontierLabel: 'BFS frontier',
        queueLabel: 'Residual queue',
        queue: queue.slice(queueIndex),
        focusItemsLabel: 'Positive flow',
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: `Explore residual outgoing edges from ${labelById.get(currentNodeId) ?? currentNodeId}.`,
        activeCodeLine: 4,
      });

      for (const edge of adjacency.get(currentNodeId) ?? []) {
        const residual = residualCapacity(edge, flow);
        const targetId = edge.toId;
        const targetLabel = labelById.get(targetId) ?? targetId;
        const decision =
          residual <= 0
            ? 'Residual capacity is zero, so BFS cannot use this edge.'
            : discovered.has(targetId)
              ? `${targetLabel} already has the shortest residual parent for this round.`
              : `${targetLabel} joins the BFS tree through this edge.`;

        yield createSnapshot({
          scenario,
          flow,
          level,
          parentEdgeByNode,
          currentNodeId,
          activeEdgeId: edge.id,
          frontierIds: new Set(queue.slice(queueIndex)),
          phaseLabel: `BFS round ${bfsRound}`,
          statusLabel: 'Inspect residual edge',
          resultLabel: `max flow ${totalFlow}`,
          frontierLabel: 'BFS frontier',
          queueLabel: 'Residual queue',
          queue: queue.slice(queueIndex),
          focusItemsLabel: 'Positive flow',
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: `Check whether ${labelById.get(currentNodeId) ?? currentNodeId} → ${targetLabel} can still carry more flow.`,
          activeCodeLine: 4,
          phase: 'inspect-edge',
          computation: {
            label: 'Residual capacity',
            expression: `${edge.capacity ?? 0} - ${flow.get(edge.id) ?? 0}`,
            result: String(residual),
            decision,
          },
        });

        if (residual <= 0 || discovered.has(targetId)) {
          continue;
        }

        discovered.add(targetId);
        level.set(targetId, (level.get(currentNodeId) ?? 0) + 1);
        parentEdgeByNode.set(targetId, edge);
        queue.push(targetId);

        yield createSnapshot({
          scenario,
          flow,
          level,
          parentEdgeByNode,
          currentNodeId,
          activeEdgeId: edge.id,
          frontierIds: new Set(queue.slice(queueIndex)),
          candidateEdgeIds: new Set(Array.from(parentEdgeByNode.values(), (parentEdge) => parentEdge.id)),
          phaseLabel: `BFS round ${bfsRound}`,
          statusLabel: 'Attach node to BFS tree',
          resultLabel: `max flow ${totalFlow}`,
          frontierLabel: 'BFS frontier',
          queueLabel: 'Residual queue',
          queue: queue.slice(queueIndex),
          focusItemsLabel: 'Positive flow',
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: `${targetLabel} now stores its parent edge so the augmenting path can be reconstructed if BFS reaches the sink.`,
          activeCodeLine: 5,
          phase: 'relax',
          computation: {
            label: 'Parent update',
            expression: `${targetLabel} ← ${labelById.get(currentNodeId) ?? currentNodeId}`,
            result: `level ${level.get(targetId) ?? 0}`,
            decision: 'shortest residual parent recorded',
          },
        });

        if (targetId === scenario.sinkId) {
          sinkFound = true;
          break;
        }
      }
    }

    if (!parentEdgeByNode.has(scenario.sinkId)) {
      yield createSnapshot({
        scenario,
        flow,
        level,
        parentEdgeByNode,
        phaseLabel: `Complete after round ${bfsRound}`,
        statusLabel: 'Sink is unreachable',
        resultLabel: `max flow ${totalFlow}`,
        frontierLabel: 'Residual BFS',
        queueLabel: 'Residual queue',
        queue: [],
        focusItemsLabel: 'Final positive flow',
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: 'If BFS can no longer reach the sink in the residual network, the current flow is maximum.',
        activeCodeLine: 9,
        phase: 'graph-complete',
        computation: {
          label: 'Reachability',
          expression: `${labelById.get(scenario.sinkId) ?? scenario.sinkId} ∉ BFS tree`,
          result: `max flow ${totalFlow}`,
          decision: 'No more augmenting path exists.',
        },
      });
      return;
    }

    const pathEdges = reconstructPathEdges(scenario.sinkId, parentEdgeByNode);
    const pathNodeIds = edgePathToNodeIds(scenario.sourceId, pathEdges);
    const pathEdgeIds = new Set(pathEdges.map((edge) => edge.id));
    const bottleneck = Math.min(...pathEdges.map((edge) => residualCapacity(edge, flow)));

    yield createSnapshot({
      scenario,
      flow,
      level,
      parentEdgeByNode,
      activePathNodeIds: new Set(pathNodeIds),
      activePathEdgeIds: pathEdgeIds,
      candidateEdgeIds: pathEdgeIds,
      phaseLabel: `Augment round ${bfsRound}`,
      statusLabel: 'Shortest augmenting path found',
      resultLabel: `max flow ${totalFlow}`,
      frontierLabel: 'Augment path',
      queueLabel: 'Residual queue',
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: 'Positive flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'BFS gives the shortest residual path to the sink; the smallest residual edge becomes the bottleneck.',
      activeCodeLine: 7,
      computation: {
        label: 'Bottleneck',
        expression: `min(${pathEdges.map((edge) => residualCapacity(edge, flow)).join(', ')})`,
        result: String(bottleneck),
        decision: 'Every edge on this path can increase flow by at most the bottleneck.',
      },
    });

    for (const edge of pathEdges) {
      flow.set(edge.id, (flow.get(edge.id) ?? 0) + bottleneck);
    }
    totalFlow += bottleneck;

    yield createSnapshot({
      scenario,
      flow,
      level,
      parentEdgeByNode,
      activePathNodeIds: new Set(pathNodeIds),
      activePathEdgeIds: pathEdgeIds,
      phaseLabel: `Augment round ${bfsRound}`,
      statusLabel: 'Flow pushed through path',
      resultLabel: `max flow ${totalFlow}`,
      frontierLabel: 'Positive flow',
      queueLabel: 'Residual queue',
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: 'Positive flow',
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: 'Increase the flow on every edge of the augmenting path by the bottleneck amount and restart BFS.',
      activeCodeLine: 8,
      phase: 'relax',
      computation: {
        label: 'Flow update',
        expression: `${totalFlow - bottleneck} + ${bottleneck}`,
        result: String(totalFlow),
        decision: 'The residual network changes, so Edmonds-Karp launches a fresh BFS.',
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: DinicScenario;
  readonly flow: ReadonlyMap<string, number>;
  readonly level: ReadonlyMap<string, number>;
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
    const level = args.level.get(node.id) ?? null;
    const parentEdge = args.parentEdgeByNode.get(node.id) ?? null;
    const hasPositiveFlow = args.scenario.edges.some(
      (edge) => (edge.fromId === node.id || edge.toId === node.id) && (args.flow.get(edge.id) ?? 0) > 0,
    );
    const tags: NetworkTraceTag[] = [];
    if (level !== null) tags.push('level');
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
    } else if (level !== null) {
      status = 'visited';
    }

    nodeState.set(node.id, {
      level,
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
      secondaryText: `res ${residual}`,
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
    mode: 'edmonds-karp',
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

function buildAdjacency(scenario: DinicScenario): Map<string, readonly LayeredNetworkEdge[]> {
  const map = new Map<string, LayeredNetworkEdge[]>();
  for (const node of scenario.nodes) {
    map.set(node.id, []);
  }
  for (const edge of scenario.edges) {
    map.get(edge.fromId)?.push(edge);
  }
  for (const edges of map.values()) {
    edges.sort((left, right) => left.toId.localeCompare(right.toId));
  }
  return map;
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
  scenario: DinicScenario,
  flow: ReadonlyMap<string, number>,
  labelById: ReadonlyMap<string, string>,
): readonly string[] {
  return scenario.edges
    .filter((edge) => (flow.get(edge.id) ?? 0) > 0)
    .map((edge) => {
      const currentFlow = flow.get(edge.id) ?? 0;
      return `${labelById.get(edge.fromId) ?? edge.fromId} → ${labelById.get(edge.toId) ?? edge.toId} ${currentFlow}/${edge.capacity ?? 0}`;
    });
}

function labelsFor(nodeIds: readonly string[], labelById: ReadonlyMap<string, string>): readonly string[] {
  return nodeIds.map((nodeId) => labelById.get(nodeId) ?? nodeId);
}
