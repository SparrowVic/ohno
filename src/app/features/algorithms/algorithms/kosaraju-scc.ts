import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { GraphComputation, WeightedGraphData, WeightedGraphEdge } from '../models/graph';
import { SortStep } from '../models/sort-step';
import { createSccStep } from './scc-step';

const I18N = {
  descriptions: {
    initializePass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.initializePass1'),
    seedPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.seedPass1'),
    initializePass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.initializePass2'),
    seedPass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.seedPass2'),
    sealComponent: t('features.algorithms.runtime.graph.kosaraju.descriptions.sealComponent'),
    complete: t('features.algorithms.runtime.graph.kosaraju.descriptions.complete'),
    enterPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.enterPass1'),
    inspectPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.inspectPass1'),
    seenPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.seenPass1'),
    descendPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.descendPass1'),
    finishPass1: t('features.algorithms.runtime.graph.kosaraju.descriptions.finishPass1'),
    enterPass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.enterPass2'),
    inspectPass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.inspectPass2'),
    sealedPass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.sealedPass2'),
    joinPass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.joinPass2'),
    leavePass2: t('features.algorithms.runtime.graph.kosaraju.descriptions.leavePass2'),
  },
  results: {
    new: t('features.algorithms.runtime.graph.kosaraju.results.new'),
    stack: t('features.algorithms.runtime.graph.kosaraju.results.stack'),
    done: t('features.algorithms.runtime.graph.kosaraju.results.done'),
    seen: t('features.algorithms.runtime.graph.kosaraju.results.seen'),
    dfsChild: t('features.algorithms.runtime.graph.kosaraju.results.dfsChild'),
    assigned: t('features.algorithms.runtime.graph.kosaraju.results.assigned'),
  },
  phases: {
    pass1Open: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Open'),
    pass1Inspect: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Inspect'),
    pass1Descend: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Descend'),
    pass1Skip: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Skip'),
    pass1Finish: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Finish'),
    pass1Complete: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Complete'),
    pass1Initialize: t('features.algorithms.runtime.graph.kosaraju.phases.pass1Initialize'),
    pass2Open: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Open'),
    pass2Inspect: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Inspect'),
    pass2Expand: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Expand'),
    pass2Keep: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Keep'),
    pass2Seal: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Seal'),
    complete: t('features.algorithms.runtime.graph.kosaraju.phases.complete'),
    pass2Initialize: t('features.algorithms.runtime.graph.kosaraju.phases.pass2Initialize'),
  },
} as const;

type VisitState = 'new' | 'stack' | 'done';

const VISIT_RESULTS: Readonly<Record<VisitState, TranslatableText>> = {
  new: i18nText(I18N.results.new),
  stack: i18nText(I18N.results.stack),
  done: i18nText(I18N.results.done),
};

export function* kosarajuSccGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const reversedGraph = createReversedGraph(graph);
  const finishMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const componentMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const stateMap = new Map<string, VisitState>(graph.nodes.map((node) => [node.id, 'new']));
  const assigned = new Set<string>();
  const dfsStack: string[] = [];
  const finishStack: string[] = [];
  const componentOrder: string[] = [];
  let currentSeedId = graph.sourceId;
  let finishIndex = 0;
  let componentCount = 0;
  let phase: 1 | 2 = 1;

  yield createStep({
    graph,
    viewGraph: graph,
    finishMap,
    previousMap,
    componentMap,
    stateMap,
    assigned,
    dfsStack,
    finishStack,
    componentOrder,
    currentSeedId,
    phase,
    description: i18nText(I18N.descriptions.initializePass1),
    activeCodeLine: 2,
    stepPhase: 'init',
  });

  for (const node of graph.nodes) {
    if ((stateMap.get(node.id) ?? 'new') !== 'new') continue;
    currentSeedId = node.id;

    yield createStep({
      graph,
      viewGraph: graph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: node.id,
      description: i18nText(I18N.descriptions.seedPass1, { node: labelOf(labelMap, node.id) }),
      activeCodeLine: 4,
      stepPhase: 'pick-node',
    });

    yield* dfsOriginal(node.id);
  }

  phase = 2;
  previousMap.clear();
  for (const node of graph.nodes) {
    previousMap.set(node.id, null);
    stateMap.set(node.id, 'new');
  }

  yield createStep({
    graph,
    viewGraph: reversedGraph,
    finishMap,
    previousMap,
    componentMap,
    stateMap,
    assigned,
    dfsStack,
    finishStack,
    componentOrder,
    currentSeedId: finishStack[finishStack.length - 1] ?? graph.sourceId,
    phase,
    description: i18nText(I18N.descriptions.initializePass2),
    activeCodeLine: 9,
    stepPhase: 'init',
  });

  for (let index = finishStack.length - 1; index >= 0; index--) {
    const nodeId = finishStack[index]!;
    if (assigned.has(nodeId)) continue;

    currentSeedId = nodeId;
    componentCount += 1;

    yield createStep({
      graph,
      viewGraph: reversedGraph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.seedPass2, { node: labelOf(labelMap, nodeId), component: componentCount }),
      activeCodeLine: 11,
      stepPhase: 'pick-node',
    });

    const members = yield* dfsReverse(nodeId, componentCount);
    const summary = summarizeComponent(componentCount, members, labelMap);
    componentOrder.push(summary);

    yield createStep({
      graph,
      viewGraph: reversedGraph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.sealComponent, { node: labelOf(labelMap, nodeId), component: summary }),
      activeCodeLine: 13,
      stepPhase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelMap, nodeId),
        expression: `reverse DFS from ${labelOf(labelMap, nodeId)}`,
        result: summary,
        decision: 'emit SCC',
      },
    });
  }

  yield createStep({
    graph,
    viewGraph: reversedGraph,
    finishMap,
    previousMap,
    componentMap,
    stateMap,
    assigned,
    dfsStack,
    finishStack,
    componentOrder,
    currentSeedId,
    phase,
    description: i18nText(I18N.descriptions.complete, { count: componentCount }),
    activeCodeLine: 15,
    stepPhase: 'graph-complete',
  });

  function* dfsOriginal(nodeId: string): Generator<SortStep> {
    stateMap.set(nodeId, 'stack');
    dfsStack.push(nodeId);

    yield createStep({
      graph,
      viewGraph: graph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.enterPass1, { node: labelOf(labelMap, nodeId) }),
      activeCodeLine: 5,
      stepPhase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph.edges, nodeId)) {
      const neighborId = edge.to;
      const neighborState = stateMap.get(neighborId) ?? 'new';

      yield createStep({
        graph,
        viewGraph: graph,
        finishMap,
        previousMap,
        componentMap,
        stateMap,
        assigned,
        dfsStack,
        finishStack,
        componentOrder,
        currentSeedId,
        phase,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspectPass1, { from: labelOf(labelMap, nodeId), to: labelOf(labelMap, neighborId) }),
        activeCodeLine: 6,
        stepPhase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: neighborState.toUpperCase(),
          result: VISIT_RESULTS[neighborState],
          decision: neighborState === 'new' ? 'visit child' : 'skip visited node',
        },
      });

      if (neighborState !== 'new') {
        yield createStep({
          graph,
          viewGraph: graph,
          finishMap,
          previousMap,
          componentMap,
          stateMap,
          assigned,
          dfsStack,
          finishStack,
          componentOrder,
          currentSeedId,
          phase,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.seenPass1, { node: labelOf(labelMap, neighborId) }),
          activeCodeLine: 7,
          stepPhase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: neighborState.toUpperCase(),
            result: i18nText(I18N.results.seen),
            decision: 'no recursive call',
          },
        });
        continue;
      }

      previousMap.set(neighborId, nodeId);
      yield createStep({
        graph,
        viewGraph: graph,
        finishMap,
        previousMap,
        componentMap,
        stateMap,
        assigned,
        dfsStack,
        finishStack,
        componentOrder,
        currentSeedId,
        phase,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        relaxedEdgeId: edge.id,
        description: i18nText(I18N.descriptions.descendPass1, { node: labelOf(labelMap, neighborId) }),
        activeCodeLine: 6,
        stepPhase: 'relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: 'NEW',
          result: i18nText(I18N.results.dfsChild),
          decision: 'descend',
        },
      });
      yield* dfsOriginal(neighborId);
    }

    dfsStack.pop();
    stateMap.set(nodeId, 'done');
    finishIndex += 1;
    finishMap.set(nodeId, finishIndex);
    finishStack.push(nodeId);

    yield createStep({
      graph,
      viewGraph: graph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.finishPass1, { node: labelOf(labelMap, nodeId), rank: finishIndex }),
      activeCodeLine: 8,
      stepPhase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelMap, nodeId),
        expression: `push ${labelOf(labelMap, nodeId)}`,
        result: `post = ${finishIndex}`,
        decision: 'append to finish stack',
      },
    });
  }

  function* dfsReverse(nodeId: string, componentId: number): Generator<SortStep, string[]> {
    const members: string[] = [];
    stateMap.set(nodeId, 'stack');
    dfsStack.push(nodeId);
    componentMap.set(nodeId, componentId);
    assigned.add(nodeId);
    members.push(nodeId);

    yield createStep({
      graph,
      viewGraph: reversedGraph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.enterPass2, { node: labelOf(labelMap, nodeId), component: componentId }),
      activeCodeLine: 12,
      stepPhase: 'pick-node',
    });

    for (const edge of outgoingEdges(reversedGraph.edges, nodeId)) {
      const neighborId = edge.to;

      yield createStep({
        graph,
        viewGraph: reversedGraph,
        finishMap,
        previousMap,
        componentMap,
        stateMap,
        assigned,
        dfsStack,
        finishStack,
        componentOrder,
        currentSeedId,
        phase,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspectPass2, { from: labelOf(labelMap, nodeId), to: labelOf(labelMap, neighborId) }),
        activeCodeLine: 12,
        stepPhase: 'inspect-edge',
        computation: reverseInspection(neighborId, componentId),
      });

      if (assigned.has(neighborId)) {
        yield createStep({
          graph,
          viewGraph: reversedGraph,
          finishMap,
          previousMap,
          componentMap,
          stateMap,
          assigned,
          dfsStack,
          finishStack,
          componentOrder,
          currentSeedId,
          phase,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.sealedPass2, { node: labelOf(labelMap, neighborId), component: componentLabel(componentMap.get(neighborId)) }),
          activeCodeLine: 12,
          stepPhase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: componentLabel(componentMap.get(neighborId)),
            result: i18nText(I18N.results.assigned),
            decision: 'keep current SCC boundary',
          },
        });
        continue;
      }

      previousMap.set(neighborId, nodeId);
      yield createStep({
        graph,
        viewGraph: reversedGraph,
        finishMap,
        previousMap,
        componentMap,
        stateMap,
        assigned,
        dfsStack,
        finishStack,
        componentOrder,
        currentSeedId,
        phase,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        relaxedEdgeId: edge.id,
        description: i18nText(I18N.descriptions.joinPass2, { node: labelOf(labelMap, neighborId), component: componentId }),
        activeCodeLine: 12,
        stepPhase: 'relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: 'unassigned on reversed graph',
          result: componentLabel(componentId),
          decision: 'expand SCC',
        },
      });
      const childMembers = yield* dfsReverse(neighborId, componentId);
      members.push(...childMembers);
    }

    dfsStack.pop();
    stateMap.set(nodeId, 'done');

    yield createStep({
      graph,
      viewGraph: reversedGraph,
      finishMap,
      previousMap,
      componentMap,
      stateMap,
      assigned,
      dfsStack,
      finishStack,
      componentOrder,
      currentSeedId,
      phase,
      currentNodeId: nodeId,
      description: i18nText(I18N.descriptions.leavePass2, { node: labelOf(labelMap, nodeId), component: componentId }),
      activeCodeLine: 12,
      stepPhase: 'settle-node',
    });

    return members;
  }

  function reverseInspection(neighborId: string, componentId: number): GraphComputation {
    const neighborLabel = labelOf(labelMap, neighborId);
    if (assigned.has(neighborId)) {
      return {
        candidateLabel: neighborLabel,
        expression: componentLabel(componentMap.get(neighborId)),
        result: i18nText(I18N.results.assigned),
        decision: 'skip finished SCC',
      };
    }

    return {
      candidateLabel: neighborLabel,
      expression: `post = ${finishOrDash(finishMap, neighborId)}`,
      result: componentLabel(componentId),
      decision: 'reverse DFS can absorb it',
    };
  }
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly viewGraph: WeightedGraphData;
  readonly finishMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly componentMap: ReadonlyMap<string, number | null>;
  readonly stateMap: ReadonlyMap<string, VisitState>;
  readonly assigned: ReadonlySet<string>;
  readonly dfsStack: readonly string[];
  readonly finishStack: readonly string[];
  readonly componentOrder: readonly string[];
  readonly currentSeedId: string;
  readonly phase: 1 | 2;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly stepPhase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const secondaryMap = new Map<string, string | null>(
    args.graph.nodes.map((node) => {
      const component = args.componentMap.get(node.id);
      if (args.phase === 2 && component !== null) {
        return [node.id, `S${component}`];
      }
      const state = args.stateMap.get(node.id) ?? 'new';
      return [node.id, state.toUpperCase()];
    }),
  );

  return createSccStep({
    graph: args.graph,
    viewGraph: args.viewGraph,
    sourceId: args.currentSeedId,
    indexMap: args.finishMap,
    secondaryMap,
    previousMap: args.previousMap,
    settled: args.assigned,
    frontierOrder: [...args.dfsStack].reverse(),
    visitOrder: args.phase === 1 ? [...args.finishStack].map((nodeId) => labelOf(new Map(args.graph.nodes.map((node) => [node.id, node.label])), nodeId)) : [...args.componentOrder],
    metricLabel: 'Post',
    secondaryLabel: args.phase === 1 ? 'State' : 'SCC',
    frontierLabel: args.phase === 1 ? 'DFS stack' : 'Reverse stack',
    frontierHeadLabel: 'Stack top',
    completionLabel: args.phase === 1 ? 'Closed' : 'Assigned',
    frontierStatusLabel: 'stacked',
    completionStatusLabel: args.phase === 1 ? 'closed' : 'assigned',
    detailLabel: args.phase === 1 ? 'Finish stack' : 'Kosaraju SCC map',
    detailValue: args.phase === 1 ? summarizeFinishStack(args.finishStack, args.graph) : summarizeAllComponents(args.componentOrder),
    visitOrderLabel: args.phase === 1 ? 'Finish stack' : 'SCC order',
    phaseLabel: i18nText(phaseLabel(args.phase, args.stepPhase)),
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.stepPhase,
    componentMap: args.componentMap,
    currentNodeId: args.currentNodeId,
    activeEdgeId: args.activeEdgeId,
    relaxedEdgeId: args.relaxedEdgeId,
    computation: args.computation ?? null,
  });
}

function createReversedGraph(graph: WeightedGraphData): WeightedGraphData {
  return {
    ...graph,
    edges: graph.edges.map((edge) => ({
      ...edge,
      id: `${edge.id}__rev`,
      from: edge.to,
      to: edge.from,
      directed: true,
    })),
  };
}

function outgoingEdges(edges: readonly WeightedGraphEdge[], nodeId: string) {
  return edges.filter((edge) => edge.from === nodeId).sort((left, right) => left.to.localeCompare(right.to));
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

function summarizeAllComponents(componentOrder: readonly string[]): string {
  return componentOrder.length > 0 ? componentOrder.join(' · ') : 'No SCC closed yet';
}

function summarizeFinishStack(finishStack: readonly string[], graph: WeightedGraphData): string {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  if (finishStack.length === 0) return 'No finish order yet';
  return finishStack.map((nodeId) => labelOf(labelMap, nodeId)).join(' → ');
}

function finishOrDash(map: ReadonlyMap<string, number | null>, nodeId: string): string {
  const value = map.get(nodeId);
  return value === null ? '∅' : String(value);
}

function componentLabel(componentId: number | null | undefined): string {
  return componentId == null ? 'S—' : `S${componentId}`;
}

function phaseLabel(pass: 1 | 2, stepPhase: SortStep['phase']): string {
  if (pass === 1) {
    switch (stepPhase) {
      case 'pick-node':
        return I18N.phases.pass1Open;
      case 'inspect-edge':
        return I18N.phases.pass1Inspect;
      case 'relax':
        return I18N.phases.pass1Descend;
      case 'skip-relax':
        return I18N.phases.pass1Skip;
      case 'settle-node':
        return I18N.phases.pass1Finish;
      case 'graph-complete':
        return I18N.phases.pass1Complete;
      default:
        return I18N.phases.pass1Initialize;
    }
  }

  switch (stepPhase) {
    case 'pick-node':
      return I18N.phases.pass2Open;
    case 'inspect-edge':
      return I18N.phases.pass2Inspect;
    case 'relax':
      return I18N.phases.pass2Expand;
    case 'skip-relax':
      return I18N.phases.pass2Keep;
    case 'settle-node':
      return I18N.phases.pass2Seal;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.pass2Initialize;
  }
}
