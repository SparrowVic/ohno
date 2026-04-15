import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const DIJKSTRA_TS = buildStructuredCode(`
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
   * Compute single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  function dijkstra(
    graph: WeightedGraphData,
    source: string,
  ): {
    distance: Map<string, number>;
    previous: Map<string, string | null>;
  } {
    const adjacency = buildAdjacency(graph);
    const distance = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unsettled = new Set<string>();

    for (const node of graph.nodes) {
      distance.set(node.id, Number.POSITIVE_INFINITY);
      previous.set(node.id, null);
      unsettled.add(node.id);
    }

    distance.set(source, 0);

    //@step 5
    while (unsettled.size > 0) {
      const current = extractMinVertex(unsettled, distance);
      if (
        current === null ||
        !Number.isFinite(distance.get(current) ?? Number.POSITIVE_INFINITY)
      ) {
        break;
      }

      //@step 7
      for (const edge of adjacency.get(current) ?? []) {
        //@step 8
        const candidate =
          (distance.get(current) ?? Number.POSITIVE_INFINITY) + edge.weight;

        //@step 9
        if (candidate < (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          distance.set(edge.to, candidate);
          previous.set(edge.to, current);
        }
      }

      //@step 12
      unsettled.delete(current);
    }

    //@step 14
    return { distance, previous };
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  function buildAdjacency(
    graph: WeightedGraphData,
  ): Map<string, WeightedEdge[]> {
    const adjacency = new Map<string, WeightedEdge[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge);
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  function extractMinVertex(
    unsettled: ReadonlySet<string>,
    distance: ReadonlyMap<string, number>,
  ): string | null {
    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of unsettled) {
      const candidate = distance.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (candidate < bestDistance) {
        bestDistance = candidate;
        bestId = nodeId;
      }
    }

    return bestId;
  }
  //#endregion extract-min
`);

const DIJKSTRA_PY = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  from dataclasses import dataclass


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
  Compute single-source shortest paths with Dijkstra's algorithm.
  Input: directed weighted graph with non-negative edge weights and a source id.
  Returns: distance and predecessor maps for the shortest-path tree.
  """
  //#region dijkstra function open
  //@step 2
  def dijkstra(
      graph: WeightedGraphData,
      source: str,
  ) -> tuple[dict[str, float], dict[str, str | None]]:
      adjacency = build_adjacency(graph)
      distance = {node.id: float("inf") for node in graph.nodes}
      previous = {node.id: None for node in graph.nodes}
      unsettled = {node.id for node in graph.nodes}

      distance[source] = 0.0

      //@step 5
      while unsettled:
          current = extract_min_vertex(unsettled, distance)
          if current is None or distance[current] == float("inf"):
              break

          //@step 7
          for edge in adjacency.get(current, []):
              //@step 8
              candidate = distance[current] + edge.weight

              //@step 9
              if candidate < distance[edge.to]:
                  distance[edge.to] = candidate
                  previous[edge.to] = current

          //@step 12
          unsettled.remove(current)

      //@step 14
      return distance, previous
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  def build_adjacency(graph: WeightedGraphData) -> dict[str, list[WeightedEdge]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge)

      return adjacency
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  def extract_min_vertex(
      unsettled: set[str],
      distance: dict[str, float],
  ) -> str | None:
      best_id: str | None = None
      best_distance = float("inf")

      for node_id in unsettled:
          candidate = distance[node_id]
          if candidate < best_distance:
              best_distance = candidate
              best_id = node_id

      return best_id
  //#endregion extract-min
  `,
  'python',
);

const DIJKSTRA_CS = buildStructuredCode(
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
  /// Computes single-source shortest paths with Dijkstra's algorithm.
  /// Input: directed weighted graph with non-negative edge weights and a source id.
  /// Returns: distance and predecessor maps for the shortest-path tree.
  /// </summary>
  //#region dijkstra function open
  //@step 2
  public static (
      Dictionary<string, double> Distance,
      Dictionary<string, string?> Previous
  ) Dijkstra(WeightedGraphData graph, string source)
  {
      var adjacency = BuildAdjacency(graph);
      var distance = new Dictionary<string, double>();
      var previous = new Dictionary<string, string?>();
      var unsettled = new HashSet<string>();

      foreach (var node in graph.Nodes)
      {
          distance[node.Id] = double.PositiveInfinity;
          previous[node.Id] = null;
          unsettled.Add(node.Id);
      }

      distance[source] = 0.0;

      //@step 5
      while (unsettled.Count > 0)
      {
          var current = ExtractMinVertex(unsettled, distance);
          if (current is null || double.IsPositiveInfinity(distance[current]))
          {
              break;
          }

          //@step 7
          foreach (var edge in adjacency.GetValueOrDefault(current, []))
          {
              //@step 8
              var candidate = distance[current] + edge.Weight;

              //@step 9
              if (candidate < distance[edge.To])
              {
                  distance[edge.To] = candidate;
                  previous[edge.To] = current;
              }
          }

          //@step 12
          unsettled.Remove(current);
      }

      //@step 14
      return (distance, previous);
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<WeightedEdge>> BuildAdjacency(WeightedGraphData graph)
  {
      var adjacency = new Dictionary<string, List<WeightedEdge>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static string? ExtractMinVertex(
      IReadOnlySet<string> unsettled,
      IReadOnlyDictionary<string, double> distance
  )
  {
      string? bestId = null;
      var bestDistance = double.PositiveInfinity;

      foreach (var nodeId in unsettled)
      {
          var candidate = distance[nodeId];
          if (candidate < bestDistance)
          {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'csharp',
);

const DIJKSTRA_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.HashSet;
  import java.util.List;
  import java.util.Map;
  import java.util.Set;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record WeightedEdge(String from, String to, double weight) {}

  public record WeightedGraphData(
      List<GraphNode> nodes,
      List<WeightedEdge> edges
  ) {}
  //#endregion graph-types

  //#region dijkstra function open
  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //@step 2
  public static Result dijkstra(WeightedGraphData graph, String source) {
      Map<String, List<WeightedEdge>> adjacency = buildAdjacency(graph);
      Map<String, Double> distance = new HashMap<>();
      Map<String, String> previous = new HashMap<>();
      Set<String> unsettled = new HashSet<>();

      for (GraphNode node : graph.nodes()) {
          distance.put(node.id(), Double.POSITIVE_INFINITY);
          previous.put(node.id(), null);
          unsettled.add(node.id());
      }

      distance.put(source, 0.0);

      //@step 5
      while (!unsettled.isEmpty()) {
          String current = extractMinVertex(unsettled, distance);
          if (current == null || !Double.isFinite(distance.get(current))) {
              break;
          }

          //@step 7
          for (WeightedEdge edge : adjacency.getOrDefault(current, List.of())) {
              //@step 8
              double candidate = distance.get(current) + edge.weight();

              //@step 9
              if (candidate < distance.get(edge.to())) {
                  distance.put(edge.to(), candidate);
                  previous.put(edge.to(), current);
              }
          }

          //@step 12
          unsettled.remove(current);
      }

      //@step 14
      return new Result(distance, previous);
  }
  //#endregion dijkstra

  //#region result helper collapsed
  public record Result(
      Map<String, Double> distance,
      Map<String, String> previous
  ) {}
  //#endregion result

  //#region build-adjacency helper collapsed
  private static Map<String, List<WeightedEdge>> buildAdjacency(WeightedGraphData graph) {
      Map<String, List<WeightedEdge>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (WeightedEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static String extractMinVertex(
      Set<String> unsettled,
      Map<String, Double> distance
  ) {
      String bestId = null;
      double bestDistance = Double.POSITIVE_INFINITY;

      for (String nodeId : unsettled) {
          double candidate = distance.get(nodeId);
          if (candidate < bestDistance) {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'java',
);

const DIJKSTRA_CPP = buildStructuredCode(
  `
  #include <limits>
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
  #include <utility>
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

  struct DijkstraResult {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> previous;
  };
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  DijkstraResult dijkstra(const WeightedGraphData& graph, const std::string& source) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> previous;
      std::unordered_set<std::string> unsettled;

      for (const auto& node : graph.nodes) {
          distance[node.id] = std::numeric_limits<double>::infinity();
          previous[node.id] = "";
          unsettled.insert(node.id);
      }

      distance[source] = 0.0;

      //@step 5
      while (!unsettled.empty()) {
          const auto current = extractMinVertex(unsettled, distance);
          if (current.empty() || !std::isfinite(distance[current])) {
              break;
          }

          //@step 7
          for (const auto& edge : adjacency[current]) {
              //@step 8
              const double candidate = distance[current] + edge.weight;

              //@step 9
              if (candidate < distance[edge.to]) {
                  distance[edge.to] = candidate;
                  previous[edge.to] = current;
              }
          }

          //@step 12
          unsettled.erase(current);
      }

      //@step 14
      return { distance, previous };
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<WeightedEdge>> buildAdjacency(
      const WeightedGraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<WeightedEdge>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  std::string extractMinVertex(
      const std::unordered_set<std::string>& unsettled,
      const std::unordered_map<std::string, double>& distance
  ) {
      std::string bestId;
      double bestDistance = std::numeric_limits<double>::infinity();

      for (const auto& nodeId : unsettled) {
          const double candidate = distance.at(nodeId);
          if (candidate < bestDistance) {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'cpp',
);

export const DIJKSTRA_CODE = DIJKSTRA_TS.lines;
export const DIJKSTRA_CODE_REGIONS = DIJKSTRA_TS.regions;
export const DIJKSTRA_CODE_HIGHLIGHT_MAP = DIJKSTRA_TS.highlightMap;
export const DIJKSTRA_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: DIJKSTRA_TS.lines,
    regions: DIJKSTRA_TS.regions,
    highlightMap: DIJKSTRA_TS.highlightMap,
    source: DIJKSTRA_TS.source,
  },
  python: {
    language: 'python',
    lines: DIJKSTRA_PY.lines,
    regions: DIJKSTRA_PY.regions,
    highlightMap: DIJKSTRA_PY.highlightMap,
    source: DIJKSTRA_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: DIJKSTRA_CS.lines,
    regions: DIJKSTRA_CS.regions,
    highlightMap: DIJKSTRA_CS.highlightMap,
    source: DIJKSTRA_CS.source,
  },
  java: {
    language: 'java',
    lines: DIJKSTRA_JAVA.lines,
    regions: DIJKSTRA_JAVA.regions,
    highlightMap: DIJKSTRA_JAVA.highlightMap,
    source: DIJKSTRA_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: DIJKSTRA_CPP.lines,
    regions: DIJKSTRA_CPP.regions,
    highlightMap: DIJKSTRA_CPP.highlightMap,
    source: DIJKSTRA_CPP.source,
  },
};
