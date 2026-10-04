import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { GraphComputation, WeightedGraphData } from '../models/graph';
import { SortStep } from '../models/sort-step';
import { createSccStep } from './scc-step';
import { graphLabel } from './graph-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.graph.tarjan;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.tarjan.descriptions.initialize'),
    seed: t('features.algorithms.runtime.graph.tarjan.descriptions.seed'),
    complete: t('features.algorithms.runtime.graph.tarjan.descriptions.complete'),
    open: t('features.algorithms.runtime.graph.tarjan.descriptions.open'),
    inspect: t('features.algorithms.runtime.graph.tarjan.descriptions.inspect'),
    descend: t('features.algorithms.runtime.graph.tarjan.descriptions.descend'),
    propagate: t('features.algorithms.runtime.graph.tarjan.descriptions.propagate'),
    backEdge: t('features.algorithms.runtime.graph.tarjan.descriptions.backEdge'),
    assigned: t('features.algorithms.runtime.graph.tarjan.descriptions.assigned'),
    emit: t('features.algorithms.runtime.graph.tarjan.descriptions.emit'),
    stay: t('features.algorithms.runtime.graph.tarjan.descriptions.stay'),
  },
  results: {
    visitChild: t('features.algorithms.runtime.graph.tarjan.results.visitChild'),
    assigned: t('features.algorithms.runtime.graph.tarjan.results.assigned'),
    unseen: t('features.algorithms.runtime.graph.tarjan.results.unseen'),
    onStack: t('features.algorithms.runtime.graph.tarjan.results.onStack'),
    closedScc: t('features.algorithms.runtime.graph.tarjan.results.closedScc'),
  },
  phases: {
    open: t('features.algorithms.runtime.graph.tarjan.phases.open'),
    inspect: t('features.algorithms.runtime.graph.tarjan.phases.inspect'),
    descend: t('features.algorithms.runtime.graph.tarjan.phases.descend'),
    backEdge: t('features.algorithms.runtime.graph.tarjan.phases.backEdge'),
    close: t('features.algorithms.runtime.graph.tarjan.phases.close'),
    complete: t('features.algorithms.runtime.graph.tarjan.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.tarjan.phases.initialize'),
  },
} as const;

export function* tarjanSccGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const indexMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const lowMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const componentMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const onStack = new Set<string>();
  const assigned = new Set<string>();
  const tarjanStack: string[] = [];
  const componentOrder: string[] = [];
  let currentSeedId = graph.sourceId;
  let index = 0;
  let componentCount = 0;

  yield createStep({
    graph,
    indexMap,
    lowMap,
    previousMap,
    componentMap,
    assigned,
    tarjanStack,
    componentOrder,
    currentSeedId,
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 2,
    phase: 'init',
  });

  for (const node of graph.nodes) {
    if (indexMap.get(node.id) !== null) continue;

    currentSeedId = node.id;
    yield createStep({
      graph,
      indexMap,
      lowMap,
      previousMap,
      componentMap,
      assigned,
      tarjanStack,
      componentOrder,
      currentSeedId,
      currentNodeId: node.id,
      description: i18nText(I18N.descriptions.seed, { node: labelOf(labelMap, node.id) }),
      activeCodeLine: 4,
      phase: 'pick-node',
    });

    yield* strongConnect(node.id);
  }

  yield createStep({
    graph,
    indexMap,
    lowMap,
    previousMap,
    componentMap,
    assigned,
    tarjanStack,
    componentOrder,
    currentSeedId,
    description: i18nText(I18N.descriptions.complete, { count: componentCount }),
    activeCodeLine: 18,
    phase: 'graph-complete',
  });

  function* strongConnect(nodeId: string): Generator<SortStep> {
    index += 1;
    indexMap.set(nodeId, index);
    lowMap.set(nodeId, index);
    tarjanStack.push(nodeId);
    onStack.add(nodeId);

    yield createStep({
      graph,
      indexMap,
      lowMap,
      previousMap,
      componentMap,
      assigned,
      tarjanStack,
      componentOrder,
      currentSeedId,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.open, { index, node: labelOf(labelMap, nodeId) }),
      activeCodeLine: 6,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, nodeId)) {
      const neighborId = edge.to;
      const neighborLabel = labelOf(labelMap, neighborId);

      yield createStep({
        graph,
        indexMap,
        lowMap,
        previousMap,
        componentMap,
        assigned,
        tarjanStack,
        componentOrder,
        currentSeedId,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspect, { from: labelOf(labelMap, nodeId), to: neighborLabel }),
        activeCodeLine: 8,
        phase: 'inspect-edge',
        computation: inspectionComputation(neighborId),
      });

      if (indexMap.get(neighborId) === null) {
        previousMap.set(neighborId, nodeId);

        yield createStep({
          graph,
          indexMap,
          lowMap,
          previousMap,
          componentMap,
          assigned,
          tarjanStack,
          componentOrder,
          currentSeedId,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: i18nText(I18N.descriptions.descend, { node: neighborLabel }),
          activeCodeLine: 10,
          phase: 'relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `index[${neighborLabel}] = ∅`,
            result: i18nText(I18N.results.visitChild),
            decision: i18nText(TEXT.decisions.treeEdge),
          },
        });

        yield* strongConnect(neighborId);

        const updatedLow = Math.min(lowMap.get(nodeId) ?? Number.POSITIVE_INFINITY, lowMap.get(neighborId) ?? Number.POSITIVE_INFINITY);
        lowMap.set(nodeId, updatedLow);

        yield createStep({
          graph,
          indexMap,
          lowMap,
          previousMap,
          componentMap,
          assigned,
          tarjanStack,
          componentOrder,
          currentSeedId,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.propagate, { child: neighborLabel, node: labelOf(labelMap, nodeId) }),
          activeCodeLine: 11,
          phase: 'settle-node',
          computation: {
            candidateLabel: neighborLabel,
            expression: `min(${indexOrDash(lowMap, nodeId)}, ${indexOrDash(lowMap, neighborId)})`,
            result: String(updatedLow),
            decision: i18nText(RUNTIME_KEY.graph.common.lowLinkPropagated),
          },
        });
        continue;
      }

      if (onStack.has(neighborId)) {
        const updatedLow = Math.min(lowMap.get(nodeId) ?? Number.POSITIVE_INFINITY, indexMap.get(neighborId) ?? Number.POSITIVE_INFINITY);
        lowMap.set(nodeId, updatedLow);

        yield createStep({
          graph,
          indexMap,
          lowMap,
          previousMap,
          componentMap,
          assigned,
          tarjanStack,
          componentOrder,
          currentSeedId,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.backEdge, { child: neighborLabel, node: labelOf(labelMap, nodeId) }),
          activeCodeLine: 13,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `min(${indexOrDash(lowMap, nodeId)}, ${indexOrDash(indexMap, neighborId)})`,
            result: String(updatedLow),
            decision: i18nText(TEXT.decisions.backEdgeInside),
          },
        });
        continue;
      }

      yield createStep({
        graph,
        indexMap,
        lowMap,
        previousMap,
        componentMap,
        assigned,
        tarjanStack,
        componentOrder,
        currentSeedId,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.assigned, { node: neighborLabel }),
        activeCodeLine: 14,
        phase: 'skip-relax',
        computation: {
          candidateLabel: neighborLabel,
          expression: `component = ${componentLabel(componentMap.get(neighborId))}`,
          result: i18nText(I18N.results.assigned),
          decision: i18nText(RUNTIME_KEY.graph.common.ignoreFinishedScc),
        },
      });
    }

    if (lowMap.get(nodeId) === indexMap.get(nodeId)) {
      componentCount += 1;
      const members: string[] = [];

      while (tarjanStack.length > 0) {
        const popped = tarjanStack.pop()!;
        onStack.delete(popped);
        assigned.add(popped);
        componentMap.set(popped, componentCount);
        members.push(popped);
        if (popped === nodeId) break;
      }

      const summary = summarizeComponent(componentCount, members, labelMap);
      componentOrder.push(summary);

      yield createStep({
        graph,
        indexMap,
        lowMap,
        previousMap,
        componentMap,
        assigned,
        tarjanStack,
        componentOrder,
        currentSeedId,
        currentNodeId: nodeId,
        description: i18nText(I18N.descriptions.emit, { node: labelOf(labelMap, nodeId), component: summary }),
        activeCodeLine: 16,
        phase: 'settle-node',
        computation: {
          candidateLabel: labelOf(labelMap, nodeId),
          expression: `low = index = ${indexOrDash(indexMap, nodeId)}`,
          result: summary,
          decision: i18nText(RUNTIME_KEY.graph.common.emitScc),
        },
      });
      return;
    }

    yield createStep({
      graph,
      indexMap,
      lowMap,
      previousMap,
      componentMap,
      assigned,
      tarjanStack,
      componentOrder,
      currentSeedId,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.stay, { node: labelOf(labelMap, nodeId) }),
      activeCodeLine: 17,
      phase: 'settle-node',
    });
  }

  function inspectionComputation(neighborId: string): GraphComputation {
    const neighborLabel = labelOf(labelMap, neighborId);
    if (indexMap.get(neighborId) === null) {
      return {
        candidateLabel: neighborLabel,
        expression: `index[${neighborLabel}] = ∅`,
        result: i18nText(I18N.results.unseen),
        decision: i18nText(TEXT.decisions.visitChild),
      };
    }

    if (onStack.has(neighborId)) {
      return {
        candidateLabel: neighborLabel,
        expression: `index = ${indexOrDash(indexMap, neighborId)}`,
        result: i18nText(I18N.results.onStack),
        decision: i18nText(TEXT.decisions.useBackEdge),
      };
    }

    return {
      candidateLabel: neighborLabel,
      expression: componentLabel(componentMap.get(neighborId)),
      result: i18nText(I18N.results.closedScc),
      decision: i18nText(TEXT.decisions.ignoreAssigned),
    };
  }
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly indexMap: ReadonlyMap<string, number | null>;
  readonly lowMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly componentMap: ReadonlyMap<string, number | null>;
  readonly assigned: ReadonlySet<string>;
  readonly tarjanStack: readonly string[];
  readonly componentOrder: readonly string[];
  readonly currentSeedId: string;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const secondaryMap = new Map<string, string | null>(
    args.graph.nodes.map((node) => {
      const low = args.lowMap.get(node.id);
      const component = args.componentMap.get(node.id);
      const fragments: string[] = [];
      if (low !== null) fragments.push(`L${low}`);
      if (component !== null) fragments.push(`S${component}`);
      return [node.id, fragments.length > 0 ? fragments.join(' · ') : null];
    }),
  );

  return createSccStep({
    graph: args.graph,
    sourceId: args.currentSeedId,
    indexMap: args.indexMap,
    secondaryMap,
    previousMap: args.previousMap,
    settled: args.assigned,
    frontierOrder: [...args.tarjanStack].reverse(),
    visitOrder: [...args.componentOrder],
    metricLabel: graphLabel('index'),
    secondaryLabel: graphLabel('lowScc'),
    frontierLabel: graphLabel('tarjanStack'),
    frontierHeadLabel: graphLabel('stackTop'),
    completionLabel: graphLabel('assigned'),
    frontierStatusLabel: graphLabel('statusStacked'),
    completionStatusLabel: graphLabel('statusAssigned'),
    detailLabel: graphLabel('tarjanSccMap'),
    detailValue: summarizeAllComponents(args.componentOrder),
    visitOrderLabel: graphLabel('sccOrder'),
    phaseLabel: i18nText(phaseLabel(args.phase)),
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    componentMap: args.componentMap,
    currentNodeId: args.currentNodeId,
    activeEdgeId: args.activeEdgeId,
    relaxedEdgeId: args.relaxedEdgeId,
    computation: args.computation ?? null,
  });
}

function outgoingEdges(graph: WeightedGraphData, nodeId: string) {
  return graph.edges
    .filter((edge) => edge.from === nodeId)
    .sort((left, right) => left.to.localeCompare(right.to));
}

function labelOf(nodes: ReadonlyMap<string, string>, nodeId: string): string {
  return nodes.get(nodeId) ?? nodeId;
}

function summarizeComponent(
  componentId: number,
  members: readonly string[],
  labelMap: ReadonlyMap<string, string>,
): string {
  const labels = [...members].map((nodeId) => labelOf(labelMap, nodeId)).sort();
  return `S${componentId}: ${labels.join(', ')}`;
}

function summarizeAllComponents(componentOrder: readonly string[]): TranslatableText {
  return componentOrder.length > 0 ? componentOrder.join(' · ') : i18nText(RUNTIME_KEY.graph.common.noSccClosed);
}

function indexOrDash(map: ReadonlyMap<string, number | null>, nodeId: string): string {
  const value = map.get(nodeId);
  return value === null ? '∅' : String(value);
}

function componentLabel(componentId: number | null | undefined): string {
  return componentId == null ? 'S—' : `S${componentId}`;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return I18N.phases.open;
    case 'inspect-edge':
      return I18N.phases.inspect;
    case 'relax':
      return I18N.phases.descend;
    case 'skip-relax':
      return I18N.phases.backEdge;
    case 'settle-node':
      return I18N.phases.close;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
}
