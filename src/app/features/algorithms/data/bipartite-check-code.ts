import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BIPARTITE_CHECK_TS = buildStructuredCode(`
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

  type Partition = 0 | 1;
  //#endregion graph-types

  /**
   * Check whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  function isBipartite(graph: GraphData): boolean {
    const adjacency = buildUndirectedAdjacency(graph);
    const color = new Map<string, Partition | null>();
    const closed: string[] = [];

    for (const node of graph.nodes) {
      color.set(node.id, null);
    }

    for (const node of graph.nodes) {
      if (color.get(node.id) !== null) {
        continue;
      }

      //@step 5
      const queue: string[] = [node.id];
      color.set(node.id, 0);

      while (queue.length > 0) {
        //@step 7
        const current = queue.shift()!;
        const wanted = color.get(current) === 0 ? 1 : 0;

        //@step 8
        for (const neighbor of adjacency.get(current) ?? []) {
          const neighborColor = color.get(neighbor) ?? null;

          //@step 10
          if (neighborColor === null) {
            color.set(neighbor, wanted);
            queue.push(neighbor);
            continue;
          }

          //@step 13
          if (neighborColor === wanted) {
            continue;
          }

          //@step 12
          return false;
        }

        //@step 14
        closed.push(current);
      }
    }

    //@step 15
    return true;
  }
  //#endregion bipartite

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

const BIPARTITE_CHECK_PY = buildStructuredCode(
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
  Check whether an undirected graph is bipartite.
  Input: graph interpreted as undirected.
  Returns: true when every edge connects opposite partitions.
  """
  //#region bipartite function open
  //@step 2
  def is_bipartite(graph: GraphData) -> bool:
      adjacency = build_undirected_adjacency(graph)
      color = {node.id: None for node in graph.nodes}
      closed: list[str] = []

      for node in graph.nodes:
          if color[node.id] is not None:
              continue

          //@step 5
          queue = deque([node.id])
          color[node.id] = 0

          while queue:
              //@step 7
              current = queue.popleft()
              wanted = 1 if color[current] == 0 else 0

              //@step 8
              for neighbor in adjacency.get(current, []):
                  neighbor_color = color[neighbor]

                  //@step 10
                  if neighbor_color is None:
                      color[neighbor] = wanted
                      queue.append(neighbor)
                      continue

                  //@step 13
                  if neighbor_color == wanted:
                      continue

                  //@step 12
                  return False

              //@step 14
              closed.append(current)

      //@step 15
      return True
  //#endregion bipartite

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

const BIPARTITE_CHECK_CS = buildStructuredCode(
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
  /// Checks whether an undirected graph is bipartite.
  /// Input: graph interpreted as undirected.
  /// Returns: true when every edge connects opposite partitions.
  /// </summary>
  //#region bipartite function open
  //@step 2
  public static bool IsBipartite(GraphData graph)
  {
      var adjacency = BuildUndirectedAdjacency(graph);
      var color = new Dictionary<string, int?>();
      var closed = new List<string>();

      foreach (var node in graph.Nodes)
      {
          color[node.Id] = null;
      }

      foreach (var node in graph.Nodes)
      {
          if (color[node.Id] is not null)
          {
              continue;
          }

          //@step 5
          var queue = new Queue<string>([node.Id]);
          color[node.Id] = 0;

          while (queue.Count > 0)
          {
            //@step 7
            var current = queue.Dequeue();
            var wanted = color[current] == 0 ? 1 : 0;

            //@step 8
            foreach (var neighbor in adjacency.GetValueOrDefault(current, []))
            {
                var neighborColor = color[neighbor];

                //@step 10
                if (neighborColor is null)
                {
                    color[neighbor] = wanted;
                    queue.Enqueue(neighbor);
                    continue;
                }

                //@step 13
                if (neighborColor == wanted)
                {
                    continue;
                }

                //@step 12
                return false;
            }

            //@step 14
            closed.Add(current);
          }
      }

      //@step 15
      return true;
  }
  //#endregion bipartite

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

const BIPARTITE_CHECK_JAVA = buildStructuredCode(
  `
  import java.util.ArrayDeque;
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;
  import java.util.Queue;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record GraphEdge(String from, String to) {}

  public record GraphData(
      List<GraphNode> nodes,
      List<GraphEdge> edges
  ) {}
  //#endregion graph-types

  //#region bipartite function open
  /**
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //@step 2
  public static boolean isBipartite(GraphData graph) {
      Map<String, List<String>> adjacency = buildUndirectedAdjacency(graph);
      Map<String, Integer> color = new HashMap<>();
      List<String> closed = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          color.put(node.id(), null);
      }

      for (GraphNode node : graph.nodes()) {
          if (color.get(node.id()) != null) {
              continue;
          }

          //@step 5
          Queue<String> queue = new ArrayDeque<>();
          queue.add(node.id());
          color.put(node.id(), 0);

          while (!queue.isEmpty()) {
              //@step 7
              String current = queue.remove();
              int wanted = color.get(current) == 0 ? 1 : 0;

              //@step 8
              for (String neighbor : adjacency.getOrDefault(current, List.of())) {
                  Integer neighborColor = color.get(neighbor);

                  //@step 10
                  if (neighborColor == null) {
                      color.put(neighbor, wanted);
                      queue.add(neighbor);
                      continue;
                  }

                  //@step 13
                  if (neighborColor == wanted) {
                      continue;
                  }

                  //@step 12
                  return false;
              }

              //@step 14
              closed.add(current);
          }
      }

      //@step 15
      return true;
  }
  //#endregion bipartite

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

const BIPARTITE_CHECK_CPP = buildStructuredCode(
  `
  #include <queue>
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
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  bool isBipartite(const GraphData& graph) {
      auto adjacency = buildUndirectedAdjacency(graph);
      std::unordered_map<std::string, int> color;
      std::vector<std::string> closed;

      for (const auto& node : graph.nodes) {
          color[node.id] = -1;
      }

      for (const auto& node : graph.nodes) {
          if (color[node.id] != -1) {
              continue;
          }

          //@step 5
          std::queue<std::string> queue;
          queue.push(node.id);
          color[node.id] = 0;

          while (!queue.empty()) {
              //@step 7
              std::string current = queue.front();
              queue.pop();
              int wanted = color[current] == 0 ? 1 : 0;

              //@step 8
              for (const auto& neighbor : adjacency[current]) {
                  int neighborColor = color[neighbor];

                  //@step 10
                  if (neighborColor == -1) {
                      color[neighbor] = wanted;
                      queue.push(neighbor);
                      continue;
                  }

                  //@step 13
                  if (neighborColor == wanted) {
                      continue;
                  }

                  //@step 12
                  return false;
              }

              //@step 14
              closed.push_back(current);
          }
      }

      //@step 15
      return true;
  }
  //#endregion bipartite

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

export const BIPARTITE_CHECK_CODE = BIPARTITE_CHECK_TS.lines;
export const BIPARTITE_CHECK_CODE_REGIONS = BIPARTITE_CHECK_TS.regions;
export const BIPARTITE_CHECK_CODE_HIGHLIGHT_MAP = BIPARTITE_CHECK_TS.highlightMap;
export const BIPARTITE_CHECK_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BIPARTITE_CHECK_TS.lines,
    regions: BIPARTITE_CHECK_TS.regions,
    highlightMap: BIPARTITE_CHECK_TS.highlightMap,
    source: BIPARTITE_CHECK_TS.source,
  },
  python: {
    language: 'python',
    lines: BIPARTITE_CHECK_PY.lines,
    regions: BIPARTITE_CHECK_PY.regions,
    highlightMap: BIPARTITE_CHECK_PY.highlightMap,
    source: BIPARTITE_CHECK_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BIPARTITE_CHECK_CS.lines,
    regions: BIPARTITE_CHECK_CS.regions,
    highlightMap: BIPARTITE_CHECK_CS.highlightMap,
    source: BIPARTITE_CHECK_CS.source,
  },
  java: {
    language: 'java',
    lines: BIPARTITE_CHECK_JAVA.lines,
    regions: BIPARTITE_CHECK_JAVA.regions,
    highlightMap: BIPARTITE_CHECK_JAVA.highlightMap,
    source: BIPARTITE_CHECK_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BIPARTITE_CHECK_CPP.lines,
    regions: BIPARTITE_CHECK_CPP.regions,
    highlightMap: BIPARTITE_CHECK_CPP.highlightMap,
    source: BIPARTITE_CHECK_CPP.source,
  },
};
