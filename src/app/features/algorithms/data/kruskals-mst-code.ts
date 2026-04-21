import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const KRUSKALS_MST_CODE_SOURCES = {
  typescript: `
    interface WeightedEdge {
      readonly from: string;
      readonly to: string;
      readonly weight: number;
    }

    function kruskalMst(nodes: readonly string[], edges: readonly WeightedEdge[]): {
      mst: WeightedEdge[];
      totalWeight: number;
    } {
      const dsu = new DisjointSet(nodes);
      //@step 2
      const sorted = [...edges].sort((left, right) => left.weight - right.weight);
      const mst: WeightedEdge[] = [];
      let totalWeight = 0;

      //@step 5
      for (const edge of sorted) {
        //@step 6
        if (!dsu.union(edge.from, edge.to)) {
          continue;
        }
        //@step 7
        mst.push(edge);
        totalWeight += edge.weight;
        if (mst.length === nodes.length - 1) {
          break;
        }
      }

      //@step 9
      return { mst, totalWeight };
    }
  `,
  javascript: `
    function kruskalMst(nodes, edges) {
      const dsu = new DisjointSet(nodes);
      const sorted = [...edges].sort((left, right) => left.weight - right.weight);
      const mst = [];
      let totalWeight = 0;

      for (const edge of sorted) {
        if (!dsu.union(edge.from, edge.to)) {
          continue;
        }
        mst.push(edge);
        totalWeight += edge.weight;
        if (mst.length === nodes.length - 1) {
          break;
        }
      }

      return { mst, totalWeight };
    }
  `,
  python: `
    def kruskal_mst(nodes: list[str], edges: list[tuple[str, str, float]]) -> tuple[list[tuple[str, str, float]], float]:
        dsu = DisjointSet(nodes)
        mst: list[tuple[str, str, float]] = []
        total_weight = 0.0

        for from_node, to_node, weight in sorted(edges, key=lambda edge: edge[2]):
            if not dsu.union(from_node, to_node):
                continue
            mst.append((from_node, to_node, weight))
            total_weight += weight
            if len(mst) == len(nodes) - 1:
                break

        return mst, total_weight
  `,
  csharp: `
    using System.Collections.Generic;
    using System.Linq;

    public readonly record struct WeightedEdge(string From, string To, double Weight);

    public static (List<WeightedEdge> Mst, double TotalWeight) KruskalMst(
        IReadOnlyList<string> nodes,
        IReadOnlyList<WeightedEdge> edges
    ) {
        var dsu = new DisjointSet(nodes);
        var mst = new List<WeightedEdge>();
        var totalWeight = 0.0;

        foreach (var edge in edges.OrderBy(edge => edge.Weight))
        {
            if (!dsu.Union(edge.From, edge.To)) continue;
            mst.Add(edge);
            totalWeight += edge.Weight;
            if (mst.Count == nodes.Count - 1) break;
        }

        return (mst, totalWeight);
    }
  `,
  java: `
    import java.util.*;

    public record WeightedEdge(String from, String to, double weight) {}

    public static Map<String, Object> kruskalMst(List<String> nodes, List<WeightedEdge> edges) {
        var dsu = new DisjointSet(nodes);
        var sorted = new ArrayList<>(edges);
        sorted.sort(Comparator.comparingDouble(WeightedEdge::weight));
        var mst = new ArrayList<WeightedEdge>();
        double totalWeight = 0.0;

        for (WeightedEdge edge : sorted) {
            if (!dsu.union(edge.from(), edge.to())) continue;
            mst.add(edge);
            totalWeight += edge.weight();
            if (mst.size() == nodes.size() - 1) break;
        }

        return Map.of("mst", mst, "totalWeight", totalWeight);
    }
  `,
  cpp: `
    #include <algorithm>
    #include <string>
    #include <tuple>
    #include <vector>

    struct WeightedEdge {
        std::string from;
        std::string to;
        double weight;
    };

    std::pair<std::vector<WeightedEdge>, double> kruskalMst(
        const std::vector<std::string>& nodes,
        std::vector<WeightedEdge> edges
    ) {
        DisjointSet dsu(nodes);
        std::sort(edges.begin(), edges.end(), [](const auto& left, const auto& right) {
            return left.weight < right.weight;
        });

        std::vector<WeightedEdge> mst;
        double totalWeight = 0.0;

        for (const auto& edge : edges) {
            if (!dsu.unite(edge.from, edge.to)) continue;
            mst.push_back(edge);
            totalWeight += edge.weight;
            if (mst.size() == nodes.size() - 1) break;
        }

        return { mst, totalWeight };
    }
  `,
  go: `
    package graphs

    import "sort"

    type WeightedEdge struct {
        From   string
        To     string
        Weight float64
    }

    func KruskalMst(nodes []string, edges []WeightedEdge) ([]WeightedEdge, float64) {
        dsu := NewDisjointSet(nodes)
        sorted := append([]WeightedEdge{}, edges...)
        sort.Slice(sorted, func(i int, j int) bool {
            return sorted[i].Weight < sorted[j].Weight
        })

        mst := []WeightedEdge{}
        totalWeight := 0.0

        for _, edge := range sorted {
            if !dsu.Union(edge.From, edge.To) {
                continue
            }
            mst = append(mst, edge)
            totalWeight += edge.Weight
            if len(mst) == len(nodes)-1 {
                break
            }
        }

        return mst, totalWeight
    }
  `,
  rust: `
    #[derive(Clone)]
    struct WeightedEdge {
        from: String,
        to: String,
        weight: f64,
    }

    fn kruskal_mst(nodes: &[String], mut edges: Vec<WeightedEdge>) -> (Vec<WeightedEdge>, f64) {
        let mut dsu = DisjointSet::new(nodes);
        edges.sort_by(|left, right| left.weight.partial_cmp(&right.weight).unwrap());

        let mut mst = Vec::new();
        let mut total_weight = 0.0;

        for edge in edges {
            if !dsu.union(&edge.from, &edge.to) {
                continue;
            }
            total_weight += edge.weight;
            mst.push(edge);
            if mst.len() == nodes.len() - 1 {
                break;
            }
        }

        (mst, total_weight)
    }
  `,
  swift: `
    struct WeightedEdge {
        let from: String
        let to: String
        let weight: Double
    }

    func kruskalMst(nodes: [String], edges: [WeightedEdge]) -> (mst: [WeightedEdge], totalWeight: Double) {
        let dsu = DisjointSet(nodes: nodes)
        let sorted = edges.sorted { $0.weight < $1.weight }
        var mst: [WeightedEdge] = []
        var totalWeight = 0.0

        for edge in sorted {
            if !dsu.union(edge.from, edge.to) {
                continue
            }
            mst.append(edge)
            totalWeight += edge.weight
            if mst.count == nodes.count - 1 {
                break
            }
        }

        return (mst, totalWeight)
    }
  `,
  php: `
    <?php

    final class WeightedEdge
    {
        public function __construct(
            public string $from,
            public string $to,
            public float $weight,
        ) {}
    }

    function kruskalMst(array $nodes, array $edges): array
    {
        $dsu = new DisjointSet($nodes);
        usort($edges, fn (WeightedEdge $left, WeightedEdge $right): int => $left->weight <=> $right->weight);
        $mst = [];
        $totalWeight = 0.0;

        foreach ($edges as $edge) {
          if (!$dsu->union($edge->from, $edge->to)) {
              continue;
          }
          $mst[] = $edge;
          $totalWeight += $edge->weight;
          if (count($mst) === count($nodes) - 1) {
              break;
          }
        }

        return ['mst' => $mst, 'totalWeight' => $totalWeight];
    }
  `,
  kotlin: `
    data class WeightedEdge(
        val from: String,
        val to: String,
        val weight: Double,
    )

    fun kruskalMst(nodes: List<String>, edges: List<WeightedEdge>): Pair<List<WeightedEdge>, Double> {
        val dsu = DisjointSet(nodes)
        val mst = mutableListOf<WeightedEdge>()
        var totalWeight = 0.0

        for (edge in edges.sortedBy { it.weight }) {
            if (!dsu.union(edge.from, edge.to)) {
                continue
            }
            mst += edge
            totalWeight += edge.weight
            if (mst.size == nodes.size - 1) {
                break
            }
        }

        return mst to totalWeight
    }
  `,
} as const;

export const KRUSKALS_MST_CODE_VARIANTS: CodeVariantMap =
  buildCodeVariants(KRUSKALS_MST_CODE_SOURCES);
export const KRUSKALS_MST_CODE = KRUSKALS_MST_CODE_VARIANTS.typescript?.lines ?? [];
