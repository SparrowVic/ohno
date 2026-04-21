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

const BIPARTITE_CHECK_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   * @typedef {0 | 1} Partition
   */
  //#endregion graph-types

  /**
   * Check whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  function isBipartite(graph) {
      const adjacency = buildUndirectedAdjacency(graph);
      const color = new Map();
      const closed = [];

      for (const node of graph.nodes) {
          color.set(node.id, null);
      }

      for (const node of graph.nodes) {
          if (color.get(node.id) !== null) {
              continue;
          }

          //@step 5
          const queue = [node.id];
          color.set(node.id, 0);

          while (queue.length > 0) {
              //@step 7
              const current = queue.shift();
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
  `,
  'javascript',
);

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

const BIPARTITE_CHECK_GO = buildStructuredCode(
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
  //#endregion graph-types

  /**
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  func IsBipartite(graph GraphData) bool {
      adjacency := buildUndirectedAdjacency(graph)
      color := map[string]int{}
      closed := []string{}

      for _, node := range graph.Nodes {
          color[node.ID] = -1
      }

      for _, node := range graph.Nodes {
          if color[node.ID] != -1 {
              continue
          }

          //@step 5
          queue := []string{node.ID}
          color[node.ID] = 0

          for len(queue) > 0 {
              //@step 7
              current := queue[0]
              queue = queue[1:]
              wanted := 1
              if color[current] != 0 {
                  wanted = 0
              }

              //@step 8
              for _, neighbor := range adjacency[current] {
                  neighborColor := color[neighbor]

                  //@step 10
                  if neighborColor == -1 {
                      color[neighbor] = wanted
                      queue = append(queue, neighbor)
                      continue
                  }

                  //@step 13
                  if neighborColor == wanted {
                      continue
                  }

                  //@step 12
                  return false
              }

              //@step 14
              closed = append(closed, current)
          }
      }

      //@step 15
      return true
  }
  //#endregion bipartite

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
  `,
  'go',
);

const BIPARTITE_CHECK_RUST = buildStructuredCode(
  `
  use std::collections::{HashMap, VecDeque};

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
  //#endregion graph-types

  /**
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  fn is_bipartite(graph: &GraphData) -> bool {
      let adjacency = build_undirected_adjacency(graph);
      let mut color = HashMap::new();
      let mut closed = Vec::new();

      for node in &graph.nodes {
          color.insert(node.id.clone(), -1);
      }

      for node in &graph.nodes {
          if color.get(&node.id).copied().unwrap_or(-1) != -1 {
              continue;
          }

          //@step 5
          let mut queue = VecDeque::from([node.id.clone()]);
          color.insert(node.id.clone(), 0);

          while !queue.is_empty() {
              //@step 7
              let current = queue.pop_front().unwrap();
              let wanted = if color.get(&current).copied().unwrap_or(-1) == 0 { 1 } else { 0 };

              //@step 8
              for neighbor in adjacency.get(&current).cloned().unwrap_or_default() {
                  let neighbor_color = color.get(&neighbor).copied().unwrap_or(-1);

                  //@step 10
                  if neighbor_color == -1 {
                      color.insert(neighbor.clone(), wanted);
                      queue.push_back(neighbor);
                      continue;
                  }

                  //@step 13
                  if neighbor_color == wanted {
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
      true
  }
  //#endregion bipartite

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
  `,
  'rust',
);

const BIPARTITE_CHECK_SWIFT = buildStructuredCode(
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
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  func isBipartite(graph: GraphData) -> Bool {
      let adjacency = buildUndirectedAdjacency(graph: graph)
      var color: [String: Int] = [:]
      var closed: [String] = []

      for node in graph.nodes {
          color[node.id] = -1
      }

      for node in graph.nodes {
          if (color[node.id] ?? -1) != -1 {
              continue
          }

          //@step 5
          var queue = [node.id]
          color[node.id] = 0

          while !queue.isEmpty {
              //@step 7
              let current = queue.removeFirst()
              let wanted = (color[current] ?? -1) == 0 ? 1 : 0

              //@step 8
              for neighbor in adjacency[current] ?? [] {
                  let neighborColor = color[neighbor] ?? -1

                  //@step 10
                  if neighborColor == -1 {
                      color[neighbor] = wanted
                      queue.append(neighbor)
                      continue
                  }

                  //@step 13
                  if neighborColor == wanted {
                      continue
                  }

                  //@step 12
                  return false
              }

              //@step 14
              closed.append(current)
          }
      }

      //@step 15
      return true
  }
  //#endregion bipartite

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
  `,
  'swift',
);

const BIPARTITE_CHECK_PHP = buildStructuredCode(
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
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  function isBipartite(GraphData $graph): bool
  {
      $adjacency = buildUndirectedAdjacency($graph);
      $color = [];
      $closed = [];

      foreach ($graph->nodes as $node) {
          $color[$node->id] = -1;
      }

      foreach ($graph->nodes as $node) {
          if (($color[$node->id] ?? -1) !== -1) {
              continue;
          }

          //@step 5
          $queue = [$node->id];
          $color[$node->id] = 0;

          while ($queue !== []) {
              //@step 7
              $current = array_shift($queue);
              $wanted = (($color[$current] ?? -1) === 0) ? 1 : 0;

              //@step 8
              foreach ($adjacency[$current] ?? [] as $neighbor) {
                  $neighborColor = $color[$neighbor] ?? -1;

                  //@step 10
                  if ($neighborColor === -1) {
                      $color[$neighbor] = $wanted;
                      $queue[] = $neighbor;
                      continue;
                  }

                  //@step 13
                  if ($neighborColor === $wanted) {
                      continue;
                  }

                  //@step 12
                  return false;
              }

              //@step 14
              $closed[] = $current;
          }
      }

      //@step 15
      return true;
  }
  //#endregion bipartite

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
  `,
  'php',
);

const BIPARTITE_CHECK_KOTLIN = buildStructuredCode(
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
  //#endregion graph-types

  /**
   * Checks whether an undirected graph is bipartite.
   * Input: graph interpreted as undirected.
   * Returns: true when every edge connects opposite partitions.
   */
  //#region bipartite function open
  //@step 2
  fun isBipartite(graph: GraphData): Boolean {
      val adjacency = buildUndirectedAdjacency(graph)
      val color = mutableMapOf<String, Int>()
      val closed = mutableListOf<String>()

      for (node in graph.nodes) {
          color[node.id] = -1
      }

      for (node in graph.nodes) {
          if ((color[node.id] ?: -1) != -1) {
              continue
          }

          //@step 5
          val queue = ArrayDeque<String>()
          queue.addLast(node.id)
          color[node.id] = 0

          while (queue.isNotEmpty()) {
              //@step 7
              val current = queue.removeFirst()
              val wanted = if ((color[current] ?: -1) == 0) 1 else 0

              //@step 8
              for (neighbor in adjacency[current].orEmpty()) {
                  val neighborColor = color[neighbor] ?: -1

                  //@step 10
                  if (neighborColor == -1) {
                      color[neighbor] = wanted
                      queue.addLast(neighbor)
                      continue
                  }

                  //@step 13
                  if (neighborColor == wanted) {
                      continue
                  }

                  //@step 12
                  return false
              }

              //@step 14
              closed += current
          }
      }

      //@step 15
      return true
  }
  //#endregion bipartite

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
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: BIPARTITE_CHECK_JS.lines,
    regions: BIPARTITE_CHECK_JS.regions,
    highlightMap: BIPARTITE_CHECK_JS.highlightMap,
    source: BIPARTITE_CHECK_JS.source,
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
  go: {
    language: 'go',
    lines: BIPARTITE_CHECK_GO.lines,
    regions: BIPARTITE_CHECK_GO.regions,
    highlightMap: BIPARTITE_CHECK_GO.highlightMap,
    source: BIPARTITE_CHECK_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BIPARTITE_CHECK_RUST.lines,
    regions: BIPARTITE_CHECK_RUST.regions,
    highlightMap: BIPARTITE_CHECK_RUST.highlightMap,
    source: BIPARTITE_CHECK_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BIPARTITE_CHECK_SWIFT.lines,
    regions: BIPARTITE_CHECK_SWIFT.regions,
    highlightMap: BIPARTITE_CHECK_SWIFT.highlightMap,
    source: BIPARTITE_CHECK_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BIPARTITE_CHECK_PHP.lines,
    regions: BIPARTITE_CHECK_PHP.regions,
    highlightMap: BIPARTITE_CHECK_PHP.highlightMap,
    source: BIPARTITE_CHECK_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BIPARTITE_CHECK_KOTLIN.lines,
    regions: BIPARTITE_CHECK_KOTLIN.regions,
    highlightMap: BIPARTITE_CHECK_KOTLIN.highlightMap,
    source: BIPARTITE_CHECK_KOTLIN.source,
  },
};
