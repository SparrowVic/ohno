import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const HOPCROFT_KARP_CODE_SOURCES = {
  typescript: `
    function hopcroftKarp(graph: BipartiteGraph): number {
      //@step 2
      const pairU = new Map<string, string | null>();
      const pairV = new Map<string, string | null>();
      let matching = 0;

      initializePairs(graph, pairU, pairV);
      //@step 3
      //@step 4
      //@step 5
      //@step 6
      //@step 9
      while (buildLayers(graph, pairU, pairV)) {
        for (const left of graph.left) {
          //@step 7
          if (pairU.get(left) === null && dfsAugment(graph, left, pairU, pairV)) {
            //@step 8
            matching += 1;
          }
        }
      }

      //@step 10
      return matching;
    }
  `,
  javascript: `
    function hopcroftKarp(graph) {
      const pairU = new Map();
      const pairV = new Map();
      let matching = 0;

      initializePairs(graph, pairU, pairV);
      while (buildLayers(graph, pairU, pairV)) {
        for (const left of graph.left) {
          if (pairU.get(left) === null && dfsAugment(graph, left, pairU, pairV)) {
            matching += 1;
          }
        }
      }

      return matching;
    }
  `,
  python: `
    def hopcroft_karp(graph: BipartiteGraph) -> int:
        pair_u: dict[str, str | None] = {}
        pair_v: dict[str, str | None] = {}
        matching = 0

        initialize_pairs(graph, pair_u, pair_v)
        while build_layers(graph, pair_u, pair_v):
            for left in graph.left:
                if pair_u.get(left) is None and dfs_augment(graph, left, pair_u, pair_v):
                    matching += 1

        return matching
  `,
  csharp: `
    public static int HopcroftKarp(BipartiteGraph graph)
    {
        var pairU = new Dictionary<string, string?>();
        var pairV = new Dictionary<string, string?>();
        var matching = 0;

        InitializePairs(graph, pairU, pairV);
        while (BuildLayers(graph, pairU, pairV))
        {
            foreach (var left in graph.Left)
            {
                if (pairU[left] is null && DfsAugment(graph, left, pairU, pairV))
                {
                    matching += 1;
                }
            }
        }

        return matching;
    }
  `,
  java: `
    public static int hopcroftKarp(BipartiteGraph graph) {
        var pairU = new HashMap<String, String>();
        var pairV = new HashMap<String, String>();
        int matching = 0;

        initializePairs(graph, pairU, pairV);
        while (buildLayers(graph, pairU, pairV)) {
            for (String left : graph.left()) {
                if (pairU.get(left) == null && dfsAugment(graph, left, pairU, pairV)) {
                    matching += 1;
                }
            }
        }

        return matching;
    }
  `,
  cpp: `
    int hopcroftKarp(BipartiteGraph& graph) {
        std::unordered_map<std::string, std::string> pairU;
        std::unordered_map<std::string, std::string> pairV;
        int matching = 0;

        initializePairs(graph, pairU, pairV);
        while (buildLayers(graph, pairU, pairV)) {
            for (const auto& left : graph.left) {
                if (!pairU.contains(left) && dfsAugment(graph, left, pairU, pairV)) {
                    matching += 1;
                }
            }
        }

        return matching;
    }
  `,
  go: `
    package graphs

    func HopcroftKarp(graph BipartiteGraph) int {
        pairU := map[string]*string{}
        pairV := map[string]*string{}
        matching := 0

        initializePairs(graph, pairU, pairV)
        for buildLayers(graph, pairU, pairV) {
            for _, left := range graph.Left {
                if pairU[left] == nil && dfsAugment(graph, left, pairU, pairV) {
                    matching += 1
                }
            }
        }

        return matching
    }
  `,
  rust: `
    fn hopcroft_karp(graph: &BipartiteGraph) -> i32 {
        let mut pair_u = std::collections::HashMap::new();
        let mut pair_v = std::collections::HashMap::new();
        let mut matching = 0;

        initialize_pairs(graph, &mut pair_u, &mut pair_v);
        while build_layers(graph, &pair_u, &pair_v) {
            for left in &graph.left {
                if pair_u.get(left).is_none() && dfs_augment(graph, left, &mut pair_u, &mut pair_v) {
                    matching += 1;
                }
            }
        }

        matching
    }
  `,
  swift: `
    func hopcroftKarp(graph: BipartiteGraph) -> Int {
        var pairU: [String: String?] = [:]
        var pairV: [String: String?] = [:]
        var matching = 0

        initializePairs(graph: graph, pairU: &pairU, pairV: &pairV)
        while buildLayers(graph: graph, pairU: pairU, pairV: pairV) {
            for left in graph.left {
                if pairU[left] == nil && dfsAugment(graph: graph, left: left, pairU: &pairU, pairV: &pairV) {
                    matching += 1
                }
            }
        }

        return matching
    }
  `,
  php: `
    <?php

    function hopcroftKarp(BipartiteGraph $graph): int
    {
        $pairU = [];
        $pairV = [];
        $matching = 0;

        initializePairs($graph, $pairU, $pairV);
        while (buildLayers($graph, $pairU, $pairV)) {
            foreach ($graph->left as $left) {
                if (($pairU[$left] ?? null) === null && dfsAugment($graph, $left, $pairU, $pairV)) {
                    $matching += 1;
                }
            }
        }

        return $matching;
    }
  `,
  kotlin: `
    fun hopcroftKarp(graph: BipartiteGraph): Int {
        val pairU = mutableMapOf<String, String?>()
        val pairV = mutableMapOf<String, String?>()
        var matching = 0

        initializePairs(graph, pairU, pairV)
        while (buildLayers(graph, pairU, pairV)) {
            for (left in graph.left) {
                if (pairU[left] == null && dfsAugment(graph, left, pairU, pairV)) {
                    matching += 1
                }
            }
        }

        return matching
    }
  `,
} as const;

export const HOPCROFT_KARP_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  HOPCROFT_KARP_CODE_SOURCES,
);
export const HOPCROFT_KARP_CODE = HOPCROFT_KARP_CODE_VARIANTS.typescript?.lines ?? [];
