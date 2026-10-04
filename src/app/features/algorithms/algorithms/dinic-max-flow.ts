import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { DinicScenario, LayeredNetworkEdge, LayeredNetworkNode } from '../utils/scenarios/network/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';
import { networkFrontier, networkRack } from './network-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const C = RUNTIME_KEY.network.common.computation;
const TEXT = RUNTIME_KEY.network.dinic.computation;

const I18N = {
  phases: {
    initialize: t('features.algorithms.runtime.network.dinic.phases.initialize'),
    bfs: t('features.algorithms.runtime.network.dinic.phases.bfs'),
    complete: t('features.algorithms.runtime.network.dinic.phases.complete'),
    blocking: t('features.algorithms.runtime.network.dinic.phases.blocking'),
    phaseDone: t('features.algorithms.runtime.network.dinic.phases.phaseDone'),
  },
  statuses: {
    zeroFlow: t('features.algorithms.runtime.network.dinic.statuses.zeroFlow'),
    seed: t('features.algorithms.runtime.network.dinic.statuses.seed'),
    expand: t('features.algorithms.runtime.network.dinic.statuses.expand'),
    inspect: t('features.algorithms.runtime.network.dinic.statuses.inspect'),
    unreachable: t('features.algorithms.runtime.network.dinic.statuses.unreachable'),
    levelGraph: t('features.algorithms.runtime.network.dinic.statuses.levelGraph'),
    pathFound: t('features.algorithms.runtime.network.dinic.statuses.pathFound'),
    pushed: t('features.algorithms.runtime.network.dinic.statuses.pushed'),
    blockingAdded: t('features.algorithms.runtime.network.dinic.statuses.blockingAdded'),
  },
  results: {
    maxFlowZero: t('features.algorithms.runtime.network.dinic.results.maxFlowZero'),
    maxFlow: t('features.algorithms.runtime.network.dinic.results.maxFlow'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.network.dinic.descriptions.initialize'),
    seed: t('features.algorithms.runtime.network.dinic.descriptions.seed'),
    expand: t('features.algorithms.runtime.network.dinic.descriptions.expand'),
    inspect: t('features.algorithms.runtime.network.dinic.descriptions.inspect'),
    complete: t('features.algorithms.runtime.network.dinic.descriptions.complete'),
    levelGraph: t('features.algorithms.runtime.network.dinic.descriptions.levelGraph'),
    pathFound: t('features.algorithms.runtime.network.dinic.descriptions.pathFound'),
    augment: t('features.algorithms.runtime.network.dinic.descriptions.augment'),
    phaseDone: t('features.algorithms.runtime.network.dinic.descriptions.phaseDone'),
  },
} as const;

export function* dinicMaxFlowGenerator(scenario: DinicScenario): Generator<SortStep> {
  const flow = new Map<string, number>(scenario.edges.map((edge) => [edge.id, 0]));
  const adjacency = buildAdjacency(scenario);
  const labelById = new Map(scenario.nodes.map((node) => [node.id, node.label]));
  let totalFlow = 0;
  let phaseIndex = 0;

  yield createSnapshot({
    scenario,
    flow,
    level: new Map(),
    phaseLabel: i18nText(I18N.phases.initialize),
    statusLabel: i18nText(I18N.statuses.zeroFlow),
    resultLabel: i18nText(I18N.results.maxFlowZero),
    frontierLabel: networkFrontier('bfsFrontier'),
    queueLabel: networkRack('levelQueue'),
    queue: [],
    focusItemsLabel: networkRack('positiveFlow'),
    focusItems: [],
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    phaseIndex += 1;
    const level = new Map<string, number>();
    const queue: string[] = [scenario.sourceId];
    level.set(scenario.sourceId, 0);

    yield createSnapshot({
      scenario,
      flow,
      level,
      frontierIds: new Set(queue),
      phaseLabel: i18nText(I18N.phases.bfs, { phase: phaseIndex }),
      statusLabel: i18nText(I18N.statuses.seed),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkFrontier('bfsFrontier'),
      queueLabel: networkRack('levelQueue'),
      queue,
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.seed),
      activeCodeLine: 3,
      computation: {
        label: i18nText(C.startLevel),
        expression: `${labelById.get(scenario.sourceId) ?? scenario.sourceId} = 0`,
        result: i18nText(C.residualBfsReady),
        decision: i18nText(TEXT.rebuild),
      },
    });

    let queueIndex = 0;
    while (queueIndex < queue.length) {
      const currentNodeId = queue[queueIndex++]!;

      yield createSnapshot({
        scenario,
        flow,
        level,
        currentNodeId,
        frontierIds: new Set(queue.slice(queueIndex)),
        phaseLabel: i18nText(I18N.phases.bfs, { phase: phaseIndex }),
        statusLabel: i18nText(I18N.statuses.expand),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkFrontier('bfsFrontier'),
        queueLabel: networkRack('levelQueue'),
        queue: queue.slice(queueIndex),
        focusItemsLabel: networkRack('positiveFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.expand, { node: labelById.get(currentNodeId) ?? currentNodeId }),
        activeCodeLine: 4,
      });

      for (const edge of adjacency.get(currentNodeId) ?? []) {
        const residual = residualCapacity(edge, flow);
        const targetId = edge.toId;
        let decision: TranslatableText = i18nText(residual > 0 ? TEXT.residualPositive : C.residualZeroBfs);
        if (residual > 0 && !level.has(targetId)) {
          decision = i18nText(TEXT.entersLayer, { node: labelById.get(targetId) ?? targetId });
        }

        yield createSnapshot({
          scenario,
          flow,
          level,
          currentNodeId,
          frontierIds: new Set(queue.slice(queueIndex)),
          activeEdgeId: edge.id,
          phaseLabel: i18nText(I18N.phases.bfs, { phase: phaseIndex }),
          statusLabel: i18nText(I18N.statuses.inspect),
          resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
          frontierLabel: networkFrontier('bfsFrontier'),
          queueLabel: networkRack('levelQueue'),
          queue: queue.slice(queueIndex),
          focusItemsLabel: networkRack('positiveFlow'),
          focusItems: positiveFlowLabels(scenario, flow, labelById),
          description: i18nText(I18N.descriptions.inspect, { from: labelById.get(currentNodeId) ?? currentNodeId, to: labelById.get(targetId) ?? targetId }),
          activeCodeLine: 4,
          computation: {
            label: i18nText(C.residualCapacity),
            expression: `${edge.capacity ?? 0} - ${flow.get(edge.id) ?? 0}`,
            result: String(residual),
            decision,
          },
        });

        if (residual <= 0 || level.has(targetId)) {
          continue;
        }

        level.set(targetId, (level.get(currentNodeId) ?? 0) + 1);
        queue.push(targetId);
      }
    }

    if (!level.has(scenario.sinkId)) {
      yield createSnapshot({
        scenario,
        flow,
        level,
        phaseLabel: i18nText(I18N.phases.complete, { phase: phaseIndex }),
        statusLabel: i18nText(I18N.statuses.unreachable),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkFrontier('residualBfs'),
        queueLabel: networkRack('levelQueue'),
        queue: [],
        focusItemsLabel: networkRack('finalPositiveFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.complete),
        activeCodeLine: 10,
        phase: 'graph-complete',
        computation: {
          label: i18nText(C.reachability),
          expression: i18nText(TEXT.sinkNotInLevel, { node: labelById.get(scenario.sinkId) ?? scenario.sinkId }),
          result: i18nText(C.maxFlow, { flow: totalFlow }),
          decision: i18nText(TEXT.noPathResidual),
        },
      });
      return;
    }

    const candidateEdgeIds = admissibleEdgeIds(scenario, level, flow);
    yield createSnapshot({
      scenario,
      flow,
      level,
      candidateEdgeIds,
      phaseLabel: i18nText(I18N.phases.blocking, { phase: phaseIndex }),
      statusLabel: i18nText(I18N.statuses.levelGraph),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkFrontier('admissibleEdges'),
      queueLabel: networkRack('levelQueue'),
      queue: [],
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.levelGraph),
      activeCodeLine: 5,
      computation: {
        label: i18nText(C.levelGraph),
        expression: i18nText(C.admissibleEdges, { count: candidateEdgeIds.size }),
        result: i18nText(C.flowValue, { flow: totalFlow }),
        decision: i18nText(TEXT.sendBlocking),
      },
    });

    let pushedThisPhase = 0;
    while (true) {
      const path = findAdmissiblePath(scenario.sourceId, scenario.sinkId, adjacency, level, flow);
      if (!path) {
        break;
      }

      const bottleneck = Math.min(...path.map((edge) => residualCapacity(edge, flow)));
      const pathNodeIds = edgePathToNodeIds(scenario.sourceId, path);
      const pathEdgeIds = new Set(path.map((edge) => edge.id));

      yield createSnapshot({
        scenario,
        flow,
        level,
        candidateEdgeIds,
        activePathNodeIds: new Set(pathNodeIds),
        activePathEdgeIds: pathEdgeIds,
        phaseLabel: i18nText(I18N.phases.blocking, { phase: phaseIndex }),
        statusLabel: i18nText(I18N.statuses.pathFound),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkFrontier('admissiblePath'),
        queueLabel: networkRack('levelQueue'),
        queue: [],
        activeRouteLabel: labelsFor(pathNodeIds, labelById).join(' → '),
        focusItemsLabel: networkRack('positiveFlow'),
        focusItems: positiveFlowLabels(scenario, flow, labelById),
        description: i18nText(I18N.descriptions.pathFound),
        activeCodeLine: 7,
        computation: {
          label: i18nText(C.bottleneck),
          expression: `min(${path.map((edge) => residualCapacity(edge, flow)).join(', ')})`,
          result: String(bottleneck),
          decision: i18nText(TEXT.smallestLimits),
        },
      });

      for (const edge of path) {
        flow.set(edge.id, (flow.get(edge.id) ?? 0) + bottleneck);
      }
      totalFlow += bottleneck;
      pushedThisPhase += bottleneck;

      yield createSnapshot({
        scenario,
        flow,
        level,
        candidateEdgeIds: admissibleEdgeIds(scenario, level, flow),
        activePathNodeIds: new Set(pathNodeIds),
        activePathEdgeIds: pathEdgeIds,
        phaseLabel: i18nText(I18N.phases.blocking, { phase: phaseIndex }),
        statusLabel: i18nText(I18N.statuses.pushed),
        resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
        frontierLabel: networkRack('positiveFlow'),
        queueLabel: networkRack('levelQueue'),
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
          decision: i18nText(TEXT.repeat),
        },
      });
    }

    yield createSnapshot({
      scenario,
      flow,
      level,
      phaseLabel: i18nText(I18N.phases.phaseDone, { phase: phaseIndex }),
      statusLabel: i18nText(I18N.statuses.blockingAdded, { flow: pushedThisPhase }),
      resultLabel: i18nText(I18N.results.maxFlow, { flow: totalFlow }),
      frontierLabel: networkRack('positiveFlow'),
      queueLabel: networkRack('levelQueue'),
      queue: [],
      focusItemsLabel: networkRack('positiveFlow'),
      focusItems: positiveFlowLabels(scenario, flow, labelById),
      description: i18nText(I18N.descriptions.phaseDone),
      activeCodeLine: 9,
      phase: 'pass-complete',
      computation: {
        label: i18nText(C.phaseGain),
        expression: `+${pushedThisPhase}`,
        result: i18nText(C.flowValue, { flow: totalFlow }),
        decision: i18nText(TEXT.blockingExhausts),
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: DinicScenario;
  readonly flow: ReadonlyMap<string, number>;
  readonly level: ReadonlyMap<string, number>;
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
  readonly blockedEdgeIds?: ReadonlySet<string>;
  readonly computation?: NetworkComputation | null;
}): SortStep {
  const labelById = new Map(args.scenario.nodes.map((node) => [node.id, node.label]));
  const nodeState = new Map<string, NetworkStepNodeState>();
  for (const node of args.scenario.nodes) {
    const level = args.level.get(node.id) ?? null;
    const admissibleOutgoing = args.scenario.edges.filter(
      (edge) => edge.fromId === node.id && residualCapacity(edge, args.flow) > 0 && (args.level.get(edge.toId) ?? -1) === (level ?? -2) + 1,
    ).length;
    const hasPositiveFlow = args.scenario.edges.some(
      (edge) => edge.fromId === node.id || edge.toId === node.id ? (args.flow.get(edge.id) ?? 0) > 0 : false,
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
            : level !== null
              ? `out ${admissibleOutgoing}`
              : hasPositiveFlow
                ? 'carrying flow'
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
              : args.blockedEdgeIds?.has(edge.id)
                ? 'blocked'
                : args.candidateEdgeIds?.has(edge.id)
                  ? 'candidate'
                  : 'base',
    };
  });

  return createNetworkStep({
    mode: 'dinic',
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
  return map;
}

function admissibleEdgeIds(
  scenario: DinicScenario,
  level: ReadonlyMap<string, number>,
  flow: ReadonlyMap<string, number>,
): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const edge of scenario.edges) {
    if (residualCapacity(edge, flow) <= 0) continue;
    if ((level.get(edge.toId) ?? -1) === (level.get(edge.fromId) ?? -2) + 1) {
      ids.add(edge.id);
    }
  }
  return ids;
}

function findAdmissiblePath(
  currentId: string,
  sinkId: string,
  adjacency: ReadonlyMap<string, readonly LayeredNetworkEdge[]>,
  level: ReadonlyMap<string, number>,
  flow: ReadonlyMap<string, number>,
): readonly LayeredNetworkEdge[] | null {
  if (currentId === sinkId) {
    return [];
  }

  for (const edge of adjacency.get(currentId) ?? []) {
    if (residualCapacity(edge, flow) <= 0) continue;
    if ((level.get(edge.toId) ?? -1) !== (level.get(currentId) ?? -2) + 1) continue;
    const suffix = findAdmissiblePath(edge.toId, sinkId, adjacency, level, flow);
    if (suffix) {
      return [edge, ...suffix];
    }
  }

  return null;
}

function edgePathToNodeIds(sourceId: string, path: readonly LayeredNetworkEdge[]): readonly string[] {
  const ids: string[] = [sourceId];
  for (const edge of path) {
    ids.push(edge.toId);
  }
  return ids;
}

function residualCapacity(edge: LayeredNetworkEdge, flow: ReadonlyMap<string, number>): number {
  return Math.max(0, (edge.capacity ?? 0) - (flow.get(edge.id) ?? 0));
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
      return `${labelById.get(edge.fromId) ?? edge.fromId}→${labelById.get(edge.toId) ?? edge.toId} ${currentFlow}/${edge.capacity ?? 0}`;
    });
}

function labelsFor(path: readonly string[], labelById: ReadonlyMap<string, string>): readonly string[] {
  return path.map((id) => labelById.get(id) ?? id);
}
