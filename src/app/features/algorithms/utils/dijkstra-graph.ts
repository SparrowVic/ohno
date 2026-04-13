import { WeightedGraphData, WeightedGraphEdge, WeightedGraphNode } from '../models/graph';

interface GraphLayout {
  readonly positions: readonly [number, number][];
  readonly spine: readonly [number, number][];
  readonly optional: readonly [number, number][];
}

const GRAPH_LAYOUTS: Record<number, GraphLayout> = {
  6: {
    positions: [
      [140, 132],
      [394, 92],
      [716, 156],
      [226, 404],
      [520, 334],
      [792, 470],
    ],
    spine: [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [4, 5],
    ],
    optional: [
      [1, 4],
      [2, 4],
      [1, 3],
      [2, 5],
      [0, 4],
      [3, 5],
    ],
  },
  8: {
    positions: [
      [120, 132],
      [300, 74],
      [518, 98],
      [766, 148],
      [208, 314],
      [438, 270],
      [662, 336],
      [822, 518],
    ],
    spine: [
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
    optional: [
      [1, 5],
      [2, 5],
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 7],
      [1, 4],
      [3, 7],
      [0, 5],
    ],
  },
  10: {
    positions: [
      [112, 128],
      [254, 76],
      [428, 66],
      [620, 110],
      [808, 160],
      [146, 316],
      [322, 260],
      [516, 314],
      [698, 372],
      [856, 526],
    ],
    spine: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
    ],
    optional: [
      [1, 6],
      [2, 6],
      [2, 7],
      [3, 7],
      [4, 8],
      [5, 7],
      [6, 8],
      [7, 9],
      [1, 5],
      [3, 8],
      [2, 5],
      [4, 9],
    ],
  },
};

export function generateDijkstraGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const nodes: WeightedGraphNode[] = layout.positions.slice(0, size).map(([x, y], index) => ({
    id: `node-${index}`,
    label: labels[index],
    x,
    y,
  }));

  const edgePairs: [number, number][] = [...layout.spine];
  const optionalPairs = shuffle([...layout.optional]);
  const minEdges = size + Math.max(2, Math.floor(size / 2));

  for (const pair of optionalPairs) {
    if (edgePairs.length >= minEdges) break;
    edgePairs.push(pair);
  }

  for (const pair of optionalPairs) {
    if (edgePairs.some(([a, b]) => hasPair(a, b, pair))) continue;
    if (Math.random() > 0.48) {
      edgePairs.push(pair);
    }
  }

  const edges: WeightedGraphEdge[] = edgePairs.map(([fromIndex, toIndex]) => {
    const from = nodes[fromIndex];
    const to = nodes[toIndex];
    return {
      id: edgeId(from.id, to.id),
      from: from.id,
      to: to.id,
      weight: randomWeight(),
    };
  });

  return {
    nodes,
    edges,
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateTraversalGraph(size: number): WeightedGraphData {
  const graph = generateDijkstraGraph(size);
  return {
    ...graph,
    edges: graph.edges.map((edge) => ({
      ...edge,
      weight: 1,
    })),
  };
}

export function generateDagGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const nodes: WeightedGraphNode[] = layout.positions.slice(0, size).map(([x, y], index) => ({
    id: `node-${index}`,
    label: labels[index],
    x,
    y,
  }));

  const edgePairs: [number, number][] = [...layout.spine].map(([a, b]) => [Math.min(a, b), Math.max(a, b)]);
  const optionalPairs = shuffle([...layout.optional]).map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as [number, number]);
  const minEdges = size + Math.max(1, Math.floor(size / 3));

  for (const pair of optionalPairs) {
    if (edgePairs.length >= minEdges) break;
    if (!edgePairs.some(([a, b]) => a === pair[0] && b === pair[1])) {
      edgePairs.push(pair);
    }
  }

  const edges: WeightedGraphEdge[] = edgePairs.map(([fromIndex, toIndex]) => ({
    id: directedEdgeId(nodes[fromIndex].id, nodes[toIndex].id),
    from: nodes[fromIndex].id,
    to: nodes[toIndex].id,
    weight: 1,
    directed: true,
  }));

  return {
    nodes,
    edges,
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateCycleDetectionGraph(size: number): WeightedGraphData {
  const dag = generateDagGraph(size);
  const cycleTargets: Record<number, [number, number]> = {
    6: [4, 1],
    8: [6, 2],
    10: [8, 3],
  };
  const [fromIndex, toIndex] = cycleTargets[size] ?? cycleTargets[8];
  const from = dag.nodes[fromIndex];
  const to = dag.nodes[toIndex];
  const cycleEdge: WeightedGraphEdge = {
    id: directedEdgeId(from.id, to.id),
    from: from.id,
    to: to.id,
    weight: 1,
    directed: true,
  };

  return {
    ...dag,
    edges: [...dag.edges, cycleEdge],
  };
}

export function generateConnectedComponentsGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const nodes = buildLayoutNodes(layout, size);
  const componentPairs: Record<number, readonly [number, number][]> = {
    6: [
      [0, 1],
      [1, 3],
      [0, 3],
      [2, 4],
      [4, 5],
    ],
    8: [
      [0, 1],
      [0, 4],
      [1, 5],
      [4, 5],
      [2, 3],
      [2, 6],
      [3, 6],
      [6, 7],
    ],
    10: [
      [0, 1],
      [0, 5],
      [1, 6],
      [5, 6],
      [2, 3],
      [3, 4],
      [3, 7],
      [7, 8],
      [2, 7],
    ],
  };

  return {
    nodes,
    edges: (componentPairs[size] ?? componentPairs[8]).map(([fromIndex, toIndex]) => ({
      id: edgeId(nodes[fromIndex].id, nodes[toIndex].id),
      from: nodes[fromIndex].id,
      to: nodes[toIndex].id,
      weight: 1,
    })),
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateBipartiteGraph(size: number): WeightedGraphData {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const leftCount = Math.ceil(size / 2);
  const rightCount = size - leftCount;
  const leftYStep = leftCount > 1 ? 380 / (leftCount - 1) : 0;
  const rightYStep = rightCount > 1 ? 380 / Math.max(1, rightCount - 1) : 0;

  const nodes: WeightedGraphNode[] = Array.from({ length: size }, (_, index) => {
    const isLeft = index < leftCount;
    const laneIndex = isLeft ? index : index - leftCount;
    return {
      id: `node-${index}`,
      label: labels[index] ?? `N${index + 1}`,
      x: isLeft ? 264 : 704,
      y: 124 + (isLeft ? laneIndex * leftYStep : laneIndex * rightYStep),
    };
  });

  const basePairs: Record<number, readonly [number, number][]> = {
    6: [
      [0, 3],
      [0, 4],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 5],
    ],
    8: [
      [0, 4],
      [0, 5],
      [1, 5],
      [1, 6],
      [2, 6],
      [2, 7],
      [3, 4],
      [3, 7],
      [1, 4],
    ],
    10: [
      [0, 5],
      [0, 6],
      [1, 6],
      [1, 7],
      [2, 7],
      [2, 8],
      [3, 8],
      [3, 9],
      [4, 5],
      [4, 9],
      [1, 5],
      [2, 9],
    ],
  };

  const edges: WeightedGraphEdge[] = [...(basePairs[size] ?? basePairs[8])].map(([fromIndex, toIndex]) => ({
    id: edgeId(nodes[fromIndex].id, nodes[toIndex].id),
    from: nodes[fromIndex].id,
    to: nodes[toIndex].id,
    weight: 1,
  }));

  if (Math.random() > 0.45 && leftCount >= 2) {
    const from = nodes[0];
    const to = nodes[1];
    edges.push({
      id: edgeId(from.id, to.id),
      from: from.id,
      to: to.id,
      weight: 1,
    });
  }

  return {
    nodes,
    edges,
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateBellmanFordGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const nodes = buildLayoutNodes(layout, size);
  const directedPairs: Record<number, readonly [number, number, number][]> = {
    6: [
      [0, 1, 4],
      [0, 3, 5],
      [1, 2, -2],
      [1, 4, 3],
      [3, 4, 2],
      [4, 5, -1],
      [2, 5, 3],
    ],
    8: [
      [0, 1, 4],
      [0, 4, 5],
      [1, 2, -2],
      [1, 5, 4],
      [4, 5, 2],
      [5, 6, -1],
      [2, 3, 3],
      [2, 6, 4],
      [6, 7, 2],
      [3, 7, 1],
      [1, 4, 1],
    ],
    10: [
      [0, 1, 5],
      [0, 5, 6],
      [1, 2, -2],
      [1, 6, 4],
      [5, 6, 2],
      [6, 7, -1],
      [2, 3, 3],
      [2, 7, 5],
      [7, 8, 2],
      [3, 4, 2],
      [4, 9, 1],
      [8, 9, -2],
      [1, 5, 1],
      [3, 8, 2],
    ],
  };

  return {
    nodes,
    edges: (directedPairs[size] ?? directedPairs[8]).map(([fromIndex, toIndex, weight]) => ({
      id: directedEdgeId(nodes[fromIndex].id, nodes[toIndex].id),
      from: nodes[fromIndex].id,
      to: nodes[toIndex].id,
      weight,
      directed: true,
    })),
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateBridgesGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const nodes = buildLayoutNodes(layout, size);
  const bridgePairs: Record<number, readonly [number, number][]> = {
    6: [
      [0, 1],
      [1, 3],
      [3, 0],
      [1, 4],
      [4, 2],
      [4, 5],
    ],
    8: [
      [0, 1],
      [1, 4],
      [4, 0],
      [1, 5],
      [5, 2],
      [2, 3],
      [3, 6],
      [6, 2],
      [5, 7],
    ],
    10: [
      [0, 1],
      [1, 5],
      [5, 0],
      [1, 6],
      [6, 2],
      [2, 3],
      [3, 7],
      [7, 6],
      [3, 4],
      [7, 8],
      [8, 9],
    ],
  };

  return {
    nodes,
    edges: (bridgePairs[size] ?? bridgePairs[8]).map(([fromIndex, toIndex]) => ({
      id: edgeId(nodes[fromIndex].id, nodes[toIndex].id),
      from: nodes[fromIndex].id,
      to: nodes[toIndex].id,
      weight: 1,
    })),
    sourceId: nodes[0]?.id ?? '',
  };
}

export function generateSccGraph(size: number): WeightedGraphData {
  const layout = GRAPH_LAYOUTS[size] ?? GRAPH_LAYOUTS[8];
  const nodes = buildLayoutNodes(layout, size);
  const directedPairs: Record<number, readonly [number, number][]> = {
    6: [
      [0, 1],
      [1, 3],
      [3, 0],
      [1, 2],
      [3, 4],
      [2, 4],
      [4, 2],
      [4, 5],
    ],
    8: [
      [0, 1],
      [1, 4],
      [4, 0],
      [1, 2],
      [4, 5],
      [2, 3],
      [3, 6],
      [6, 2],
      [3, 5],
      [5, 7],
      [7, 5],
      [6, 7],
    ],
    10: [
      [0, 1],
      [1, 5],
      [5, 0],
      [1, 2],
      [5, 6],
      [2, 3],
      [3, 6],
      [6, 2],
      [3, 4],
      [6, 7],
      [4, 8],
      [8, 4],
      [8, 9],
      [7, 9],
      [9, 7],
    ],
  };

  return {
    nodes,
    edges: (directedPairs[size] ?? directedPairs[8]).map(([fromIndex, toIndex]) => ({
      id: directedEdgeId(nodes[fromIndex].id, nodes[toIndex].id),
      from: nodes[fromIndex].id,
      to: nodes[toIndex].id,
      weight: 1,
      directed: true,
    })),
    sourceId: nodes[0]?.id ?? '',
  };
}

function buildLayoutNodes(layout: GraphLayout, size: number): WeightedGraphNode[] {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return layout.positions.slice(0, size).map(([x, y], index) => ({
    id: `node-${index}`,
    label: labels[index],
    x,
    y,
  }));
}

function randomWeight(): number {
  return Math.floor(Math.random() * 9) + 1;
}

function edgeId(a: string, b: string): string {
  return [a, b].sort().join('__');
}

function directedEdgeId(from: string, to: string): string {
  return `${from}__${to}`;
}

function hasPair(a: number, b: number, pair: readonly [number, number]): boolean {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;
  }
  return items;
}
