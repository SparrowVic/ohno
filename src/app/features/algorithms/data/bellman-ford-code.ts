import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BELLMAN_FORD_TS = buildStructuredCode(`
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
  //#endregion graph-types

  /**
   * Compute shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  function bellmanFord(
    graph: WeightedGraphData,
    source: string,
  ): {
    distance: Map<string, number>;
    parent: Map<string, string | null>;
    hasNegativeCycle: boolean;
  } {
    const distance = new Map<string, number>();
    const parent = new Map<string, string | null>();

    for (const node of graph.nodes) {
      distance.set(node.id, Number.POSITIVE_INFINITY);
      parent.set(node.id, null);
    }

    distance.set(source, 0);

    for (let pass = 1; pass < graph.nodes.length; pass += 1) {
      //@step 5
      let changed = false;

      for (const edge of graph.edges) {
        if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
          continue;
        }

        //@step 7
        const candidate =
          (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight;

        //@step 8
        if (candidate >= (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          continue;
        }

        //@step 9
        distance.set(edge.to, candidate);
        parent.set(edge.to, edge.from);
        changed = true;
      }

      //@step 12
      if (!changed) {
        break;
      }
    }

    let hasNegativeCycle = false;
    for (const edge of graph.edges) {
      if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }

      //@step 14
      if (
        (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight <
        (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)
      ) {
        hasNegativeCycle = true;
        break;
      }
    }

    //@step 16
    return { distance, parent, hasNegativeCycle };
  }
  //#endregion bellman-ford
`);

const BELLMAN_FORD_PY = buildStructuredCode(
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
  Compute shortest paths even when edge weights may be negative.
  Input: directed weighted graph and a source node id.
  Returns: distance map, predecessor map, and a negative-cycle flag.
  """
  //#region bellman-ford function open
  //@step 2
  def bellman_ford(
      graph: WeightedGraphData,
      source: str,
  ) -> tuple[dict[str, float], dict[str, str | None], bool]:
      distance = {node.id: float("inf") for node in graph.nodes}
      parent = {node.id: None for node in graph.nodes}
      distance[source] = 0.0

      for _pass in range(1, len(graph.nodes)):
          //@step 5
          changed = False

          for edge in graph.edges:
              if distance[edge.from_id] == float("inf"):
                  continue

              //@step 7
              candidate = distance[edge.from_id] + edge.weight

              //@step 8
              if candidate >= distance[edge.to]:
                  continue

              //@step 9
              distance[edge.to] = candidate
              parent[edge.to] = edge.from_id
              changed = True

          //@step 12
          if not changed:
              break

      has_negative_cycle = False
      for edge in graph.edges:
          if distance[edge.from_id] == float("inf"):
              continue

          //@step 14
          if distance[edge.from_id] + edge.weight < distance[edge.to]:
              has_negative_cycle = True
              break

      //@step 16
      return distance, parent, has_negative_cycle
  //#endregion bellman-ford
  `,
  'python',
);

const BELLMAN_FORD_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct WeightedEdge(string From, string To, double Weight);

  public sealed record WeightedGraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<WeightedEdge> Edges
  );
  //#endregion graph-types

  /// <summary>
  /// Computes shortest paths even when edge weights may be negative.
  /// Input: directed weighted graph and a source node id.
  /// Returns: distance map, predecessor map, and a negative-cycle flag.
  /// </summary>
  //#region bellman-ford function open
  //@step 2
  public static (
      Dictionary<string, double> Distance,
      Dictionary<string, string?> Parent,
      bool HasNegativeCycle
  ) BellmanFord(WeightedGraphData graph, string source)
  {
      var distance = new Dictionary<string, double>();
      var parent = new Dictionary<string, string?>();

      foreach (var node in graph.Nodes)
      {
          distance[node.Id] = double.PositiveInfinity;
          parent[node.Id] = null;
      }

      distance[source] = 0.0;

      for (var pass = 1; pass < graph.Nodes.Count; pass += 1)
      {
          //@step 5
          var changed = false;

          foreach (var edge in graph.Edges)
          {
              if (double.IsPositiveInfinity(distance[edge.From]))
              {
                  continue;
              }

              //@step 7
              var candidate = distance[edge.From] + edge.Weight;

              //@step 8
              if (candidate >= distance[edge.To])
              {
                  continue;
              }

              //@step 9
              distance[edge.To] = candidate;
              parent[edge.To] = edge.From;
              changed = true;
          }

          //@step 12
          if (!changed)
          {
              break;
          }
      }

      var hasNegativeCycle = false;
      foreach (var edge in graph.Edges)
      {
          if (double.IsPositiveInfinity(distance[edge.From]))
          {
              continue;
          }

          //@step 14
          if (distance[edge.From] + edge.Weight < distance[edge.To])
          {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return (distance, parent, hasNegativeCycle);
  }
  //#endregion bellman-ford
  `,
  'csharp',
);

const BELLMAN_FORD_JAVA = buildStructuredCode(
  `
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

  public record BellmanFordResult(
      Map<String, Double> distance,
      Map<String, String> parent,
      boolean hasNegativeCycle
  ) {}

  //#region bellman-ford function open
  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //@step 2
  public static BellmanFordResult bellmanFord(
      WeightedGraphData graph,
      String source
  ) {
      Map<String, Double> distance = new HashMap<>();
      Map<String, String> parent = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          distance.put(node.id(), Double.POSITIVE_INFINITY);
          parent.put(node.id(), null);
      }

      distance.put(source, 0.0);

      for (int pass = 1; pass < graph.nodes().size(); pass += 1) {
          //@step 5
          boolean changed = false;

          for (WeightedEdge edge : graph.edges()) {
              if (!Double.isFinite(distance.get(edge.from()))) {
                  continue;
              }

              //@step 7
              double candidate = distance.get(edge.from()) + edge.weight();

              //@step 8
              if (candidate >= distance.get(edge.to())) {
                  continue;
              }

              //@step 9
              distance.put(edge.to(), candidate);
              parent.put(edge.to(), edge.from());
              changed = true;
          }

          //@step 12
          if (!changed) {
              break;
          }
      }

      boolean hasNegativeCycle = false;
      for (WeightedEdge edge : graph.edges()) {
          if (!Double.isFinite(distance.get(edge.from()))) {
              continue;
          }

          //@step 14
          if (distance.get(edge.from()) + edge.weight() < distance.get(edge.to())) {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return new BellmanFordResult(distance, parent, hasNegativeCycle);
  }
  //#endregion bellman-ford
  `,
  'java',
);

const BELLMAN_FORD_CPP = buildStructuredCode(
  `
  #include <cmath>
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

  struct BellmanFordResult {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> parent;
      bool hasNegativeCycle;
  };
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  BellmanFordResult bellmanFord(
      const WeightedGraphData& graph,
      const std::string& source
  ) {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> parent;

      for (const auto& node : graph.nodes) {
          distance[node.id] = std::numeric_limits<double>::infinity();
          parent[node.id] = "";
      }

      distance[source] = 0.0;

      for (int pass = 1; pass < static_cast<int>(graph.nodes.size()); pass += 1) {
          //@step 5
          bool changed = false;

          for (const auto& edge : graph.edges) {
              if (!std::isfinite(distance[edge.from])) {
                  continue;
              }

              //@step 7
              const double candidate = distance[edge.from] + edge.weight;

              //@step 8
              if (candidate >= distance[edge.to]) {
                  continue;
              }

              //@step 9
              distance[edge.to] = candidate;
              parent[edge.to] = edge.from;
              changed = true;
          }

          //@step 12
          if (!changed) {
              break;
          }
      }

      bool hasNegativeCycle = false;
      for (const auto& edge : graph.edges) {
          if (!std::isfinite(distance[edge.from])) {
              continue;
          }

          //@step 14
          if (distance[edge.from] + edge.weight < distance[edge.to]) {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return { distance, parent, hasNegativeCycle };
  }
  //#endregion bellman-ford
  `,
  'cpp',
);

export const BELLMAN_FORD_CODE = BELLMAN_FORD_TS.lines;
export const BELLMAN_FORD_CODE_REGIONS = BELLMAN_FORD_TS.regions;
export const BELLMAN_FORD_CODE_HIGHLIGHT_MAP = BELLMAN_FORD_TS.highlightMap;
export const BELLMAN_FORD_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BELLMAN_FORD_TS.lines,
    regions: BELLMAN_FORD_TS.regions,
    highlightMap: BELLMAN_FORD_TS.highlightMap,
    source: BELLMAN_FORD_TS.source,
  },
  python: {
    language: 'python',
    lines: BELLMAN_FORD_PY.lines,
    regions: BELLMAN_FORD_PY.regions,
    highlightMap: BELLMAN_FORD_PY.highlightMap,
    source: BELLMAN_FORD_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BELLMAN_FORD_CS.lines,
    regions: BELLMAN_FORD_CS.regions,
    highlightMap: BELLMAN_FORD_CS.highlightMap,
    source: BELLMAN_FORD_CS.source,
  },
  java: {
    language: 'java',
    lines: BELLMAN_FORD_JAVA.lines,
    regions: BELLMAN_FORD_JAVA.regions,
    highlightMap: BELLMAN_FORD_JAVA.highlightMap,
    source: BELLMAN_FORD_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BELLMAN_FORD_CPP.lines,
    regions: BELLMAN_FORD_CPP.regions,
    highlightMap: BELLMAN_FORD_CPP.highlightMap,
    source: BELLMAN_FORD_CPP.source,
  },
};
