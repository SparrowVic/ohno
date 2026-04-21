import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const BFS_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Traverse a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  function bfs(graph, source) {
      const adjacency = buildAdjacency(graph);
      const queue = [source];
      const visited = new Set([source]);
      const level = new Map([[source, 0]]);
      const order = [];

      while (queue.length > 0) {
          //@step 6
          const current = queue.shift();

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
  function buildAdjacency(graph) {
      const adjacency = new Map();

      for (const node of graph.nodes) {
          adjacency.set(node.id, []);
      }

      for (const edge of graph.edges) {
          adjacency.get(edge.from)?.push(edge.to);
      }

      return adjacency;
  }
  //#endregion build-adjacency
  `,
  'javascript',
);

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

const BFS_GO = buildStructuredCode(
  `
  package graphs

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

  type BfsResult struct {
      Level map[string]int
      Order []string
  }
  //#endregion graph-types

  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  func Bfs(graph GraphData, source string) BfsResult {
      adjacency := buildAdjacency(graph)
      queue := []string{source}
      visited := map[string]struct{}{source: {}}
      level := map[string]int{source: 0}
      order := []string{}

      for len(queue) > 0 {
          //@step 6
          current := queue[0]
          queue = queue[1:]

          //@step 7
          for _, neighbor := range adjacency[current] {
              //@step 8
              if _, seen := visited[neighbor]; seen {
                  continue
              }

              visited[neighbor] = struct{}{}

              //@step 10
              level[neighbor] = level[current] + 1
              queue = append(queue, neighbor)
          }

          //@step 13
          order = append(order, current)
      }

      return BfsResult{Level: level, Order: order}
  }
  //#endregion bfs

  //#region build-adjacency helper collapsed
  func buildAdjacency(graph GraphData) map[string][]string {
      adjacency := make(map[string][]string)

      for _, node := range graph.Nodes {
          adjacency[node.ID] = []string{}
      }

      for _, edge := range graph.Edges {
          adjacency[edge.From] = append(adjacency[edge.From], edge.To)
      }

      return adjacency
  }
  //#endregion build-adjacency
  `,
  'go',
);

const BFS_RUST = buildStructuredCode(
  `
  use std::collections::{HashMap, HashSet, VecDeque};

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

  struct BfsResult {
      level: HashMap<String, i32>,
      order: Vec<String>,
  }
  //#endregion graph-types

  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  fn bfs(graph: &GraphData, source: &str) -> BfsResult {
      let adjacency = build_adjacency(graph);
      let mut queue = VecDeque::from([source.to_string()]);
      let mut visited = HashSet::from([source.to_string()]);
      let mut level = HashMap::from([(source.to_string(), 0)]);
      let mut order = Vec::new();

      while !queue.is_empty() {
          //@step 6
          let current = queue.pop_front().unwrap();

          //@step 7
          for neighbor in adjacency.get(&current).cloned().unwrap_or_default() {
              //@step 8
              if visited.contains(&neighbor) {
                  continue;
              }

              visited.insert(neighbor.clone());

              //@step 10
              level.insert(neighbor.clone(), level.get(&current).copied().unwrap_or(0) + 1);
              queue.push_back(neighbor);
          }

          //@step 13
          order.push(current);
      }

      BfsResult { level, order }
  }
  //#endregion bfs

  //#region build-adjacency helper collapsed
  fn build_adjacency(graph: &GraphData) -> HashMap<String, Vec<String>> {
      let mut adjacency = HashMap::new();

      for node in &graph.nodes {
          adjacency.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          adjacency.entry(edge.from.clone()).or_insert_with(Vec::new).push(edge.to.clone());
      }

      adjacency
  }
  //#endregion build-adjacency
  `,
  'rust',
);

const BFS_SWIFT = buildStructuredCode(
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

  struct BfsResult {
      let level: [String: Int]
      let order: [String]
  }
  //#endregion graph-types

  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  func bfs(graph: GraphData, source: String) -> BfsResult {
      let adjacency = buildAdjacency(graph: graph)
      var queue = [source]
      var visited: Set<String> = [source]
      var level = [source: 0]
      var order: [String] = []

      while !queue.isEmpty {
          //@step 6
          let current = queue.removeFirst()

          //@step 7
          for neighbor in adjacency[current] ?? [] {
              //@step 8
              if visited.contains(neighbor) {
                  continue
              }

              visited.insert(neighbor)

              //@step 10
              level[neighbor] = (level[current] ?? 0) + 1
              queue.append(neighbor)
          }

          //@step 13
          order.append(current)
      }

      return BfsResult(level: level, order: order)
  }
  //#endregion bfs

  //#region build-adjacency helper collapsed
  func buildAdjacency(graph: GraphData) -> [String: [String]] {
      var adjacency: [String: [String]] = [:]

      for node in graph.nodes {
          adjacency[node.id] = []
      }

      for edge in graph.edges {
          adjacency[edge.from, default: []].append(edge.to)
      }

      return adjacency
  }
  //#endregion build-adjacency
  `,
  'swift',
);

const BFS_PHP = buildStructuredCode(
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
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   *
   * @return array{
   *   level: array<string, int>,
   *   order: list<string>
   * }
   */
  //#region bfs function open
  //@step 2
  function bfs(GraphData $graph, string $source): array
  {
      $adjacency = buildAdjacency($graph);
      $queue = [$source];
      $visited = [$source => true];
      $level = [$source => 0];
      $order = [];

      while ($queue !== []) {
          //@step 6
          $current = array_shift($queue);

          //@step 7
          foreach ($adjacency[$current] ?? [] as $neighbor) {
              //@step 8
              if (isset($visited[$neighbor])) {
                  continue;
              }

              $visited[$neighbor] = true;

              //@step 10
              $level[$neighbor] = ($level[$current] ?? 0) + 1;
              $queue[] = $neighbor;
          }

          //@step 13
          $order[] = $current;
      }

      return ['level' => $level, 'order' => $order];
  }
  //#endregion bfs

  //#region build-adjacency helper collapsed
  function buildAdjacency(GraphData $graph): array
  {
      $adjacency = [];

      foreach ($graph->nodes as $node) {
          $adjacency[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $adjacency[$edge->from][] = $edge->to;
      }

      return $adjacency;
  }
  //#endregion build-adjacency
  `,
  'php',
);

const BFS_KOTLIN = buildStructuredCode(
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

  data class BfsResult(
      val level: Map<String, Int>,
      val order: List<String>,
  )
  //#endregion graph-types

  /**
   * Traverses a graph in breadth-first order.
   * Input: directed graph and a source node id.
   * Returns: BFS level map and visitation order.
   */
  //#region bfs function open
  //@step 2
  fun bfs(graph: GraphData, source: String): BfsResult {
      val adjacency = buildAdjacency(graph)
      val queue = ArrayDeque<String>()
      queue.addLast(source)
      val visited = mutableSetOf(source)
      val level = mutableMapOf(source to 0)
      val order = mutableListOf<String>()

      while (queue.isNotEmpty()) {
          //@step 6
          val current = queue.removeFirst()

          //@step 7
          for (neighbor in adjacency[current].orEmpty()) {
              //@step 8
              if (neighbor in visited) {
                  continue
              }

              visited += neighbor

              //@step 10
              level[neighbor] = (level[current] ?: 0) + 1
              queue.addLast(neighbor)
          }

          //@step 13
          order += current
      }

      return BfsResult(level, order)
  }
  //#endregion bfs

  //#region build-adjacency helper collapsed
  fun buildAdjacency(graph: GraphData): MutableMap<String, MutableList<String>> {
      val adjacency = mutableMapOf<String, MutableList<String>>()

      for (node in graph.nodes) {
          adjacency[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          adjacency.getOrPut(edge.from) { mutableListOf() }.add(edge.to)
      }

      return adjacency
  }
  //#endregion build-adjacency
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: BFS_JS.lines,
    regions: BFS_JS.regions,
    highlightMap: BFS_JS.highlightMap,
    source: BFS_JS.source,
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
  go: {
    language: 'go',
    lines: BFS_GO.lines,
    regions: BFS_GO.regions,
    highlightMap: BFS_GO.highlightMap,
    source: BFS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BFS_RUST.lines,
    regions: BFS_RUST.regions,
    highlightMap: BFS_RUST.highlightMap,
    source: BFS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BFS_SWIFT.lines,
    regions: BFS_SWIFT.regions,
    highlightMap: BFS_SWIFT.highlightMap,
    source: BFS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BFS_PHP.lines,
    regions: BFS_PHP.regions,
    highlightMap: BFS_PHP.highlightMap,
    source: BFS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BFS_KOTLIN.lines,
    regions: BFS_KOTLIN.regions,
    highlightMap: BFS_KOTLIN.highlightMap,
    source: BFS_KOTLIN.source,
  },
};
