import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BRIDGES_ARTICULATION_POINTS_TS = buildStructuredCode(`
  //#region graph-types interface collapsed
  interface GraphNode {
    readonly id: string;
  }

  interface GraphEdge {
    readonly from: string;
    readonly to: string;
  }

  interface GraphData {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
  }
  //#endregion graph-types

  /**
   * Find all bridges and articulation points in an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: bridge edge pairs and articulation node ids.
   */
  //#region critical-cuts function open
  //@step 2
  function findCriticalCuts(
    graph: GraphData,
  ): {
    bridges: Array<[string, string]>;
    articulation: Set<string>;
  } {
    const adjacency = buildUndirectedAdjacency(graph);
    const discovery = new Map<string, number | null>();
    const low = new Map<string, number | null>();
    const articulation = new Set<string>();
    const bridges: Array<[string, string]> = [];
    let time = 0;

    for (const node of graph.nodes) {
      discovery.set(node.id, null);
      low.set(node.id, null);
    }

    for (const node of graph.nodes) {
      if (discovery.get(node.id) !== null) {
        continue;
      }

      //@step 4
      dfs(node.id, null);
    }

    //@step 16
    return { bridges, articulation };

    //#region dfs helper collapsed
    function dfs(nodeId: string, parentId: string | null): void {
      time += 1;
      discovery.set(nodeId, time);
      low.set(nodeId, time);
      let childCount = 0;

      //@step 7
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        //@step 8
        if (neighbor !== parentId && discovery.get(neighbor) !== null) {
          low.set(
            nodeId,
            Math.min(low.get(nodeId) ?? Number.POSITIVE_INFINITY, discovery.get(neighbor)!),
          );
          continue;
        }

        //@step 10
        if (discovery.get(neighbor) === null) {
          childCount += 1;
          dfs(neighbor, nodeId);

          //@step 12
          low.set(
            nodeId,
            Math.min(low.get(nodeId) ?? Number.POSITIVE_INFINITY, low.get(neighbor)!),
          );

          const nodeDiscovery = discovery.get(nodeId)!;
          const childLow = low.get(neighbor)!;

          //@step 13
          if (childLow > nodeDiscovery) {
            bridges.push([nodeId, neighbor]);
          }

          if (parentId !== null && childLow >= nodeDiscovery) {
            articulation.add(nodeId);
          }
        }
      }

      if (parentId === null && childCount > 1) {
        articulation.add(nodeId);
      }

      //@step 15
      return;
    }
    //#endregion dfs
  }
  //#endregion critical-cuts

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(graph: GraphData): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge.to);
      adjacency.get(edge.to)?.push(edge.from);
    }

    return adjacency;
  }
  //#endregion build-adjacency
`);

const BRIDGES_ARTICULATION_POINTS_PY = buildStructuredCode(
  `
  from dataclasses import dataclass


  //#region graph-types interface collapsed
  @dataclass(frozen=True)
  class GraphNode:
      id: str


  @dataclass(frozen=True)
  class GraphEdge:
      from_id: str
      to: str


  @dataclass(frozen=True)
  class GraphData:
      nodes: list[GraphNode]
      edges: list[GraphEdge]
  //#endregion graph-types

  """
  Find all bridges and articulation points in an undirected graph.
  Input: graph interpreted as undirected.
  Returns: bridge edge pairs and articulation node ids.
  """
  //#region critical-cuts function open
  //@step 2
  def find_critical_cuts(
      graph: GraphData,
  ) -> tuple[list[tuple[str, str]], set[str]]:
      adjacency = build_undirected_adjacency(graph)
      discovery = {node.id: None for node in graph.nodes}
      low = {node.id: None for node in graph.nodes}
      articulation: set[str] = set()
      bridges: list[tuple[str, str]] = []
      time = 0

      def dfs(node_id: str, parent_id: str | None) -> None:
          nonlocal time
          time += 1
          discovery[node_id] = time
          low[node_id] = time
          child_count = 0

          //@step 7
          for neighbor in adjacency.get(node_id, []):
              //@step 8
              if neighbor != parent_id and discovery[neighbor] is not None:
                  low[node_id] = min(low[node_id], discovery[neighbor])
                  continue

              //@step 10
              if discovery[neighbor] is None:
                  child_count += 1
                  dfs(neighbor, node_id)

                  //@step 12
                  low[node_id] = min(low[node_id], low[neighbor])

                  //@step 13
                  if low[neighbor] > discovery[node_id]:
                      bridges.append((node_id, neighbor))

                  if parent_id is not None and low[neighbor] >= discovery[node_id]:
                      articulation.add(node_id)

          if parent_id is None and child_count > 1:
              articulation.add(node_id)

          //@step 15
          return

      for node in graph.nodes:
          if discovery[node.id] is not None:
              continue

          //@step 4
          dfs(node.id, None)

      //@step 16
      return bridges, articulation
  //#endregion critical-cuts

  //#region build-adjacency helper collapsed
  def build_undirected_adjacency(graph: GraphData) -> dict[str, list[str]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)
          adjacency.setdefault(edge.to, []).append(edge.from_id)

      return adjacency
  //#endregion build-adjacency
  `,
  'python',
);

const BRIDGES_ARTICULATION_POINTS_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct GraphEdge(string From, string To);

  public sealed record GraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<GraphEdge> Edges
  );
  //#endregion graph-types

  /// <summary>
  /// Finds all bridges and articulation points in an undirected graph.
  /// Input: graph interpreted as undirected.
  /// Returns: bridge edge pairs and articulation node ids.
  /// </summary>
  //#region critical-cuts function open
  //@step 2
  public static (
      List<(string From, string To)> Bridges,
      HashSet<string> Articulation
  ) FindCriticalCuts(GraphData graph)
  {
      var adjacency = BuildUndirectedAdjacency(graph);
      var discovery = new Dictionary<string, int?>();
      var low = new Dictionary<string, int?>();
      var articulation = new HashSet<string>();
      var bridges = new List<(string From, string To)>();
      var time = 0;

      foreach (var node in graph.Nodes)
      {
          discovery[node.Id] = null;
          low[node.Id] = null;
      }

      foreach (var node in graph.Nodes)
      {
          if (discovery[node.Id] is not null)
          {
              continue;
          }

          //@step 4
          Dfs(node.Id, null);
      }

      //@step 16
      return (bridges, articulation);

      //#region dfs helper collapsed
      void Dfs(string nodeId, string? parentId)
      {
          time += 1;
          discovery[nodeId] = time;
          low[nodeId] = time;
          var childCount = 0;

          //@step 7
          foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
          {
              //@step 8
              if (neighbor != parentId && discovery[neighbor] is not null)
              {
                  low[nodeId] = Math.Min(low[nodeId]!.Value, discovery[neighbor]!.Value);
                  continue;
              }

              //@step 10
              if (discovery[neighbor] is null)
              {
                  childCount += 1;
                  Dfs(neighbor, nodeId);

                  //@step 12
                  low[nodeId] = Math.Min(low[nodeId]!.Value, low[neighbor]!.Value);

                  var nodeDiscovery = discovery[nodeId]!.Value;
                  var childLow = low[neighbor]!.Value;

                  //@step 13
                  if (childLow > nodeDiscovery)
                  {
                      bridges.Add((nodeId, neighbor));
                  }

                  if (parentId is not null && childLow >= nodeDiscovery)
                  {
                      articulation.Add(nodeId);
                  }
              }
          }

          if (parentId is null && childCount > 1)
          {
              articulation.Add(nodeId);
          }

          //@step 15
          return;
      }
      //#endregion dfs
  }
  //#endregion critical-cuts

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<string>> BuildUndirectedAdjacency(GraphData graph)
  {
      var adjacency = new Dictionary<string, List<string>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge.To);
          adjacency[edge.To].Add(edge.From);
      }

      return adjacency;
  }
  //#endregion build-adjacency
  `,
  'csharp',
);

const BRIDGES_ARTICULATION_POINTS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.HashSet;
  import java.util.List;
  import java.util.Map;
  import java.util.Set;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record GraphEdge(String from, String to) {}

  public record GraphData(
      List<GraphNode> nodes,
      List<GraphEdge> edges
  ) {}
  //#endregion graph-types

  public record CriticalCutsResult(
      List<List<String>> bridges,
      Set<String> articulation
  ) {}

  //#region critical-cuts function open
  /**
   * Finds all bridges and articulation points in an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: bridge edge pairs and articulation node ids.
   */
  //@step 2
  public static CriticalCutsResult findCriticalCuts(GraphData graph) {
      Map<String, List<String>> adjacency = buildUndirectedAdjacency(graph);
      Map<String, Integer> discovery = new HashMap<>();
      Map<String, Integer> low = new HashMap<>();
      Set<String> articulation = new HashSet<>();
      List<List<String>> bridges = new ArrayList<>();
      Counter time = new Counter();

      for (GraphNode node : graph.nodes()) {
          discovery.put(node.id(), null);
          low.put(node.id(), null);
      }

      for (GraphNode node : graph.nodes()) {
          if (discovery.get(node.id()) != null) {
              continue;
          }

          //@step 4
          dfs(node.id(), null, adjacency, discovery, low, articulation, bridges, time);
      }

      //@step 16
      return new CriticalCutsResult(bridges, articulation);
  }
  //#endregion critical-cuts

  //#region dfs helper collapsed
  private static void dfs(
      String nodeId,
      String parentId,
      Map<String, List<String>> adjacency,
      Map<String, Integer> discovery,
      Map<String, Integer> low,
      Set<String> articulation,
      List<List<String>> bridges,
      Counter time
  ) {
      time.value += 1;
      discovery.put(nodeId, time.value);
      low.put(nodeId, time.value);
      int childCount = 0;

      //@step 7
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          //@step 8
          if (!neighbor.equals(parentId) && discovery.get(neighbor) != null) {
              low.put(nodeId, Math.min(low.get(nodeId), discovery.get(neighbor)));
              continue;
          }

          //@step 10
          if (discovery.get(neighbor) == null) {
              childCount += 1;
              dfs(neighbor, nodeId, adjacency, discovery, low, articulation, bridges, time);

              //@step 12
              low.put(nodeId, Math.min(low.get(nodeId), low.get(neighbor)));

              int nodeDiscovery = discovery.get(nodeId);
              int childLow = low.get(neighbor);

              //@step 13
              if (childLow > nodeDiscovery) {
                  bridges.add(List.of(nodeId, neighbor));
              }

              if (parentId != null && childLow >= nodeDiscovery) {
                  articulation.add(nodeId);
              }
          }
      }

      if (parentId == null && childCount > 1) {
          articulation.add(nodeId);
      }

      //@step 15
      return;
  }
  //#endregion dfs

  //#region counter helper collapsed
  private static final class Counter {
      int value = 0;
  }
  //#endregion counter

  //#region build-adjacency helper collapsed
  private static Map<String, List<String>> buildUndirectedAdjacency(GraphData graph) {
      Map<String, List<String>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge.to());
          adjacency.get(edge.to()).add(edge.from());
      }

      return adjacency;
  }
  //#endregion build-adjacency
  `,
  'java',
);

const BRIDGES_ARTICULATION_POINTS_CPP = buildStructuredCode(
  `
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
  #include <utility>
  #include <vector>

  //#region graph-types interface collapsed
  struct GraphNode {
      std::string id;
  };

  struct GraphEdge {
      std::string from;
      std::string to;
  };

  struct GraphData {
      std::vector<GraphNode> nodes;
      std::vector<GraphEdge> edges;
  };

  struct CriticalCutsResult {
      std::vector<std::pair<std::string, std::string>> bridges;
      std::unordered_set<std::string> articulation;
  };
  //#endregion graph-types

  /**
   * Finds all bridges and articulation points in an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: bridge edge pairs and articulation node ids.
   */
  //#region critical-cuts function open
  //@step 2
  CriticalCutsResult findCriticalCuts(const GraphData& graph) {
      auto adjacency = buildUndirectedAdjacency(graph);
      std::unordered_map<std::string, int> discovery;
      std::unordered_map<std::string, int> low;
      std::unordered_set<std::string> articulation;
      std::vector<std::pair<std::string, std::string>> bridges;
      int time = 0;

      for (const auto& node : graph.nodes) {
          discovery[node.id] = -1;
          low[node.id] = -1;
      }

      for (const auto& node : graph.nodes) {
          if (discovery[node.id] != -1) {
              continue;
          }

          //@step 4
          dfs(node.id, "", adjacency, discovery, low, articulation, bridges, time);
      }

      //@step 16
      return { bridges, articulation };
  }
  //#endregion critical-cuts

  //#region dfs helper collapsed
  void dfs(
      const std::string& nodeId,
      const std::string& parentId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_map<std::string, int>& discovery,
      std::unordered_map<std::string, int>& low,
      std::unordered_set<std::string>& articulation,
      std::vector<std::pair<std::string, std::string>>& bridges,
      int& time
  ) {
      time += 1;
      discovery[nodeId] = time;
      low[nodeId] = time;
      int childCount = 0;

      //@step 7
      for (const auto& neighbor : adjacency.at(nodeId)) {
          //@step 8
          if (neighbor != parentId && discovery[neighbor] != -1) {
              low[nodeId] = std::min(low[nodeId], discovery[neighbor]);
              continue;
          }

          //@step 10
          if (discovery[neighbor] == -1) {
              childCount += 1;
              dfs(neighbor, nodeId, adjacency, discovery, low, articulation, bridges, time);

              //@step 12
              low[nodeId] = std::min(low[nodeId], low[neighbor]);

              //@step 13
              if (low[neighbor] > discovery[nodeId]) {
                  bridges.push_back({ nodeId, neighbor });
              }

              if (!parentId.empty() && low[neighbor] >= discovery[nodeId]) {
                  articulation.insert(nodeId);
              }
          }
      }

      if (parentId.empty() && childCount > 1) {
          articulation.insert(nodeId);
      }

      //@step 15
      return;
  }
  //#endregion dfs

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<std::string>> buildUndirectedAdjacency(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<std::string>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back(edge.to);
          adjacency[edge.to].push_back(edge.from);
      }

      return adjacency;
  }
  //#endregion build-adjacency
  `,
  'cpp',
);

export const BRIDGES_ARTICULATION_POINTS_CODE = BRIDGES_ARTICULATION_POINTS_TS.lines;
export const BRIDGES_ARTICULATION_POINTS_CODE_REGIONS = BRIDGES_ARTICULATION_POINTS_TS.regions;
export const BRIDGES_ARTICULATION_POINTS_CODE_HIGHLIGHT_MAP = BRIDGES_ARTICULATION_POINTS_TS.highlightMap;
export const BRIDGES_ARTICULATION_POINTS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BRIDGES_ARTICULATION_POINTS_TS.lines,
    regions: BRIDGES_ARTICULATION_POINTS_TS.regions,
    highlightMap: BRIDGES_ARTICULATION_POINTS_TS.highlightMap,
    source: BRIDGES_ARTICULATION_POINTS_TS.source,
  },
  python: {
    language: 'python',
    lines: BRIDGES_ARTICULATION_POINTS_PY.lines,
    regions: BRIDGES_ARTICULATION_POINTS_PY.regions,
    highlightMap: BRIDGES_ARTICULATION_POINTS_PY.highlightMap,
    source: BRIDGES_ARTICULATION_POINTS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BRIDGES_ARTICULATION_POINTS_CS.lines,
    regions: BRIDGES_ARTICULATION_POINTS_CS.regions,
    highlightMap: BRIDGES_ARTICULATION_POINTS_CS.highlightMap,
    source: BRIDGES_ARTICULATION_POINTS_CS.source,
  },
  java: {
    language: 'java',
    lines: BRIDGES_ARTICULATION_POINTS_JAVA.lines,
    regions: BRIDGES_ARTICULATION_POINTS_JAVA.regions,
    highlightMap: BRIDGES_ARTICULATION_POINTS_JAVA.highlightMap,
    source: BRIDGES_ARTICULATION_POINTS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BRIDGES_ARTICULATION_POINTS_CPP.lines,
    regions: BRIDGES_ARTICULATION_POINTS_CPP.regions,
    highlightMap: BRIDGES_ARTICULATION_POINTS_CPP.highlightMap,
    source: BRIDGES_ARTICULATION_POINTS_CPP.source,
  },
};
