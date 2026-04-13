import { GraphComputation, WeightedGraphData, WeightedGraphEdge } from '../models/graph';
import { SortStep } from '../models/sort-step';
import { createSccStep } from './scc-step';

type VisitState = 'new' | 'stack' | 'done';

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
    description: 'Pass 1 runs DFS on the original graph to build a finish-order stack.',
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
      description: `Start pass 1 from ${labelOf(labelMap, node.id)} to collect finishing times.`,
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
    description: 'Pass 2 reverses every edge and expands seeds in decreasing finish order to isolate SCCs.',
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
      description: `Pop ${labelOf(labelMap, nodeId)} from the finish stack and start reverse DFS for SCC ${componentCount}.`,
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
      description: `Reverse DFS from ${labelOf(labelMap, nodeId)} closes ${summary}.`,
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
    description: `Kosaraju complete. Found ${componentCount} strongly connected component(s).`,
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
      description: `Enter ${labelOf(labelMap, nodeId)} in pass 1 and keep exploring original outgoing edges.`,
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
        description: `Pass 1 inspects ${labelOf(labelMap, nodeId)} → ${labelOf(labelMap, neighborId)}.`,
        activeCodeLine: 6,
        stepPhase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: neighborState.toUpperCase(),
          result: neighborState,
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
          description: `${labelOf(labelMap, neighborId)} was already seen in pass 1, so keep the current finish search moving.`,
          activeCodeLine: 7,
          stepPhase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: neighborState.toUpperCase(),
            result: 'seen',
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
        description: `Go deeper to ${labelOf(labelMap, neighborId)} so it can receive a later finishing time.`,
        activeCodeLine: 6,
        stepPhase: 'relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: 'NEW',
          result: 'DFS child',
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
      description: `Finish ${labelOf(labelMap, nodeId)} and push it onto the finish-order stack with rank ${finishIndex}.`,
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
      description: `Enter ${labelOf(labelMap, nodeId)} on the reversed graph and assign it to SCC ${componentId}.`,
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
        description: `Pass 2 inspects reversed edge ${labelOf(labelMap, nodeId)} → ${labelOf(labelMap, neighborId)}.`,
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
          description: `${labelOf(labelMap, neighborId)} is already sealed into ${componentLabel(componentMap.get(neighborId))}, so skip it.`,
          activeCodeLine: 12,
          stepPhase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: componentLabel(componentMap.get(neighborId)),
            result: 'assigned',
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
        description: `${labelOf(labelMap, neighborId)} is still free in pass 2, so it joins SCC ${componentId}.`,
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
      description: `Leave ${labelOf(labelMap, nodeId)} while SCC ${componentId} continues absorbing reverse-reachable nodes.`,
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
        result: 'assigned',
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
  readonly description: string;
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
    phaseLabel: phaseLabel(args.phase, args.stepPhase),
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
        return 'Pass 1: open DFS';
      case 'inspect-edge':
        return 'Pass 1: inspect original edge';
      case 'relax':
        return 'Pass 1: descend';
      case 'skip-relax':
        return 'Pass 1: skip seen node';
      case 'settle-node':
        return 'Pass 1: push finish order';
      case 'graph-complete':
        return 'Pass 1 complete';
      default:
        return 'Initialize pass 1';
    }
  }

  switch (stepPhase) {
    case 'pick-node':
      return 'Pass 2: open reverse DFS';
    case 'inspect-edge':
      return 'Pass 2: inspect reversed edge';
    case 'relax':
      return 'Pass 2: expand SCC';
    case 'skip-relax':
      return 'Pass 2: keep SCC boundary';
    case 'settle-node':
      return 'Pass 2: seal SCC';
    case 'graph-complete':
      return 'Kosaraju complete';
    default:
      return 'Initialize pass 2';
  }
}
