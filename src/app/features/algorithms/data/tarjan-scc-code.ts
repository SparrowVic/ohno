import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const TARJAN_SCC_TS = buildStructuredCode(`
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
   * Partition a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  function tarjanScc(graph: GraphData): string[][] {
    const adjacency = buildAdjacency(graph);
    const index = new Map<string, number | null>();
    const low = new Map<string, number | null>();
    const stack: string[] = [];
    const onStack = new Set<string>();
    const components: string[][] = [];
    let nextIndex = 0;

    for (const node of graph.nodes) {
      index.set(node.id, null);
      low.set(node.id, null);
    }

    for (const node of graph.nodes) {
      //@step 4
      if (index.get(node.id) === null) {
        strongConnect(node.id);
      }
    }

    //@step 18
    return components;

    //#region strong-connect helper collapsed
    function strongConnect(nodeId: string): void {
      nextIndex += 1;
      //@step 6
      index.set(nodeId, nextIndex);
      low.set(nodeId, nextIndex);
      stack.push(nodeId);
      onStack.add(nodeId);

      //@step 8
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (index.get(neighbor) === null) {
          //@step 10
          strongConnect(neighbor);

          //@step 11
          low.set(nodeId, Math.min(low.get(nodeId)!, low.get(neighbor)!));
          continue;
        }

        if (onStack.has(neighbor)) {
          //@step 13
          low.set(nodeId, Math.min(low.get(nodeId)!, index.get(neighbor)!));
          continue;
        }

        //@step 14
        continue;
      }

      if (low.get(nodeId) === index.get(nodeId)) {
        const component: string[] = [];

        //@step 16
        while (stack.length > 0) {
          const member = stack.pop()!;
          onStack.delete(member);
          component.push(member);

          if (member === nodeId) {
            break;
          }
        }

        components.push(component);
        return;
      }

      //@step 17
      return;
    }
    //#endregion strong-connect
  }
  //#endregion tarjan

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

const TARJAN_SCC_PY = buildStructuredCode(
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
  Partition a directed graph into strongly connected components with Tarjan's algorithm.
  Input: directed graph.
  Returns: SCCs in the order they are emitted by the DFS.
  """
  //#region tarjan function open
  //@step 2
  def tarjan_scc(graph: GraphData) -> list[list[str]]:
      adjacency = build_adjacency(graph)
      index = {node.id: None for node in graph.nodes}
      low = {node.id: None for node in graph.nodes}
      stack: list[str] = []
      on_stack: set[str] = set()
      components: list[list[str]] = []
      next_index = 0

      def strong_connect(node_id: str) -> None:
          nonlocal next_index
          next_index += 1

          //@step 6
          index[node_id] = next_index
          low[node_id] = next_index
          stack.append(node_id)
          on_stack.add(node_id)

          //@step 8
          for neighbor in adjacency.get(node_id, []):
              if index[neighbor] is None:
                  //@step 10
                  strong_connect(neighbor)

                  //@step 11
                  low[node_id] = min(low[node_id], low[neighbor])
                  continue

              if neighbor in on_stack:
                  //@step 13
                  low[node_id] = min(low[node_id], index[neighbor])
                  continue

              //@step 14
              continue

          if low[node_id] == index[node_id]:
              component: list[str] = []

              //@step 16
              while stack:
                  member = stack.pop()
                  on_stack.remove(member)
                  component.append(member)

                  if member == node_id:
                      break

              components.append(component)
              return

          //@step 17
          return

      for node in graph.nodes:
          //@step 4
          if index[node.id] is None:
              strong_connect(node.id)

      //@step 18
      return components
  //#endregion tarjan

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

const TARJAN_SCC_CS = buildStructuredCode(
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
  /// Partitions a directed graph into strongly connected components with Tarjan's algorithm.
  /// Input: directed graph.
  /// Returns: SCCs in the order they are emitted by the DFS.
  /// </summary>
  //#region tarjan function open
  //@step 2
  public static List<List<string>> TarjanScc(GraphData graph)
  {
      var adjacency = BuildAdjacency(graph);
      var index = new Dictionary<string, int?>();
      var low = new Dictionary<string, int?>();
      var stack = new Stack<string>();
      var onStack = new HashSet<string>();
      var components = new List<List<string>>();
      var nextIndex = 0;

      foreach (var node in graph.Nodes)
      {
          index[node.Id] = null;
          low[node.Id] = null;
      }

      foreach (var node in graph.Nodes)
      {
          //@step 4
          if (index[node.Id] is null)
          {
              StrongConnect(node.Id);
          }
      }

      //@step 18
      return components;

      //#region strong-connect helper collapsed
      void StrongConnect(string nodeId)
      {
          nextIndex += 1;

          //@step 6
          index[nodeId] = nextIndex;
          low[nodeId] = nextIndex;
          stack.Push(nodeId);
          onStack.Add(nodeId);

          //@step 8
          foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
          {
              if (index[neighbor] is null)
              {
                  //@step 10
                  StrongConnect(neighbor);

                  //@step 11
                  low[nodeId] = Math.Min(low[nodeId]!.Value, low[neighbor]!.Value);
                  continue;
              }

              if (onStack.Contains(neighbor))
              {
                  //@step 13
                  low[nodeId] = Math.Min(low[nodeId]!.Value, index[neighbor]!.Value);
                  continue;
              }

              //@step 14
              continue;
          }

          if (low[nodeId] == index[nodeId])
          {
              var component = new List<string>();

              //@step 16
              while (stack.Count > 0)
              {
                  var member = stack.Pop();
                  onStack.Remove(member);
                  component.Add(member);

                  if (member == nodeId)
                  {
                      break;
                  }
              }

              components.Add(component);
              return;
          }

          //@step 17
          return;
      }
      //#endregion strong-connect
  }
  //#endregion tarjan

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

const TARJAN_SCC_JAVA = buildStructuredCode(
  `
  import java.util.ArrayDeque;
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

  //#region tarjan function open
  /**
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //@step 2
  public static List<List<String>> tarjanScc(GraphData graph) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Map<String, Integer> index = new HashMap<>();
      Map<String, Integer> low = new HashMap<>();
      ArrayDeque<String> stack = new ArrayDeque<>();
      Set<String> onStack = new HashSet<>();
      List<List<String>> components = new ArrayList<>();
      Counter nextIndex = new Counter();

      for (GraphNode node : graph.nodes()) {
          index.put(node.id(), null);
          low.put(node.id(), null);
      }

      for (GraphNode node : graph.nodes()) {
          //@step 4
          if (index.get(node.id()) == null) {
              strongConnect(node.id(), adjacency, index, low, stack, onStack, components, nextIndex);
          }
      }

      //@step 18
      return components;
  }
  //#endregion tarjan

  //#region strong-connect helper collapsed
  private static void strongConnect(
      String nodeId,
      Map<String, List<String>> adjacency,
      Map<String, Integer> index,
      Map<String, Integer> low,
      ArrayDeque<String> stack,
      Set<String> onStack,
      List<List<String>> components,
      Counter nextIndex
  ) {
      nextIndex.value += 1;

      //@step 6
      index.put(nodeId, nextIndex.value);
      low.put(nodeId, nextIndex.value);
      stack.push(nodeId);
      onStack.add(nodeId);

      //@step 8
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          if (index.get(neighbor) == null) {
              //@step 10
              strongConnect(neighbor, adjacency, index, low, stack, onStack, components, nextIndex);

              //@step 11
              low.put(nodeId, Math.min(low.get(nodeId), low.get(neighbor)));
              continue;
          }

          if (onStack.contains(neighbor)) {
              //@step 13
              low.put(nodeId, Math.min(low.get(nodeId), index.get(neighbor)));
              continue;
          }

          //@step 14
          continue;
      }

      if (low.get(nodeId).equals(index.get(nodeId))) {
          List<String> component = new ArrayList<>();

          //@step 16
          while (!stack.isEmpty()) {
              String member = stack.pop();
              onStack.remove(member);
              component.add(member);

              if (member.equals(nodeId)) {
                  break;
              }
          }

          components.add(component);
          return;
      }

      //@step 17
      return;
  }
  //#endregion strong-connect

  //#region counter helper collapsed
  private static final class Counter {
      int value = 0;
  }
  //#endregion counter

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

const TARJAN_SCC_CPP = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  std::vector<std::vector<std::string>> tarjanScc(const GraphData& graph) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_map<std::string, int> index;
      std::unordered_map<std::string, int> low;
      std::vector<std::string> stack;
      std::unordered_set<std::string> onStack;
      std::vector<std::vector<std::string>> components;
      int nextIndex = 0;

      for (const auto& node : graph.nodes) {
          index[node.id] = -1;
          low[node.id] = -1;
      }

      for (const auto& node : graph.nodes) {
          //@step 4
          if (index[node.id] == -1) {
              strongConnect(node.id, adjacency, index, low, stack, onStack, components, nextIndex);
          }
      }

      //@step 18
      return components;
  }
  //#endregion tarjan

  //#region strong-connect helper collapsed
  void strongConnect(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_map<std::string, int>& index,
      std::unordered_map<std::string, int>& low,
      std::vector<std::string>& stack,
      std::unordered_set<std::string>& onStack,
      std::vector<std::vector<std::string>>& components,
      int& nextIndex
  ) {
      nextIndex += 1;

      //@step 6
      index[nodeId] = nextIndex;
      low[nodeId] = nextIndex;
      stack.push_back(nodeId);
      onStack.insert(nodeId);

      //@step 8
      for (const auto& neighbor : adjacency.at(nodeId)) {
          if (index[neighbor] == -1) {
              //@step 10
              strongConnect(neighbor, adjacency, index, low, stack, onStack, components, nextIndex);

              //@step 11
              low[nodeId] = std::min(low[nodeId], low[neighbor]);
              continue;
          }

          if (onStack.contains(neighbor)) {
              //@step 13
              low[nodeId] = std::min(low[nodeId], index[neighbor]);
              continue;
          }

          //@step 14
          continue;
      }

      if (low[nodeId] == index[nodeId]) {
          std::vector<std::string> component;

          //@step 16
          while (!stack.empty()) {
              std::string member = stack.back();
              stack.pop_back();
              onStack.erase(member);
              component.push_back(member);

              if (member == nodeId) {
                  break;
              }
          }

          components.push_back(component);
          return;
      }

      //@step 17
      return;
  }
  //#endregion strong-connect

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

export const TARJAN_SCC_CODE = TARJAN_SCC_TS.lines;
export const TARJAN_SCC_CODE_REGIONS = TARJAN_SCC_TS.regions;
export const TARJAN_SCC_CODE_HIGHLIGHT_MAP = TARJAN_SCC_TS.highlightMap;
export const TARJAN_SCC_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TARJAN_SCC_TS.lines,
    regions: TARJAN_SCC_TS.regions,
    highlightMap: TARJAN_SCC_TS.highlightMap,
    source: TARJAN_SCC_TS.source,
  },
  python: {
    language: 'python',
    lines: TARJAN_SCC_PY.lines,
    regions: TARJAN_SCC_PY.regions,
    highlightMap: TARJAN_SCC_PY.highlightMap,
    source: TARJAN_SCC_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: TARJAN_SCC_CS.lines,
    regions: TARJAN_SCC_CS.regions,
    highlightMap: TARJAN_SCC_CS.highlightMap,
    source: TARJAN_SCC_CS.source,
  },
  java: {
    language: 'java',
    lines: TARJAN_SCC_JAVA.lines,
    regions: TARJAN_SCC_JAVA.regions,
    highlightMap: TARJAN_SCC_JAVA.highlightMap,
    source: TARJAN_SCC_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: TARJAN_SCC_CPP.lines,
    regions: TARJAN_SCC_CPP.regions,
    highlightMap: TARJAN_SCC_CPP.highlightMap,
    source: TARJAN_SCC_CPP.source,
  },
};
