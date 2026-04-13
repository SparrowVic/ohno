import {
  NetworkComputation,
  NetworkEdgeSnapshot,
  NetworkTraceTag,
} from '../models/network';
import { SortStep } from '../models/sort-step';
import { HopcroftKarpScenario, LayeredNetworkEdge, LayeredNetworkNode } from '../utils/network-scenarios';
import { createNetworkStep, NetworkStepNodeState } from './network-step';

const INF = Number.MAX_SAFE_INTEGER;

export function* hopcroftKarpGenerator(scenario: HopcroftKarpScenario): Generator<SortStep> {
  const pairU = new Map<string, string | null>(scenario.leftIds.map((id) => [id, null]));
  const pairV = new Map<string, string | null>(scenario.rightIds.map((id) => [id, null]));
  const adjacency = buildAdjacency(scenario);
  const labelById = new Map(scenario.nodes.map((node) => [node.id, node.label]));
  let phaseIndex = 0;

  yield createSnapshot({
    scenario,
    pairU,
    pairV,
    levelByNode: new Map(),
    phaseLabel: 'Initialize matching',
    statusLabel: 'No nodes are matched yet',
    resultLabel: `matching 0/${scenario.rightIds.length}`,
    frontierLabel: 'BFS frontier',
    queueLabel: 'BFS queue',
    queue: [],
    focusItemsLabel: 'Current matching',
    focusItems: [],
    description: 'Start with an empty matching and prepare the layered BFS/DFS phases.',
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    phaseIndex += 1;
    const dist = new Map<string, number>(scenario.leftIds.map((id) => [id, INF]));
    const levelByNode = new Map<string, number>();
    const queue: string[] = [];

    for (const leftId of scenario.leftIds) {
      if (pairU.get(leftId) === null) {
        dist.set(leftId, 0);
        levelByNode.set(leftId, 0);
        queue.push(leftId);
      }
    }

    yield createSnapshot({
      scenario,
      pairU,
      pairV,
      levelByNode,
      frontierIds: new Set(queue),
      phaseLabel: `BFS phase ${phaseIndex}`,
      statusLabel: 'Seed all free left nodes',
      resultLabel: matchingResult(pairU, scenario.rightIds.length),
      frontierLabel: 'BFS frontier',
      queueLabel: 'BFS queue',
      queue,
      focusItemsLabel: 'Current matching',
      focusItems: matchingLabels(pairU, labelById),
      description: 'Free left-side nodes enter the queue as simultaneous BFS sources.',
      activeCodeLine: 3,
      computation: {
        label: 'Queue seeds',
        expression: queue.map((id) => labelById.get(id) ?? id).join(', ') || '∅',
        result: `${queue.length} source(s)`,
        decision: 'Only unmatched left nodes can start shortest augmenting paths.',
      },
    });

    let foundAugmentingPath = false;
    let queueIndex = 0;
    while (queueIndex < queue.length) {
      const currentLeft = queue[queueIndex++]!;

      yield createSnapshot({
        scenario,
        pairU,
        pairV,
        levelByNode,
        currentNodeId: currentLeft,
        frontierIds: new Set(queue.slice(queueIndex)),
        phaseLabel: `BFS phase ${phaseIndex}`,
        statusLabel: 'Expand one left node',
        resultLabel: matchingResult(pairU, scenario.rightIds.length),
        frontierLabel: 'BFS frontier',
        queueLabel: 'BFS queue',
        queue: queue.slice(queueIndex),
        focusItemsLabel: 'Current matching',
        focusItems: matchingLabels(pairU, labelById),
        description: `Inspect every candidate edge leaving ${labelById.get(currentLeft) ?? currentLeft}.`,
        activeCodeLine: 4,
      });

      for (const edge of adjacency.get(currentLeft) ?? []) {
        const rightId = edge.toId;
        const mate = pairV.get(rightId);
        if (!levelByNode.has(rightId)) {
          levelByNode.set(rightId, (dist.get(currentLeft) ?? 0) + 1);
        }

        let decision = `${labelById.get(rightId) ?? rightId} is free and can end an augmenting path.`;
        if (mate) {
          decision = `${labelById.get(rightId) ?? rightId} is matched with ${labelById.get(mate) ?? mate}; queue that mate one layer deeper.`;
        }

        yield createSnapshot({
          scenario,
          pairU,
          pairV,
          levelByNode,
          currentNodeId: currentLeft,
          frontierIds: new Set(queue.slice(queueIndex)),
          activeEdgeId: edge.id,
          phaseLabel: `BFS phase ${phaseIndex}`,
          statusLabel: 'Inspect alternating edge',
          resultLabel: matchingResult(pairU, scenario.rightIds.length),
          frontierLabel: 'BFS frontier',
          queueLabel: 'BFS queue',
          queue: queue.slice(queueIndex),
          focusItemsLabel: 'Current matching',
          focusItems: matchingLabels(pairU, labelById),
          description: `Check whether ${labelById.get(currentLeft) ?? currentLeft} → ${labelById.get(rightId) ?? rightId} extends the shortest alternating frontier.`,
          activeCodeLine: 5,
          computation: {
            label: 'Alternating step',
            expression: `${labelById.get(currentLeft) ?? currentLeft} → ${labelById.get(rightId) ?? rightId}`,
            result: mate ? `matched to ${labelById.get(mate) ?? mate}` : 'free right node',
            decision,
          },
        });

        if (!mate) {
          foundAugmentingPath = true;
          continue;
        }

        if ((dist.get(mate) ?? INF) !== INF) {
          continue;
        }

        const nextDistance = (dist.get(currentLeft) ?? 0) + 2;
        dist.set(mate, nextDistance);
        levelByNode.set(mate, nextDistance);
        queue.push(mate);
      }
    }

    if (!foundAugmentingPath) {
      yield createSnapshot({
        scenario,
        pairU,
        pairV,
        levelByNode,
        phaseLabel: `Complete after phase ${phaseIndex}`,
        statusLabel: 'No augmenting path remains',
        resultLabel: matchingResult(pairU, scenario.rightIds.length),
        frontierLabel: 'BFS frontier',
        queueLabel: 'BFS queue',
        queue: [],
        focusItemsLabel: 'Final matching',
        focusItems: matchingLabels(pairU, labelById),
        description: 'BFS cannot reach any free right node, so the current matching is maximum.',
        activeCodeLine: 10,
        phase: 'graph-complete',
        computation: {
          label: 'Shortest-path test',
          expression: 'reachable free right = false',
          result: `|M| = ${matchingSize(pairU)}`,
          decision: 'Hopcroft-Karp stops when the layered graph has no augmenting path.',
        },
      });
      return;
    }

    const candidateEdgeIds = computeCandidateEdges(scenario, dist, pairV);
    yield createSnapshot({
      scenario,
      pairU,
      pairV,
      levelByNode,
      candidateEdgeIds,
      phaseLabel: `DFS phase ${phaseIndex}`,
      statusLabel: 'Layer graph ready',
      resultLabel: matchingResult(pairU, scenario.rightIds.length),
      frontierLabel: 'Shortest layers',
      queueLabel: 'Layer queue',
      queue: scenario.leftIds.filter((id) => (dist.get(id) ?? INF) !== INF),
      focusItemsLabel: 'Current matching',
      focusItems: matchingLabels(pairU, labelById),
      description: 'The BFS layers now constrain DFS to shortest augmenting paths only.',
      activeCodeLine: 6,
      computation: {
        label: 'Level graph',
        expression: `${candidateEdgeIds.size} admissible edge(s)`,
        result: `${matchingSize(pairU)} matched`,
        decision: 'DFS now tries to pack as many shortest augmenting paths as possible into this phase.',
      },
    });

    let augmentationsThisPhase = 0;
    for (const leftId of scenario.leftIds) {
      if (pairU.get(leftId)) {
        continue;
      }
      const path = findAugmentingPath(leftId, adjacency, pairV, dist, new Set<string>());
      if (!path) {
        continue;
      }

      augmentationsThisPhase += 1;
      const pathEdgeIds = new Set(pathToEdgeIds(path));
      yield createSnapshot({
        scenario,
        pairU,
        pairV,
        levelByNode,
        candidateEdgeIds,
        activePathNodeIds: new Set(path),
        activePathEdgeIds: pathEdgeIds,
        phaseLabel: `DFS phase ${phaseIndex}`,
        statusLabel: 'Augmenting path found',
        resultLabel: matchingResult(pairU, scenario.rightIds.length),
        frontierLabel: 'Shortest path',
        queueLabel: 'Layer queue',
        queue: [],
        activeRouteLabel: labelsFor(path, labelById).join(' → '),
        focusItemsLabel: 'Current matching',
        focusItems: matchingLabels(pairU, labelById),
        description: 'A shortest alternating path has been reconstructed and is ready for augmentation.',
        activeCodeLine: 7,
        computation: {
          label: 'Path length',
          expression: labelsFor(path, labelById).join(' → '),
          result: `+1 match`,
          decision: 'Flip matched/unmatched edges along this alternating path.',
        },
      });

      applyAugmentation(path, pairU, pairV);

      yield createSnapshot({
        scenario,
        pairU,
        pairV,
        levelByNode,
        activePathNodeIds: new Set(path),
        activePathEdgeIds: pathEdgeIds,
        phaseLabel: `DFS phase ${phaseIndex}`,
        statusLabel: 'Matching updated',
        resultLabel: matchingResult(pairU, scenario.rightIds.length),
        frontierLabel: 'Current matching',
        queueLabel: 'Layer queue',
        queue: [],
        activeRouteLabel: labelsFor(path, labelById).join(' → '),
        focusItemsLabel: 'Current matching',
        focusItems: matchingLabels(pairU, labelById),
        description: 'Every edge on the alternating path toggles, increasing the matching by one.',
        activeCodeLine: 8,
        phase: 'relax',
        computation: {
          label: 'Matching size',
          expression: `${matchingSize(pairU) - 1} + 1`,
          result: String(matchingSize(pairU)),
          decision: 'The augmenting path increases the matching cardinality by exactly one.',
        },
      });
    }

    if (augmentationsThisPhase === 0) {
      yield createSnapshot({
        scenario,
        pairU,
        pairV,
        levelByNode,
        candidateEdgeIds,
        phaseLabel: `Complete after phase ${phaseIndex}`,
        statusLabel: 'Layer graph could not augment further',
        resultLabel: matchingResult(pairU, scenario.rightIds.length),
        frontierLabel: 'Layer graph',
        queueLabel: 'Layer queue',
        queue: [],
        focusItemsLabel: 'Final matching',
        focusItems: matchingLabels(pairU, labelById),
        description: 'No DFS path survived the shortest-layer constraints, so the current matching is final.',
        activeCodeLine: 10,
        phase: 'graph-complete',
      });
      return;
    }

    yield createSnapshot({
      scenario,
      pairU,
      pairV,
      levelByNode,
      phaseLabel: `Phase ${phaseIndex} complete`,
      statusLabel: `${augmentationsThisPhase} shortest path(s) packed`,
      resultLabel: matchingResult(pairU, scenario.rightIds.length),
      frontierLabel: 'Current matching',
      queueLabel: 'Layer queue',
      queue: [],
      focusItemsLabel: 'Current matching',
      focusItems: matchingLabels(pairU, labelById),
      description: 'This phase is done; rebuild BFS layers to search for the next batch of shortest augmenting paths.',
      activeCodeLine: 9,
      phase: 'pass-complete',
      computation: {
        label: 'Phase gain',
        expression: `${augmentationsThisPhase} augmenting path(s)`,
        result: matchingResult(pairU, scenario.rightIds.length),
        decision: 'Hopcroft-Karp accelerates matching by augmenting several shortest paths in one BFS phase.',
      },
    });
  }
}

function createSnapshot(args: {
  readonly scenario: HopcroftKarpScenario;
  readonly pairU: ReadonlyMap<string, string | null>;
  readonly pairV: ReadonlyMap<string, string | null>;
  readonly levelByNode: ReadonlyMap<string, number>;
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly frontierLabel: string;
  readonly queueLabel: string;
  readonly queue: readonly string[];
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly frontierIds?: ReadonlySet<string>;
  readonly activeEdgeId?: string | null;
  readonly activePathNodeIds?: ReadonlySet<string>;
  readonly activePathEdgeIds?: ReadonlySet<string>;
  readonly candidateEdgeIds?: ReadonlySet<string>;
  readonly blockedEdgeIds?: ReadonlySet<string>;
  readonly currentNodeId?: string | null;
  readonly activeRouteLabel?: string | null;
  readonly computation?: NetworkComputation | null;
}): SortStep {
  const labelById = new Map(args.scenario.nodes.map((node) => [node.id, node.label]));
  const nodeState = new Map<string, NetworkStepNodeState>();
  for (const node of args.scenario.nodes) {
    const partnerId = node.lane === 'left' ? args.pairU.get(node.id) : args.pairV.get(node.id);
    const isMatched = partnerId !== null && partnerId !== undefined;
    const level = args.levelByNode.get(node.id) ?? null;
    const tags: NetworkTraceTag[] = [];
    tags.push(isMatched ? 'matched' : 'free');
    if (level !== null) tags.push('level');
    if (args.frontierIds?.has(node.id)) tags.push('frontier');
    if (args.currentNodeId === node.id) tags.push('current');
    if (args.activePathNodeIds?.has(node.id)) tags.push('augment');

    let status: NetworkStepNodeState['status'] = 'idle';
    if (args.currentNodeId === node.id) {
      status = 'current';
    } else if (args.frontierIds?.has(node.id)) {
      status = 'frontier';
    } else if (args.activePathNodeIds?.has(node.id) || isMatched) {
      status = 'linked';
    } else if (level !== null) {
      status = 'visited';
    }

    nodeState.set(node.id, {
      level,
      linkLabel: isMatched ? `↔ ${labelById.get(partnerId ?? '') ?? partnerId}` : 'free',
      status,
      tags,
    });
  }

  const matchedEdgeIds = new Set(
    [...args.pairU.entries()]
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .map(([leftId, rightId]) => `${leftId}->${rightId}`),
  );

  const edges: NetworkEdgeSnapshot[] = args.scenario.edges.map((edge) => ({
    id: edge.id,
    fromId: edge.fromId,
    toId: edge.toId,
    directed: true,
    primaryText: matchedEdgeIds.has(edge.id) ? 'match' : 'free',
    secondaryText: null,
    status: args.activePathEdgeIds?.has(edge.id)
      ? 'augment'
      : args.activeEdgeId === edge.id
        ? 'active'
        : matchedEdgeIds.has(edge.id)
          ? 'matched'
          : args.blockedEdgeIds?.has(edge.id)
            ? 'blocked'
            : args.candidateEdgeIds?.has(edge.id)
              ? 'candidate'
              : 'base',
  }));

  return createNetworkStep({
    mode: 'hopcroft-karp',
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

function buildAdjacency(scenario: HopcroftKarpScenario): Map<string, readonly LayeredNetworkEdge[]> {
  const map = new Map<string, LayeredNetworkEdge[]>();
  for (const leftId of scenario.leftIds) {
    map.set(leftId, []);
  }
  for (const edge of scenario.edges) {
    map.get(edge.fromId)?.push(edge);
  }
  return map;
}

function computeCandidateEdges(
  scenario: HopcroftKarpScenario,
  dist: ReadonlyMap<string, number>,
  pairV: ReadonlyMap<string, string | null>,
): ReadonlySet<string> {
  const result = new Set<string>();
  for (const edge of scenario.edges) {
    const leftDistance = dist.get(edge.fromId) ?? INF;
    if (leftDistance === INF) continue;
    const mate = pairV.get(edge.toId);
    if (!mate || (dist.get(mate) ?? INF) === leftDistance + 2) {
      result.add(edge.id);
    }
  }
  return result;
}

function findAugmentingPath(
  leftId: string,
  adjacency: ReadonlyMap<string, readonly LayeredNetworkEdge[]>,
  pairV: ReadonlyMap<string, string | null>,
  dist: ReadonlyMap<string, number>,
  seenLeft: Set<string>,
): readonly string[] | null {
  seenLeft.add(leftId);
  for (const edge of adjacency.get(leftId) ?? []) {
    const rightId = edge.toId;
    const mate = pairV.get(rightId);
    if (!mate) {
      return [leftId, rightId];
    }
    if (seenLeft.has(mate)) {
      continue;
    }
    if ((dist.get(mate) ?? INF) !== (dist.get(leftId) ?? 0) + 2) {
      continue;
    }
    const suffix = findAugmentingPath(mate, adjacency, pairV, dist, seenLeft);
    if (suffix) {
      return [leftId, rightId, ...suffix];
    }
  }
  return null;
}

function applyAugmentation(
  path: readonly string[],
  pairU: Map<string, string | null>,
  pairV: Map<string, string | null>,
): void {
  for (let index = 0; index < path.length - 1; index += 2) {
    const leftId = path[index]!;
    const rightId = path[index + 1]!;
    pairU.set(leftId, rightId);
    pairV.set(rightId, leftId);
  }
}

function pathToEdgeIds(path: readonly string[]): readonly string[] {
  const result: string[] = [];
  for (let index = 0; index < path.length - 1; index++) {
    const fromId = path[index]!;
    const toId = path[index + 1]!;
    if (index % 2 === 0) {
      result.push(`${fromId}->${toId}`);
    } else {
      result.push(`${toId}->${fromId}`);
    }
  }
  return result;
}

function labelsFor(path: readonly string[], labelById: ReadonlyMap<string, string>): readonly string[] {
  return path.map((id) => labelById.get(id) ?? id);
}

function matchingLabels(
  pairU: ReadonlyMap<string, string | null>,
  labelById: ReadonlyMap<string, string>,
): readonly string[] {
  return [...pairU.entries()]
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([leftId, rightId]) => `${labelById.get(leftId) ?? leftId}-${labelById.get(rightId) ?? rightId}`)
    .sort((left, right) => left.localeCompare(right));
}

function matchingSize(pairU: ReadonlyMap<string, string | null>): number {
  return [...pairU.values()].filter((value) => value !== null).length;
}

function matchingResult(pairU: ReadonlyMap<string, string | null>, totalRight: number): string {
  return `matching ${matchingSize(pairU)}/${totalRight}`;
}
