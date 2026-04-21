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

const CHROMATIC_NUMBER_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Find the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  function chromaticNumber(graph) {
      const adjacency = buildUndirectedAdjacency(graph);

      //@step 2
      const order = orderNodes(graph, adjacency);
      const startLimit = 1;

      //@step 3
      for (let limit = startLimit; limit <= graph.nodes.length; limit += 1) {
          const coloring = new Map();

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
  function search(index, limit, order, adjacency, coloring) {
      if (index >= order.length) {
          return true;
      }

      //@step 4
      const nodeId = order[index];

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
  function buildUndirectedAdjacency(graph) {
      const adjacency = new Map();

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
  function orderNodes(graph, adjacency) {
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
  function canUseColor(nodeId, color, adjacency, coloring) {
      for (const neighbor of adjacency.get(nodeId) ?? []) {
          if (coloring.get(neighbor) === color) {
              return false;
          }
      }

      return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  function stripNullColors(coloring) {
      const result = new Map();

      for (const [nodeId, color] of coloring) {
          if (color !== null) {
              result.set(nodeId, color);
          }
      }

      return result;
  }
  //#endregion strip-null
  `,
  'javascript',
);

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

const CHROMATIC_NUMBER_GO = buildStructuredCode(
  `
  package graphs

  import "fmt"

  //#region graph-types interface collapsed
  type GraphNode struct {
      ID string
  }

  type GraphEdge struct {
      From string
      To   string
  }

  type GraphData struct {
      Nodes []GraphNode
      Edges []GraphEdge
  }

  type ChromaticNumberResult struct {
      ChromaticNumber int
      Coloring        map[string]int
  }
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  func ChromaticNumber(graph GraphData) (ChromaticNumberResult, error) {
      adjacency := buildUndirectedAdjacency(graph)

      //@step 2
      order := orderNodes(graph, adjacency)
      startLimit := 1

      //@step 3
      for limit := startLimit; limit <= len(graph.Nodes); limit += 1 {
          coloring := map[string]int{}
          for _, node := range graph.Nodes {
              coloring[node.ID] = 0
          }

          if search(0, limit, order, adjacency, coloring) {
              //@step 9
              return ChromaticNumberResult{
                  ChromaticNumber: limit,
                  Coloring: stripZeroColors(coloring),
              }, nil
          }

          //@step 8
          continue
      }

      return ChromaticNumberResult{}, fmt.Errorf("every finite graph is colorable with at most |V| colors")
  }
  //#endregion chromatic

  //#region search helper collapsed
  func search(
      index int,
      limit int,
      order []string,
      adjacency map[string][]string,
      coloring map[string]int,
  ) bool {
      if index >= len(order) {
          return true
      }

      //@step 4
      nodeID := order[index]

      //@step 5
      for color := 1; color <= limit; color += 1 {
          if canUseColor(nodeID, color, adjacency, coloring) {
              //@step 6
              coloring[nodeID] = color

              if search(index+1, limit, order, adjacency, coloring) {
                  return true
              }

              //@step 7
              coloring[nodeID] = 0
          }
      }

      return false
  }
  //#endregion search

  //#region build-adjacency helper collapsed
  func buildUndirectedAdjacency(graph GraphData) map[string][]string {
      adjacency := make(map[string][]string)

      for _, node := range graph.Nodes {
          adjacency[node.ID] = []string{}
      }

      for _, edge := range graph.Edges {
          adjacency[edge.From] = append(adjacency[edge.From], edge.To)
          adjacency[edge.To] = append(adjacency[edge.To], edge.From)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  func orderNodes(graph GraphData, adjacency map[string][]string) []string {
      order := make([]string, 0, len(graph.Nodes))
      for _, node := range graph.Nodes {
          order = append(order, node.ID)
      }

      for i := 0; i < len(order); i += 1 {
          best := i
          for j := i + 1; j < len(order); j += 1 {
              left, right := order[best], order[j]
              degreeDiff := len(adjacency[right]) - len(adjacency[left])
              if degreeDiff > 0 || (degreeDiff == 0 && right < left) {
                  best = j
              }
          }
          order[i], order[best] = order[best], order[i]
      }

      return order
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  func canUseColor(
      nodeID string,
      color int,
      adjacency map[string][]string,
      coloring map[string]int,
  ) bool {
      for _, neighbor := range adjacency[nodeID] {
          if coloring[neighbor] == color {
              return false
          }
      }

      return true
  }
  //#endregion can-use

  //#region strip-zero helper collapsed
  func stripZeroColors(coloring map[string]int) map[string]int {
      result := map[string]int{}
      for nodeID, color := range coloring {
          if color != 0 {
              result[nodeID] = color
          }
      }
      return result
  }
  //#endregion strip-zero
  `,
  'go',
);

const CHROMATIC_NUMBER_RUST = buildStructuredCode(
  `
  use std::collections::HashMap;

  //#region graph-types interface collapsed
  #[derive(Clone)]
  struct GraphNode {
      id: String,
  }

  #[derive(Clone)]
  struct GraphEdge {
      from: String,
      to: String,
  }

  struct GraphData {
      nodes: Vec<GraphNode>,
      edges: Vec<GraphEdge>,
  }

  struct ChromaticNumberResult {
      chromatic_number: usize,
      coloring: HashMap<String, i32>,
  }
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  fn chromatic_number(graph: &GraphData) -> Result<ChromaticNumberResult, String> {
      let adjacency = build_undirected_adjacency(graph);

      //@step 2
      let order = order_nodes(graph, &adjacency);
      let start_limit = 1;

      //@step 3
      for limit in start_limit..=graph.nodes.len() {
          let mut coloring = HashMap::new();
          for node in &graph.nodes {
              coloring.insert(node.id.clone(), 0);
          }

          if search(0, limit, &order, &adjacency, &mut coloring) {
              //@step 9
              return Ok(ChromaticNumberResult {
                  chromatic_number: limit,
                  coloring: strip_zero_colors(&coloring),
              });
          }

          //@step 8
          continue;
      }

      Err("every finite graph is colorable with at most |V| colors".to_string())
  }
  //#endregion chromatic

  //#region search helper collapsed
  fn search(
      index: usize,
      limit: usize,
      order: &[String],
      adjacency: &HashMap<String, Vec<String>>,
      coloring: &mut HashMap<String, i32>,
  ) -> bool {
      if index >= order.len() {
          return true;
      }

      //@step 4
      let node_id = order[index].clone();

      //@step 5
      for color in 1..=limit {
          if can_use_color(&node_id, color as i32, adjacency, coloring) {
              //@step 6
              coloring.insert(node_id.clone(), color as i32);

              if search(index + 1, limit, order, adjacency, coloring) {
                  return true;
              }

              //@step 7
              coloring.insert(node_id.clone(), 0);
          }
      }

      false
  }
  //#endregion search

  //#region build-adjacency helper collapsed
  fn build_undirected_adjacency(graph: &GraphData) -> HashMap<String, Vec<String>> {
      let mut adjacency = HashMap::new();

      for node in &graph.nodes {
          adjacency.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          adjacency.entry(edge.from.clone()).or_insert_with(Vec::new).push(edge.to.clone());
          adjacency.entry(edge.to.clone()).or_insert_with(Vec::new).push(edge.from.clone());
      }

      adjacency
  }
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  fn order_nodes(
      graph: &GraphData,
      adjacency: &HashMap<String, Vec<String>>,
  ) -> Vec<String> {
      let mut order: Vec<String> = graph.nodes.iter().map(|node| node.id.clone()).collect();
      order.sort_by(|left, right| {
          let degree_diff =
              adjacency.get(right).map(Vec::len).unwrap_or(0) as i32 -
              adjacency.get(left).map(Vec::len).unwrap_or(0) as i32;

          if degree_diff != 0 {
              degree_diff.cmp(&0)
          } else {
              left.cmp(right).reverse()
          }
      });
      order
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  fn can_use_color(
      node_id: &str,
      color: i32,
      adjacency: &HashMap<String, Vec<String>>,
      coloring: &HashMap<String, i32>,
  ) -> bool {
      for neighbor in adjacency.get(node_id).cloned().unwrap_or_default() {
          if coloring.get(&neighbor).copied().unwrap_or(0) == color {
              return false;
          }
      }

      true
  }
  //#endregion can-use

  //#region strip-zero helper collapsed
  fn strip_zero_colors(coloring: &HashMap<String, i32>) -> HashMap<String, i32> {
      let mut result = HashMap::new();

      for (node_id, color) in coloring {
          if *color != 0 {
              result.insert(node_id.clone(), *color);
          }
      }

      result
  }
  //#endregion strip-zero
  `,
  'rust',
);

const CHROMATIC_NUMBER_SWIFT = buildStructuredCode(
  `
  import Foundation

  //#region graph-types interface collapsed
  struct GraphNode {
      let id: String
  }

  struct GraphEdge {
      let from: String
      let to: String
  }

  struct GraphData {
      let nodes: [GraphNode]
      let edges: [GraphEdge]
  }
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  func chromaticNumber(graph: GraphData) throws -> (
      chromaticNumber: Int,
      coloring: [String: Int]
  ) {
      let adjacency = buildUndirectedAdjacency(graph: graph)

      //@step 2
      let order = orderNodes(graph: graph, adjacency: adjacency)
      let startLimit = 1

      //@step 3
      for limit in startLimit...graph.nodes.count {
          var coloring: [String: Int] = [:]
          for node in graph.nodes {
              coloring[node.id] = 0
          }

          if search(index: 0, limit: limit, order: order, adjacency: adjacency, coloring: &coloring) {
              //@step 9
              return (
                  limit,
                  stripZeroColors(coloring: coloring)
              )
          }

          //@step 8
          continue
      }

      throw NSError(
          domain: "ChromaticNumber",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Every finite graph is colorable with at most |V| colors."]
      )
  }
  //#endregion chromatic

  //#region search helper collapsed
  func search(
      index: Int,
      limit: Int,
      order: [String],
      adjacency: [String: [String]],
      coloring: inout [String: Int],
  ) -> Bool {
      if index >= order.count {
          return true
      }

      //@step 4
      let nodeId = order[index]

      //@step 5
      for color in 1...limit {
          if canUseColor(nodeId: nodeId, color: color, adjacency: adjacency, coloring: coloring) {
              //@step 6
              coloring[nodeId] = color

              if search(index: index + 1, limit: limit, order: order, adjacency: adjacency, coloring: &coloring) {
                  return true
              }

              //@step 7
              coloring[nodeId] = 0
          }
      }

      return false
  }
  //#endregion search

  //#region build-adjacency helper collapsed
  func buildUndirectedAdjacency(graph: GraphData) -> [String: [String]] {
      var adjacency: [String: [String]] = [:]

      for node in graph.nodes {
          adjacency[node.id] = []
      }

      for edge in graph.edges {
          adjacency[edge.from, default: []].append(edge.to)
          adjacency[edge.to, default: []].append(edge.from)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  func orderNodes(graph: GraphData, adjacency: [String: [String]]) -> [String] {
      return graph.nodes
          .map(\.id)
          .sorted { left, right in
              let degreeDiff = (adjacency[right]?.count ?? 0) - (adjacency[left]?.count ?? 0)
              return degreeDiff != 0 ? degreeDiff > 0 : left < right
          }
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  func canUseColor(
      nodeId: String,
      color: Int,
      adjacency: [String: [String]],
      coloring: [String: Int],
  ) -> Bool {
      for neighbor in adjacency[nodeId] ?? [] {
          if coloring[neighbor] == color {
              return false
          }
      }

      return true
  }
  //#endregion can-use

  //#region strip-zero helper collapsed
  func stripZeroColors(coloring: [String: Int]) -> [String: Int] {
      var result: [String: Int] = [:]
      for (nodeId, color) in coloring where color != 0 {
          result[nodeId] = color
      }
      return result
  }
  //#endregion strip-zero
  `,
  'swift',
);

const CHROMATIC_NUMBER_PHP = buildStructuredCode(
  `
  <?php

  //#region graph-types interface collapsed
  final class GraphNode
  {
      public function __construct(public string $id) {}
  }

  final class GraphEdge
  {
      public function __construct(
          public string $from,
          public string $to,
      ) {}
  }

  final class GraphData
  {
      /**
       * @param list<GraphNode> $nodes
       * @param list<GraphEdge> $edges
       */
      public function __construct(
          public array $nodes,
          public array $edges,
      ) {}
  }
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   *
   * @return array{chromaticNumber: int, coloring: array<string, int>}
   */
  //#region chromatic function open
  function chromaticNumber(GraphData $graph): array
  {
      $adjacency = buildUndirectedAdjacency($graph);

      //@step 2
      $order = orderNodes($graph, $adjacency);
      $startLimit = 1;

      //@step 3
      for ($limit = $startLimit; $limit <= count($graph->nodes); $limit += 1) {
          $coloring = [];
          foreach ($graph->nodes as $node) {
              $coloring[$node->id] = null;
          }

          if (search(0, $limit, $order, $adjacency, $coloring)) {
              //@step 9
              return [
                  'chromaticNumber' => $limit,
                  'coloring' => stripNullColors($coloring),
              ];
          }

          //@step 8
          continue;
      }

      throw new RuntimeException('Every finite graph is colorable with at most |V| colors.');
  }
  //#endregion chromatic

  //#region search helper collapsed
  function search(
      int $index,
      int $limit,
      array $order,
      array $adjacency,
      array &$coloring,
  ): bool {
      if ($index >= count($order)) {
          return true;
      }

      //@step 4
      $nodeId = $order[$index];

      //@step 5
      for ($color = 1; $color <= $limit; $color += 1) {
          if (canUseColor($nodeId, $color, $adjacency, $coloring)) {
              //@step 6
              $coloring[$nodeId] = $color;

              if (search($index + 1, $limit, $order, $adjacency, $coloring)) {
                  return true;
              }

              //@step 7
              $coloring[$nodeId] = null;
          }
      }

      return false;
  }
  //#endregion search

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(GraphData $graph): array
  {
      $adjacency = [];

      foreach ($graph->nodes as $node) {
          $adjacency[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $adjacency[$edge->from][] = $edge->to;
          $adjacency[$edge->to][] = $edge->from;
      }

      return $adjacency;
  }
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  function orderNodes(GraphData $graph, array $adjacency): array
  {
      $order = array_map(fn (GraphNode $node): string => $node->id, $graph->nodes);
      usort($order, function (string $left, string $right) use ($adjacency): int {
          $degreeDiff = count($adjacency[$right] ?? []) - count($adjacency[$left] ?? []);
          return $degreeDiff !== 0 ? $degreeDiff : strcmp($left, $right);
      });
      return $order;
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  function canUseColor(string $nodeId, int $color, array $adjacency, array $coloring): bool
  {
      foreach ($adjacency[$nodeId] ?? [] as $neighbor) {
          if (($coloring[$neighbor] ?? null) === $color) {
              return false;
          }
      }

      return true;
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  function stripNullColors(array $coloring): array
  {
      return array_filter($coloring, fn ($color): bool => $color !== null);
  }
  //#endregion strip-null
  `,
  'php',
);

const CHROMATIC_NUMBER_KOTLIN = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  data class GraphNode(val id: String)

  data class GraphEdge(
      val from: String,
      val to: String,
  )

  data class GraphData(
      val nodes: List<GraphNode>,
      val edges: List<GraphEdge>,
  )

  data class ChromaticNumberResult(
      val chromaticNumber: Int,
      val coloring: Map<String, Int>,
  )
  //#endregion graph-types

  /**
   * Finds the chromatic number with exact backtracking search.
   * Input: graph interpreted as undirected.
   * Returns: the minimum number of colors and one valid coloring.
   */
  //#region chromatic function open
  fun chromaticNumber(graph: GraphData): ChromaticNumberResult {
      val adjacency = buildUndirectedAdjacency(graph)

      //@step 2
      val order = orderNodes(graph, adjacency)
      val startLimit = 1

      //@step 3
      for (limit in startLimit..graph.nodes.size) {
          val coloring = mutableMapOf<String, Int?>()
          for (node in graph.nodes) {
              coloring[node.id] = null
          }

          if (search(0, limit, order, adjacency, coloring)) {
              //@step 9
              return ChromaticNumberResult(
                  limit,
                  stripNullColors(coloring),
              )
          }

          //@step 8
          continue
      }

      error("Every finite graph is colorable with at most |V| colors.")
  }
  //#endregion chromatic

  //#region search helper collapsed
  fun search(
      index: Int,
      limit: Int,
      order: List<String>,
      adjacency: Map<String, List<String>>,
      coloring: MutableMap<String, Int?>,
  ): Boolean {
      if (index >= order.size) {
          return true
      }

      //@step 4
      val nodeId = order[index]

      //@step 5
      for (color in 1..limit) {
          if (canUseColor(nodeId, color, adjacency, coloring)) {
              //@step 6
              coloring[nodeId] = color

              if (search(index + 1, limit, order, adjacency, coloring)) {
                  return true
              }

              //@step 7
              coloring[nodeId] = null
          }
      }

      return false
  }
  //#endregion search

  //#region build-adjacency helper collapsed
  fun buildUndirectedAdjacency(graph: GraphData): MutableMap<String, MutableList<String>> {
      val adjacency = mutableMapOf<String, MutableList<String>>()

      for (node in graph.nodes) {
          adjacency[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          adjacency.getOrPut(edge.from) { mutableListOf() }.add(edge.to)
          adjacency.getOrPut(edge.to) { mutableListOf() }.add(edge.from)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region order-nodes helper collapsed
  fun orderNodes(
      graph: GraphData,
      adjacency: Map<String, List<String>>,
  ): List<String> {
      return graph.nodes
          .map { it.id }
          .sortedWith(compareByDescending<String> { adjacency[it].orEmpty().size }.thenBy { it })
  }
  //#endregion order-nodes

  //#region can-use helper collapsed
  fun canUseColor(
      nodeId: String,
      color: Int,
      adjacency: Map<String, List<String>>,
      coloring: Map<String, Int?>,
  ): Boolean {
      for (neighbor in adjacency[nodeId].orEmpty()) {
          if (coloring[neighbor] == color) {
              return false
          }
      }

      return true
  }
  //#endregion can-use

  //#region strip-null helper collapsed
  fun stripNullColors(coloring: Map<String, Int?>): Map<String, Int> {
      val result = mutableMapOf<String, Int>()
      for ((nodeId, color) in coloring) {
          if (color != null) {
              result[nodeId] = color
          }
      }
      return result
  }
  //#endregion strip-null
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: CHROMATIC_NUMBER_JS.lines,
    regions: CHROMATIC_NUMBER_JS.regions,
    highlightMap: CHROMATIC_NUMBER_JS.highlightMap,
    source: CHROMATIC_NUMBER_JS.source,
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
  go: {
    language: 'go',
    lines: CHROMATIC_NUMBER_GO.lines,
    regions: CHROMATIC_NUMBER_GO.regions,
    highlightMap: CHROMATIC_NUMBER_GO.highlightMap,
    source: CHROMATIC_NUMBER_GO.source,
  },
  rust: {
    language: 'rust',
    lines: CHROMATIC_NUMBER_RUST.lines,
    regions: CHROMATIC_NUMBER_RUST.regions,
    highlightMap: CHROMATIC_NUMBER_RUST.highlightMap,
    source: CHROMATIC_NUMBER_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: CHROMATIC_NUMBER_SWIFT.lines,
    regions: CHROMATIC_NUMBER_SWIFT.regions,
    highlightMap: CHROMATIC_NUMBER_SWIFT.highlightMap,
    source: CHROMATIC_NUMBER_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: CHROMATIC_NUMBER_PHP.lines,
    regions: CHROMATIC_NUMBER_PHP.regions,
    highlightMap: CHROMATIC_NUMBER_PHP.highlightMap,
    source: CHROMATIC_NUMBER_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: CHROMATIC_NUMBER_KOTLIN.lines,
    regions: CHROMATIC_NUMBER_KOTLIN.regions,
    highlightMap: CHROMATIC_NUMBER_KOTLIN.highlightMap,
    source: CHROMATIC_NUMBER_KOTLIN.source,
  },
};
