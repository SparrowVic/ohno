import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.connectedComponents.descriptions.initialize'),
    seed: t('features.algorithms.runtime.graph.connectedComponents.descriptions.seed'),
    expand: t('features.algorithms.runtime.graph.connectedComponents.descriptions.expand'),
    inspect: t('features.algorithms.runtime.graph.connectedComponents.descriptions.inspect'),
    skip: t('features.algorithms.runtime.graph.connectedComponents.descriptions.skip'),
    assign: t('features.algorithms.runtime.graph.connectedComponents.descriptions.assign'),
    close: t('features.algorithms.runtime.graph.connectedComponents.descriptions.close'),
    complete: t('features.algorithms.runtime.graph.connectedComponents.descriptions.complete'),
  },
  results: {
    unassigned: t('features.algorithms.runtime.graph.connectedComponents.results.unassigned'),
  },
  phases: {
    seed: t('features.algorithms.runtime.graph.connectedComponents.phases.seed'),
    inspect: t('features.algorithms.runtime.graph.connectedComponents.phases.inspect'),
    assign: t('features.algorithms.runtime.graph.connectedComponents.phases.assign'),
    keep: t('features.algorithms.runtime.graph.connectedComponents.phases.keep'),
    close: t('features.algorithms.runtime.graph.connectedComponents.phases.close'),
    complete: t('features.algorithms.runtime.graph.connectedComponents.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.connectedComponents.phases.initialize'),
  },
} as const;

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
    description: i18nText(I18N.descriptions.initialize),
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
      description: i18nText(I18N.descriptions.seed, { component: activeComponent, node: labelOf(labelMap, node.id) }),
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
        description: i18nText(I18N.descriptions.expand, { node: labelOf(labelMap, currentNodeId), component: activeComponent }),
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
          description: i18nText(I18N.descriptions.inspect, { from: labelOf(labelMap, currentNodeId), to: labelOf(labelMap, neighborId) }),
          activeCodeLine: 8,
          phase: 'inspect-edge',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `component C${activeComponent}`,
            result: neighborComponent === null ? i18nText(I18N.results.unassigned) : `C${neighborComponent}`,
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
            description: i18nText(I18N.descriptions.skip, { node: labelOf(labelMap, neighborId), component: neighborComponent }),
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
          description: i18nText(I18N.descriptions.assign, { node: labelOf(labelMap, neighborId), component: activeComponent }),
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
        description: i18nText(I18N.descriptions.close, { node: labelOf(labelMap, currentNodeId), component: activeComponent }),
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
    description: i18nText(I18N.descriptions.complete, { count: activeComponent }),
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
  readonly description: TranslatableText;
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
      phaseLabel: i18nText(phaseLabel(args.phase)),
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
      return I18N.phases.seed;
    case 'inspect-edge':
      return I18N.phases.inspect;
    case 'relax':
      return I18N.phases.assign;
    case 'skip-relax':
      return I18N.phases.keep;
    case 'settle-node':
      return I18N.phases.close;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
}
