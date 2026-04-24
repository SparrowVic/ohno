import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import {
  TreeComputation,
  TreeEdge,
  TreeNode,
  TreeNodeStatus,
  TreeTraversalOrder,
  TreeTraversalTraceState,
} from '../../models/tree';
import { TreeTraversalScenario } from '../../utils/scenarios/tree/tree-scenarios';
import { buildTreeEdges, layoutTree, TreeLayoutNode } from '../../utils/helpers/tree-layout/tree-layout';
import { createTreeStep } from '../tree-step';

const I18N = {
  modeLabels: {
    preorder: t('features.algorithms.runtime.tree.treeTraversals.modeLabels.preorder'),
    inorder: t('features.algorithms.runtime.tree.treeTraversals.modeLabels.inorder'),
    postorder: t('features.algorithms.runtime.tree.treeTraversals.modeLabels.postorder'),
    levelOrder: t('features.algorithms.runtime.tree.treeTraversals.modeLabels.levelOrder'),
  },
  phases: {
    init: t('features.algorithms.runtime.tree.treeTraversals.phases.init'),
    push: t('features.algorithms.runtime.tree.treeTraversals.phases.push'),
    enqueue: t('features.algorithms.runtime.tree.treeTraversals.phases.enqueue'),
    visit: t('features.algorithms.runtime.tree.treeTraversals.phases.visit'),
    descendLeft: t('features.algorithms.runtime.tree.treeTraversals.phases.descendLeft'),
    descendRight: t('features.algorithms.runtime.tree.treeTraversals.phases.descendRight'),
    backtrack: t('features.algorithms.runtime.tree.treeTraversals.phases.backtrack'),
    dequeue: t('features.algorithms.runtime.tree.treeTraversals.phases.dequeue'),
    complete: t('features.algorithms.runtime.tree.treeTraversals.phases.complete'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.tree.treeTraversals.descriptions.start'),
    push: t('features.algorithms.runtime.tree.treeTraversals.descriptions.push'),
    enqueue: t('features.algorithms.runtime.tree.treeTraversals.descriptions.enqueue'),
    visit: t('features.algorithms.runtime.tree.treeTraversals.descriptions.visit'),
    descendLeft: t('features.algorithms.runtime.tree.treeTraversals.descriptions.descendLeft'),
    descendRight: t('features.algorithms.runtime.tree.treeTraversals.descriptions.descendRight'),
    backtrack: t('features.algorithms.runtime.tree.treeTraversals.descriptions.backtrack'),
    dequeue: t('features.algorithms.runtime.tree.treeTraversals.descriptions.dequeue'),
    complete: t('features.algorithms.runtime.tree.treeTraversals.descriptions.complete'),
  },
  decisions: {
    pushThenDescend: t(
      'features.algorithms.runtime.tree.treeTraversals.decisions.pushThenDescend',
    ),
    emitCurrent: t('features.algorithms.runtime.tree.treeTraversals.decisions.emitCurrent'),
    leftBeforeRight: t(
      'features.algorithms.runtime.tree.treeTraversals.decisions.leftBeforeRight',
    ),
    rightAfterSelf: t('features.algorithms.runtime.tree.treeTraversals.decisions.rightAfterSelf'),
    dequeueLevel: t('features.algorithms.runtime.tree.treeTraversals.decisions.dequeueLevel'),
    backtrackDone: t('features.algorithms.runtime.tree.treeTraversals.decisions.backtrackDone'),
    finished: t('features.algorithms.runtime.tree.treeTraversals.decisions.finished'),
  },
  computation: {
    stackPush: t('features.algorithms.runtime.tree.treeTraversals.computation.stackPush'),
    stackPop: t('features.algorithms.runtime.tree.treeTraversals.computation.stackPop'),
    queuePush: t('features.algorithms.runtime.tree.treeTraversals.computation.queuePush'),
    queuePop: t('features.algorithms.runtime.tree.treeTraversals.computation.queuePop'),
    visit: t('features.algorithms.runtime.tree.treeTraversals.computation.visit'),
    output: t('features.algorithms.runtime.tree.treeTraversals.computation.output'),
  },
} as const;

interface NodeRuntime {
  readonly layout: TreeLayoutNode;
  readonly children: readonly string[];
  status: TreeNodeStatus;
}

function modeLabel(order: TreeTraversalOrder): TranslatableText {
  switch (order) {
    case 'preorder': return I18N.modeLabels.preorder;
    case 'inorder': return I18N.modeLabels.inorder;
    case 'postorder': return I18N.modeLabels.postorder;
    case 'level-order': return I18N.modeLabels.levelOrder;
  }
}

function createState(
  runtime: ReadonlyMap<string, NodeRuntime>,
  edges: readonly TreeEdge[],
  order: TreeTraversalOrder,
  scenario: TreeTraversalScenario,
  args: {
    phaseLabel: TranslatableText;
    decisionLabel: TranslatableText;
    stack: readonly string[];
    queue: readonly string[];
    output: readonly string[];
    currentNodeId: string | null;
    computation: TreeComputation | null;
  },
): TreeTraversalTraceState {
  const nodes: TreeNode[] = [];
  runtime.forEach((info) => {
    nodes.push({
      ...info.layout,
      status: info.status,
    });
  });
  // Deterministic render order — nodes sorted by layout y then x, so
  // track-by keys in the template stay stable across updates.
  nodes.sort((a, b) => a.y - b.y || a.x - b.x);

  const visitedCount = args.output.length;
  const rootId = [...runtime.values()].find((info) => info.layout.parentId === null)?.layout.id
    ?? null;

  return {
    order,
    modeLabel: modeLabel(order),
    phaseLabel: args.phaseLabel,
    presetLabel: scenario.presetLabel,
    presetDescription: scenario.presetDescription,
    decisionLabel: args.decisionLabel,
    nodes,
    edges,
    stack: args.stack,
    queue: args.queue,
    output: args.output,
    currentNodeId: args.currentNodeId,
    rootId,
    totalNodes: runtime.size,
    visitedCount,
    computation: args.computation,
  };
}

function buildRuntime(layoutNodes: readonly TreeLayoutNode[]): Map<string, NodeRuntime> {
  const childrenMap = new Map<string, string[]>();
  for (const node of layoutNodes) {
    if (node.parentId !== null) {
      const siblings = childrenMap.get(node.parentId) ?? [];
      siblings.push(node.id);
      childrenMap.set(node.parentId, siblings);
    }
  }
  // Order children left-to-right by layout x so preorder/inorder/
  // postorder respect the visual tree.
  for (const [parentId, kids] of childrenMap) {
    kids.sort((a, b) => {
      const ax = layoutNodes.find((n) => n.id === a)?.x ?? 0;
      const bx = layoutNodes.find((n) => n.id === b)?.x ?? 0;
      return ax - bx;
    });
    childrenMap.set(parentId, kids);
  }

  const runtime = new Map<string, NodeRuntime>();
  for (const node of layoutNodes) {
    runtime.set(node.id, {
      layout: node,
      children: childrenMap.get(node.id) ?? [],
      status: 'idle',
    });
  }
  return runtime;
}

/** Mark every node on the current DFS stack so the tree highlights
 *  the live path root-to-current. */
function applyPathMarkers(edges: readonly TreeEdge[], pathIds: readonly string[]): TreeEdge[] {
  const pathSet = new Set(pathIds);
  return edges.map((edge) => ({
    ...edge,
    isOnPath: pathSet.has(edge.fromId) && pathSet.has(edge.toId),
  }));
}

function markTraversedEdge(
  edges: readonly TreeEdge[],
  fromId: string,
  toId: string,
): TreeEdge[] {
  return edges.map((edge) =>
    edge.fromId === fromId && edge.toId === toId ? { ...edge, isTraversed: true } : edge,
  );
}

function applyBaseStatuses(
  runtime: Map<string, NodeRuntime>,
  args: {
    visited: readonly string[];
    queued?: readonly string[];
    onStack?: readonly string[];
    current: string | null;
  },
): void {
  const visited = new Set(args.visited);
  const queued = new Set(args.queued ?? []);
  const onStack = new Set(args.onStack ?? []);
  for (const info of runtime.values()) {
    const id = info.layout.id;
    if (id === args.current) {
      info.status = 'current';
      continue;
    }
    if (visited.has(id)) {
      info.status = 'visited';
      continue;
    }
    if (onStack.has(id)) {
      info.status = 'onStack';
      continue;
    }
    if (queued.has(id)) {
      info.status = 'queued';
      continue;
    }
    info.status = 'idle';
  }
}

/** Main generator — dispatches on `scenario.order`. Each branch
 *  yields a sequence of SortSteps that walk the tree in the named
 *  order, updating node statuses, stack/queue, and the output tape. */
export function* treeTraversalsGenerator(scenario: TreeTraversalScenario): Generator<SortStep> {
  const layoutNodes = layoutTree(scenario.seeds);
  const runtime = buildRuntime(layoutNodes);
  const edges = buildTreeEdges(layoutNodes);
  const order = scenario.order;

  const rootId = layoutNodes.find((n) => n.parentId === null)?.id ?? null;
  if (rootId === null) {
    return;
  }

  const visited: string[] = [];
  const output: string[] = [];
  let liveEdges = edges.slice();

  // Initial snapshot — nothing touched yet.
  applyBaseStatuses(runtime, { visited: [], current: null });
  yield createTreeStep({
    activeCodeLine: 1,
    description: I18N.descriptions.start,
    tree: createState(runtime, liveEdges, order, scenario, {
      phaseLabel: I18N.phases.init,
      decisionLabel: I18N.decisions.pushThenDescend,
      stack: [],
      queue: [],
      output: [],
      currentNodeId: null,
      computation: null,
    }),
  });

  if (order === 'level-order') {
    yield* levelOrder(scenario, runtime, liveEdges, rootId, visited, output);
  } else {
    yield* dfsOrder(scenario, order, runtime, liveEdges, rootId, visited, output);
  }
}

function* levelOrder(
  scenario: TreeTraversalScenario,
  runtime: Map<string, NodeRuntime>,
  edges: readonly TreeEdge[],
  rootId: string,
  visited: string[],
  output: string[],
): Generator<SortStep> {
  const queue: string[] = [rootId];

  // Enqueue root.
  applyBaseStatuses(runtime, { visited, queued: queue, current: null });
  yield createTreeStep({
    activeCodeLine: 3,
    description: I18N.descriptions.enqueue,
    tree: createState(runtime, edges, 'level-order', scenario, {
      phaseLabel: I18N.phases.enqueue,
      decisionLabel: I18N.decisions.dequeueLevel,
      stack: [],
      queue: queue.slice(),
      output: output.slice(),
      currentNodeId: null,
      computation: {
        label: I18N.computation.queuePush,
        expression: runtime.get(rootId)!.layout.label,
        note: I18N.decisions.dequeueLevel,
      },
    }),
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const info = runtime.get(currentId)!;

    // Dequeue + visit.
    visited.push(currentId);
    output.push(info.layout.label);
    applyBaseStatuses(runtime, { visited, queued: queue, current: currentId });
    yield createTreeStep({
      activeCodeLine: 5,
      description: I18N.descriptions.visit,
      tree: createState(runtime, edges, 'level-order', scenario, {
        phaseLabel: I18N.phases.visit,
        decisionLabel: I18N.decisions.emitCurrent,
        stack: [],
        queue: queue.slice(),
        output: output.slice(),
        currentNodeId: currentId,
        computation: {
          label: I18N.computation.queuePop,
          expression: info.layout.label,
          note: I18N.computation.output,
        },
      }),
    });

    // Enqueue children in left-to-right order.
    for (const childId of info.children) {
      queue.push(childId);
      applyBaseStatuses(runtime, { visited, queued: queue, current: currentId });
      yield createTreeStep({
        activeCodeLine: 7,
        description: I18N.descriptions.enqueue,
        tree: createState(runtime, edges, 'level-order', scenario, {
          phaseLabel: I18N.phases.enqueue,
          decisionLabel: I18N.decisions.leftBeforeRight,
          stack: [],
          queue: queue.slice(),
          output: output.slice(),
          currentNodeId: currentId,
          computation: {
            label: I18N.computation.queuePush,
            expression: runtime.get(childId)!.layout.label,
            note: I18N.decisions.leftBeforeRight,
          },
        }),
      });
    }
  }

  applyBaseStatuses(runtime, { visited, current: null });
  yield createTreeStep({
    activeCodeLine: 9,
    description: I18N.descriptions.complete,
    tree: createState(runtime, edges, 'level-order', scenario, {
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.finished,
      stack: [],
      queue: [],
      output: output.slice(),
      currentNodeId: null,
      computation: null,
    }),
  });
}

function* dfsOrder(
  scenario: TreeTraversalScenario,
  order: 'preorder' | 'inorder' | 'postorder',
  runtime: Map<string, NodeRuntime>,
  edges: readonly TreeEdge[],
  rootId: string,
  visited: string[],
  output: string[],
): Generator<SortStep> {
  const stack: string[] = [];
  let liveEdges = edges.slice();

  function* dfs(nodeId: string): Generator<SortStep> {
    const info = runtime.get(nodeId)!;
    stack.push(nodeId);

    // Push + path marker.
    liveEdges = applyPathMarkers(liveEdges, stack);
    applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
    yield createTreeStep({
      activeCodeLine: 2,
      description: I18N.descriptions.push,
      tree: createState(runtime, liveEdges, order, scenario, {
        phaseLabel: I18N.phases.push,
        decisionLabel: I18N.decisions.pushThenDescend,
        stack: stack.slice(),
        queue: [],
        output: output.slice(),
        currentNodeId: nodeId,
        computation: {
          label: I18N.computation.stackPush,
          expression: info.layout.label,
          note: I18N.decisions.pushThenDescend,
        },
      }),
    });

    // PREORDER: emit before descending.
    if (order === 'preorder') {
      visited.push(nodeId);
      output.push(info.layout.label);
      applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
      yield createTreeStep({
        activeCodeLine: 3,
        description: I18N.descriptions.visit,
        tree: createState(runtime, liveEdges, order, scenario, {
          phaseLabel: I18N.phases.visit,
          decisionLabel: I18N.decisions.emitCurrent,
          stack: stack.slice(),
          queue: [],
          output: output.slice(),
          currentNodeId: nodeId,
          computation: {
            label: I18N.computation.visit,
            expression: info.layout.label,
            note: I18N.computation.output,
          },
        }),
      });
    }

    // Descend into left (first) child.
    if (info.children.length >= 1) {
      const leftId = info.children[0];
      liveEdges = markTraversedEdge(liveEdges, nodeId, leftId);
      applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
      yield createTreeStep({
        activeCodeLine: 4,
        description: I18N.descriptions.descendLeft,
        tree: createState(runtime, liveEdges, order, scenario, {
          phaseLabel: I18N.phases.descendLeft,
          decisionLabel: I18N.decisions.leftBeforeRight,
          stack: stack.slice(),
          queue: [],
          output: output.slice(),
          currentNodeId: nodeId,
          computation: null,
        }),
      });
      yield* dfs(leftId);
    }

    // INORDER: emit between children.
    if (order === 'inorder') {
      visited.push(nodeId);
      output.push(info.layout.label);
      applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
      yield createTreeStep({
        activeCodeLine: 5,
        description: I18N.descriptions.visit,
        tree: createState(runtime, liveEdges, order, scenario, {
          phaseLabel: I18N.phases.visit,
          decisionLabel: I18N.decisions.emitCurrent,
          stack: stack.slice(),
          queue: [],
          output: output.slice(),
          currentNodeId: nodeId,
          computation: {
            label: I18N.computation.visit,
            expression: info.layout.label,
            note: I18N.computation.output,
          },
        }),
      });
    }

    // Descend into right (second) child.
    if (info.children.length >= 2) {
      const rightId = info.children[1];
      liveEdges = markTraversedEdge(liveEdges, nodeId, rightId);
      applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
      yield createTreeStep({
        activeCodeLine: 6,
        description: I18N.descriptions.descendRight,
        tree: createState(runtime, liveEdges, order, scenario, {
          phaseLabel: I18N.phases.descendRight,
          decisionLabel: I18N.decisions.rightAfterSelf,
          stack: stack.slice(),
          queue: [],
          output: output.slice(),
          currentNodeId: nodeId,
          computation: null,
        }),
      });
      yield* dfs(rightId);
    }

    // POSTORDER: emit after both children.
    if (order === 'postorder') {
      visited.push(nodeId);
      output.push(info.layout.label);
      applyBaseStatuses(runtime, { visited, onStack: stack, current: nodeId });
      yield createTreeStep({
        activeCodeLine: 7,
        description: I18N.descriptions.visit,
        tree: createState(runtime, liveEdges, order, scenario, {
          phaseLabel: I18N.phases.visit,
          decisionLabel: I18N.decisions.emitCurrent,
          stack: stack.slice(),
          queue: [],
          output: output.slice(),
          currentNodeId: nodeId,
          computation: {
            label: I18N.computation.visit,
            expression: info.layout.label,
            note: I18N.computation.output,
          },
        }),
      });
    }

    // Pop (backtrack).
    stack.pop();
    liveEdges = applyPathMarkers(liveEdges, stack);
    const nextCurrent = stack.length > 0 ? stack[stack.length - 1] : null;
    applyBaseStatuses(runtime, { visited, onStack: stack, current: nextCurrent });
    yield createTreeStep({
      activeCodeLine: 8,
      description: I18N.descriptions.backtrack,
      tree: createState(runtime, liveEdges, order, scenario, {
        phaseLabel: I18N.phases.backtrack,
        decisionLabel: I18N.decisions.backtrackDone,
        stack: stack.slice(),
        queue: [],
        output: output.slice(),
        currentNodeId: nextCurrent,
        computation: {
          label: I18N.computation.stackPop,
          expression: info.layout.label,
          note: I18N.decisions.backtrackDone,
        },
      }),
    });
  }

  yield* dfs(rootId);

  applyBaseStatuses(runtime, { visited, current: null });
  yield createTreeStep({
    activeCodeLine: 9,
    description: I18N.descriptions.complete,
    tree: createState(runtime, liveEdges, order, scenario, {
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.finished,
      stack: [],
      queue: [],
      output: output.slice(),
      currentNodeId: null,
      computation: null,
    }),
  });
}
