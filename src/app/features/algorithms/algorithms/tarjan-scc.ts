import { GraphComputation, WeightedGraphData } from '../models/graph';
import { SortStep } from '../models/sort-step';
import { createSccStep } from './scc-step';

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
    description: 'Initialize index and low-link arrays, then run one DFS that keeps active nodes on the Tarjan stack.',
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
      description: `Start a DFS seed at ${labelOf(labelMap, node.id)} because it has not received an index yet.`,
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
    description: `Tarjan complete. Found ${componentCount} strongly connected component(s).`,
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
      description: `Assign index ${index} to ${labelOf(labelMap, nodeId)} and push it onto the Tarjan stack.`,
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
        description: `Inspect ${labelOf(labelMap, nodeId)} → ${neighborLabel}.`,
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
          description: `${neighborLabel} is new, so descend and continue the DFS there.`,
          activeCodeLine: 10,
          phase: 'relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `index[${neighborLabel}] = ∅`,
            result: 'visit child',
            decision: 'tree edge',
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
          description: `Return from ${neighborLabel} and propagate its low-link back to ${labelOf(labelMap, nodeId)}.`,
          activeCodeLine: 11,
          phase: 'settle-node',
          computation: {
            candidateLabel: neighborLabel,
            expression: `min(${indexOrDash(lowMap, nodeId)}, ${indexOrDash(lowMap, neighborId)})`,
            result: String(updatedLow),
            decision: 'low-link propagated',
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
          description: `${neighborLabel} is still on the Tarjan stack, so its index can tighten the low-link of ${labelOf(labelMap, nodeId)}.`,
          activeCodeLine: 13,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `min(${indexOrDash(lowMap, nodeId)}, ${indexOrDash(indexMap, neighborId)})`,
            result: String(updatedLow),
            decision: 'back edge inside active SCC',
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
        description: `${neighborLabel} already belongs to a finished SCC, so this edge cannot change the active low-link.`,
        activeCodeLine: 14,
        phase: 'skip-relax',
        computation: {
          candidateLabel: neighborLabel,
          expression: `component = ${componentLabel(componentMap.get(neighborId))}`,
          result: 'assigned',
          decision: 'ignore finished SCC',
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
        description: `${labelOf(labelMap, nodeId)} is the root of an SCC, so pop until it closes ${summary}.`,
        activeCodeLine: 16,
        phase: 'settle-node',
        computation: {
          candidateLabel: labelOf(labelMap, nodeId),
          expression: `low = index = ${indexOrDash(indexMap, nodeId)}`,
          result: summary,
          decision: 'emit SCC',
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
      description: `${labelOf(labelMap, nodeId)} stays on the Tarjan stack because its SCC is still open.`,
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
        result: 'unseen',
        decision: 'visit child',
      };
    }

    if (onStack.has(neighborId)) {
      return {
        candidateLabel: neighborLabel,
        expression: `index = ${indexOrDash(indexMap, neighborId)}`,
        result: 'on stack',
        decision: 'use back edge for low-link',
      };
    }

    return {
      candidateLabel: neighborLabel,
      expression: componentLabel(componentMap.get(neighborId)),
      result: 'closed SCC',
      decision: 'ignore assigned component',
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
  readonly description: string;
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
    metricLabel: 'Index',
    secondaryLabel: 'Low / SCC',
    frontierLabel: 'Tarjan stack',
    frontierHeadLabel: 'Stack top',
    completionLabel: 'Assigned',
    frontierStatusLabel: 'stacked',
    completionStatusLabel: 'assigned',
    detailLabel: 'Tarjan SCC map',
    detailValue: summarizeAllComponents(args.componentOrder),
    visitOrderLabel: 'SCC order',
    phaseLabel: phaseLabel(args.phase),
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

function summarizeAllComponents(componentOrder: readonly string[]): string {
  return componentOrder.length > 0 ? componentOrder.join(' · ') : 'No SCC closed yet';
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
      return 'Open DFS node';
    case 'inspect-edge':
      return 'Inspect outgoing edge';
    case 'relax':
      return 'Descend into child';
    case 'skip-relax':
      return 'Back-edge low-link update';
    case 'settle-node':
      return 'Close or emit SCC';
    case 'graph-complete':
      return 'SCC discovery complete';
    default:
      return 'Initialize Tarjan';
  }
}
