import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TOPOLOGICAL_SORT_KAHN_TS = buildStructuredCode(`
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
   * Compute a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  function topologicalSortKahn(graph: GraphData): string[] {
    const { adjacency, inDegree } = buildGraphMetadata(graph);
    const queue: string[] = [];
    const order: string[] = [];

    for (const node of graph.nodes) {
      //@step 8
      if ((inDegree.get(node.id) ?? 0) === 0) {
        queue.push(node.id);
      }
    }

    while (queue.length > 0) {
      //@step 10
      const current = queue.shift()!;
      order.push(current);

      for (const neighbor of adjacency.get(current) ?? []) {
        //@step 13
        const next = (inDegree.get(neighbor) ?? 0) - 1;

        //@step 14
        inDegree.set(neighbor, next);

        //@step 15
        if (next === 0) {
          queue.push(neighbor);
        }
      }
    }

    //@step 17
    if (order.length !== graph.nodes.length) {
      throw new Error('Topological order is undefined for graphs with cycles.');
    }

    //@step 18
    return order;
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  function buildGraphMetadata(
    graph: GraphData,
  ): {
    adjacency: Map<string, string[]>;
    inDegree: Map<string, number>;
  } {
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }

    return { adjacency, inDegree };
  }
  //#endregion build-metadata
`);

const TOPOLOGICAL_SORT_KAHN_PY = buildStructuredCode(
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
  Compute a topological order of a directed acyclic graph with Kahn's algorithm.
  Input: directed graph.
  Returns: one valid topological ordering of all nodes.
  """
  //#region kahn function open
  def topological_sort_kahn(graph: GraphData) -> list[str]:
      adjacency, indegree = build_graph_metadata(graph)
      queue = deque()
      order: list[str] = []

      for node in graph.nodes:
          //@step 8
          if indegree[node.id] == 0:
              queue.append(node.id)

      while queue:
          //@step 10
          current = queue.popleft()
          order.append(current)

          for neighbor in adjacency.get(current, []):
              //@step 13
              next_degree = indegree[neighbor] - 1

              //@step 14
              indegree[neighbor] = next_degree

              //@step 15
              if next_degree == 0:
                  queue.append(neighbor)

      //@step 17
      if len(order) != len(graph.nodes):
          raise ValueError("Topological order is undefined for graphs with cycles.")

      //@step 18
      return order
  //#endregion kahn

  //#region build-metadata helper collapsed
  def build_graph_metadata(
      graph: GraphData,
  ) -> tuple[dict[str, list[str]], dict[str, int]]:
      adjacency = {node.id: [] for node in graph.nodes}
      indegree = {node.id: 0 for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)
          indegree[edge.to] = indegree.get(edge.to, 0) + 1

      return adjacency, indegree
  //#endregion build-metadata
  `,
  'python',
);

const TOPOLOGICAL_SORT_KAHN_CS = buildStructuredCode(
  `
  using System;
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
  /// Computes a topological order of a directed acyclic graph with Kahn's algorithm.
  /// Input: directed graph.
  /// Returns: one valid topological ordering of all nodes.
  /// </summary>
  //#region kahn function open
  public static List<string> TopologicalSortKahn(GraphData graph)
  {
      var (adjacency, indegree) = BuildGraphMetadata(graph);
      var queue = new Queue<string>();
      var order = new List<string>();

      foreach (var node in graph.Nodes)
      {
          //@step 8
          if (indegree[node.Id] == 0)
          {
              queue.Enqueue(node.Id);
          }
      }

      while (queue.Count > 0)
      {
          //@step 10
          var current = queue.Dequeue();
          order.Add(current);

          foreach (var neighbor in adjacency.GetValueOrDefault(current, []))
          {
              //@step 13
              var next = indegree[neighbor] - 1;

              //@step 14
              indegree[neighbor] = next;

              //@step 15
              if (next == 0)
              {
                  queue.Enqueue(neighbor);
              }
          }
      }

      //@step 17
      if (order.Count != graph.Nodes.Count)
      {
          throw new InvalidOperationException("Topological order is undefined for graphs with cycles.");
      }

      //@step 18
      return order;
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  private static (
      Dictionary<string, List<string>> Adjacency,
      Dictionary<string, int> InDegree
  ) BuildGraphMetadata(GraphData graph)
  {
      var adjacency = new Dictionary<string, List<string>>();
      var indegree = new Dictionary<string, int>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
          indegree[node.Id] = 0;
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge.To);
          indegree[edge.To] = indegree.GetValueOrDefault(edge.To) + 1;
      }

      return (adjacency, indegree);
  }
  //#endregion build-metadata
  `,
  'csharp',
);

const TOPOLOGICAL_SORT_KAHN_JAVA = buildStructuredCode(
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

  //#region kahn function open
  /**
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  public static List<String> topologicalSortKahn(GraphData graph) {
      GraphMetadata metadata = buildGraphMetadata(graph);
      Queue<String> queue = new ArrayDeque<>();
      List<String> order = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          //@step 8
          if (metadata.inDegree().get(node.id()) == 0) {
              queue.add(node.id());
          }
      }

      while (!queue.isEmpty()) {
          //@step 10
          String current = queue.remove();
          order.add(current);

          for (String neighbor : metadata.adjacency().getOrDefault(current, List.of())) {
              //@step 13
              int next = metadata.inDegree().get(neighbor) - 1;

              //@step 14
              metadata.inDegree().put(neighbor, next);

              //@step 15
              if (next == 0) {
                  queue.add(neighbor);
              }
          }
      }

      //@step 17
      if (order.size() != graph.nodes().size()) {
          throw new IllegalStateException("Topological order is undefined for graphs with cycles.");
      }

      //@step 18
      return order;
  }
  //#endregion kahn

  //#region metadata helper collapsed
  public record GraphMetadata(
      Map<String, List<String>> adjacency,
      Map<String, Integer> inDegree
  ) {}
  //#endregion metadata

  //#region build-metadata helper collapsed
  private static GraphMetadata buildGraphMetadata(GraphData graph) {
      Map<String, List<String>> adjacency = new HashMap<>();
      Map<String, Integer> indegree = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
          indegree.put(node.id(), 0);
      }

      for (GraphEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge.to());
          indegree.put(edge.to(), indegree.get(edge.to()) + 1);
      }

      return new GraphMetadata(adjacency, indegree);
  }
  //#endregion build-metadata
  `,
  'java',
);

const TOPOLOGICAL_SORT_KAHN_CPP = buildStructuredCode(
  `
  #include <queue>
  #include <stdexcept>
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

  struct GraphMetadata {
      std::unordered_map<std::string, std::vector<std::string>> adjacency;
      std::unordered_map<std::string, int> indegree;
  };
  //#endregion graph-types

  /**
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  std::vector<std::string> topologicalSortKahn(const GraphData& graph) {
      auto metadata = buildGraphMetadata(graph);
      std::queue<std::string> queue;
      std::vector<std::string> order;

      for (const auto& node : graph.nodes) {
          //@step 8
          if (metadata.indegree[node.id] == 0) {
              queue.push(node.id);
          }
      }

      while (!queue.empty()) {
          //@step 10
          std::string current = queue.front();
          queue.pop();
          order.push_back(current);

          for (const auto& neighbor : metadata.adjacency[current]) {
              //@step 13
              int next = metadata.indegree[neighbor] - 1;

              //@step 14
              metadata.indegree[neighbor] = next;

              //@step 15
              if (next == 0) {
                  queue.push(neighbor);
              }
          }
      }

      //@step 17
      if (order.size() != graph.nodes.size()) {
          throw std::runtime_error("Topological order is undefined for graphs with cycles.");
      }

      //@step 18
      return order;
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  GraphMetadata buildGraphMetadata(const GraphData& graph) {
      GraphMetadata metadata;

      for (const auto& node : graph.nodes) {
          metadata.adjacency[node.id] = {};
          metadata.indegree[node.id] = 0;
      }

      for (const auto& edge : graph.edges) {
          metadata.adjacency[edge.from].push_back(edge.to);
          metadata.indegree[edge.to] += 1;
      }

      return metadata;
  }
  //#endregion build-metadata
  `,
  'cpp',
);

export const TOPOLOGICAL_SORT_KAHN_CODE = TOPOLOGICAL_SORT_KAHN_TS.lines;
export const TOPOLOGICAL_SORT_KAHN_CODE_REGIONS = TOPOLOGICAL_SORT_KAHN_TS.regions;
export const TOPOLOGICAL_SORT_KAHN_CODE_HIGHLIGHT_MAP = TOPOLOGICAL_SORT_KAHN_TS.highlightMap;
export const TOPOLOGICAL_SORT_KAHN_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TOPOLOGICAL_SORT_KAHN_TS.lines,
    regions: TOPOLOGICAL_SORT_KAHN_TS.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_TS.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_TS.source,
  },
  python: {
    language: 'python',
    lines: TOPOLOGICAL_SORT_KAHN_PY.lines,
    regions: TOPOLOGICAL_SORT_KAHN_PY.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_PY.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: TOPOLOGICAL_SORT_KAHN_CS.lines,
    regions: TOPOLOGICAL_SORT_KAHN_CS.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_CS.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_CS.source,
  },
  java: {
    language: 'java',
    lines: TOPOLOGICAL_SORT_KAHN_JAVA.lines,
    regions: TOPOLOGICAL_SORT_KAHN_JAVA.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_JAVA.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: TOPOLOGICAL_SORT_KAHN_CPP.lines,
    regions: TOPOLOGICAL_SORT_KAHN_CPP.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_CPP.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_CPP.source,
  },
};
