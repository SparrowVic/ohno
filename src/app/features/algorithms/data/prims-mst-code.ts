import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const PRIMS_MST_TS = buildStructuredCode(`
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
   * Build a minimum spanning tree with Prim's algorithm.
   * Input: connected weighted graph interpreted as undirected and a start id.
   * Returns: parent map of the MST rooted at start.
   */
  //#region prim function open
  //@step 2
  function primsMst(
    graph: WeightedGraphData,
    start: string,
  ): Map<string, string | null> {
    const adjacency = buildUndirectedAdjacency(graph);
    const key = new Map<string, number>();
    const parent = new Map<string, string | null>();
    const inTree = new Set<string>();

    for (const node of graph.nodes) {
      key.set(node.id, Number.POSITIVE_INFINITY);
      parent.set(node.id, null);
    }

    key.set(start, 0);

    while (inTree.size < graph.nodes.length) {
      //@step 5
      const current = extractMinVertex(key, inTree);
      if (current === null) {
        break;
      }

      //@step 12
      inTree.add(current);

      //@step 7
      for (const edge of adjacency.get(current) ?? []) {
        //@step 8
        if (inTree.has(edge.to)) {
          continue;
        }

        //@step 9
        if (edge.weight < (key.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          key.set(edge.to, edge.weight);
          parent.set(edge.to, current);
        }
      }
    }

    //@step 14
    return parent;
  }
  //#endregion prim

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(
    graph: WeightedGraphData,
  ): Map<string, WeightedEdge[]> {
    const adjacency = new Map<string, WeightedEdge[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge);
      adjacency.get(edge.to)?.push({
        from: edge.to,
        to: edge.from,
        weight: edge.weight,
      });
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  function extractMinVertex(
    key: ReadonlyMap<string, number>,
    inTree: ReadonlySet<string>,
  ): string | null {
    let bestId: string | null = null;
    let bestKey = Number.POSITIVE_INFINITY;

    for (const [nodeId, value] of key) {
      if (inTree.has(nodeId)) {
        continue;
      }

      if (value < bestKey) {
        bestKey = value;
        bestId = nodeId;
      }
    }

    return bestId;
  }
  //#endregion extract-min
`);

const PRIMS_MST_PY = buildStructuredCode(
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
  Build a minimum spanning tree with Prim's algorithm.
  Input: connected weighted graph interpreted as undirected and a start id.
  Returns: parent map of the MST rooted at start.
  """
  //#region prim function open
  //@step 2
  def prims_mst(
      graph: WeightedGraphData,
      start: str,
  ) -> dict[str, str | None]:
      adjacency = build_undirected_adjacency(graph)
      key = {node.id: float("inf") for node in graph.nodes}
      parent = {node.id: None for node in graph.nodes}
      in_tree: set[str] = set()

      key[start] = 0.0

      while len(in_tree) < len(graph.nodes):
          //@step 5
          current = extract_min_vertex(key, in_tree)
          if current is None:
              break

          //@step 12
          in_tree.add(current)

          //@step 7
          for edge in adjacency.get(current, []):
              //@step 8
              if edge.to in in_tree:
                  continue

              //@step 9
              if edge.weight < key[edge.to]:
                  key[edge.to] = edge.weight
                  parent[edge.to] = current

      //@step 14
      return parent
  //#endregion prim

  //#region build-adjacency helper collapsed
  def build_undirected_adjacency(
      graph: WeightedGraphData,
  ) -> dict[str, list[WeightedEdge]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge)
          adjacency.setdefault(edge.to, []).append(
              WeightedEdge(edge.to, edge.from_id, edge.weight)
          )

      return adjacency
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  def extract_min_vertex(
      key: dict[str, float],
      in_tree: set[str],
  ) -> str | None:
      best_id: str | None = None
      best_key = float("inf")

      for node_id, value in key.items():
          if node_id in in_tree:
              continue

          if value < best_key:
              best_key = value
              best_id = node_id

      return best_id
  //#endregion extract-min
  `,
  'python',
);

const PRIMS_MST_CS = buildStructuredCode(
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
  /// Builds a minimum spanning tree with Prim's algorithm.
  /// Input: connected weighted graph interpreted as undirected and a start id.
  /// Returns: parent map of the MST rooted at start.
  /// </summary>
  //#region prim function open
  //@step 2
  public static Dictionary<string, string?> PrimsMst(
      WeightedGraphData graph,
      string start
  )
  {
      var adjacency = BuildUndirectedAdjacency(graph);
      var key = new Dictionary<string, double>();
      var parent = new Dictionary<string, string?>();
      var inTree = new HashSet<string>();

      foreach (var node in graph.Nodes)
      {
          key[node.Id] = double.PositiveInfinity;
          parent[node.Id] = null;
      }

      key[start] = 0.0;

      while (inTree.Count < graph.Nodes.Count)
      {
          //@step 5
          var current = ExtractMinVertex(key, inTree);
          if (current is null)
          {
              break;
          }

          //@step 12
          inTree.Add(current);

          //@step 7
          foreach (var edge in adjacency.GetValueOrDefault(current, []))
          {
              //@step 8
              if (inTree.Contains(edge.To))
              {
                  continue;
              }

              //@step 9
              if (edge.Weight < key[edge.To])
              {
                  key[edge.To] = edge.Weight;
                  parent[edge.To] = current;
              }
          }
      }

      //@step 14
      return parent;
  }
  //#endregion prim

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<WeightedEdge>> BuildUndirectedAdjacency(
      WeightedGraphData graph
  )
  {
      var adjacency = new Dictionary<string, List<WeightedEdge>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge);
          adjacency[edge.To].Add(new WeightedEdge(edge.To, edge.From, edge.Weight));
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static string? ExtractMinVertex(
      IReadOnlyDictionary<string, double> key,
      IReadOnlySet<string> inTree
  )
  {
      string? bestId = null;
      var bestKey = double.PositiveInfinity;

      foreach (var entry in key)
      {
          if (inTree.Contains(entry.Key))
          {
              continue;
          }

          if (entry.Value < bestKey)
          {
              bestKey = entry.Value;
              bestId = entry.Key;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'csharp',
);

const PRIMS_MST_JAVA = buildStructuredCode(
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

  //#region prim function open
  /**
   * Builds a minimum spanning tree with Prim's algorithm.
   * Input: connected weighted graph interpreted as undirected and a start id.
   * Returns: parent map of the MST rooted at start.
   */
  //@step 2
  public static Map<String, String> primsMst(
      WeightedGraphData graph,
      String start
  ) {
      Map<String, List<WeightedEdge>> adjacency = buildUndirectedAdjacency(graph);
      Map<String, Double> key = new HashMap<>();
      Map<String, String> parent = new HashMap<>();
      Set<String> inTree = new HashSet<>();

      for (GraphNode node : graph.nodes()) {
          key.put(node.id(), Double.POSITIVE_INFINITY);
          parent.put(node.id(), null);
      }

      key.put(start, 0.0);

      while (inTree.size() < graph.nodes().size()) {
          //@step 5
          String current = extractMinVertex(key, inTree);
          if (current == null) {
              break;
          }

          //@step 12
          inTree.add(current);

          //@step 7
          for (WeightedEdge edge : adjacency.getOrDefault(current, List.of())) {
              //@step 8
              if (inTree.contains(edge.to())) {
                  continue;
              }

              //@step 9
              if (edge.weight() < key.get(edge.to())) {
                  key.put(edge.to(), edge.weight());
                  parent.put(edge.to(), current);
              }
          }
      }

      //@step 14
      return parent;
  }
  //#endregion prim

  //#region build-adjacency helper collapsed
  private static Map<String, List<WeightedEdge>> buildUndirectedAdjacency(
      WeightedGraphData graph
  ) {
      Map<String, List<WeightedEdge>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (WeightedEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge);
          adjacency.get(edge.to()).add(new WeightedEdge(edge.to(), edge.from(), edge.weight()));
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static String extractMinVertex(
      Map<String, Double> key,
      Set<String> inTree
  ) {
      String bestId = null;
      double bestKey = Double.POSITIVE_INFINITY;

      for (Map.Entry<String, Double> entry : key.entrySet()) {
          if (inTree.contains(entry.getKey())) {
              continue;
          }

          if (entry.getValue() < bestKey) {
              bestKey = entry.getValue();
              bestId = entry.getKey();
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'java',
);

const PRIMS_MST_CPP = buildStructuredCode(
  `
  #include <limits>
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
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
  //#endregion graph-types

  /**
   * Builds a minimum spanning tree with Prim's algorithm.
   * Input: connected weighted graph interpreted as undirected and a start id.
   * Returns: parent map of the MST rooted at start.
   */
  //#region prim function open
  //@step 2
  std::unordered_map<std::string, std::string> primsMst(
      const WeightedGraphData& graph,
      const std::string& start
  ) {
      auto adjacency = buildUndirectedAdjacency(graph);
      std::unordered_map<std::string, double> key;
      std::unordered_map<std::string, std::string> parent;
      std::unordered_set<std::string> inTree;

      for (const auto& node : graph.nodes) {
          key[node.id] = std::numeric_limits<double>::infinity();
          parent[node.id] = "";
      }

      key[start] = 0.0;

      while (inTree.size() < graph.nodes.size()) {
          //@step 5
          std::string current = extractMinVertex(key, inTree);
          if (current.empty()) {
              break;
          }

          //@step 12
          inTree.insert(current);

          //@step 7
          for (const auto& edge : adjacency[current]) {
              //@step 8
              if (inTree.contains(edge.to)) {
                  continue;
              }

              //@step 9
              if (edge.weight < key[edge.to]) {
                  key[edge.to] = edge.weight;
                  parent[edge.to] = current;
              }
          }
      }

      //@step 14
      return parent;
  }
  //#endregion prim

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<WeightedEdge>> buildUndirectedAdjacency(
      const WeightedGraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<WeightedEdge>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back(edge);
          adjacency[edge.to].push_back({ edge.to, edge.from, edge.weight });
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  std::string extractMinVertex(
      const std::unordered_map<std::string, double>& key,
      const std::unordered_set<std::string>& inTree
  ) {
      std::string bestId;
      double bestKey = std::numeric_limits<double>::infinity();

      for (const auto& entry : key) {
          if (inTree.contains(entry.first)) {
              continue;
          }

          if (entry.second < bestKey) {
              bestKey = entry.second;
              bestId = entry.first;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'cpp',
);

export const PRIMS_MST_CODE = PRIMS_MST_TS.lines;
export const PRIMS_MST_CODE_REGIONS = PRIMS_MST_TS.regions;
export const PRIMS_MST_CODE_HIGHLIGHT_MAP = PRIMS_MST_TS.highlightMap;
export const PRIMS_MST_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: PRIMS_MST_TS.lines,
    regions: PRIMS_MST_TS.regions,
    highlightMap: PRIMS_MST_TS.highlightMap,
    source: PRIMS_MST_TS.source,
  },
  python: {
    language: 'python',
    lines: PRIMS_MST_PY.lines,
    regions: PRIMS_MST_PY.regions,
    highlightMap: PRIMS_MST_PY.highlightMap,
    source: PRIMS_MST_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: PRIMS_MST_CS.lines,
    regions: PRIMS_MST_CS.regions,
    highlightMap: PRIMS_MST_CS.highlightMap,
    source: PRIMS_MST_CS.source,
  },
  java: {
    language: 'java',
    lines: PRIMS_MST_JAVA.lines,
    regions: PRIMS_MST_JAVA.regions,
    highlightMap: PRIMS_MST_JAVA.highlightMap,
    source: PRIMS_MST_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: PRIMS_MST_CPP.lines,
    regions: PRIMS_MST_CPP.regions,
    highlightMap: PRIMS_MST_CPP.highlightMap,
    source: PRIMS_MST_CPP.source,
  },
};
