import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const KOSARAJU_SCC_TS = buildStructuredCode(`
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
   * Partition a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  function kosarajuScc(graph: GraphData): string[][] {
    const adjacency = buildAdjacency(graph);
    const visited = new Set<string>();
    const finishOrder: string[] = [];

    for (const node of graph.nodes) {
      //@step 4
      if (!visited.has(node.id)) {
        dfsOriginal(node.id);
      }
    }

    //@step 8
    const reversed = buildReversedAdjacency(graph);
    const assigned = new Set<string>();
    const components: string[][] = [];

    //@step 9
    for (let index = finishOrder.length - 1; index >= 0; index -= 1) {
      const nodeId = finishOrder[index]!;

      //@step 11
      if (assigned.has(nodeId)) {
        continue;
      }

      const component: string[] = [];

      //@step 12
      dfsReverse(nodeId, reversed, assigned, component);

      //@step 13
      components.push(component);
    }

    //@step 15
    return components;

    //#region dfs-original helper collapsed
    function dfsOriginal(nodeId: string): void {
      //@step 5
      visited.add(nodeId);

      //@step 6
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          dfsOriginal(neighbor);
        }
      }

      //@step 7
      finishOrder.push(nodeId);
    }
    //#endregion dfs-original

    //#region dfs-reverse helper collapsed
    function dfsReverse(
      nodeId: string,
      reverseAdjacency: ReadonlyMap<string, readonly string[]>,
      seen: Set<string>,
      component: string[],
    ): void {
      seen.add(nodeId);
      component.push(nodeId);

      for (const neighbor of reverseAdjacency.get(nodeId) ?? []) {
        if (!seen.has(neighbor)) {
          dfsReverse(neighbor, reverseAdjacency, seen, component);
        }
      }
    }
    //#endregion dfs-reverse
  }
  //#endregion kosaraju

  //#region build-adjacency helper collapsed
  function buildAdjacency(graph: GraphData): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge.to);
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  function buildReversedAdjacency(graph: GraphData): Map<string, string[]> {
    const reversed = new Map<string, string[]>();

    for (const node of graph.nodes) {
      reversed.set(node.id, []);
    }

    for (const edge of graph.edges) {
      reversed.get(edge.to)?.push(edge.from);
    }

    return reversed;
  }
  //#endregion build-reversed
`);

const KOSARAJU_SCC_PY = buildStructuredCode(
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
  Partition a directed graph into strongly connected components with Kosaraju's algorithm.
  Input: directed graph.
  Returns: SCCs in reverse finishing-time order.
  """
  //#region kosaraju function open
  //@step 2
  def kosaraju_scc(graph: GraphData) -> list[list[str]]:
      adjacency = build_adjacency(graph)
      visited: set[str] = set()
      finish_order: list[str] = []

      def dfs_original(node_id: str) -> None:
          //@step 5
          visited.add(node_id)

          //@step 6
          for neighbor in adjacency.get(node_id, []):
              if neighbor not in visited:
                  dfs_original(neighbor)

          //@step 7
          finish_order.append(node_id)

      for node in graph.nodes:
          //@step 4
          if node.id not in visited:
              dfs_original(node.id)

      //@step 8
      reversed_adjacency = build_reversed_adjacency(graph)
      assigned: set[str] = set()
      components: list[list[str]] = []

      def dfs_reverse(node_id: str, component: list[str]) -> None:
          assigned.add(node_id)
          component.append(node_id)

          for neighbor in reversed_adjacency.get(node_id, []):
              if neighbor not in assigned:
                  dfs_reverse(neighbor, component)

      //@step 9
      for node_id in reversed(finish_order):
          //@step 11
          if node_id in assigned:
              continue

          component: list[str] = []

          //@step 12
          dfs_reverse(node_id, component)

          //@step 13
          components.append(component)

      //@step 15
      return components
  //#endregion kosaraju

  //#region build-adjacency helper collapsed
  def build_adjacency(graph: GraphData) -> dict[str, list[str]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)

      return adjacency
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  def build_reversed_adjacency(graph: GraphData) -> dict[str, list[str]]:
      reversed_adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          reversed_adjacency.setdefault(edge.to, []).append(edge.from_id)

      return reversed_adjacency
  //#endregion build-reversed
  `,
  'python',
);

const KOSARAJU_SCC_CS = buildStructuredCode(
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
  /// Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
  /// Input: directed graph.
  /// Returns: SCCs in reverse finishing-time order.
  /// </summary>
  //#region kosaraju function open
  //@step 2
  public static List<List<string>> KosarajuScc(GraphData graph)
  {
      var adjacency = BuildAdjacency(graph);
      var visited = new HashSet<string>();
      var finishOrder = new List<string>();

      void DfsOriginal(string nodeId)
      {
          //@step 5
          visited.Add(nodeId);

          //@step 6
          foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
          {
              if (!visited.Contains(neighbor))
              {
                  DfsOriginal(neighbor);
              }
          }

          //@step 7
          finishOrder.Add(nodeId);
      }

      foreach (var node in graph.Nodes)
      {
          //@step 4
          if (!visited.Contains(node.Id))
          {
              DfsOriginal(node.Id);
          }
      }

      //@step 8
      var reversed = BuildReversedAdjacency(graph);
      var assigned = new HashSet<string>();
      var components = new List<List<string>>();

      void DfsReverse(string nodeId, List<string> component)
      {
          assigned.Add(nodeId);
          component.Add(nodeId);

          foreach (var neighbor in reversed.GetValueOrDefault(nodeId, []))
          {
              if (!assigned.Contains(neighbor))
              {
                  DfsReverse(neighbor, component);
              }
          }
      }

      //@step 9
      for (var index = finishOrder.Count - 1; index >= 0; index -= 1)
      {
          var nodeId = finishOrder[index];

          //@step 11
          if (assigned.Contains(nodeId))
          {
              continue;
          }

          var component = new List<string>();

          //@step 12
          DfsReverse(nodeId, component);

          //@step 13
          components.Add(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<string>> BuildAdjacency(GraphData graph)
  {
      var adjacency = new Dictionary<string, List<string>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge.To);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  private static Dictionary<string, List<string>> BuildReversedAdjacency(GraphData graph)
  {
      var reversed = new Dictionary<string, List<string>>();

      foreach (var node in graph.Nodes)
      {
          reversed[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          reversed[edge.To].Add(edge.From);
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'csharp',
);

const KOSARAJU_SCC_JAVA = buildStructuredCode(
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

  //#region kosaraju function open
  /**
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //@step 2
  public static List<List<String>> kosarajuScc(GraphData graph) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Set<String> visited = new HashSet<>();
      List<String> finishOrder = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          //@step 4
          if (!visited.contains(node.id())) {
              dfsOriginal(node.id(), adjacency, visited, finishOrder);
          }
      }

      //@step 8
      Map<String, List<String>> reversed = buildReversedAdjacency(graph);
      Set<String> assigned = new HashSet<>();
      List<List<String>> components = new ArrayList<>();

      //@step 9
      for (int index = finishOrder.size() - 1; index >= 0; index -= 1) {
          String nodeId = finishOrder.get(index);

          //@step 11
          if (assigned.contains(nodeId)) {
              continue;
          }

          List<String> component = new ArrayList<>();

          //@step 12
          dfsReverse(nodeId, reversed, assigned, component);

          //@step 13
          components.add(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

  //#region dfs-original helper collapsed
  private static void dfsOriginal(
      String nodeId,
      Map<String, List<String>> adjacency,
      Set<String> visited,
      List<String> finishOrder
  ) {
      //@step 5
      visited.add(nodeId);

      //@step 6
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          if (!visited.contains(neighbor)) {
              dfsOriginal(neighbor, adjacency, visited, finishOrder);
          }
      }

      //@step 7
      finishOrder.add(nodeId);
  }
  //#endregion dfs-original

  //#region dfs-reverse helper collapsed
  private static void dfsReverse(
      String nodeId,
      Map<String, List<String>> reversed,
      Set<String> assigned,
      List<String> component
  ) {
      assigned.add(nodeId);
      component.add(nodeId);

      for (String neighbor : reversed.getOrDefault(nodeId, List.of())) {
          if (!assigned.contains(neighbor)) {
              dfsReverse(neighbor, reversed, assigned, component);
          }
      }
  }
  //#endregion dfs-reverse

  //#region build-adjacency helper collapsed
  private static Map<String, List<String>> buildAdjacency(GraphData graph) {
      Map<String, List<String>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge.to());
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  private static Map<String, List<String>> buildReversedAdjacency(GraphData graph) {
      Map<String, List<String>> reversed = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          reversed.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          reversed.get(edge.to()).add(edge.from());
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'java',
);

const KOSARAJU_SCC_CPP = buildStructuredCode(
  `
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
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
  //#endregion graph-types

  /**
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  std::vector<std::vector<std::string>> kosarajuScc(const GraphData& graph) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_set<std::string> visited;
      std::vector<std::string> finishOrder;

      for (const auto& node : graph.nodes) {
          //@step 4
          if (!visited.contains(node.id)) {
              dfsOriginal(node.id, adjacency, visited, finishOrder);
          }
      }

      //@step 8
      auto reversed = buildReversedAdjacency(graph);
      std::unordered_set<std::string> assigned;
      std::vector<std::vector<std::string>> components;

      //@step 9
      for (int index = static_cast<int>(finishOrder.size()) - 1; index >= 0; index -= 1) {
          const auto& nodeId = finishOrder[index];

          //@step 11
          if (assigned.contains(nodeId)) {
              continue;
          }

          std::vector<std::string> component;

          //@step 12
          dfsReverse(nodeId, reversed, assigned, component);

          //@step 13
          components.push_back(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

  //#region dfs-original helper collapsed
  void dfsOriginal(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_set<std::string>& visited,
      std::vector<std::string>& finishOrder
  ) {
      //@step 5
      visited.insert(nodeId);

      //@step 6
      for (const auto& neighbor : adjacency.at(nodeId)) {
          if (!visited.contains(neighbor)) {
              dfsOriginal(neighbor, adjacency, visited, finishOrder);
          }
      }

      //@step 7
      finishOrder.push_back(nodeId);
  }
  //#endregion dfs-original

  //#region dfs-reverse helper collapsed
  void dfsReverse(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& reversed,
      std::unordered_set<std::string>& assigned,
      std::vector<std::string>& component
  ) {
      assigned.insert(nodeId);
      component.push_back(nodeId);

      for (const auto& neighbor : reversed.at(nodeId)) {
          if (!assigned.contains(neighbor)) {
              dfsReverse(neighbor, reversed, assigned, component);
          }
      }
  }
  //#endregion dfs-reverse

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<std::string>> buildAdjacency(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<std::string>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back(edge.to);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  std::unordered_map<std::string, std::vector<std::string>> buildReversedAdjacency(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<std::string>> reversed;

      for (const auto& node : graph.nodes) {
          reversed[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          reversed[edge.to].push_back(edge.from);
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'cpp',
);

export const KOSARAJU_SCC_CODE = KOSARAJU_SCC_TS.lines;
export const KOSARAJU_SCC_CODE_REGIONS = KOSARAJU_SCC_TS.regions;
export const KOSARAJU_SCC_CODE_HIGHLIGHT_MAP = KOSARAJU_SCC_TS.highlightMap;
export const KOSARAJU_SCC_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KOSARAJU_SCC_TS.lines,
    regions: KOSARAJU_SCC_TS.regions,
    highlightMap: KOSARAJU_SCC_TS.highlightMap,
    source: KOSARAJU_SCC_TS.source,
  },
  python: {
    language: 'python',
    lines: KOSARAJU_SCC_PY.lines,
    regions: KOSARAJU_SCC_PY.regions,
    highlightMap: KOSARAJU_SCC_PY.highlightMap,
    source: KOSARAJU_SCC_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: KOSARAJU_SCC_CS.lines,
    regions: KOSARAJU_SCC_CS.regions,
    highlightMap: KOSARAJU_SCC_CS.highlightMap,
    source: KOSARAJU_SCC_CS.source,
  },
  java: {
    language: 'java',
    lines: KOSARAJU_SCC_JAVA.lines,
    regions: KOSARAJU_SCC_JAVA.regions,
    highlightMap: KOSARAJU_SCC_JAVA.highlightMap,
    source: KOSARAJU_SCC_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: KOSARAJU_SCC_CPP.lines,
    regions: KOSARAJU_SCC_CPP.regions,
    highlightMap: KOSARAJU_SCC_CPP.highlightMap,
    source: KOSARAJU_SCC_CPP.source,
  },
};
