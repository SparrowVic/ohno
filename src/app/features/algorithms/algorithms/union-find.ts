import { DsuEdgeTrace } from '../models/dsu';
import { SortStep } from '../models/sort-step';
import { UnionFindOperation, UnionFindScenario } from '../utils/dsu-scenarios';
import { createDsuStep, DsuBaseNode } from './dsu-step';

export function* unionFindGenerator(scenario: UnionFindScenario): Generator<SortStep> {
  const nodes = scenario.nodes;
  const parent = new Map<string, string>(nodes.map((node) => [node.id, node.id]));
  const rank = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const size = new Map<string, number>(nodes.map((node) => [node.id, 1]));
  const statuses = new Map<number, DsuEdgeTrace['status']>(scenario.operations.map((_, index) => [index, 'pending']));

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    operations: scenario.operations,
    statuses,
    description: 'Initialize each element as its own set with itself as parent.',
    activeCodeLine: 2,
    statusLabel: 'Disjoint sets ready',
    decision: 'Every node starts as a root of size 1.',
    resultLabel: `${nodes.length} singleton sets`,
    operationsLabel: 'Operation queue',
  });

  for (let index = 0; index < scenario.operations.length; index++) {
    const operation = scenario.operations[index]!;
    statuses.set(index, 'active');

    if (operation.kind === 'find') {
      const path = collectPath(operation.a, parent);

      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description: `Follow parent pointers from ${labelOf(nodes, operation.a)} to locate its representative.`,
        activeCodeLine: 5,
        statusLabel: 'Find representative',
        decision: `Current path: ${labelsFor(nodes, path).join(' → ')}.`,
        resultLabel: `${componentCount(parent)} active sets`,
        operationsLabel: 'Operation queue',
        activeIds: path,
        queryIds: [operation.a],
      });

      const root = path[path.length - 1]!;
      const compressed = path.slice(0, -1).filter((nodeId) => (parent.get(nodeId) ?? nodeId) !== root);
      for (const nodeId of compressed) {
        parent.set(nodeId, root);
      }

      statuses.set(index, 'accepted');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description: compressed.length > 0
          ? `Compress the path so every visited node now points directly to ${labelOf(nodes, root)}.`
          : `${labelOf(nodes, operation.a)} already points to root ${labelOf(nodes, root)}.`,
        activeCodeLine: 6,
        statusLabel: 'Path compression',
        decision: `Representative is ${labelOf(nodes, root)}.`,
        resultLabel: `${componentCount(parent)} active sets`,
        operationsLabel: 'Operation queue',
        activeIds: [root],
        compressedIds: compressed,
        queryIds: [operation.a],
      });
      continue;
    }

    const leftPath = collectPath(operation.a, parent);
    const rightPath = collectPath(operation.b!, parent);
    const leftRoot = leftPath[leftPath.length - 1]!;
    const rightRoot = rightPath[rightPath.length - 1]!;

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      operations: scenario.operations,
      statuses,
      description: `Find the representatives for ${labelOf(nodes, operation.a)} and ${labelOf(nodes, operation.b!)} before merging.`,
      activeCodeLine: 8,
      statusLabel: 'Compare two roots',
      decision: `${labelOf(nodes, operation.a)} -> ${labelOf(nodes, leftRoot)}, ${labelOf(nodes, operation.b!)} -> ${labelOf(nodes, rightRoot)}.`,
      resultLabel: `${componentCount(parent)} active sets`,
      operationsLabel: 'Operation queue',
      activeIds: [operation.a, operation.b!],
      queryIds: [...new Set([...leftPath, ...rightPath])],
    });

    if (leftRoot === rightRoot) {
      statuses.set(index, 'rejected');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description: `Skip merge because both elements already belong to the same set rooted at ${labelOf(nodes, leftRoot)}.`,
        activeCodeLine: 9,
        statusLabel: 'Union skipped',
        decision: 'No structural change needed.',
        resultLabel: `${componentCount(parent)} active sets`,
        operationsLabel: 'Operation queue',
        activeIds: [leftRoot],
      });
      continue;
    }

    let attachRoot = leftRoot;
    let keepRoot = rightRoot;
    const leftRank = rank.get(leftRoot) ?? 0;
    const rightRank = rank.get(rightRoot) ?? 0;
    if (leftRank > rightRank || (leftRank === rightRank && leftRoot.localeCompare(rightRoot) < 0)) {
      attachRoot = rightRoot;
      keepRoot = leftRoot;
    }

    parent.set(attachRoot, keepRoot);
    size.set(keepRoot, (size.get(keepRoot) ?? 1) + (size.get(attachRoot) ?? 1));
    if (leftRank === rightRank) {
      rank.set(keepRoot, (rank.get(keepRoot) ?? 0) + 1);
    }
    statuses.set(index, 'accepted');

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      operations: scenario.operations,
      statuses,
      description: `Attach ${labelOf(nodes, attachRoot)} under ${labelOf(nodes, keepRoot)} and merge the two sets.`,
      activeCodeLine: 10,
      statusLabel: 'Union by rank',
      decision: `New root ${labelOf(nodes, keepRoot)} now represents ${size.get(keepRoot)} element(s).`,
      resultLabel: `${componentCount(parent)} active sets`,
      operationsLabel: 'Operation queue',
      activeIds: [keepRoot],
      mergedIds: [attachRoot],
    });
  }

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    operations: scenario.operations,
    statuses,
    description: `Union-Find complete. ${componentCount(parent)} disjoint set(s) remain after all operations.`,
    activeCodeLine: 12,
    phase: 'graph-complete',
    statusLabel: 'Operations complete',
    decision: 'Final parent links and set sizes are stable.',
    resultLabel: `${componentCount(parent)} active sets`,
    operationsLabel: 'Operation queue',
  });
}

function createStep(args: {
  readonly nodes: readonly DsuBaseNode[];
  readonly parent: ReadonlyMap<string, string>;
  readonly rank: ReadonlyMap<string, number>;
  readonly size: ReadonlyMap<string, number>;
  readonly operations: readonly UnionFindOperation[];
  readonly statuses: ReadonlyMap<number, DsuEdgeTrace['status']>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly statusLabel: string;
  readonly decision: string;
  readonly resultLabel: string;
  readonly operationsLabel: string;
  readonly activeIds?: readonly string[];
  readonly mergedIds?: readonly string[];
  readonly compressedIds?: readonly string[];
  readonly queryIds?: readonly string[];
}): SortStep {
  return createDsuStep({
    mode: 'union-find',
    nodes: args.nodes,
    parent: args.parent,
    rank: args.rank,
    size: args.size,
    edges: args.operations.map((operation, index) => ({
      id: `op-${index}`,
      fromId: operation.a,
      fromLabel: labelOf(args.nodes, operation.a),
      toId: operation.b ?? operation.a,
      toLabel: operation.kind === 'find' ? 'find' : labelOf(args.nodes, operation.b ?? operation.a),
      weight: null,
      status: args.statuses.get(index) ?? 'pending',
    })),
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    statusLabel: args.statusLabel,
    decision: args.decision,
    resultLabel: args.resultLabel,
    operationsLabel: args.operationsLabel,
    activeIds: args.activeIds,
    mergedIds: args.mergedIds,
    compressedIds: args.compressedIds,
    queryIds: args.queryIds,
  });
}

function collectPath(nodeId: string, parent: ReadonlyMap<string, string>): readonly string[] {
  const path: string[] = [nodeId];
  let current = nodeId;
  let hops = 0;
  while ((parent.get(current) ?? current) !== current && hops < parent.size + 1) {
    current = parent.get(current) ?? current;
    path.push(current);
    hops++;
  }
  return path;
}

function componentCount(parent: ReadonlyMap<string, string>): number {
  return new Set([...parent.keys()].map((nodeId) => collectPath(nodeId, parent).at(-1) ?? nodeId)).size;
}

function labelOf(nodes: readonly DsuBaseNode[], nodeId: string): string {
  return nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}

function labelsFor(nodes: readonly DsuBaseNode[], ids: readonly string[]): readonly string[] {
  return ids.map((id) => labelOf(nodes, id));
}
