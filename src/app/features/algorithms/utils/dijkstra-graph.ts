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

function randomWeight(): number {
  return Math.floor(Math.random() * 9) + 1;
}

function edgeId(a: string, b: string): string {
  return [a, b].sort().join('__');
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
