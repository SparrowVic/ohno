import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CYCLE_DETECTION_TS = buildStructuredCode(`
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

  type VisitState = 'new' | 'stack' | 'done';
  //#endregion graph-types

  /**
   * Detect whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  function hasDirectedCycle(graph: GraphData): boolean {
    const adjacency = buildAdjacency(graph);
    const state = new Map<string, VisitState>();

    for (const node of graph.nodes) {
      //@step 4
      state.set(node.id, 'new');
    }

    for (const node of graph.nodes) {
      if (state.get(node.id) === 'new' && dfs(node.id, adjacency, state)) {
        return true;
      }
    }

    //@step 9
    return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  function dfs(
    nodeId: string,
    adjacency: ReadonlyMap<string, readonly string[]>,
    state: Map<string, VisitState>,
  ): boolean {
    //@step 11
    state.set(nodeId, 'stack');

    //@step 12
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      //@step 13
      if (state.get(neighbor) === 'stack') {
        return true;
      }

      //@step 14
      if (state.get(neighbor) === 'new') {
        //@step 15
        if (dfs(neighbor, adjacency, state)) {
          return true;
        }
      }
    }

    //@step 18
    state.set(nodeId, 'done');
    return false;
  }
  //#endregion dfs

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
`);

const CYCLE_DETECTION_PY = buildStructuredCode(
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
  Detect whether a directed graph contains a cycle.
  Input: directed graph.
  Returns: true if any DFS walk reaches a node already on the recursion stack.
  """
  //#region cycle-detection function open
  def has_directed_cycle(graph: GraphData) -> bool:
      adjacency = build_adjacency(graph)
      state = {}

      for node in graph.nodes:
          //@step 4
          state[node.id] = "new"

      for node in graph.nodes:
          if state[node.id] == "new" and dfs(node.id, adjacency, state):
              return True

      //@step 9
      return False
  //#endregion cycle-detection

  //#region dfs helper collapsed
  def dfs(
      node_id: str,
      adjacency: dict[str, list[str]],
      state: dict[str, str],
  ) -> bool:
      //@step 11
      state[node_id] = "stack"

      //@step 12
      for neighbor in adjacency.get(node_id, []):
          //@step 13
          if state.get(neighbor) == "stack":
              return True

          //@step 14
          if state.get(neighbor) == "new":
              //@step 15
              if dfs(neighbor, adjacency, state):
                  return True

      //@step 18
      state[node_id] = "done"
      return False
  //#endregion dfs

  //#region build-adjacency helper collapsed
  def build_adjacency(graph: GraphData) -> dict[str, list[str]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)

      return adjacency
  //#endregion build-adjacency
  `,
  'python',
);

const CYCLE_DETECTION_CS = buildStructuredCode(
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
  /// Detects whether a directed graph contains a cycle.
  /// Input: directed graph.
  /// Returns: true if any DFS walk reaches a node already on the recursion stack.
  /// </summary>
  //#region cycle-detection function open
  public static bool HasDirectedCycle(GraphData graph)
  {
      var adjacency = BuildAdjacency(graph);
      var state = new Dictionary<string, string>();

      foreach (var node in graph.Nodes)
      {
          //@step 4
          state[node.Id] = "new";
      }

      foreach (var node in graph.Nodes)
      {
          if (state[node.Id] == "new" && Dfs(node.Id, adjacency, state))
          {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  private static bool Dfs(
      string nodeId,
      IReadOnlyDictionary<string, List<string>> adjacency,
      Dictionary<string, string> state
  )
  {
      //@step 11
      state[nodeId] = "stack";

      //@step 12
      foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
      {
          //@step 13
          if (state.GetValueOrDefault(neighbor) == "stack")
          {
              return true;
          }

          //@step 14
          if (state.GetValueOrDefault(neighbor) == "new")
          {
              //@step 15
              if (Dfs(neighbor, adjacency, state))
              {
                  return true;
              }
          }
      }

      //@step 18
      state[nodeId] = "done";
      return false;
  }
  //#endregion dfs

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
  `,
  'csharp',
);

const CYCLE_DETECTION_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record GraphEdge(String from, String to) {}

  public record GraphData(
      List<GraphNode> nodes,
      List<GraphEdge> edges
  ) {}
  //#endregion graph-types

  //#region cycle-detection function open
  /**
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  public static boolean hasDirectedCycle(GraphData graph) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Map<String, String> state = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          //@step 4
          state.put(node.id(), "new");
      }

      for (GraphNode node : graph.nodes()) {
          if ("new".equals(state.get(node.id())) && dfs(node.id(), adjacency, state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  private static boolean dfs(
      String nodeId,
      Map<String, List<String>> adjacency,
      Map<String, String> state
  ) {
      //@step 11
      state.put(nodeId, "stack");

      //@step 12
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          //@step 13
          if ("stack".equals(state.get(neighbor))) {
              return true;
          }

          //@step 14
          if ("new".equals(state.get(neighbor))) {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true;
              }
          }
      }

      //@step 18
      state.put(nodeId, "done");
      return false;
  }
  //#endregion dfs

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
  `,
  'java',
);

const CYCLE_DETECTION_CPP = buildStructuredCode(
  `
  #include <string>
  #include <unordered_map>
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
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  bool hasDirectedCycle(const GraphData& graph) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_map<std::string, std::string> state;

      for (const auto& node : graph.nodes) {
          //@step 4
          state[node.id] = "new";
      }

      for (const auto& node : graph.nodes) {
          if (state[node.id] == "new" && dfs(node.id, adjacency, state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  bool dfs(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_map<std::string, std::string>& state
  ) {
      //@step 11
      state[nodeId] = "stack";

      //@step 12
      for (const auto& neighbor : adjacency.at(nodeId)) {
          //@step 13
          if (state[neighbor] == "stack") {
              return true;
          }

          //@step 14
          if (state[neighbor] == "new") {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true;
              }
          }
      }

      //@step 18
      state[nodeId] = "done";
      return false;
  }
  //#endregion dfs

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
  `,
  'cpp',
);

export const CYCLE_DETECTION_CODE = CYCLE_DETECTION_TS.lines;
export const CYCLE_DETECTION_CODE_REGIONS = CYCLE_DETECTION_TS.regions;
export const CYCLE_DETECTION_CODE_HIGHLIGHT_MAP = CYCLE_DETECTION_TS.highlightMap;
export const CYCLE_DETECTION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CYCLE_DETECTION_TS.lines,
    regions: CYCLE_DETECTION_TS.regions,
    highlightMap: CYCLE_DETECTION_TS.highlightMap,
    source: CYCLE_DETECTION_TS.source,
  },
  python: {
    language: 'python',
    lines: CYCLE_DETECTION_PY.lines,
    regions: CYCLE_DETECTION_PY.regions,
    highlightMap: CYCLE_DETECTION_PY.highlightMap,
    source: CYCLE_DETECTION_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CYCLE_DETECTION_CS.lines,
    regions: CYCLE_DETECTION_CS.regions,
    highlightMap: CYCLE_DETECTION_CS.highlightMap,
    source: CYCLE_DETECTION_CS.source,
  },
  java: {
    language: 'java',
    lines: CYCLE_DETECTION_JAVA.lines,
    regions: CYCLE_DETECTION_JAVA.regions,
    highlightMap: CYCLE_DETECTION_JAVA.highlightMap,
    source: CYCLE_DETECTION_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CYCLE_DETECTION_CPP.lines,
    regions: CYCLE_DETECTION_CPP.regions,
    highlightMap: CYCLE_DETECTION_CPP.highlightMap,
    source: CYCLE_DETECTION_CPP.source,
  },
};
