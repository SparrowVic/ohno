import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const CONNECTED_COMPONENTS_TS = buildStructuredCode(`
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
   * Label every connected component of an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: map from node id to component index.
   */
  //#region connected-components function open
  //@step 2
  function connectedComponents(graph: GraphData): Map<string, number | null> {
    const adjacency = buildUndirectedAdjacency(graph);
    const component = new Map<string, number | null>();
    let nextComponent = 0;
    const closed: string[] = [];

    for (const node of graph.nodes) {
      component.set(node.id, null);
    }

    for (const node of graph.nodes) {
      //@step 5
      if (component.get(node.id) !== null) {
        continue;
      }

      nextComponent += 1;
      const queue: string[] = [node.id];
      component.set(node.id, nextComponent);

      //@step 7
      while (queue.length > 0) {
        //@step 8
        const current = queue.shift()!;

        //@step 9
        for (const neighbor of adjacency.get(current) ?? []) {
          //@step 10
          if (component.get(neighbor) !== null) {
            continue;
          }

          component.set(neighbor, nextComponent);

          //@step 12
          queue.push(neighbor);
        }

        closed.push(current);
      }
    }

    //@step 15
    return component;
  }
  //#endregion connected-components

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

const CONNECTED_COMPONENTS_PY = buildStructuredCode(
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
  Label every connected component of an undirected graph.
  Input: graph interpreted as undirected.
  Returns: map from node id to component index.
  """
  //#region connected-components function open
  //@step 2
  def connected_components(graph: GraphData) -> dict[str, int | None]:
      adjacency = build_undirected_adjacency(graph)
      component = {node.id: None for node in graph.nodes}
      next_component = 0
      closed: list[str] = []

      for node in graph.nodes:
          //@step 5
          if component[node.id] is not None:
              continue

          next_component += 1
          queue = deque([node.id])
          component[node.id] = next_component

          //@step 7
          while queue:
              //@step 8
              current = queue.popleft()

              //@step 9
              for neighbor in adjacency.get(current, []):
                  //@step 10
                  if component[neighbor] is not None:
                      continue

                  component[neighbor] = next_component

                  //@step 12
                  queue.append(neighbor)

              closed.append(current)

      //@step 15
      return component
  //#endregion connected-components

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

const CONNECTED_COMPONENTS_CS = buildStructuredCode(
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
  /// Labels every connected component of an undirected graph.
  /// Input: graph interpreted as undirected.
  /// Returns: map from node id to component index.
  /// </summary>
  //#region connected-components function open
  //@step 2
  public static Dictionary<string, int?> ConnectedComponents(GraphData graph)
  {
      var adjacency = BuildUndirectedAdjacency(graph);
      var component = new Dictionary<string, int?>();
      var nextComponent = 0;
      var closed = new List<string>();

      foreach (var node in graph.Nodes)
      {
          component[node.Id] = null;
      }

      foreach (var node in graph.Nodes)
      {
          //@step 5
          if (component[node.Id] is not null)
          {
              continue;
          }

          nextComponent += 1;
          var queue = new Queue<string>([node.Id]);
          component[node.Id] = nextComponent;

          //@step 7
          while (queue.Count > 0)
          {
              //@step 8
              var current = queue.Dequeue();

              //@step 9
              foreach (var neighbor in adjacency.GetValueOrDefault(current, []))
              {
                  //@step 10
                  if (component[neighbor] is not null)
                  {
                      continue;
                  }

                  component[neighbor] = nextComponent;

                  //@step 12
                  queue.Enqueue(neighbor);
              }

              closed.Add(current);
          }
      }

      //@step 15
      return component;
  }
  //#endregion connected-components

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

const CONNECTED_COMPONENTS_JAVA = buildStructuredCode(
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

  //#region connected-components function open
  /**
   * Labels every connected component of an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: map from node id to component index.
   */
  //@step 2
  public static Map<String, Integer> connectedComponents(GraphData graph) {
      Map<String, List<String>> adjacency = buildUndirectedAdjacency(graph);
      Map<String, Integer> component = new HashMap<>();
      int nextComponent = 0;
      List<String> closed = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          component.put(node.id(), null);
      }

      for (GraphNode node : graph.nodes()) {
          //@step 5
          if (component.get(node.id()) != null) {
              continue;
          }

          nextComponent += 1;
          Queue<String> queue = new ArrayDeque<>();
          queue.add(node.id());
          component.put(node.id(), nextComponent);

          //@step 7
          while (!queue.isEmpty()) {
            //@step 8
            String current = queue.remove();

            //@step 9
            for (String neighbor : adjacency.getOrDefault(current, List.of())) {
                //@step 10
                if (component.get(neighbor) != null) {
                    continue;
                }

                component.put(neighbor, nextComponent);

                //@step 12
                queue.add(neighbor);
            }

            closed.add(current);
          }
      }

      //@step 15
      return component;
  }
  //#endregion connected-components

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

const CONNECTED_COMPONENTS_CPP = buildStructuredCode(
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
   * Labels every connected component of an undirected graph.
   * Input: graph interpreted as undirected.
   * Returns: map from node id to component index.
   */
  //#region connected-components function open
  //@step 2
  std::unordered_map<std::string, int> connectedComponents(const GraphData& graph) {
      auto adjacency = buildUndirectedAdjacency(graph);
      std::unordered_map<std::string, int> component;
      int nextComponent = 0;
      std::vector<std::string> closed;

      for (const auto& node : graph.nodes) {
          component[node.id] = 0;
      }

      for (const auto& node : graph.nodes) {
          //@step 5
          if (component[node.id] != 0) {
              continue;
          }

          nextComponent += 1;
          std::queue<std::string> queue;
          queue.push(node.id);
          component[node.id] = nextComponent;

          //@step 7
          while (!queue.empty()) {
              //@step 8
              std::string current = queue.front();
              queue.pop();

              //@step 9
              for (const auto& neighbor : adjacency[current]) {
                  //@step 10
                  if (component[neighbor] != 0) {
                      continue;
                  }

                  component[neighbor] = nextComponent;

                  //@step 12
                  queue.push(neighbor);
              }

              closed.push_back(current);
          }
      }

      //@step 15
      return component;
  }
  //#endregion connected-components

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

export const CONNECTED_COMPONENTS_CODE = CONNECTED_COMPONENTS_TS.lines;
export const CONNECTED_COMPONENTS_CODE_REGIONS = CONNECTED_COMPONENTS_TS.regions;
export const CONNECTED_COMPONENTS_CODE_HIGHLIGHT_MAP = CONNECTED_COMPONENTS_TS.highlightMap;
export const CONNECTED_COMPONENTS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CONNECTED_COMPONENTS_TS.lines,
    regions: CONNECTED_COMPONENTS_TS.regions,
    highlightMap: CONNECTED_COMPONENTS_TS.highlightMap,
    source: CONNECTED_COMPONENTS_TS.source,
  },
  python: {
    language: 'python',
    lines: CONNECTED_COMPONENTS_PY.lines,
    regions: CONNECTED_COMPONENTS_PY.regions,
    highlightMap: CONNECTED_COMPONENTS_PY.highlightMap,
    source: CONNECTED_COMPONENTS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CONNECTED_COMPONENTS_CS.lines,
    regions: CONNECTED_COMPONENTS_CS.regions,
    highlightMap: CONNECTED_COMPONENTS_CS.highlightMap,
    source: CONNECTED_COMPONENTS_CS.source,
  },
  java: {
    language: 'java',
    lines: CONNECTED_COMPONENTS_JAVA.lines,
    regions: CONNECTED_COMPONENTS_JAVA.regions,
    highlightMap: CONNECTED_COMPONENTS_JAVA.highlightMap,
    source: CONNECTED_COMPONENTS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CONNECTED_COMPONENTS_CPP.lines,
    regions: CONNECTED_COMPONENTS_CPP.regions,
    highlightMap: CONNECTED_COMPONENTS_CPP.highlightMap,
    source: CONNECTED_COMPONENTS_CPP.source,
  },
};
