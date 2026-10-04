import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { LayeredNetworkEdge, MinCostMaxFlowScenario } from '../utils/scenarios/network/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';
import { networkFrontier, networkRack } from './network-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const C = RUNTIME_KEY.network.common.computation;
const TEXT = RUNTIME_KEY.network.minCostMaxFlow.computation;

const I18N = {
  phases: {
    initialize: t('features.algorithms.runtime.network.minCostMaxFlow.phases.initialize'),
    costPath: t('features.algorithms.runtime.network.minCostMaxFlow.phases.costPath'),
    relax: t('features.algorithms.runtime.network.minCostMaxFlow.phases.relax'),
    complete: t('features.algorithms.runtime.network.minCostMaxFlow.phases.complete'),
    augment: t('features.algorithms.runtime.network.minCostMaxFlow.phases.augment'),
  },
  statuses: {
    zeroFlow: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.zeroFlow'),
    seed: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.seed'),
    inspect: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.inspect'),
    updated: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.updated'),
    unreachable: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.unreachable'),
    routeFound: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.routeFound'),
    committed: t('features.algorithms.runtime.network.minCostMaxFlow.statuses.committed'),
  },
  results: {
    zero: t('features.algorithms.runtime.network.minCostMaxFlow.results.zero'),
    flowCost: t('features.algorithms.runtime.network.minCostMaxFlow.results.flowCost'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.initialize'),
    seed: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.seed'),
    inspect: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.inspect'),
    updated: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.updated'),
    complete: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.complete'),
    routeFound: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.routeFound'),
    augment: t('features.algorithms.runtime.network.minCostMaxFlow.descriptions.augment'),
  },
} as const;

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
    phaseLabel: i18nText(I18N.phases.initialize),
    statusLabel: i18nText(I18N.statuses.zeroFlow),
    resultLabel: i18nText(I18N.results.zero),
    frontierLabel: networkFrontier('shortestCostFrontier'),
    queueLabel: networkRack('costScan'),
    queue: [],
    focusItemsLabel: networkRack('committedFlow'),
    focusItems: [],
    description: i18nText(I18N.descriptions.initialize),
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
      phaseLabel: i18nText(I18N.phases.costPath, { round }),
      statusLabel: i18nText(I18N.statuses.seed),
      resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
      frontierLabel: networkFrontier('shortestCostFrontier'),
      queueLabel: networkRack('costScan'),
      queue: [scenario.sourceId],
      focusItemsLabel: networkRack('committedFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.seed),
      activeCodeLine: 3,
      computation: {
        label: i18nText(TEXT.sourceCost),
        expression: `${labelById.get(scenario.sourceId) ?? scenario.sourceId} = 0`,
        result: i18nText(TEXT.ready),
        decision: i18nText(TEXT.minimizeCost),
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
          phaseLabel: i18nText(I18N.phases.relax, { pass: pass + 1 }),
          statusLabel: i18nText(I18N.statuses.inspect),
          resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
          frontierLabel: networkFrontier('shortestCostFrontier'),
          queueLabel: networkRack('costScan'),
          queue: [...activeFrontier],
          focusItemsLabel: networkRack('committedFlow'),
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: i18nText(I18N.descriptions.inspect, { via: labelById.get(edge.fromId) ?? edge.fromId, node: labelById.get(edge.toId) ?? edge.toId }),
          activeCodeLine: 4,
          phase: 'inspect-edge',
          computation: {
            label: i18nText(TEXT.costRelaxation),
            expression: `${fromDistance} + ${edgeCost}`,
            result: String(candidateCost),
            decision:
              residual <= 0
                ? i18nText(C.residualZero)
                : improves
                  ? i18nText(RUNTIME_KEY.graph.common.betterThan, { value: currentCost ?? '∞' })
                  : i18nText(RUNTIME_KEY.graph.common.keep, { value: currentCost }),
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
          phaseLabel: i18nText(I18N.phases.relax, { pass: pass + 1 }),
          statusLabel: i18nText(I18N.statuses.updated),
          resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
          frontierLabel: networkFrontier('shortestCostFrontier'),
          queueLabel: networkRack('costScan'),
          queue: [...activeFrontier],
          focusItemsLabel: networkRack('committedFlow'),
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: i18nText(I18N.descriptions.updated, { node: labelById.get(edge.toId) ?? edge.toId }),
          activeCodeLine: 5,
          phase: 'relax',
          computation: {
            label: i18nText(C.parentUpdate),
            expression: `${labelById.get(edge.toId) ?? edge.toId} ← ${labelById.get(edge.fromId) ?? edge.fromId}`,
            result: String(candidateCost),
            decision: i18nText(TEXT.costUpdated),
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
        phaseLabel: i18nText(I18N.phases.complete, { round }),
        statusLabel: i18nText(I18N.statuses.unreachable),
        resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
        frontierLabel: networkFrontier('residualCheapestPath'),
        queueLabel: networkRack('costScan'),
        queue: [],
        focusItemsLabel: networkRack('finalCommittedFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.complete),
        activeCodeLine: 8,
        phase: 'graph-complete',
        computation: {
          label: i18nText(C.reachability),
          expression: i18nText(TEXT.noPredecessor, { node: labelById.get(scenario.sinkId) ?? scenario.sinkId }),
          result: i18nText(TEXT.flowCost, { flow: totalFlow, cost: totalCost }),
          decision: i18nText(C.noAugmentingPath),
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
      phaseLabel: i18nText(I18N.phases.augment, { round }),
      statusLabel: i18nText(I18N.statuses.routeFound),
      resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
      frontierLabel: networkFrontier('augmentRoute'),
      queueLabel: networkRack('costScan'),
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: networkRack('committedFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.routeFound),
      activeCodeLine: 6,
      computation: {
        label: i18nText(TEXT.routePrice),
        expression: `${pathEdges.map((edge) => edge.cost ?? 0).join(' + ')} × ${bottleneck}`,
        result: String(pathTotalCost),
        decision: i18nText(TEXT.unitCost, { unit: pathUnitCost, bottleneck }),
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
      phaseLabel: i18nText(I18N.phases.augment, { round }),
      statusLabel: i18nText(I18N.statuses.committed),
      resultLabel: i18nText(I18N.results.flowCost, { flow: totalFlow, cost: totalCost }),
      frontierLabel: networkRack('committedFlow'),
      queueLabel: networkRack('costScan'),
      queue: [],
      activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
      focusItemsLabel: networkRack('committedFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.augment),
      activeCodeLine: 7,
      phase: 'relax',
      computation: {
        label: i18nText(TEXT.totalCost),
        expression: `${totalCost - pathTotalCost} + ${pathTotalCost}`,
        result: String(totalCost),
        decision: i18nText(TEXT.newBaseline),
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: MinCostMaxFlowScenario;
  readonly flow: ReadonlyMap<string, number>;
  readonly distanceByNode: ReadonlyMap<string, number>;
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
