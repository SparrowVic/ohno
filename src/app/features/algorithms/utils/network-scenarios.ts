import { NetworkLane } from '../models/network';

export interface LayeredNetworkNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly lane: NetworkLane;
}

export interface LayeredNetworkEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly directed: boolean;
  readonly capacity: number | null;
}

export interface DinicScenario {
  readonly kind: 'dinic';
  readonly nodes: readonly LayeredNetworkNode[];
  readonly edges: readonly LayeredNetworkEdge[];
  readonly sourceId: string;
  readonly sinkId: string;
}

export interface HopcroftKarpScenario {
  readonly kind: 'hopcroft-karp';
  readonly nodes: readonly LayeredNetworkNode[];
  readonly edges: readonly LayeredNetworkEdge[];
  readonly leftIds: readonly string[];
  readonly rightIds: readonly string[];
}

export function createDinicScenario(size: number): DinicScenario {
  return size >= 10 ? createLargeDinicScenario() : createCompactDinicScenario();
}

export function createHopcroftKarpScenario(size: number): HopcroftKarpScenario {
  return size >= 10 ? createLargeMatchingScenario() : createCompactMatchingScenario();
}

export function createEdmondsKarpScenario(size: number): DinicScenario {
  return size >= 10 ? createLargeEdmondsKarpScenario() : createCompactEdmondsKarpScenario();
}

function createCompactEdmondsKarpScenario(): DinicScenario {
  const nodes: readonly LayeredNetworkNode[] = [
    { id: 's', label: 'S', x: 110, y: 280, lane: 'source' },
    { id: 'a', label: 'A', x: 250, y: 150, lane: 'inner' },
    { id: 'b', label: 'B', x: 250, y: 408, lane: 'inner' },
    { id: 'c', label: 'C', x: 438, y: 132, lane: 'inner' },
    { id: 'd', label: 'D', x: 438, y: 282, lane: 'inner' },
    { id: 'e', label: 'E', x: 438, y: 432, lane: 'inner' },
    { id: 'f', label: 'F', x: 670, y: 224, lane: 'inner' },
    { id: 't', label: 'T', x: 840, y: 280, lane: 'sink' },
  ];

  return {
    kind: 'dinic',
    sourceId: 's',
    sinkId: 't',
    nodes,
    edges: [
      edge('s', 'a', 5),
      edge('s', 'b', 4),
      edge('a', 'c', 3),
      edge('a', 'd', 2),
      edge('b', 'd', 3),
      edge('b', 'e', 2),
      edge('c', 'f', 2),
      edge('d', 'f', 2),
      edge('d', 't', 1),
      edge('e', 't', 2),
      edge('f', 't', 4),
    ],
  };
}

function createLargeEdmondsKarpScenario(): DinicScenario {
  const nodes: readonly LayeredNetworkNode[] = [
    { id: 's', label: 'S', x: 96, y: 280, lane: 'source' },
    { id: 'a', label: 'A', x: 220, y: 116, lane: 'inner' },
    { id: 'b', label: 'B', x: 220, y: 280, lane: 'inner' },
    { id: 'c', label: 'C', x: 220, y: 444, lane: 'inner' },
    { id: 'd', label: 'D', x: 430, y: 108, lane: 'inner' },
    { id: 'e', label: 'E', x: 430, y: 256, lane: 'inner' },
    { id: 'f', label: 'F', x: 430, y: 426, lane: 'inner' },
    { id: 'g', label: 'G', x: 668, y: 164, lane: 'inner' },
    { id: 'h', label: 'H', x: 668, y: 372, lane: 'inner' },
    { id: 't', label: 'T', x: 896, y: 280, lane: 'sink' },
  ];

  return {
    kind: 'dinic',
    sourceId: 's',
    sinkId: 't',
    nodes,
    edges: [
      edge('s', 'a', 6),
      edge('s', 'b', 5),
      edge('s', 'c', 4),
      edge('a', 'd', 4),
      edge('a', 'e', 2),
      edge('b', 'e', 3),
      edge('b', 'f', 2),
      edge('c', 'f', 4),
      edge('d', 'g', 3),
      edge('e', 'g', 2),
      edge('e', 'h', 3),
      edge('f', 'h', 4),
      edge('g', 't', 4),
      edge('h', 't', 5),
    ],
  };
}

function createCompactDinicScenario(): DinicScenario {
  const nodes: readonly LayeredNetworkNode[] = [
    { id: 's', label: 'S', x: 110, y: 280, lane: 'source' },
    { id: 'a', label: 'A', x: 250, y: 180, lane: 'inner' },
    { id: 'b', label: 'B', x: 250, y: 390, lane: 'inner' },
    { id: 'c', label: 'C', x: 430, y: 150, lane: 'inner' },
    { id: 'd', label: 'D', x: 430, y: 335, lane: 'inner' },
    { id: 'e', label: 'E', x: 620, y: 220, lane: 'inner' },
    { id: 'g', label: 'G', x: 720, y: 340, lane: 'inner' },
    { id: 't', label: 'T', x: 840, y: 280, lane: 'sink' },
  ];

  return {
    kind: 'dinic',
    sourceId: 's',
    sinkId: 't',
    nodes,
    edges: [
      edge('s', 'a', 4),
      edge('s', 'b', 5),
      edge('a', 'c', 3),
      edge('a', 'd', 2),
      edge('b', 'c', 2),
      edge('b', 'd', 4),
      edge('c', 't', 3),
      edge('d', 'e', 5),
      edge('e', 'g', 5),
      edge('g', 't', 5),
    ],
  };
}

function createLargeDinicScenario(): DinicScenario {
  const nodes: readonly LayeredNetworkNode[] = [
    { id: 's', label: 'S', x: 96, y: 280, lane: 'source' },
    { id: 'a', label: 'A', x: 240, y: 150, lane: 'inner' },
    { id: 'b', label: 'B', x: 240, y: 410, lane: 'inner' },
    { id: 'c', label: 'C', x: 420, y: 120, lane: 'inner' },
    { id: 'd', label: 'D', x: 420, y: 260, lane: 'inner' },
    { id: 'e', label: 'E', x: 420, y: 430, lane: 'inner' },
    { id: 'f', label: 'F', x: 610, y: 160, lane: 'inner' },
    { id: 'g', label: 'G', x: 610, y: 360, lane: 'inner' },
    { id: 'h', label: 'H', x: 770, y: 260, lane: 'inner' },
    { id: 't', label: 'T', x: 900, y: 280, lane: 'sink' },
  ];

  return {
    kind: 'dinic',
    sourceId: 's',
    sinkId: 't',
    nodes,
    edges: [
      edge('s', 'a', 6),
      edge('s', 'b', 7),
      edge('a', 'c', 4),
      edge('a', 'd', 2),
      edge('b', 'd', 4),
      edge('b', 'e', 4),
      edge('c', 'f', 4),
      edge('d', 'f', 2),
      edge('d', 'g', 3),
      edge('e', 'g', 4),
      edge('f', 't', 4),
      edge('g', 'h', 5),
      edge('h', 't', 5),
    ],
  };
}

function createCompactMatchingScenario(): HopcroftKarpScenario {
  const leftIds = ['u1', 'u2', 'u3', 'u4'] as const;
  const rightIds = ['v1', 'v2', 'v3', 'v4'] as const;

  return {
    kind: 'hopcroft-karp',
    leftIds,
    rightIds,
    nodes: [
      ...buildPartition(leftIds, 250, ['U1', 'U2', 'U3', 'U4'], 'left'),
      ...buildPartition(rightIds, 710, ['V1', 'V2', 'V3', 'V4'], 'right'),
    ],
    edges: [
      edge('u1', 'v1'),
      edge('u1', 'v2'),
      edge('u2', 'v1'),
      edge('u2', 'v3'),
      edge('u3', 'v2'),
      edge('u3', 'v4'),
      edge('u4', 'v3'),
    ],
  };
}

function createLargeMatchingScenario(): HopcroftKarpScenario {
  const leftIds = ['u1', 'u2', 'u3', 'u4', 'u5'] as const;
  const rightIds = ['v1', 'v2', 'v3', 'v4', 'v5'] as const;

  return {
    kind: 'hopcroft-karp',
    leftIds,
    rightIds,
    nodes: [
      ...buildPartition(leftIds, 240, ['U1', 'U2', 'U3', 'U4', 'U5'], 'left'),
      ...buildPartition(rightIds, 720, ['V1', 'V2', 'V3', 'V4', 'V5'], 'right'),
    ],
    edges: [
      edge('u1', 'v1'),
      edge('u1', 'v2'),
      edge('u2', 'v1'),
      edge('u2', 'v3'),
      edge('u3', 'v2'),
      edge('u3', 'v4'),
      edge('u4', 'v3'),
      edge('u4', 'v5'),
      edge('u5', 'v4'),
    ],
  };
}

function buildPartition(
  ids: readonly string[],
  x: number,
  labels: readonly string[],
  lane: Extract<NetworkLane, 'left' | 'right'>,
): readonly LayeredNetworkNode[] {
  const gap = ids.length > 1 ? 320 / (ids.length - 1) : 0;
  return ids.map((id, index) => ({
    id,
    label: labels[index] ?? id.toUpperCase(),
    x,
    y: 130 + Math.round(index * gap),
    lane,
  }));
}

function edge(fromId: string, toId: string, capacity: number | null = null): LayeredNetworkEdge {
  return {
    id: `${fromId}->${toId}`,
    fromId,
    toId,
    directed: true,
    capacity,
  };
}
