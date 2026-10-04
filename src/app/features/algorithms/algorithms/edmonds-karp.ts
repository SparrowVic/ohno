import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { DinicScenario, LayeredNetworkEdge } from '../utils/scenarios/network/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';
import { networkFrontier, networkRack } from './network-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const C = RUNTIME_KEY.network.common.computation;
const TEXT = RUNTIME_KEY.network.edmondsKarp.computation;

const I18N = {
  phases: {
    initialize: t('features.algorithms.runtime.network.edmondsKarp.phases.initialize'),
    bfs: t('features.algorithms.runtime.network.edmondsKarp.phases.bfs'),
    complete: t('features.algorithms.runtime.network.edmondsKarp.phases.complete'),
    augment: t('features.algorithms.runtime.network.edmondsKarp.phases.augment'),
  },
  statuses: {
    zeroFlow: t('features.algorithms.runtime.network.edmondsKarp.statuses.zeroFlow'),
    seed: t('features.algorithms.runtime.network.edmondsKarp.statuses.seed'),
    expand: t('features.algorithms.runtime.network.edmondsKarp.statuses.expand'),
    inspect: t('features.algorithms.runtime.network.edmondsKarp.statuses.inspect'),
    attach: t('features.algorithms.runtime.network.edmondsKarp.statuses.attach'),
    unreachable: t('features.algorithms.runtime.network.edmondsKarp.statuses.unreachable'),
    pathFound: t('features.algorithms.runtime.network.edmondsKarp.statuses.pathFound'),
    pushed: t('features.algorithms.runtime.network.edmondsKarp.statuses.pushed'),
  },
  results: {
    maxFlowZero: t('features.algorithms.runtime.network.edmondsKarp.results.maxFlowZero'),
    maxFlow: t('features.algorithms.runtime.network.edmondsKarp.results.maxFlow'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.network.edmondsKarp.descriptions.initialize'),
    seed: t('features.algorithms.runtime.network.edmondsKarp.descriptions.seed'),
    expand: t('features.algorithms.runtime.network.edmondsKarp.descriptions.expand'),
    inspect: t('features.algorithms.runtime.network.edmondsKarp.descriptions.inspect'),
    attach: t('features.algorithms.runtime.network.edmondsKarp.descriptions.attach'),
    complete: t('features.algorithms.runtime.network.edmondsKarp.descriptions.complete'),
    pathFound: t('features.algorithms.runtime.network.edmondsKarp.descriptions.pathFound'),
    augment: t('features.algorithms.runtime.network.edmondsKarp.descriptions.augment'),
  },
} as const;

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
    phaseLabel: i18nText(I18N.phases.initialize),
    statusLabel: i18nText(I18N.statuses.zeroFlow),
    resultLabel: i18nText(I18N.results.maxFlowZero),
    frontierLabel: networkFrontier('bfsFrontier'),
    queueLabel: networkRack('residualQueue'),
    queue: [],
    focusItemsLabel: networkRack('positiveFlow'),
    focusItems: [],
    description: i18nText(I18N.descriptions.initialize),
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
      phaseLabel: i18nText(I18N.phases.bfs, { round: bfsRound }),
      statusLabel: i18nText(I18N.statuses.seed),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkFrontier('bfsFrontier'),
      queueLabel: networkRack('residualQueue'),
      queue,
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.seed),
      activeCodeLine: 3,
      computation: {
        label: i18nText(C.startLayer),
        expression: `${labelById.get(scenario.sourceId) ?? scenario.sourceId} = 0`,
        result: i18nText(C.residualBfsReady),
        decision: i18nText(TEXT.shortestNext),
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
        phaseLabel: i18nText(I18N.phases.bfs, { round: bfsRound }),
        statusLabel: i18nText(I18N.statuses.expand),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkFrontier('bfsFrontier'),
        queueLabel: networkRack('residualQueue'),
        queue: queue.slice(queueIndex),
        focusItemsLabel: networkRack('positiveFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.expand, { node: labelById.get(currentNodeId) ?? currentNodeId }),
        activeCodeLine: 4,
      });

      for (const edge of adjacency.get(currentNodeId) ?? []) {
        const residual = residualCapacity(edge, flow);
        const targetId = edge.toId;
        const targetLabel = labelById.get(targetId) ?? targetId;
        const decision =
          residual <= 0
            ? i18nText(C.residualZeroBfs)
            : discovered.has(targetId)
              ? i18nText(TEXT.alreadyParent, { node: targetLabel })
              : i18nText(TEXT.joinsTree, { node: targetLabel });

        yield createSnapshot({
          scenario,
          flow,
          level,
          parentEdgeByNode,
          currentNodeId,
          activeEdgeId: edge.id,
          frontierIds: new Set(queue.slice(queueIndex)),
          phaseLabel: i18nText(I18N.phases.bfs, { round: bfsRound }),
          statusLabel: i18nText(I18N.statuses.inspect),
          resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
          frontierLabel: networkFrontier('bfsFrontier'),
          queueLabel: networkRack('residualQueue'),
          queue: queue.slice(queueIndex),
          focusItemsLabel: networkRack('positiveFlow'),
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: i18nText(I18N.descriptions.inspect, { from: labelById.get(currentNodeId) ?? currentNodeId, to: targetLabel }),
          activeCodeLine: 4,
          phase: 'inspect-edge',
          computation: {
            label: i18nText(C.residualCapacity),
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
          phaseLabel: i18nText(I18N.phases.bfs, { round: bfsRound }),
          statusLabel: i18nText(I18N.statuses.attach),
          resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
          frontierLabel: networkFrontier('bfsFrontier'),
          queueLabel: networkRack('residualQueue'),
          queue: queue.slice(queueIndex),
          focusItemsLabel: networkRack('positiveFlow'),
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: i18nText(I18N.descriptions.attach, { node: targetLabel }),
          activeCodeLine: 5,
          phase: 'relax',
          computation: {
            label: i18nText(C.parentUpdate),
            expression: `${targetLabel} ← ${labelById.get(currentNodeId) ?? currentNodeId}`,
            result: i18nText(C.levelValue, { level: level.get(targetId) ?? 0 }),
            decision: i18nText(TEXT.parentRecorded),
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
        phaseLabel: i18nText(I18N.phases.complete, { round: bfsRound }),
        statusLabel: i18nText(I18N.statuses.unreachable),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkFrontier('residualBfs'),
        queueLabel: networkRack('residualQueue'),
        queue: [],
        focusItemsLabel: networkRack('finalPositiveFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.complete),
        activeCodeLine: 9,
        phase: 'graph-complete',
        computation: {
          label: i18nText(C.reachability),
          expression: i18nText(TEXT.sinkNotInTree, { node: labelById.get(scenario.sinkId) ?? scenario.sinkId }),
          result: i18nText(C.maxFlow, { flow: totalFlow }),
          decision: i18nText(C.noAugmentingPath),
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
      phaseLabel: i18nText(I18N.phases.augment, { round: bfsRound }),
      statusLabel: i18nText(I18N.statuses.pathFound),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkFrontier('augmentPath'),
      queueLabel: networkRack('residualQueue'),
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.pathFound),
      activeCodeLine: 7,
      computation: {
        label: i18nText(C.bottleneck),
        expression: `min(${pathEdges.map((edge) => residualCapacity(edge, flow)).join(', ')})`,
        result: String(bottleneck),
        decision: i18nText(TEXT.bottleneckLimit),
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
      phaseLabel: i18nText(I18N.phases.augment, { round: bfsRound }),
      statusLabel: i18nText(I18N.statuses.pushed),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkRack('positiveFlow'),
      queueLabel: networkRack('residualQueue'),
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.augment),
      activeCodeLine: 8,
      phase: 'relax',
      computation: {
        label: i18nText(C.flowUpdate),
        expression: `${totalFlow - bottleneck} + ${bottleneck}`,
        result: String(totalFlow),
        decision: i18nText(TEXT.freshBfs),
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: DinicScenario;
  readonly flow: ReadonlyMap<string, number>;
  readonly level: ReadonlyMap<string, number>;
  readonly parentEdgeByNode: ReadonlyMap<string, LayeredNetworkEdge>;
  readonly phaseLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly frontierLabel: TranslatableText;
  readonly queueLabel: TranslatableText;
  readonly queue: readonly string[];
  readonly focusItemsLabel: TranslatableText;
  readonly focusItems: readonly string[];
  readonly description: TranslatableText;
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
