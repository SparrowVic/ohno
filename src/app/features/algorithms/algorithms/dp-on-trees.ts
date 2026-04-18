import { DpCellConfig, DpHeaderConfig, createDpStep } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { TreeDpScenario } from '../utils/dp-scenarios/dp-scenarios';

export function* dpOnTreesGenerator(scenario: TreeDpScenario): Generator<SortStep> {
  const nodes = scenario.nodes;
  const count = nodes.length;
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const children = Array.from({ length: count }, () => [] as number[]);
  const rootIndex = indexById.get(scenario.rootId) ?? 0;

  for (const [index, node] of nodes.entries()) {
    if (!node.parentId) continue;
    const parentIndex = indexById.get(node.parentId);
    if (parentIndex !== undefined) {
      children[parentIndex]!.push(index);
    }
  }

  const take = Array.from({ length: count }, () => 0);
  const skip = Array.from({ length: count }, () => 0);
  const best = Array.from({ length: count }, () => 0);
  const chosen = new Set<number>();
  const postorder: number[] = [];

  buildPostorder(rootIndex);

  yield createStep({
    scenario,
    take,
    skip,
    best,
    children,
    chosen,
    postorder,
    description: 'Root the tree and prepare a postorder so every child subtree is solved before its parent.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize rooted tree',
    phase: 'init',
  });

  for (const nodeIndex of postorder) {
    let takeValue = nodes[nodeIndex]!.weight;
    let skipValue = 0;

    if (children[nodeIndex]!.length === 0) {
      yield createStep({
        scenario,
        take,
        skip,
        best,
        children,
        chosen,
        postorder,
        activeIndex: nodeIndex,
        description: `Leaf node ${nodes[nodeIndex]!.label} has no children, so its take value is just its own weight.`,
        activeCodeLine: 5,
        phaseLabel: 'Inspect leaf state',
        phase: 'compare',
        computation: {
          label: nodes[nodeIndex]!.label,
          expression: `take = ${nodes[nodeIndex]!.weight}, skip = 0`,
          result: String(nodes[nodeIndex]!.weight),
          decision: 'leaf contributes directly',
        },
      });
    }

    for (const childIndex of children[nodeIndex]!) {
      yield createStep({
        scenario,
        take,
        skip,
        best,
        children,
        chosen,
        postorder,
        activeIndex: nodeIndex,
        candidateIndex: childIndex,
        description: `Combine child ${nodes[childIndex]!.label}: taking ${nodes[nodeIndex]!.label} forces the child into skip, while skipping the parent may use the child's best state.`,
        activeCodeLine: 6,
        phaseLabel: 'Aggregate child subtree',
        phase: 'compare',
        computation: {
          label: `${nodes[nodeIndex]!.label} + ${nodes[childIndex]!.label}`,
          expression: `take += skip[${nodes[childIndex]!.label}] (${skip[childIndex]!}), skip += best[${nodes[childIndex]!.label}] (${Math.max(take[childIndex]!, skip[childIndex]!)})`,
          result: `${takeValue + skip[childIndex]!} / ${skipValue + Math.max(take[childIndex]!, skip[childIndex]!)}`,
          decision: 'merge child contribution into parent state',
        },
      });

      takeValue += skip[childIndex]!;
      skipValue += Math.max(take[childIndex]!, skip[childIndex]!);
    }

    take[nodeIndex] = takeValue;
    skip[nodeIndex] = skipValue;
    best[nodeIndex] = Math.max(takeValue, skipValue);

    yield createStep({
      scenario,
      take,
      skip,
      best,
      children,
      chosen,
      postorder,
      activeIndex: nodeIndex,
      activeStatus: 'improved',
      description: `Store take / skip / best for subtree rooted at ${nodes[nodeIndex]!.label}.`,
      activeCodeLine: 8,
      phaseLabel: 'Commit subtree states',
      phase: 'settle-node',
      computation: {
        label: `best[${nodes[nodeIndex]!.label}]`,
        expression: `max(${takeValue}, ${skipValue})`,
        result: String(best[nodeIndex]!),
        decision: takeValue >= skipValue ? 'take state dominates' : 'skip state dominates',
      },
    });
  }

  yield* trace(rootIndex, false);

  yield createStep({
    scenario,
    take,
    skip,
    best,
    children,
    chosen,
    postorder,
    description: `Recovered one maximum-weight independent set on the tree.`,
    activeCodeLine: 12,
    phaseLabel: 'Chosen nodes ready',
    phase: 'complete',
  });

  function buildPostorder(nodeIndex: number): void {
    for (const child of children[nodeIndex]!) buildPostorder(child);
    postorder.push(nodeIndex);
  }

  function* trace(nodeIndex: number, parentTaken: boolean): Generator<SortStep> {
    const takeNode = !parentTaken && take[nodeIndex]! >= skip[nodeIndex]!;
    if (takeNode) {
      chosen.add(nodeIndex);
    }

    yield createStep({
      scenario,
      take,
      skip,
      best,
      children,
      chosen,
      postorder,
      activeIndex: nodeIndex,
      activeStatus: 'backtrack',
      description: takeNode
        ? `Choose ${nodes[nodeIndex]!.label} because its take state beats skipping it and its parent is not selected.`
        : parentTaken
          ? `Skip ${nodes[nodeIndex]!.label} because its parent is already chosen.`
          : `Skip ${nodes[nodeIndex]!.label} because its skip state is better than taking it.`,
      activeCodeLine: 11,
      phaseLabel: 'Backtrack chosen set',
      phase: 'relax',
      computation: {
        label: nodes[nodeIndex]!.label,
        expression: parentTaken ? 'parent selected' : `${take[nodeIndex]!} vs ${skip[nodeIndex]!}`,
        result: takeNode ? 'take' : 'skip',
        decision: independentSetLabel(scenario, chosen),
      },
    });

    for (const childIndex of children[nodeIndex]!) {
      yield* trace(childIndex, takeNode);
    }
  }
}

function createStep(args: {
  readonly scenario: TreeDpScenario;
  readonly take: readonly number[];
  readonly skip: readonly number[];
  readonly best: readonly number[];
  readonly children: readonly (readonly number[])[];
  readonly chosen: ReadonlySet<number>;
  readonly postorder: readonly number[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndex?: number;
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const headers: DpHeaderConfig[] = args.scenario.nodes.map((node, index) => ({
    id: `col-${node.id}`,
    label: node.label,
    status: (args.activeIndex === index ? 'active' : args.candidateIndex === index ? 'accent' : 'idle') as DpHeaderConfig['status'],
    metaLabel: `w${node.weight}`,
  }));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-weight', label: 'weight', status: 'source', metaLabel: 'node' },
    { id: 'row-take', label: 'take', status: 'accent', metaLabel: 'include' },
    { id: 'row-skip', label: 'target', status: 'accent', metaLabel: 'exclude' },
    { id: 'row-best', label: 'best', status: 'target', metaLabel: 'max' },
  ];

  const cells: DpCellConfig[] = [];
  for (let index = 0; index < args.scenario.nodes.length; index++) {
    const node = args.scenario.nodes[index]!;
    const isChosen = args.chosen.has(index);
    const isActive = args.activeIndex === index;
    const isCandidate = args.candidateIndex === index;

    cells.push({
      row: 0,
      col: index,
      rowLabel: 'weight',
      colLabel: node.label,
      valueLabel: String(node.weight),
      metaLabel: args.children[index]!.length === 0 ? 'leaf' : `${args.children[index]!.length} kids`,
      status: isChosen ? 'backtrack' : 'base',
      tags: [...(isChosen ? (['path'] as const) : []), ...(isActive ? (['active'] as const) : [])],
    });

    cells.push({
      row: 1,
      col: index,
      rowLabel: 'take',
      colLabel: node.label,
      valueLabel: String(args.take[index]!),
      metaLabel: isChosen ? 'picked' : null,
      status: isChosen
        ? 'backtrack'
        : isActive
          ? (args.activeStatus ?? 'active')
          : isCandidate
            ? 'candidate'
            : args.take[index]! > 0
              ? 'chosen'
              : 'idle',
      tags: [
        'take',
        ...(isCandidate ? (['best'] as const) : []),
        ...(isChosen ? (['path'] as const) : []),
        ...(isActive ? (['active'] as const) : []),
      ],
    });

    cells.push({
      row: 2,
      col: index,
      rowLabel: 'skip',
      colLabel: node.label,
      valueLabel: String(args.skip[index]!),
      metaLabel: isChosen ? 'blocked by parent?' : null,
      status: isChosen ? 'backtrack' : isCandidate ? 'candidate' : args.skip[index]! > 0 ? 'chosen' : 'idle',
      tags: [
        'skip',
        ...(isCandidate ? (['best'] as const) : []),
        ...(isChosen ? (['path'] as const) : []),
        ...(isActive ? (['active'] as const) : []),
      ],
    });

    const bestTags: DpTraceTag[] = ['best'];
    if (isChosen) bestTags.push('path');
    if (isActive) bestTags.push('active');

    cells.push({
      row: 3,
      col: index,
      rowLabel: 'best',
      colLabel: node.label,
      valueLabel: String(args.best[index]!),
      metaLabel: args.take[index]! >= args.skip[index]! ? 'take' : 'skip',
      status: isChosen ? 'backtrack' : isActive ? (args.activeStatus ?? 'active') : args.best[index]! > 0 ? 'improved' : 'idle',
      tags: bestTags,
    });
  }

  const rootIndex = args.scenario.nodes.findIndex((node) => node.id === args.scenario.rootId);
  const insights: DpInsight[] = [
    { label: 'Nodes', value: String(args.scenario.nodes.length), tone: 'accent' },
    { label: 'Root best', value: rootIndex >= 0 ? String(args.best[rootIndex] ?? 0) : '0', tone: 'success' },
    { label: 'Chosen', value: String(args.chosen.size), tone: 'warning' },
    { label: 'Postorder', value: args.postorder.map((index) => args.scenario.nodes[index]!.label).join(' → '), tone: 'info' },
    { label: 'Strip', value: `4 × ${args.scenario.nodes.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'dp-on-trees',
    modeLabel: 'DP on Trees',
    phaseLabel: args.phaseLabel,
    resultLabel: rootIndex >= 0 ? `best = ${args.best[rootIndex] ?? 0}` : 'best = 0',
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `4 × ${args.scenario.nodes.length}`,
    activeLabel: args.activeIndex === undefined ? null : args.scenario.nodes[args.activeIndex]!.label,
    pathLabel: independentSetLabel(args.scenario, args.chosen),
    primaryItemsLabel: 'Tree edges',
    primaryItems: args.scenario.nodes
      .filter((node) => node.parentId !== null)
      .map((node) => `${node.parentId}→${node.label}`),
    secondaryItemsLabel: 'Postorder nodes',
    secondaryItems: args.postorder.map((index) => args.scenario.nodes[index]!.label),
    insights,
    rowHeaders,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function independentSetLabel(scenario: TreeDpScenario, chosen: ReadonlySet<number>): string {
  const labels = Array.from(chosen).sort((left, right) => left - right).map((index) => scenario.nodes[index]!.label);
  return labels.length > 0 ? `Chosen: ${labels.join(' · ')}` : 'Chosen: pending';
}
