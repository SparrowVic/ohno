import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CHROMATIC_NUMBER_TS = buildStructuredCode(`
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
   * Find the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  function chromaticNumber(
    graph: GraphData,
  ): {
    chromaticNumber: number;
    coloring: Map<string, number>;
  } {
    const adjacency = buildUndirectedAdjacency(graph);

    //@step 2
    const order = orderNodes(graph, adjacency);
    const startLimit = 1;

    //@step 3
    for (let limit = startLimit; limit <= graph.nodes.length; limit += 1) {
      const coloring = new Map<string, number | null>();

      for (const node of graph.nodes) {
        coloring.set(node.id, null);
      }

      if (search(0, limit, order, adjacency, coloring)) {
        //@step 9
        return {
          chromaticNumber: limit,
          coloring: stripNullColors(coloring),
        };
      }

      //@step 8
      continue;
    }

    throw new Error('Every finite graph is colorable with at most |V| colors.');
  }
  //#endregion chromatic

  //#region search helper collapsed
  function search(
    index: number,
    limit: number,
    order: readonly string[],
    adjacency: ReadonlyMap<string, readonly string[]>,
    coloring: Map<string, number | null>,
  ): boolean {
    if (index >= order.length) {
      return true;
    }

    //@step 4
    const nodeId = order[index]!;

    //@step 5
    for (let color = 1; color <= limit; color += 1) {
      if (canUseColor(nodeId, color, adjacency, coloring)) {
        //@step 6
        coloring.set(nodeId, color);

        if (search(index + 1, limit, order, adjacency, coloring)) {
          return true;
        }

        //@step 7
        coloring.set(nodeId, null);
      }
    }

    return false;
  }
  //#endregion search

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

  //#region order-nodes helper collapsed
  function orderNodes(
    graph: GraphData,
    adjacency: ReadonlyMap<string, readonly string[]>,
  ): string[] {
    return [...graph.nodes]
      .sort((left, right) => {
        const degreeDiff =
          (adjacency.get(right.id)?.length ?? 0) -
          (adjacency.get(left.id)?.length ?? 0);

        return degreeDiff !== 0 ? degreeDiff : left.id.localeCompare(right.id);
      })
      .map((node) => node.id);
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  function canUseColor(
    nodeId: string,
    color: number,
    adjacency: ReadonlyMap<string, readonly string[]>,
    coloring: ReadonlyMap<string, number | null>,
  ): boolean {
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (coloring.get(neighbor) === color) {
        return false;
      }
    }

    return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  function stripNullColors(
    coloring: ReadonlyMap<string, number | null>,
  ): Map<string, number> {
    const result = new Map<string, number>();

    for (const [nodeId, color] of coloring) {
      if (color !== null) {
        result.set(nodeId, color);
      }
    }

    return result;
  }
  //#endregion strip-null
`);

const CHROMATIC_NUMBER_PY = buildStructuredCode(
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
  Find the chromatic number with exact backtracking search.
  Input: graph interpreted as undirected.
  Returns: the minimum number of colors and one valid coloring.
  """
  //#region chromatic function open
  def chromatic_number(graph: GraphData) -> tuple[int, dict[str, int]]:
      adjacency = build_undirected_adjacency(graph)

      //@step 2
      order = order_nodes(graph, adjacency)
      start_limit = 1

      //@step 3
      for limit in range(start_limit, len(graph.nodes) + 1):
          coloring = {node.id: None for node in graph.nodes}

          if search(0, limit, order, adjacency, coloring):
              //@step 9
              return limit, strip_null_colors(coloring)

          //@step 8
          continue

      raise ValueError("Every finite graph is colorable with at most |V| colors.")
  //#endregion chromatic

  //#region search helper collapsed
  def search(
      index: int,
      limit: int,
      order: list[str],
      adjacency: dict[str, list[str]],
      coloring: dict[str, int | None],
  ) -> bool:
      if index >= len(order):
          return True

      //@step 4
      node_id = order[index]

      //@step 5
      for color in range(1, limit + 1):
          if can_use_color(node_id, color, adjacency, coloring):
              //@step 6
              coloring[node_id] = color

              if search(index + 1, limit, order, adjacency, coloring):
                  return True

              //@step 7
              coloring[node_id] = None

      return False
  //#endregion search

  //#region build-adjacency helper collapsed
  def build_undirected_adjacency(graph: GraphData) -> dict[str, list[str]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)
          adjacency.setdefault(edge.to, []).append(edge.from_id)

      return adjacency
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  def order_nodes(
      graph: GraphData,
      adjacency: dict[str, list[str]],
  ) -> list[str]:
      return [
          node.id
          for node in sorted(
              graph.nodes,
              key=lambda node: (-len(adjacency.get(node.id, [])), node.id),
          )
      ]
  //#endregion order-nodes

  //#region can-use helper collapsed
  def can_use_color(
      node_id: str,
      color: int,
      adjacency: dict[str, list[str]],
      coloring: dict[str, int | None],
  ) -> bool:
      for neighbor in adjacency.get(node_id, []):
          if coloring[neighbor] == color:
              return False

      return True
  //#endregion can-use

  //#region strip-null helper collapsed
  def strip_null_colors(coloring: dict[str, int | None]) -> dict[str, int]:
      return {node_id: color for node_id, color in coloring.items() if color is not None}
  //#endregion strip-null
  `,
  'python',
);

const CHROMATIC_NUMBER_CS = buildStructuredCode(
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
  /// Finds the chromatic number with exact backtracking search.
  /// Input: graph interpreted as undirected.
  /// Returns: the minimum number of colors and one valid coloring.
  /// </summary>
  //#region chromatic function open
  public static (int ChromaticNumber, Dictionary<string, int> Coloring) ChromaticNumber(GraphData graph)
  {
      var adjacency = BuildUndirectedAdjacency(graph);

      //@step 2
      var order = OrderNodes(graph, adjacency);
      var startLimit = 1;

      //@step 3
      for (var limit = startLimit; limit <= graph.Nodes.Count; limit += 1)
      {
          var coloring = graph.Nodes.ToDictionary(node => node.Id, _ => (int?)null);

          if (Search(0, limit, order, adjacency, coloring))
          {
              //@step 9
              return (limit, StripNullColors(coloring));
          }

          //@step 8
          continue;
      }

      throw new InvalidOperationException("Every finite graph is colorable with at most |V| colors.");
  }
  //#endregion chromatic

  //#region search helper collapsed
  private static bool Search(
      int index,
      int limit,
      IReadOnlyList<string> order,
      IReadOnlyDictionary<string, List<string>> adjacency,
      Dictionary<string, int?> coloring
  )
  {
      if (index >= order.Count)
      {
          return true;
      }

      //@step 4
      var nodeId = order[index];

      //@step 5
      for (var color = 1; color <= limit; color += 1)
      {
          if (CanUseColor(nodeId, color, adjacency, coloring))
          {
              //@step 6
              coloring[nodeId] = color;

              if (Search(index + 1, limit, order, adjacency, coloring))
              {
                  return true;
              }

              //@step 7
              coloring[nodeId] = null;
          }
      }

      return false;
  }
  //#endregion search

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

  //#region order-nodes helper collapsed
  private static List<string> OrderNodes(
      GraphData graph,
      IReadOnlyDictionary<string, List<string>> adjacency
  )
  {
      return graph.Nodes
          .OrderByDescending(node => adjacency.GetValueOrDefault(node.Id, []).Count)
          .ThenBy(node => node.Id)
          .Select(node => node.Id)
          .ToList();
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  private static bool CanUseColor(
      string nodeId,
      int color,
      IReadOnlyDictionary<string, List<string>> adjacency,
      IReadOnlyDictionary<string, int?> coloring
  )
  {
      foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
      {
          if (coloring[neighbor] == color)
          {
              return false;
          }
      }

      return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  private static Dictionary<string, int> StripNullColors(
      IReadOnlyDictionary<string, int?> coloring
  )
  {
      return coloring
          .Where(entry => entry.Value is not null)
          .ToDictionary(entry => entry.Key, entry => entry.Value!.Value);
  }
  //#endregion strip-null
  `,
  'csharp',
);

const CHROMATIC_NUMBER_JAVA = buildStructuredCode(
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

  public record ColoringResult(int chromaticNumber, Map<String, Integer> coloring) {}
  //#endregion graph-types

  //#region chromatic function open
  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  public static ColoringResult chromaticNumber(GraphData graph) {
      Map<String, List<String>> adjacency = buildUndirectedAdjacency(graph);

      //@step 2
      List<String> order = orderNodes(graph, adjacency);
      int startLimit = 1;

      //@step 3
      for (int limit = startLimit; limit <= graph.nodes().size(); limit += 1) {
          Map<String, Integer> coloring = new HashMap<>();
          for (GraphNode node : graph.nodes()) {
              coloring.put(node.id(), null);
          }

          if (search(0, limit, order, adjacency, coloring)) {
              //@step 9
              return new ColoringResult(limit, stripNullColors(coloring));
          }

          //@step 8
          continue;
      }

      throw new IllegalStateException("Every finite graph is colorable with at most |V| colors.");
  }
  //#endregion chromatic

  //#region search helper collapsed
  private static boolean search(
      int index,
      int limit,
      List<String> order,
      Map<String, List<String>> adjacency,
      Map<String, Integer> coloring
  ) {
      if (index >= order.size()) {
          return true;
      }

      //@step 4
      String nodeId = order.get(index);

      //@step 5
      for (int color = 1; color <= limit; color += 1) {
          if (canUseColor(nodeId, color, adjacency, coloring)) {
              //@step 6
              coloring.put(nodeId, color);

              if (search(index + 1, limit, order, adjacency, coloring)) {
                  return true;
              }

              //@step 7
              coloring.put(nodeId, null);
          }
      }

      return false;
  }
  //#endregion search

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

  //#region order-nodes helper collapsed
  private static List<String> orderNodes(
      GraphData graph,
      Map<String, List<String>> adjacency
  ) {
      return graph.nodes().stream()
          .sorted((left, right) -> {
              int degreeDiff = adjacency.get(right.id()).size() - adjacency.get(left.id()).size();
              return degreeDiff != 0 ? degreeDiff : left.id().compareTo(right.id());
          })
          .map(GraphNode::id)
          .toList();
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  private static boolean canUseColor(
      String nodeId,
      int color,
      Map<String, List<String>> adjacency,
      Map<String, Integer> coloring
  ) {
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          if (Integer.valueOf(color).equals(coloring.get(neighbor))) {
              return false;
          }
      }

      return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  private static Map<String, Integer> stripNullColors(Map<String, Integer> coloring) {
      Map<String, Integer> result = new HashMap<>();

      for (Map.Entry<String, Integer> entry : coloring.entrySet()) {
          if (entry.getValue() != null) {
              result.put(entry.getKey(), entry.getValue());
          }
      }

      return result;
  }
  //#endregion strip-null
  `,
  'java',
);

const CHROMATIC_NUMBER_CPP = buildStructuredCode(
  `
  #include <algorithm>
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

  struct ColoringResult {
      int chromaticNumber;
      std::unordered_map<std::string, int> coloring;
  };
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  ColoringResult chromaticNumber(const GraphData& graph) {
      auto adjacency = buildUndirectedAdjacency(graph);

      //@step 2
      auto order = orderNodes(graph, adjacency);
      int startLimit = 1;

      //@step 3
      for (int limit = startLimit; limit <= static_cast<int>(graph.nodes.size()); limit += 1) {
          std::unordered_map<std::string, int> coloring;
          for (const auto& node : graph.nodes) {
              coloring[node.id] = 0;
          }

          if (search(0, limit, order, adjacency, coloring)) {
              //@step 9
              return { limit, stripNullColors(coloring) };
          }

          //@step 8
          continue;
      }

      throw std::runtime_error("Every finite graph is colorable with at most |V| colors.");
  }
  //#endregion chromatic

  //#region search helper collapsed
  bool search(
      int index,
      int limit,
      const std::vector<std::string>& order,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_map<std::string, int>& coloring
  ) {
      if (index >= static_cast<int>(order.size())) {
          return true;
      }

      //@step 4
      const std::string& nodeId = order[index];

      //@step 5
      for (int color = 1; color <= limit; color += 1) {
          if (canUseColor(nodeId, color, adjacency, coloring)) {
              //@step 6
              coloring[nodeId] = color;

              if (search(index + 1, limit, order, adjacency, coloring)) {
                  return true;
              }

              //@step 7
              coloring[nodeId] = 0;
          }
      }

      return false;
  }
  //#endregion search

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

  //#region order-nodes helper collapsed
  std::vector<std::string> orderNodes(
      const GraphData& graph,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency
  ) {
      auto nodes = graph.nodes;
      std::sort(nodes.begin(), nodes.end(), [&](const GraphNode& left, const GraphNode& right) {
          const auto degreeDiff = static_cast<int>(adjacency.at(right.id).size()) -
              static_cast<int>(adjacency.at(left.id).size());
          return degreeDiff != 0 ? degreeDiff < 0 : left.id < right.id;
      });

      std::vector<std::string> order;
      for (const auto& node : nodes) {
          order.push_back(node.id);
      }

      return order;
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  bool canUseColor(
      const std::string& nodeId,
      int color,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      const std::unordered_map<std::string, int>& coloring
  ) {
      for (const auto& neighbor : adjacency.at(nodeId)) {
          if (coloring.at(neighbor) == color) {
              return false;
          }
      }

      return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  std::unordered_map<std::string, int> stripNullColors(
      const std::unordered_map<std::string, int>& coloring
  ) {
      std::unordered_map<std::string, int> result;

      for (const auto& entry : coloring) {
          if (entry.second != 0) {
              result[entry.first] = entry.second;
          }
      }

      return result;
  }
  //#endregion strip-null
  `,
  'cpp',
);

export const CHROMATIC_NUMBER_CODE = CHROMATIC_NUMBER_TS.lines;
export const CHROMATIC_NUMBER_CODE_REGIONS = CHROMATIC_NUMBER_TS.regions;
export const CHROMATIC_NUMBER_CODE_HIGHLIGHT_MAP = CHROMATIC_NUMBER_TS.highlightMap;
export const CHROMATIC_NUMBER_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CHROMATIC_NUMBER_TS.lines,
    regions: CHROMATIC_NUMBER_TS.regions,
    highlightMap: CHROMATIC_NUMBER_TS.highlightMap,
    source: CHROMATIC_NUMBER_TS.source,
  },
  python: {
    language: 'python',
    lines: CHROMATIC_NUMBER_PY.lines,
    regions: CHROMATIC_NUMBER_PY.regions,
    highlightMap: CHROMATIC_NUMBER_PY.highlightMap,
    source: CHROMATIC_NUMBER_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CHROMATIC_NUMBER_CS.lines,
    regions: CHROMATIC_NUMBER_CS.regions,
    highlightMap: CHROMATIC_NUMBER_CS.highlightMap,
    source: CHROMATIC_NUMBER_CS.source,
  },
  java: {
    language: 'java',
    lines: CHROMATIC_NUMBER_JAVA.lines,
    regions: CHROMATIC_NUMBER_JAVA.regions,
    highlightMap: CHROMATIC_NUMBER_JAVA.highlightMap,
    source: CHROMATIC_NUMBER_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CHROMATIC_NUMBER_CPP.lines,
    regions: CHROMATIC_NUMBER_CPP.regions,
    highlightMap: CHROMATIC_NUMBER_CPP.highlightMap,
    source: CHROMATIC_NUMBER_CPP.source,
  },
};
