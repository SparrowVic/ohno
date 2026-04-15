import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BFS_TS = buildStructuredCode(`
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
   * Traverse a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  function bfs(
    graph: GraphData,
    source: string,
  ): {
    level: Map<string, number>;
    order: string[];
  } {
    const adjacency = buildAdjacency(graph);
    const queue: string[] = [source];
    const visited = new Set<string>([source]);
    const level = new Map<string, number>([[source, 0]]);
    const order: string[] = [];

    while (queue.length > 0) {
      //@step 6
      const current = queue.shift()!;

      //@step 7
      for (const neighbor of adjacency.get(current) ?? []) {
        //@step 8
        if (visited.has(neighbor)) {
          continue;
        }

        visited.add(neighbor);

        //@step 10
        level.set(neighbor, (level.get(current) ?? 0) + 1);
        queue.push(neighbor);
      }

      //@step 13
      order.push(current);
    }

    return { level, order };
  }
  //#endregion bfs

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

const BFS_PY = buildStructuredCode(
  `
  from collections import deque
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
  Traverse a graph in breadth-first order.
  Input: directed graph and a source node id.
  Returns: BFS level map and visitation order.
  """
  //#region bfs function open
  //@step 2
  def bfs(graph: GraphData, source: str) -> tuple[dict[str, int], list[str]]:
      adjacency = build_adjacency(graph)
      queue = deque([source])
      visited = {source}
      level = {source: 0}
      order: list[str] = []

      while queue:
          //@step 6
          current = queue.popleft()

          //@step 7
          for neighbor in adjacency.get(current, []):
              //@step 8
              if neighbor in visited:
                  continue

              visited.add(neighbor)

              //@step 10
              level[neighbor] = level[current] + 1
              queue.append(neighbor)

          //@step 13
          order.append(current)

      return level, order
  //#endregion bfs

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

const BFS_CS = buildStructuredCode(
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
  /// Traverses a graph in breadth-first order.
  /// Input: directed graph and a source node id.
  /// Returns: BFS level map and visitation order.
  /// </summary>
  //#region bfs function open
  //@step 2
  public static (Dictionary<string, int> Level, List<string> Order) Bfs(
      GraphData graph,
      string source
  )
  {
      var adjacency = BuildAdjacency(graph);
      var queue = new Queue<string>([source]);
      var visited = new HashSet<string> { source };
      var level = new Dictionary<string, int> { [source] = 0 };
      var order = new List<string>();

      while (queue.Count > 0)
      {
          //@step 6
          var current = queue.Dequeue();

          //@step 7
          foreach (var neighbor in adjacency.GetValueOrDefault(current, []))
          {
              //@step 8
              if (visited.Contains(neighbor))
              {
                  continue;
              }

              visited.Add(neighbor);

              //@step 10
              level[neighbor] = level[current] + 1;
              queue.Enqueue(neighbor);
          }

          //@step 13
          order.Add(current);
      }

      return (level, order);
  }
  //#endregion bfs

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

const BFS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayDeque;
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.HashSet;
  import java.util.List;
  import java.util.Map;
  import java.util.Queue;
  import java.util.Set;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record GraphEdge(String from, String to) {}

  public record GraphData(
      List<GraphNode> nodes,
      List<GraphEdge> edges
  ) {}
  //#endregion graph-types

  public record BfsResult(
      Map<String, Integer> level,
      List<String> order
  ) {}

  //#region bfs function open
  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //@step 2
  public static BfsResult bfs(GraphData graph, String source) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Queue<String> queue = new ArrayDeque<>();
      queue.add(source);
      Set<String> visited = new HashSet<>(Set.of(source));
      Map<String, Integer> level = new HashMap<>();
      level.put(source, 0);
      List<String> order = new ArrayList<>();

      while (!queue.isEmpty()) {
          //@step 6
          String current = queue.remove();

          //@step 7
          for (String neighbor : adjacency.getOrDefault(current, List.of())) {
              //@step 8
              if (visited.contains(neighbor)) {
                  continue;
              }

              visited.add(neighbor);

              //@step 10
              level.put(neighbor, level.get(current) + 1);
              queue.add(neighbor);
          }

          //@step 13
          order.add(current);
      }

      return new BfsResult(level, order);
  }
  //#endregion bfs

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

const BFS_CPP = buildStructuredCode(
  `
  #include <queue>
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

  struct BfsResult {
      std::unordered_map<std::string, int> level;
      std::vector<std::string> order;
  };
  //#endregion graph-types

  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  BfsResult bfs(const GraphData& graph, const std::string& source) {
      auto adjacency = buildAdjacency(graph);
      std::queue<std::string> queue;
      queue.push(source);
      std::unordered_set<std::string> visited = { source };
      std::unordered_map<std::string, int> level = { { source, 0 } };
      std::vector<std::string> order;

      while (!queue.empty()) {
          //@step 6
          std::string current = queue.front();
          queue.pop();

          //@step 7
          for (const auto& neighbor : adjacency[current]) {
              //@step 8
              if (visited.contains(neighbor)) {
                  continue;
              }

              visited.insert(neighbor);

              //@step 10
              level[neighbor] = level[current] + 1;
              queue.push(neighbor);
          }

          //@step 13
          order.push_back(current);
      }

      return { level, order };
  }
  //#endregion bfs

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

export const BFS_CODE = BFS_TS.lines;
export const BFS_CODE_REGIONS = BFS_TS.regions;
export const BFS_CODE_HIGHLIGHT_MAP = BFS_TS.highlightMap;
export const BFS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BFS_TS.lines,
    regions: BFS_TS.regions,
    highlightMap: BFS_TS.highlightMap,
    source: BFS_TS.source,
  },
  python: {
    language: 'python',
    lines: BFS_PY.lines,
    regions: BFS_PY.regions,
    highlightMap: BFS_PY.highlightMap,
    source: BFS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BFS_CS.lines,
    regions: BFS_CS.regions,
    highlightMap: BFS_CS.highlightMap,
    source: BFS_CS.source,
  },
  java: {
    language: 'java',
    lines: BFS_JAVA.lines,
    regions: BFS_JAVA.regions,
    highlightMap: BFS_JAVA.highlightMap,
    source: BFS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BFS_CPP.lines,
    regions: BFS_CPP.regions,
    highlightMap: BFS_CPP.highlightMap,
    source: BFS_CPP.source,
  },
};
