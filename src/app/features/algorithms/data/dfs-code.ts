import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const DFS_TS = buildStructuredCode(`
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
   * Traverse a graph in depth-first order with an explicit stack.
   * Input: directed graph and a source node id.
   * Returns: depth map and visitation order.
   */
  //#region dfs function open
  //@step 2
  function dfs(
    graph: GraphData,
    source: string,
  ): {
    depth: Map<string, number>;
    order: string[];
  } {
    const adjacency = buildAdjacency(graph);
    const stack: string[] = [source];
    const visited = new Set<string>([source]);
    const depth = new Map<string, number>([[source, 0]]);
    const order: string[] = [];

    while (stack.length > 0) {
      //@step 6
      const current = stack.pop()!;

      const neighbors = [...(adjacency.get(current) ?? [])].reverse();

      //@step 7
      for (const neighbor of neighbors) {
        //@step 8
        if (visited.has(neighbor)) {
          continue;
        }

        visited.add(neighbor);

        //@step 10
        depth.set(neighbor, (depth.get(current) ?? 0) + 1);
        stack.push(neighbor);
      }

      //@step 13
      order.push(current);
    }

    return { depth, order };
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

const DFS_PY = buildStructuredCode(
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
  Traverse a graph in depth-first order with an explicit stack.
  Input: directed graph and a source node id.
  Returns: depth map and visitation order.
  """
  //#region dfs function open
  //@step 2
  def dfs(graph: GraphData, source: str) -> tuple[dict[str, int], list[str]]:
      adjacency = build_adjacency(graph)
      stack = [source]
      visited = {source}
      depth = {source: 0}
      order: list[str] = []

      while stack:
          //@step 6
          current = stack.pop()
          neighbors = list(reversed(adjacency.get(current, [])))

          //@step 7
          for neighbor in neighbors:
              //@step 8
              if neighbor in visited:
                  continue

              visited.add(neighbor)

              //@step 10
              depth[neighbor] = depth[current] + 1
              stack.append(neighbor)

          //@step 13
          order.append(current)

      return depth, order
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

const DFS_CS = buildStructuredCode(
  `
  using System.Collections.Generic;
  using System.Linq;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct GraphEdge(string From, string To);

  public sealed record GraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<GraphEdge> Edges
  );
  //#endregion graph-types

  /// <summary>
  /// Traverses a graph in depth-first order with an explicit stack.
  /// Input: directed graph and a source node id.
  /// Returns: depth map and visitation order.
  /// </summary>
  //#region dfs function open
  //@step 2
  public static (Dictionary<string, int> Depth, List<string> Order) Dfs(
      GraphData graph,
      string source
  )
  {
      var adjacency = BuildAdjacency(graph);
      var stack = new Stack<string>([source]);
      var visited = new HashSet<string> { source };
      var depth = new Dictionary<string, int> { [source] = 0 };
      var order = new List<string>();

      while (stack.Count > 0)
      {
          //@step 6
          var current = stack.Pop();
          var neighbors = adjacency.GetValueOrDefault(current, []).AsEnumerable().Reverse();

          //@step 7
          foreach (var neighbor in neighbors)
          {
              //@step 8
              if (visited.Contains(neighbor))
              {
                  continue;
              }

              visited.Add(neighbor);

              //@step 10
              depth[neighbor] = depth[current] + 1;
              stack.Push(neighbor);
          }

          //@step 13
          order.Add(current);
      }

      return (depth, order);
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

const DFS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayDeque;
  import java.util.ArrayList;
  import java.util.Collections;
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

  public record DfsResult(
      Map<String, Integer> depth,
      List<String> order
  ) {}

  //#region dfs function open
  /**
   * Traverses a graph in depth-first order with an explicit stack.
   * Input: directed graph and a source node id.
   * Returns: depth map and visitation order.
   */
  //@step 2
  public static DfsResult dfs(GraphData graph, String source) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      ArrayDeque<String> stack = new ArrayDeque<>();
      stack.push(source);
      Set<String> visited = new HashSet<>(Set.of(source));
      Map<String, Integer> depth = new HashMap<>();
      depth.put(source, 0);
      List<String> order = new ArrayList<>();

      while (!stack.isEmpty()) {
          //@step 6
          String current = stack.pop();
          List<String> neighbors = new ArrayList<>(adjacency.getOrDefault(current, List.of()));
          Collections.reverse(neighbors);

          //@step 7
          for (String neighbor : neighbors) {
              //@step 8
              if (visited.contains(neighbor)) {
                  continue;
              }

              visited.add(neighbor);

              //@step 10
              depth.put(neighbor, depth.get(current) + 1);
              stack.push(neighbor);
          }

          //@step 13
          order.add(current);
      }

      return new DfsResult(depth, order);
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

const DFS_CPP = buildStructuredCode(
  `
  #include <algorithm>
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

  struct DfsResult {
      std::unordered_map<std::string, int> depth;
      std::vector<std::string> order;
  };
  //#endregion graph-types

  /**
   * Traverses a graph in depth-first order with an explicit stack.
   * Input: directed graph and a source node id.
   * Returns: depth map and visitation order.
   */
  //#region dfs function open
  //@step 2
  DfsResult dfs(const GraphData& graph, const std::string& source) {
      auto adjacency = buildAdjacency(graph);
      std::vector<std::string> stack = { source };
      std::unordered_set<std::string> visited = { source };
      std::unordered_map<std::string, int> depth = { { source, 0 } };
      std::vector<std::string> order;

      while (!stack.empty()) {
          //@step 6
          std::string current = stack.back();
          stack.pop_back();

          auto neighbors = adjacency[current];
          std::reverse(neighbors.begin(), neighbors.end());

          //@step 7
          for (const auto& neighbor : neighbors) {
              //@step 8
              if (visited.contains(neighbor)) {
                  continue;
              }

              visited.insert(neighbor);

              //@step 10
              depth[neighbor] = depth[current] + 1;
              stack.push_back(neighbor);
          }

          //@step 13
          order.push_back(current);
      }

      return { depth, order };
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

export const DFS_CODE = DFS_TS.lines;
export const DFS_CODE_REGIONS = DFS_TS.regions;
export const DFS_CODE_HIGHLIGHT_MAP = DFS_TS.highlightMap;
export const DFS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: DFS_TS.lines,
    regions: DFS_TS.regions,
    highlightMap: DFS_TS.highlightMap,
    source: DFS_TS.source,
  },
  python: {
    language: 'python',
    lines: DFS_PY.lines,
    regions: DFS_PY.regions,
    highlightMap: DFS_PY.highlightMap,
    source: DFS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: DFS_CS.lines,
    regions: DFS_CS.regions,
    highlightMap: DFS_CS.highlightMap,
    source: DFS_CS.source,
  },
  java: {
    language: 'java',
    lines: DFS_JAVA.lines,
    regions: DFS_JAVA.regions,
    highlightMap: DFS_JAVA.highlightMap,
    source: DFS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: DFS_CPP.lines,
    regions: DFS_CPP.regions,
    highlightMap: DFS_CPP.highlightMap,
    source: DFS_CPP.source,
  },
};
