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

const TOPOLOGICAL_SORT_KAHN_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Compute a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  function topologicalSortKahn(graph) {
      const { adjacency, inDegree } = buildGraphMetadata(graph);
      const queue = [];
      const order = [];

      for (const node of graph.nodes) {
          //@step 8
          if ((inDegree.get(node.id) ?? 0) === 0) {
              queue.push(node.id);
          }
      }

      while (queue.length > 0) {
          //@step 10
          const current = queue.shift();
          order.push(current);

          for (const neighbor of adjacency.get(current) ?? []) {
              //@step 13
              const nextDegree = (inDegree.get(neighbor) ?? 0) - 1;

              //@step 14
              inDegree.set(neighbor, nextDegree);

              //@step 15
              if (nextDegree === 0) {
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
  function buildGraphMetadata(graph) {
      const adjacency = new Map();
      const inDegree = new Map();

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
  `,
  'javascript',
);

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

const TOPOLOGICAL_SORT_KAHN_GO = buildStructuredCode(
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

  type GraphMetadata struct {
      Adjacency map[string][]string
      InDegree  map[string]int
  }
  //#endregion graph-types

  /**
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  func TopologicalSortKahn(graph GraphData) ([]string, error) {
      metadata := buildGraphMetadata(graph)
      queue := []string{}
      order := []string{}

      for _, node := range graph.Nodes {
          //@step 8
          if metadata.InDegree[node.ID] == 0 {
              queue = append(queue, node.ID)
          }
      }

      for len(queue) > 0 {
          //@step 10
          current := queue[0]
          queue = queue[1:]
          order = append(order, current)

          for _, neighbor := range metadata.Adjacency[current] {
              //@step 13
              nextDegree := metadata.InDegree[neighbor] - 1

              //@step 14
              metadata.InDegree[neighbor] = nextDegree

              //@step 15
              if nextDegree == 0 {
                  queue = append(queue, neighbor)
              }
          }
      }

      //@step 17
      if len(order) != len(graph.Nodes) {
          return nil, fmt.Errorf("topological order is undefined for graphs with cycles")
      }

      //@step 18
      return order, nil
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  func buildGraphMetadata(graph GraphData) GraphMetadata {
      metadata := GraphMetadata{
          Adjacency: make(map[string][]string),
          InDegree:  make(map[string]int),
      }

      for _, node := range graph.Nodes {
          metadata.Adjacency[node.ID] = []string{}
          metadata.InDegree[node.ID] = 0
      }

      for _, edge := range graph.Edges {
          metadata.Adjacency[edge.From] = append(metadata.Adjacency[edge.From], edge.To)
          metadata.InDegree[edge.To] += 1
      }

      return metadata
  }
  //#endregion build-metadata
  `,
  'go',
);

const TOPOLOGICAL_SORT_KAHN_RUST = buildStructuredCode(
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
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  fn topological_sort_kahn(graph: &GraphData) -> Result<Vec<String>, String> {
      let (adjacency, mut indegree) = build_graph_metadata(graph);
      let mut queue = VecDeque::new();
      let mut order = Vec::new();

      for node in &graph.nodes {
          //@step 8
          if indegree.get(&node.id).copied().unwrap_or(0) == 0 {
              queue.push_back(node.id.clone());
          }
      }

      while !queue.is_empty() {
          //@step 10
          let current = queue.pop_front().unwrap();
          order.push(current.clone());

          for neighbor in adjacency.get(&current).cloned().unwrap_or_default() {
              //@step 13
              let next_degree = indegree.get(&neighbor).copied().unwrap_or(0) - 1;

              //@step 14
              indegree.insert(neighbor.clone(), next_degree);

              //@step 15
              if next_degree == 0 {
                  queue.push_back(neighbor);
              }
          }
      }

      //@step 17
      if order.len() != graph.nodes.len() {
          return Err("topological order is undefined for graphs with cycles".to_string());
      }

      //@step 18
      Ok(order)
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  fn build_graph_metadata(graph: &GraphData) -> (HashMap<String, Vec<String>>, HashMap<String, i32>) {
      let mut adjacency = HashMap::new();
      let mut indegree = HashMap::new();

      for node in &graph.nodes {
          adjacency.insert(node.id.clone(), Vec::new());
          indegree.insert(node.id.clone(), 0);
      }

      for edge in &graph.edges {
          adjacency.entry(edge.from.clone()).or_insert_with(Vec::new).push(edge.to.clone());
          *indegree.entry(edge.to.clone()).or_insert(0) += 1;
      }

      (adjacency, indegree)
  }
  //#endregion build-metadata
  `,
  'rust',
);

const TOPOLOGICAL_SORT_KAHN_SWIFT = buildStructuredCode(
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
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  func topologicalSortKahn(graph: GraphData) throws -> [String] {
      let metadata = buildGraphMetadata(graph: graph)
      let adjacency = metadata.adjacency
      var inDegree = metadata.inDegree
      var queue: [String] = []
      var order: [String] = []

      for node in graph.nodes {
          //@step 8
          if (inDegree[node.id] ?? 0) == 0 {
              queue.append(node.id)
          }
      }

      while !queue.isEmpty {
          //@step 10
          let current = queue.removeFirst()
          order.append(current)

          for neighbor in adjacency[current] ?? [] {
              //@step 13
              let nextDegree = (inDegree[neighbor] ?? 0) - 1

              //@step 14
              inDegree[neighbor] = nextDegree

              //@step 15
              if nextDegree == 0 {
                  queue.append(neighbor)
              }
          }
      }

      //@step 17
      if order.count != graph.nodes.count {
          throw NSError(
              domain: "TopologicalSortKahn",
              code: 1,
              userInfo: [NSLocalizedDescriptionKey: "Topological order is undefined for graphs with cycles."]
          )
      }

      //@step 18
      return order
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  func buildGraphMetadata(graph: GraphData) -> (
      adjacency: [String: [String]],
      inDegree: [String: Int]
  ) {
      var adjacency: [String: [String]] = [:]
      var inDegree: [String: Int] = [:]

      for node in graph.nodes {
          adjacency[node.id] = []
          inDegree[node.id] = 0
      }

      for edge in graph.edges {
          adjacency[edge.from, default: []].append(edge.to)
          inDegree[edge.to, default: 0] += 1
      }

      return (adjacency, inDegree)
  }
  //#endregion build-metadata
  `,
  'swift',
);

const TOPOLOGICAL_SORT_KAHN_PHP = buildStructuredCode(
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
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   *
   * @return list<string>
   */
  //#region kahn function open
  function topologicalSortKahn(GraphData $graph): array
  {
      ['adjacency' => $adjacency, 'inDegree' => $inDegree] = buildGraphMetadata($graph);
      $queue = [];
      $order = [];

      foreach ($graph->nodes as $node) {
          //@step 8
          if (($inDegree[$node->id] ?? 0) === 0) {
              $queue[] = $node->id;
          }
      }

      while ($queue !== []) {
          //@step 10
          $current = array_shift($queue);
          $order[] = $current;

          foreach ($adjacency[$current] ?? [] as $neighbor) {
              //@step 13
              $nextDegree = ($inDegree[$neighbor] ?? 0) - 1;

              //@step 14
              $inDegree[$neighbor] = $nextDegree;

              //@step 15
              if ($nextDegree === 0) {
                  $queue[] = $neighbor;
              }
          }
      }

      //@step 17
      if (count($order) !== count($graph->nodes)) {
          throw new RuntimeException('Topological order is undefined for graphs with cycles.');
      }

      //@step 18
      return $order;
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  function buildGraphMetadata(GraphData $graph): array
  {
      $adjacency = [];
      $inDegree = [];

      foreach ($graph->nodes as $node) {
          $adjacency[$node->id] = [];
          $inDegree[$node->id] = 0;
      }

      foreach ($graph->edges as $edge) {
          $adjacency[$edge->from][] = $edge->to;
          $inDegree[$edge->to] = ($inDegree[$edge->to] ?? 0) + 1;
      }

      return ['adjacency' => $adjacency, 'inDegree' => $inDegree];
  }
  //#endregion build-metadata
  `,
  'php',
);

const TOPOLOGICAL_SORT_KAHN_KOTLIN = buildStructuredCode(
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
   * Computes a topological order of a directed acyclic graph with Kahn's algorithm.
   * Input: directed graph.
   * Returns: one valid topological ordering of all nodes.
   */
  //#region kahn function open
  fun topologicalSortKahn(graph: GraphData): List<String> {
      val (adjacency, inDegree) = buildGraphMetadata(graph)
      val queue = ArrayDeque<String>()
      val order = mutableListOf<String>()

      for (node in graph.nodes) {
          //@step 8
          if ((inDegree[node.id] ?: 0) == 0) {
              queue.addLast(node.id)
          }
      }

      while (queue.isNotEmpty()) {
          //@step 10
          val current = queue.removeFirst()
          order += current

          for (neighbor in adjacency[current].orEmpty()) {
              //@step 13
              val nextDegree = (inDegree[neighbor] ?: 0) - 1

              //@step 14
              inDegree[neighbor] = nextDegree

              //@step 15
              if (nextDegree == 0) {
                  queue.addLast(neighbor)
              }
          }
      }

      //@step 17
      if (order.size != graph.nodes.size) {
          error("Topological order is undefined for graphs with cycles.")
      }

      //@step 18
      return order
  }
  //#endregion kahn

  //#region build-metadata helper collapsed
  fun buildGraphMetadata(
      graph: GraphData,
  ): Pair<MutableMap<String, MutableList<String>>, MutableMap<String, Int>> {
      val adjacency = mutableMapOf<String, MutableList<String>>()
      val inDegree = mutableMapOf<String, Int>()

      for (node in graph.nodes) {
          adjacency[node.id] = mutableListOf()
          inDegree[node.id] = 0
      }

      for (edge in graph.edges) {
          adjacency.getOrPut(edge.from) { mutableListOf() }.add(edge.to)
          inDegree[edge.to] = (inDegree[edge.to] ?: 0) + 1
      }

      return adjacency to inDegree
  }
  //#endregion build-metadata
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: TOPOLOGICAL_SORT_KAHN_JS.lines,
    regions: TOPOLOGICAL_SORT_KAHN_JS.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_JS.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_JS.source,
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
  go: {
    language: 'go',
    lines: TOPOLOGICAL_SORT_KAHN_GO.lines,
    regions: TOPOLOGICAL_SORT_KAHN_GO.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_GO.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_GO.source,
  },
  rust: {
    language: 'rust',
    lines: TOPOLOGICAL_SORT_KAHN_RUST.lines,
    regions: TOPOLOGICAL_SORT_KAHN_RUST.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_RUST.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: TOPOLOGICAL_SORT_KAHN_SWIFT.lines,
    regions: TOPOLOGICAL_SORT_KAHN_SWIFT.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_SWIFT.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: TOPOLOGICAL_SORT_KAHN_PHP.lines,
    regions: TOPOLOGICAL_SORT_KAHN_PHP.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_PHP.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: TOPOLOGICAL_SORT_KAHN_KOTLIN.lines,
    regions: TOPOLOGICAL_SORT_KAHN_KOTLIN.regions,
    highlightMap: TOPOLOGICAL_SORT_KAHN_KOTLIN.highlightMap,
    source: TOPOLOGICAL_SORT_KAHN_KOTLIN.source,
  },
};
