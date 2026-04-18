import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const STEINER_TREE_TS = buildStructuredCode(`
  //#region graph-types interface collapsed
  interface GraphNode {
    readonly id: string;
  }

  interface WeightedEdge {
    readonly from: string;
    readonly to: string;
    readonly weight: number;
  }

  interface WeightedGraphData {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly WeightedEdge[];
  }

  interface FloydWarshallResult {
    readonly nodeIds: string[];
    readonly indexById: Map<string, number>;
    readonly distance: number[][];
  }
  //#endregion graph-types

  /**
   * Compute the exact Steiner tree cost with the Dreyfus-Wagner subset DP.
   * Input: weighted graph and terminal node ids.
   * Returns: minimum total weight of any tree spanning all terminals.
   */
  //#region steiner function open
  function steinerTreeCost(
    graph: WeightedGraphData,
    terminals: readonly string[],
  ): number {
    //@step 2
    const shortest = floydWarshall(graph);
    const terminalCount = terminals.length;
    const fullMask = (1 << terminalCount) - 1;
    const nodeCount = shortest.nodeIds.length;
    const dp = Array.from({ length: 1 << terminalCount }, () =>
      Array.from({ length: nodeCount }, () => Number.POSITIVE_INFINITY),
    );

    //@step 3
    for (let terminalIndex = 0; terminalIndex < terminalCount; terminalIndex += 1) {
      const mask = 1 << terminalIndex;
      const terminalNode = terminals[terminalIndex]!;
      const targetIndex = shortest.indexById.get(terminalNode)!;

      for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
        dp[mask][nodeIndex] = shortest.distance[nodeIndex]![targetIndex]!;
      }
    }

    for (let mask = 1; mask <= fullMask; mask += 1) {
      if ((mask & (mask - 1)) === 0) {
        continue;
      }

      //@step 4
      for (let leftMask = (mask - 1) & mask; leftMask > 0; leftMask = (leftMask - 1) & mask) {
        const rightMask = mask ^ leftMask;
        if (rightMask === 0 || leftMask > rightMask) {
          continue;
        }

        for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
          dp[mask][nodeIndex] = Math.min(
            dp[mask][nodeIndex]!,
            dp[leftMask]![nodeIndex]! + dp[rightMask]![nodeIndex]!,
          );
        }
      }

      //@step 5
      for (let viaIndex = 0; viaIndex < nodeCount; viaIndex += 1) {
        for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
          dp[mask][nodeIndex] = Math.min(
            dp[mask][nodeIndex]!,
            dp[mask]![viaIndex]! + shortest.distance[viaIndex]![nodeIndex]!,
          );
        }
      }
    }

    //@step 6
    return Math.min(...dp[fullMask]!);
  }
  //#endregion steiner

  //#region floyd-warshall helper collapsed
  function floydWarshall(graph: WeightedGraphData): FloydWarshallResult {
    const nodeIds = graph.nodes.map((node) => node.id);
    const indexById = new Map(nodeIds.map((nodeId, index) => [nodeId, index]));
    const nodeCount = nodeIds.length;
    const distance = Array.from({ length: nodeCount }, (_, row) =>
      Array.from({ length: nodeCount }, (_, column) =>
        row === column ? 0 : Number.POSITIVE_INFINITY,
      ),
    );

    for (const edge of graph.edges) {
      const fromIndex = indexById.get(edge.from)!;
      const toIndex = indexById.get(edge.to)!;
      distance[fromIndex]![toIndex] = Math.min(distance[fromIndex]![toIndex]!, edge.weight);
      distance[toIndex]![fromIndex] = Math.min(distance[toIndex]![fromIndex]!, edge.weight);
    }

    for (let mid = 0; mid < nodeCount; mid += 1) {
      for (let from = 0; from < nodeCount; from += 1) {
        for (let to = 0; to < nodeCount; to += 1) {
          distance[from]![to] = Math.min(
            distance[from]![to]!,
            distance[from]![mid]! + distance[mid]![to]!,
          );
        }
      }
    }

    return { nodeIds, indexById, distance };
  }
  //#endregion floyd-warshall
`);

const STEINER_TREE_PY = buildStructuredCode(
  `
  from dataclasses import dataclass


  //#region graph-types interface collapsed
  @dataclass(frozen=True)
  class GraphNode:
      id: str


  @dataclass(frozen=True)
  class WeightedEdge:
      from_id: str
      to: str
      weight: float


  @dataclass(frozen=True)
  class WeightedGraphData:
      nodes: list[GraphNode]
      edges: list[WeightedEdge]
  //#endregion graph-types

  """
  Compute the exact Steiner tree cost with the Dreyfus-Wagner subset DP.
  Input: weighted graph and terminal node ids.
  Returns: minimum total weight of any tree spanning all terminals.
  """
  //#region steiner function open
  def steiner_tree_cost(graph: WeightedGraphData, terminals: list[str]) -> float:
      //@step 2
      node_ids, index_by_id, distance = floyd_warshall(graph)
      terminal_count = len(terminals)
      full_mask = (1 << terminal_count) - 1
      node_count = len(node_ids)
      dp = [
          [float("inf")] * node_count
          for _ in range(1 << terminal_count)
      ]

      //@step 3
      for terminal_index, terminal_node in enumerate(terminals):
          mask = 1 << terminal_index
          target_index = index_by_id[terminal_node]
          for node_index in range(node_count):
              dp[mask][node_index] = distance[node_index][target_index]

      for mask in range(1, full_mask + 1):
          if mask & (mask - 1) == 0:
              continue

          //@step 4
          left_mask = (mask - 1) & mask
          while left_mask > 0:
              right_mask = mask ^ left_mask
              if right_mask != 0 and left_mask <= right_mask:
                  for node_index in range(node_count):
                      dp[mask][node_index] = min(
                          dp[mask][node_index],
                          dp[left_mask][node_index] + dp[right_mask][node_index],
                      )
              left_mask = (left_mask - 1) & mask

          //@step 5
          for via_index in range(node_count):
              for node_index in range(node_count):
                  dp[mask][node_index] = min(
                      dp[mask][node_index],
                      dp[mask][via_index] + distance[via_index][node_index],
                  )

      //@step 6
      return min(dp[full_mask])
  //#endregion steiner

  //#region floyd-warshall helper collapsed
  def floyd_warshall(
      graph: WeightedGraphData,
  ) -> tuple[list[str], dict[str, int], list[list[float]]]:
      node_ids = [node.id for node in graph.nodes]
      index_by_id = {node_id: index for index, node_id in enumerate(node_ids)}
      node_count = len(node_ids)
      distance = [
          [0.0 if row == column else float("inf") for column in range(node_count)]
          for row in range(node_count)
      ]

      for edge in graph.edges:
          from_index = index_by_id[edge.from_id]
          to_index = index_by_id[edge.to]
          distance[from_index][to_index] = min(distance[from_index][to_index], edge.weight)
          distance[to_index][from_index] = min(distance[to_index][from_index], edge.weight)

      for mid in range(node_count):
          for from_index in range(node_count):
              for to_index in range(node_count):
                  distance[from_index][to_index] = min(
                      distance[from_index][to_index],
                      distance[from_index][mid] + distance[mid][to_index],
                  )

      return node_ids, index_by_id, distance
  //#endregion floyd-warshall
  `,
  'python',
);

const STEINER_TREE_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;
  using System.Linq;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct WeightedEdge(string From, string To, double Weight);

  public sealed record WeightedGraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<WeightedEdge> Edges
  );
  //#endregion graph-types

  /// <summary>
  /// Computes the exact Steiner tree cost with the Dreyfus-Wagner subset DP.
  /// Input: weighted graph and terminal node ids.
  /// Returns: minimum total weight of any tree spanning all terminals.
  /// </summary>
  //#region steiner function open
  public static double SteinerTreeCost(
      WeightedGraphData graph,
      IReadOnlyList<string> terminals
  )
  {
      //@step 2
      var (nodeIds, indexById, distance) = FloydWarshall(graph);
      var terminalCount = terminals.Count;
      var fullMask = (1 << terminalCount) - 1;
      var nodeCount = nodeIds.Count;
      var dp = Enumerable.Range(0, 1 << terminalCount)
          .Select(_ => Enumerable.Repeat(double.PositiveInfinity, nodeCount).ToArray())
          .ToArray();

      //@step 3
      for (var terminalIndex = 0; terminalIndex < terminalCount; terminalIndex += 1)
      {
          var mask = 1 << terminalIndex;
          var targetIndex = indexById[terminals[terminalIndex]];
          for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1)
          {
              dp[mask][nodeIndex] = distance[nodeIndex, targetIndex];
          }
      }

      for (var mask = 1; mask <= fullMask; mask += 1)
      {
          if ((mask & (mask - 1)) == 0)
          {
              continue;
          }

          //@step 4
          for (var leftMask = (mask - 1) & mask; leftMask > 0; leftMask = (leftMask - 1) & mask)
          {
              var rightMask = mask ^ leftMask;
              if (rightMask == 0 || leftMask > rightMask)
              {
                  continue;
              }

              for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1)
              {
                  dp[mask][nodeIndex] = Math.Min(
                      dp[mask][nodeIndex],
                      dp[leftMask][nodeIndex] + dp[rightMask][nodeIndex]
                  );
              }
          }

          //@step 5
          for (var viaIndex = 0; viaIndex < nodeCount; viaIndex += 1)
          {
              for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1)
              {
                  dp[mask][nodeIndex] = Math.Min(
                      dp[mask][nodeIndex],
                      dp[mask][viaIndex] + distance[viaIndex, nodeIndex]
                  );
              }
          }
      }

      //@step 6
      return dp[fullMask].Min();
  }
  //#endregion steiner

  //#region floyd-warshall helper collapsed
  private static (
      List<string> NodeIds,
      Dictionary<string, int> IndexById,
      double[,] Distance
  ) FloydWarshall(WeightedGraphData graph)
  {
      var nodeIds = graph.Nodes.Select(node => node.Id).ToList();
      var indexById = nodeIds.Select((nodeId, index) => (nodeId, index))
          .ToDictionary(item => item.nodeId, item => item.index);
      var nodeCount = nodeIds.Count;
      var distance = new double[nodeCount, nodeCount];

      for (var row = 0; row < nodeCount; row += 1)
      {
          for (var column = 0; column < nodeCount; column += 1)
          {
              distance[row, column] = row == column ? 0.0 : double.PositiveInfinity;
          }
      }

      foreach (var edge in graph.Edges)
      {
          var fromIndex = indexById[edge.From];
          var toIndex = indexById[edge.To];
          distance[fromIndex, toIndex] = Math.Min(distance[fromIndex, toIndex], edge.Weight);
          distance[toIndex, fromIndex] = Math.Min(distance[toIndex, fromIndex], edge.Weight);
      }

      for (var mid = 0; mid < nodeCount; mid += 1)
      {
          for (var fromIndex = 0; fromIndex < nodeCount; fromIndex += 1)
          {
              for (var toIndex = 0; toIndex < nodeCount; toIndex += 1)
              {
                  distance[fromIndex, toIndex] = Math.Min(
                      distance[fromIndex, toIndex],
                      distance[fromIndex, mid] + distance[mid, toIndex]
                  );
              }
          }
      }

      return (nodeIds, indexById, distance);
  }
  //#endregion floyd-warshall
  `,
  'csharp',
);

const STEINER_TREE_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record WeightedEdge(String from, String to, double weight) {}

  public record WeightedGraphData(
      List<GraphNode> nodes,
      List<WeightedEdge> edges
  ) {}
  //#endregion graph-types

  //#region steiner function open
  /**
   * Computes the exact Steiner tree cost with the Dreyfus-Wagner subset DP.
   * Input: weighted graph and terminal node ids.
   * Returns: minimum total weight of any tree spanning all terminals.
   */
  public static double steinerTreeCost(
      WeightedGraphData graph,
      List<String> terminals
  ) {
      //@step 2
      FloydWarshallResult shortest = floydWarshall(graph);
      int terminalCount = terminals.size();
      int fullMask = (1 << terminalCount) - 1;
      int nodeCount = shortest.nodeIds().size();
      double[][] dp = new double[1 << terminalCount][nodeCount];

      for (double[] row : dp) {
          java.util.Arrays.fill(row, Double.POSITIVE_INFINITY);
      }

      //@step 3
      for (int terminalIndex = 0; terminalIndex < terminalCount; terminalIndex += 1) {
          int mask = 1 << terminalIndex;
          int targetIndex = shortest.indexById().get(terminals.get(terminalIndex));
          for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
              dp[mask][nodeIndex] = shortest.distance()[nodeIndex][targetIndex];
          }
      }

      for (int mask = 1; mask <= fullMask; mask += 1) {
          if ((mask & (mask - 1)) == 0) {
              continue;
          }

          //@step 4
          for (int leftMask = (mask - 1) & mask; leftMask > 0; leftMask = (leftMask - 1) & mask) {
              int rightMask = mask ^ leftMask;
              if (rightMask == 0 || leftMask > rightMask) {
                  continue;
              }

              for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
                  dp[mask][nodeIndex] = Math.min(
                      dp[mask][nodeIndex],
                      dp[leftMask][nodeIndex] + dp[rightMask][nodeIndex]
                  );
              }
          }

          //@step 5
          for (int viaIndex = 0; viaIndex < nodeCount; viaIndex += 1) {
              for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
                  dp[mask][nodeIndex] = Math.min(
                      dp[mask][nodeIndex],
                      dp[mask][viaIndex] + shortest.distance()[viaIndex][nodeIndex]
                  );
              }
          }
      }

      //@step 6
      return java.util.Arrays.stream(dp[fullMask]).min().orElse(Double.POSITIVE_INFINITY);
  }
  //#endregion steiner

  //#region floyd-warshall helper collapsed
  private static FloydWarshallResult floydWarshall(WeightedGraphData graph) {
      List<String> nodeIds = graph.nodes().stream().map(GraphNode::id).toList();
      Map<String, Integer> indexById = new HashMap<>();
      for (int index = 0; index < nodeIds.size(); index += 1) {
          indexById.put(nodeIds.get(index), index);
      }

      int nodeCount = nodeIds.size();
      double[][] distance = new double[nodeCount][nodeCount];
      for (int row = 0; row < nodeCount; row += 1) {
          for (int column = 0; column < nodeCount; column += 1) {
              distance[row][column] = row == column ? 0.0 : Double.POSITIVE_INFINITY;
          }
      }

      for (WeightedEdge edge : graph.edges()) {
          int fromIndex = indexById.get(edge.from());
          int toIndex = indexById.get(edge.to());
          distance[fromIndex][toIndex] = Math.min(distance[fromIndex][toIndex], edge.weight());
          distance[toIndex][fromIndex] = Math.min(distance[toIndex][fromIndex], edge.weight());
      }

      for (int mid = 0; mid < nodeCount; mid += 1) {
          for (int fromIndex = 0; fromIndex < nodeCount; fromIndex += 1) {
              for (int toIndex = 0; toIndex < nodeCount; toIndex += 1) {
                  distance[fromIndex][toIndex] = Math.min(
                      distance[fromIndex][toIndex],
                      distance[fromIndex][mid] + distance[mid][toIndex]
                  );
              }
          }
      }

      return new FloydWarshallResult(nodeIds, indexById, distance);
  }
  //#endregion floyd-warshall

  //#region floyd-result helper collapsed
  private record FloydWarshallResult(
      List<String> nodeIds,
      Map<String, Integer> indexById,
      double[][] distance
  ) {}
  //#endregion floyd-result
  `,
  'java',
);

const STEINER_TREE_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <limits>
  #include <string>
  #include <unordered_map>
  #include <vector>

  //#region graph-types interface collapsed
  struct GraphNode {
      std::string id;
  };

  struct WeightedEdge {
      std::string from;
      std::string to;
      double weight;
  };

  struct WeightedGraphData {
      std::vector<GraphNode> nodes;
      std::vector<WeightedEdge> edges;
  };

  struct FloydWarshallResult {
      std::vector<std::string> nodeIds;
      std::unordered_map<std::string, int> indexById;
      std::vector<std::vector<double>> distance;
  };
  //#endregion graph-types

  /**
   * Computes the exact Steiner tree cost with the Dreyfus-Wagner subset DP.
   * Input: weighted graph and terminal node ids.
   * Returns: minimum total weight of any tree spanning all terminals.
   */
  //#region steiner function open
  double steinerTreeCost(
      const WeightedGraphData& graph,
      const std::vector<std::string>& terminals
  ) {
      //@step 2
      auto shortest = floydWarshall(graph);
      int terminalCount = static_cast<int>(terminals.size());
      int fullMask = (1 << terminalCount) - 1;
      int nodeCount = static_cast<int>(shortest.nodeIds.size());
      std::vector<std::vector<double>> dp(
          1 << terminalCount,
          std::vector<double>(nodeCount, std::numeric_limits<double>::infinity())
      );

      //@step 3
      for (int terminalIndex = 0; terminalIndex < terminalCount; terminalIndex += 1) {
          int mask = 1 << terminalIndex;
          int targetIndex = shortest.indexById.at(terminals[terminalIndex]);
          for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
              dp[mask][nodeIndex] = shortest.distance[nodeIndex][targetIndex];
          }
      }

      for (int mask = 1; mask <= fullMask; mask += 1) {
          if ((mask & (mask - 1)) == 0) {
              continue;
          }

          //@step 4
          for (int leftMask = (mask - 1) & mask; leftMask > 0; leftMask = (leftMask - 1) & mask) {
              int rightMask = mask ^ leftMask;
              if (rightMask == 0 || leftMask > rightMask) {
                  continue;
              }

              for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
                  dp[mask][nodeIndex] = std::min(
                      dp[mask][nodeIndex],
                      dp[leftMask][nodeIndex] + dp[rightMask][nodeIndex]
                  );
              }
          }

          //@step 5
          for (int viaIndex = 0; viaIndex < nodeCount; viaIndex += 1) {
              for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
                  dp[mask][nodeIndex] = std::min(
                      dp[mask][nodeIndex],
                      dp[mask][viaIndex] + shortest.distance[viaIndex][nodeIndex]
                  );
              }
          }
      }

      //@step 6
      return *std::min_element(dp[fullMask].begin(), dp[fullMask].end());
  }
  //#endregion steiner

  //#region floyd-warshall helper collapsed
  FloydWarshallResult floydWarshall(const WeightedGraphData& graph) {
      FloydWarshallResult result;
      for (int index = 0; index < static_cast<int>(graph.nodes.size()); index += 1) {
          result.nodeIds.push_back(graph.nodes[index].id);
          result.indexById[graph.nodes[index].id] = index;
      }

      int nodeCount = static_cast<int>(result.nodeIds.size());
      result.distance = std::vector<std::vector<double>>(
          nodeCount,
          std::vector<double>(nodeCount, std::numeric_limits<double>::infinity())
      );

      for (int row = 0; row < nodeCount; row += 1) {
          result.distance[row][row] = 0.0;
      }

      for (const auto& edge : graph.edges) {
          int fromIndex = result.indexById.at(edge.from);
          int toIndex = result.indexById.at(edge.to);
          result.distance[fromIndex][toIndex] = std::min(result.distance[fromIndex][toIndex], edge.weight);
          result.distance[toIndex][fromIndex] = std::min(result.distance[toIndex][fromIndex], edge.weight);
      }

      for (int mid = 0; mid < nodeCount; mid += 1) {
          for (int fromIndex = 0; fromIndex < nodeCount; fromIndex += 1) {
              for (int toIndex = 0; toIndex < nodeCount; toIndex += 1) {
                  result.distance[fromIndex][toIndex] = std::min(
                      result.distance[fromIndex][toIndex],
                      result.distance[fromIndex][mid] + result.distance[mid][toIndex]
                  );
              }
          }
      }

      return result;
  }
  //#endregion floyd-warshall
  `,
  'cpp',
);

export const STEINER_TREE_CODE = STEINER_TREE_TS.lines;
export const STEINER_TREE_CODE_REGIONS = STEINER_TREE_TS.regions;
export const STEINER_TREE_CODE_HIGHLIGHT_MAP = STEINER_TREE_TS.highlightMap;
export const STEINER_TREE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: STEINER_TREE_TS.lines,
    regions: STEINER_TREE_TS.regions,
    highlightMap: STEINER_TREE_TS.highlightMap,
    source: STEINER_TREE_TS.source,
  },
  python: {
    language: 'python',
    lines: STEINER_TREE_PY.lines,
    regions: STEINER_TREE_PY.regions,
    highlightMap: STEINER_TREE_PY.highlightMap,
    source: STEINER_TREE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: STEINER_TREE_CS.lines,
    regions: STEINER_TREE_CS.regions,
    highlightMap: STEINER_TREE_CS.highlightMap,
    source: STEINER_TREE_CS.source,
  },
  java: {
    language: 'java',
    lines: STEINER_TREE_JAVA.lines,
    regions: STEINER_TREE_JAVA.regions,
    highlightMap: STEINER_TREE_JAVA.highlightMap,
    source: STEINER_TREE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: STEINER_TREE_CPP.lines,
    regions: STEINER_TREE_CPP.regions,
    highlightMap: STEINER_TREE_CPP.highlightMap,
    source: STEINER_TREE_CPP.source,
  },
};
