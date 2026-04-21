import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { A_STAR_PATHFINDING_CODE_VARIANTS } from './a-star-pathfinding-code';
import { BFS_CODE_VARIANTS } from './bfs-code';
import { BIPARTITE_CHECK_CODE_VARIANTS } from './bipartite-check-code';
import { BELLMAN_FORD_CODE_VARIANTS } from './bellman-ford-code';
import { BRIDGES_ARTICULATION_POINTS_CODE_VARIANTS } from './bridges-articulation-points-code';
import { CHROMATIC_NUMBER_CODE_VARIANTS } from './chromatic-number-code';
import { CONNECTED_COMPONENTS_CODE_VARIANTS } from './connected-components-code';
import { CYCLE_DETECTION_CODE_VARIANTS } from './cycle-detection-code';
import { DFS_CODE_VARIANTS } from './dfs-code';
import { DIJKSTRA_CODE_VARIANTS } from './dijkstra-code';
import { DINIC_MAX_FLOW_CODE_VARIANTS } from './dinic-max-flow-code';
import { DOMINATOR_TREE_CODE_VARIANTS } from './dominator-tree-code';
import { EDMONDS_KARP_CODE_VARIANTS } from './edmonds-karp-code';
import { EULER_PATH_CIRCUIT_CODE_VARIANTS } from './euler-path-circuit-code';
import { FLOYD_WARSHALL_CODE_VARIANTS } from './floyd-warshall-code';
import { FLOOD_FILL_CODE_VARIANTS } from './flood-fill-code';
import { HOPCROFT_KARP_CODE_VARIANTS } from './hopcroft-karp-code';
import { HUNGARIAN_ALGORITHM_CODE_VARIANTS } from './hungarian-algorithm-code';
import { KOSARAJU_SCC_CODE_VARIANTS } from './kosaraju-scc-code';
import { KRUSKALS_MST_CODE_VARIANTS } from './kruskals-mst-code';
import { MIN_COST_MAX_FLOW_CODE_VARIANTS } from './min-cost-max-flow-code';
import { PRIMS_MST_CODE_VARIANTS } from './prims-mst-code';
import { STEINER_TREE_CODE_VARIANTS } from './steiner-tree-code';
import { TARJAN_SCC_CODE_VARIANTS } from './tarjan-scc-code';
import { TOPOLOGICAL_SORT_KAHN_CODE_VARIANTS } from './topological-sort-kahn-code';
import { UNION_FIND_CODE_VARIANTS } from './union-find-code';

const EXPECTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'csharp',
  'java',
  'cpp',
  'go',
  'rust',
  'swift',
  'php',
  'kotlin',
] as const;

const GRAPH_CODE_CASES = [
  [
    'dijkstra',
    DIJKSTRA_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dijkstra/dijkstra.ts',
  ],
  ['bfs', BFS_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/bfs/bfs.ts'],
  ['dfs', DFS_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/dfs/dfs.ts'],
  [
    'cycle-detection',
    CYCLE_DETECTION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/cycle-detection/cycle-detection.ts',
  ],
  [
    'connected-components',
    CONNECTED_COMPONENTS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/connected-components/connected-components.ts',
  ],
  ['union-find', UNION_FIND_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/union-find.ts'],
  [
    'flood-fill',
    FLOOD_FILL_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/flood-fill/flood-fill.ts',
  ],
  [
    'bipartite-check',
    BIPARTITE_CHECK_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/bipartite-check/bipartite-check.ts',
  ],
  [
    'topological-sort-kahn',
    TOPOLOGICAL_SORT_KAHN_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/topological-sort-kahn/topological-sort-kahn.ts',
  ],
  [
    'bellman-ford',
    BELLMAN_FORD_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/bellman-ford/bellman-ford.ts',
  ],
  [
    'floyd-warshall',
    FLOYD_WARSHALL_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/floyd-warshall/floyd-warshall.ts',
  ],
  [
    'a-star-pathfinding',
    A_STAR_PATHFINDING_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/a-star-pathfinding/a-star-pathfinding.ts',
  ],
  ['prims-mst', PRIMS_MST_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/prims-mst.ts'],
  [
    'kruskals-mst',
    KRUSKALS_MST_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/kruskals-mst.ts',
  ],
  ['tarjan-scc', TARJAN_SCC_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/tarjan-scc.ts'],
  [
    'kosaraju-scc',
    KOSARAJU_SCC_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/kosaraju-scc.ts',
  ],
  [
    'bridges-articulation-points',
    BRIDGES_ARTICULATION_POINTS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/bridges-articulation-points.ts',
  ],
  [
    'edmonds-karp',
    EDMONDS_KARP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/edmonds-karp.ts',
  ],
  [
    'hungarian-algorithm',
    HUNGARIAN_ALGORITHM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/hungarian-algorithm.ts',
  ],
  [
    'euler-path-circuit',
    EULER_PATH_CIRCUIT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/euler-path-circuit.ts',
  ],
  [
    'hopcroft-karp',
    HOPCROFT_KARP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/hopcroft-karp.ts',
  ],
  [
    'dinic-max-flow',
    DINIC_MAX_FLOW_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dinic-max-flow.ts',
  ],
  [
    'min-cost-max-flow',
    MIN_COST_MAX_FLOW_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/min-cost-max-flow.ts',
  ],
  [
    'chromatic-number',
    CHROMATIC_NUMBER_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/chromatic-number.ts',
  ],
  [
    'steiner-tree',
    STEINER_TREE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/steiner-tree.ts',
  ],
  [
    'dominator-tree',
    DOMINATOR_TREE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dominator-tree.ts',
  ],
] as const;

describe('graph code variants', () => {
  it.each(GRAPH_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(GRAPH_CODE_CASES)(
    'resolves every active graph step to a non-empty code line for %s',
    (_algorithmId, variants, generatorPath) => {
      const generatorSource = readFileSync(resolve(process.cwd(), generatorPath), 'utf8');
      const activeSteps = [
        ...new Set(
          [...generatorSource.matchAll(/activeCodeLine:\s*(\d+)/g)].map((match) =>
            Number(match[1]),
          ),
        ),
      ];

      for (const language of EXPECTED_LANGUAGES) {
        const variant = variants[language];
        expect(variant).toBeDefined();

        for (const step of activeSteps) {
          const resolved = resolveActiveCodeLine(step, variant!);
          expect(resolved).not.toBeNull();

          const line = variant!.lines[(resolved ?? 1) - 1];
          const text = line?.tokens.map((token) => token.text).join('') ?? '';
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    },
  );
});
