import { marker as t } from '@jsverse/transloco-keys-manager/marker';

/**
 * Per-algorithm catalog shared by the graph-family Trace tabs (short
 * hint at the top) and the Info tab (full tutorial — how it works,
 * strengths, trade-offs).
 *
 * Covers BFS/DFS-style traversal, shortest paths, MSTs, SCCs,
 * structural-analysis algorithms, flow and matching, disjoint-set
 * utilities, and the grid / matrix adjacencies (A*, Flood Fill,
 * Floyd-Warshall, Hungarian). Keep entries beginner-friendly: plain
 * language, short sentences, one idea per bullet.
 */

export interface GraphAlgorithmTutorial {
  /** Short family label shown as a badge in the Info tutorial card. */
  readonly pattern: string;
  /** One plain-language sentence describing the algorithm's pattern. */
  readonly keyIdea: string;
  /** One short sentence pointing at what to watch on the canvas. */
  readonly watch: string;
  /** Numbered steps describing how the algorithm proceeds. */
  readonly howItWorks: readonly string[];
  /** 2–3 sentences on when this algorithm shines. */
  readonly strengths: readonly string[];
  /** 2–3 sentences on when to avoid it / watch out. */
  readonly weaknesses: readonly string[];
}

interface GraphTutorialKeySet {
  readonly pattern: string;
  readonly keyIdea: string;
  readonly watch: string;
  readonly howItWorks: {
    readonly step1: string;
    readonly step2: string;
    readonly step3: string;
    readonly step4: string;
  };
  readonly strengths: {
    readonly item1: string;
    readonly item2: string;
  };
  readonly weaknesses: {
    readonly item1: string;
    readonly item2: string;
  };
}

function createTutorialFromKeys(keys: GraphTutorialKeySet): GraphAlgorithmTutorial {
  return {
    pattern: keys.pattern,
    keyIdea: keys.keyIdea,
    watch: keys.watch,
    howItWorks: [
      keys.howItWorks.step1,
      keys.howItWorks.step2,
      keys.howItWorks.step3,
      keys.howItWorks.step4,
    ],
    strengths: [keys.strengths.item1, keys.strengths.item2],
    weaknesses: [keys.weaknesses.item1, keys.weaknesses.item2],
  };
}

const GRAPH_TUTORIAL_KEY = {
  bfs: {
    pattern: t('features.algorithms.tutorials.graph.bfs.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.bfs.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.bfs.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.bfs.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.bfs.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.bfs.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.bfs.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.bfs.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.bfs.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.bfs.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.bfs.weaknesses.item2'),
    },
  },
  dfs: {
    pattern: t('features.algorithms.tutorials.graph.dfs.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.dfs.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.dfs.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.dfs.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.dfs.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.dfs.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.dfs.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.dfs.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.dfs.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.dfs.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.dfs.weaknesses.item2'),
    },
  },
  treeTraversals: {
    pattern: t('features.algorithms.tutorials.graph.treeTraversals.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.treeTraversals.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.treeTraversals.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.treeTraversals.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.treeTraversals.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.treeTraversals.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.treeTraversals.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.treeTraversals.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.treeTraversals.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.treeTraversals.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.treeTraversals.weaknesses.item2'),
    },
  },
  dijkstra: {
    pattern: t('features.algorithms.tutorials.graph.dijkstra.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.dijkstra.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.dijkstra.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.dijkstra.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.dijkstra.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.dijkstra.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.dijkstra.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.dijkstra.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.dijkstra.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.dijkstra.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.dijkstra.weaknesses.item2'),
    },
  },
  bellmanFord: {
    pattern: t('features.algorithms.tutorials.graph.bellmanFord.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.bellmanFord.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.bellmanFord.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.bellmanFord.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.bellmanFord.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.bellmanFord.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.bellmanFord.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.bellmanFord.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.bellmanFord.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.bellmanFord.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.bellmanFord.weaknesses.item2'),
    },
  },
  floydWarshall: {
    pattern: t('features.algorithms.tutorials.graph.floydWarshall.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.floydWarshall.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.floydWarshall.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.floydWarshall.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.floydWarshall.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.floydWarshall.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.floydWarshall.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.floydWarshall.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.floydWarshall.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.floydWarshall.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.floydWarshall.weaknesses.item2'),
    },
  },
  aStarPathfinding: {
    pattern: t('features.algorithms.tutorials.graph.aStarPathfinding.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.aStarPathfinding.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.aStarPathfinding.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.aStarPathfinding.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.aStarPathfinding.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.aStarPathfinding.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.aStarPathfinding.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.aStarPathfinding.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.aStarPathfinding.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.aStarPathfinding.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.aStarPathfinding.weaknesses.item2'),
    },
  },
  primsMst: {
    pattern: t('features.algorithms.tutorials.graph.primsMst.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.primsMst.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.primsMst.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.primsMst.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.primsMst.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.primsMst.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.primsMst.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.primsMst.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.primsMst.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.primsMst.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.primsMst.weaknesses.item2'),
    },
  },
  kruskalsMst: {
    pattern: t('features.algorithms.tutorials.graph.kruskalsMst.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.kruskalsMst.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.kruskalsMst.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.kruskalsMst.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.kruskalsMst.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.kruskalsMst.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.kruskalsMst.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.kruskalsMst.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.kruskalsMst.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.kruskalsMst.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.kruskalsMst.weaknesses.item2'),
    },
  },
  tarjanScc: {
    pattern: t('features.algorithms.tutorials.graph.tarjanScc.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.tarjanScc.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.tarjanScc.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.tarjanScc.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.tarjanScc.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.tarjanScc.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.tarjanScc.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.tarjanScc.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.tarjanScc.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.tarjanScc.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.tarjanScc.weaknesses.item2'),
    },
  },
  kosarajuScc: {
    pattern: t('features.algorithms.tutorials.graph.kosarajuScc.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.kosarajuScc.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.kosarajuScc.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.kosarajuScc.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.kosarajuScc.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.kosarajuScc.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.kosarajuScc.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.kosarajuScc.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.kosarajuScc.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.kosarajuScc.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.kosarajuScc.weaknesses.item2'),
    },
  },
  topologicalSortKahn: {
    pattern: t('features.algorithms.tutorials.graph.topologicalSortKahn.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.topologicalSortKahn.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.topologicalSortKahn.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.topologicalSortKahn.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.topologicalSortKahn.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.topologicalSortKahn.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.topologicalSortKahn.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.topologicalSortKahn.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.topologicalSortKahn.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.topologicalSortKahn.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.topologicalSortKahn.weaknesses.item2'),
    },
  },
  cycleDetection: {
    pattern: t('features.algorithms.tutorials.graph.cycleDetection.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.cycleDetection.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.cycleDetection.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.cycleDetection.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.cycleDetection.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.cycleDetection.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.cycleDetection.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.cycleDetection.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.cycleDetection.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.cycleDetection.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.cycleDetection.weaknesses.item2'),
    },
  },
  connectedComponents: {
    pattern: t('features.algorithms.tutorials.graph.connectedComponents.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.connectedComponents.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.connectedComponents.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.connectedComponents.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.connectedComponents.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.connectedComponents.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.connectedComponents.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.connectedComponents.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.connectedComponents.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.connectedComponents.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.connectedComponents.weaknesses.item2'),
    },
  },
  bipartiteCheck: {
    pattern: t('features.algorithms.tutorials.graph.bipartiteCheck.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.bipartiteCheck.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.bipartiteCheck.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.bipartiteCheck.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.bipartiteCheck.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.bipartiteCheck.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.bipartiteCheck.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.bipartiteCheck.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.bipartiteCheck.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.bipartiteCheck.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.bipartiteCheck.weaknesses.item2'),
    },
  },
  bridgesArticulationPoints: {
    pattern: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.bridgesArticulationPoints.weaknesses.item2'),
    },
  },
  eulerPathCircuit: {
    pattern: t('features.algorithms.tutorials.graph.eulerPathCircuit.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.eulerPathCircuit.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.eulerPathCircuit.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.eulerPathCircuit.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.eulerPathCircuit.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.eulerPathCircuit.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.eulerPathCircuit.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.eulerPathCircuit.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.eulerPathCircuit.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.eulerPathCircuit.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.eulerPathCircuit.weaknesses.item2'),
    },
  },
  chromaticNumber: {
    pattern: t('features.algorithms.tutorials.graph.chromaticNumber.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.chromaticNumber.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.chromaticNumber.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.chromaticNumber.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.chromaticNumber.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.chromaticNumber.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.chromaticNumber.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.chromaticNumber.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.chromaticNumber.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.chromaticNumber.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.chromaticNumber.weaknesses.item2'),
    },
  },
  steinerTree: {
    pattern: t('features.algorithms.tutorials.graph.steinerTree.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.steinerTree.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.steinerTree.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.steinerTree.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.steinerTree.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.steinerTree.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.steinerTree.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.steinerTree.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.steinerTree.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.steinerTree.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.steinerTree.weaknesses.item2'),
    },
  },
  dominatorTree: {
    pattern: t('features.algorithms.tutorials.graph.dominatorTree.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.dominatorTree.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.dominatorTree.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.dominatorTree.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.dominatorTree.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.dominatorTree.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.dominatorTree.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.dominatorTree.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.dominatorTree.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.dominatorTree.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.dominatorTree.weaknesses.item2'),
    },
  },
  unionFind: {
    pattern: t('features.algorithms.tutorials.graph.unionFind.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.unionFind.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.unionFind.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.unionFind.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.unionFind.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.unionFind.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.unionFind.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.unionFind.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.unionFind.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.unionFind.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.unionFind.weaknesses.item2'),
    },
  },
  floodFill: {
    pattern: t('features.algorithms.tutorials.graph.floodFill.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.floodFill.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.floodFill.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.floodFill.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.floodFill.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.floodFill.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.floodFill.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.floodFill.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.floodFill.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.floodFill.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.floodFill.weaknesses.item2'),
    },
  },
  edmondsKarp: {
    pattern: t('features.algorithms.tutorials.graph.edmondsKarp.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.edmondsKarp.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.edmondsKarp.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.edmondsKarp.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.edmondsKarp.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.edmondsKarp.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.edmondsKarp.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.edmondsKarp.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.edmondsKarp.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.edmondsKarp.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.edmondsKarp.weaknesses.item2'),
    },
  },
  dinicMaxFlow: {
    pattern: t('features.algorithms.tutorials.graph.dinicMaxFlow.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.dinicMaxFlow.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.dinicMaxFlow.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.dinicMaxFlow.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.dinicMaxFlow.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.dinicMaxFlow.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.dinicMaxFlow.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.dinicMaxFlow.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.dinicMaxFlow.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.dinicMaxFlow.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.dinicMaxFlow.weaknesses.item2'),
    },
  },
  hopcroftKarp: {
    pattern: t('features.algorithms.tutorials.graph.hopcroftKarp.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.hopcroftKarp.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.hopcroftKarp.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.hopcroftKarp.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.hopcroftKarp.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.hopcroftKarp.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.hopcroftKarp.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.hopcroftKarp.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.hopcroftKarp.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.hopcroftKarp.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.hopcroftKarp.weaknesses.item2'),
    },
  },
  minCostMaxFlow: {
    pattern: t('features.algorithms.tutorials.graph.minCostMaxFlow.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.minCostMaxFlow.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.minCostMaxFlow.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.minCostMaxFlow.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.minCostMaxFlow.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.minCostMaxFlow.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.minCostMaxFlow.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.minCostMaxFlow.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.minCostMaxFlow.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.minCostMaxFlow.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.minCostMaxFlow.weaknesses.item2'),
    },
  },
  hungarianAlgorithm: {
    pattern: t('features.algorithms.tutorials.graph.hungarianAlgorithm.pattern'),
    keyIdea: t('features.algorithms.tutorials.graph.hungarianAlgorithm.keyIdea'),
    watch: t('features.algorithms.tutorials.graph.hungarianAlgorithm.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.graph.hungarianAlgorithm.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.graph.hungarianAlgorithm.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.graph.hungarianAlgorithm.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.graph.hungarianAlgorithm.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.graph.hungarianAlgorithm.strengths.item1'),
      item2: t('features.algorithms.tutorials.graph.hungarianAlgorithm.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.graph.hungarianAlgorithm.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.graph.hungarianAlgorithm.weaknesses.item2'),
    },
  },
} as const;

export const GRAPH_ALGORITHM_TUTORIALS: Record<string, GraphAlgorithmTutorial> = {
  /* ==================== Traversal ==================== */

  bfs: createTutorialFromKeys(GRAPH_TUTORIAL_KEY.bfs),

  dfs: createTutorialFromKeys(GRAPH_TUTORIAL_KEY.dfs),

  'tree-traversals': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.treeTraversals),

  /* ==================== Shortest path ==================== */

  dijkstra: createTutorialFromKeys(GRAPH_TUTORIAL_KEY.dijkstra),

  'bellman-ford': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.bellmanFord),

  'floyd-warshall': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.floydWarshall),

  'a-star-pathfinding': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.aStarPathfinding),

  /* ==================== MST ==================== */

  'prims-mst': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.primsMst),

  'kruskals-mst': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.kruskalsMst),

  /* ==================== SCCs ==================== */

  'tarjan-scc': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.tarjanScc),

  'kosaraju-scc': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.kosarajuScc),

  /* ==================== DAG / structural ==================== */

  'topological-sort-kahn': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.topologicalSortKahn),

  'cycle-detection': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.cycleDetection),

  'connected-components': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.connectedComponents),

  'bipartite-check': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.bipartiteCheck),

  'bridges-articulation-points': createTutorialFromKeys(
    GRAPH_TUTORIAL_KEY.bridgesArticulationPoints
  ),

  'euler-path-circuit': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.eulerPathCircuit),

  'chromatic-number': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.chromaticNumber),

  'steiner-tree': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.steinerTree),

  'dominator-tree': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.dominatorTree),

  /* ==================== Disjoint sets / grid / flow / matching ==================== */

  'union-find': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.unionFind),

  'flood-fill': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.floodFill),

  'edmonds-karp': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.edmondsKarp),

  'dinic-max-flow': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.dinicMaxFlow),

  'hopcroft-karp': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.hopcroftKarp),

  'min-cost-max-flow': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.minCostMaxFlow),

  'hungarian-algorithm': createTutorialFromKeys(GRAPH_TUTORIAL_KEY.hungarianAlgorithm),
};
