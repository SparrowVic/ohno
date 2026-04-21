import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CYCLE_DETECTION_TS = buildStructuredCode(`
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

  type VisitState = 'new' | 'stack' | 'done';
  //#endregion graph-types

  /**
   * Detect whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  function hasDirectedCycle(graph: GraphData): boolean {
    const adjacency = buildAdjacency(graph);
    const state = new Map<string, VisitState>();

    for (const node of graph.nodes) {
      //@step 4
      state.set(node.id, 'new');
    }

    for (const node of graph.nodes) {
      if (state.get(node.id) === 'new' && dfs(node.id, adjacency, state)) {
        return true;
      }
    }

    //@step 9
    return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  function dfs(
    nodeId: string,
    adjacency: ReadonlyMap<string, readonly string[]>,
    state: Map<string, VisitState>,
  ): boolean {
    //@step 11
    state.set(nodeId, 'stack');

    //@step 12
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      //@step 13
      if (state.get(neighbor) === 'stack') {
        return true;
      }

      //@step 14
      if (state.get(neighbor) === 'new') {
        //@step 15
        if (dfs(neighbor, adjacency, state)) {
          return true;
        }
      }
    }

    //@step 18
    state.set(nodeId, 'done');
    return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   * @typedef {'new' | 'stack' | 'done'} VisitState
   */
  //#endregion graph-types

  /**
   * Detect whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  function hasDirectedCycle(graph) {
      const adjacency = buildAdjacency(graph);
      const state = new Map();

      for (const node of graph.nodes) {
          //@step 4
          state.set(node.id, 'new');
      }

      for (const node of graph.nodes) {
          if (state.get(node.id) === 'new' && dfs(node.id, adjacency, state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  function dfs(nodeId, adjacency, state) {
      //@step 11
      state.set(nodeId, 'stack');

      //@step 12
      for (const neighbor of adjacency.get(nodeId) ?? []) {
          //@step 13
          if (state.get(neighbor) === 'stack') {
              return true;
          }

          //@step 14
          if (state.get(neighbor) === 'new') {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true;
              }
          }
      }

      //@step 18
      state.set(nodeId, 'done');
      return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_PY = buildStructuredCode(
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
  Detect whether a directed graph contains a cycle.
  Input: directed graph.
  Returns: true if any DFS walk reaches a node already on the recursion stack.
  """
  //#region cycle-detection function open
  def has_directed_cycle(graph: GraphData) -> bool:
      adjacency = build_adjacency(graph)
      state = {}

      for node in graph.nodes:
          //@step 4
          state[node.id] = "new"

      for node in graph.nodes:
          if state[node.id] == "new" and dfs(node.id, adjacency, state):
              return True

      //@step 9
      return False
  //#endregion cycle-detection

  //#region dfs helper collapsed
  def dfs(
      node_id: str,
      adjacency: dict[str, list[str]],
      state: dict[str, str],
  ) -> bool:
      //@step 11
      state[node_id] = "stack"

      //@step 12
      for neighbor in adjacency.get(node_id, []):
          //@step 13
          if state.get(neighbor) == "stack":
              return True

          //@step 14
          if state.get(neighbor) == "new":
              //@step 15
              if dfs(neighbor, adjacency, state):
                  return True

      //@step 18
      state[node_id] = "done"
      return False
  //#endregion dfs

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

const CYCLE_DETECTION_CS = buildStructuredCode(
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
  /// Detects whether a directed graph contains a cycle.
  /// Input: directed graph.
  /// Returns: true if any DFS walk reaches a node already on the recursion stack.
  /// </summary>
  //#region cycle-detection function open
  public static bool HasDirectedCycle(GraphData graph)
  {
      var adjacency = BuildAdjacency(graph);
      var state = new Dictionary<string, string>();

      foreach (var node in graph.Nodes)
      {
          //@step 4
          state[node.Id] = "new";
      }

      foreach (var node in graph.Nodes)
      {
          if (state[node.Id] == "new" && Dfs(node.Id, adjacency, state))
          {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  private static bool Dfs(
      string nodeId,
      IReadOnlyDictionary<string, List<string>> adjacency,
      Dictionary<string, string> state
  )
  {
      //@step 11
      state[nodeId] = "stack";

      //@step 12
      foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
      {
          //@step 13
          if (state.GetValueOrDefault(neighbor) == "stack")
          {
              return true;
          }

          //@step 14
          if (state.GetValueOrDefault(neighbor) == "new")
          {
              //@step 15
              if (Dfs(neighbor, adjacency, state))
              {
                  return true;
              }
          }
      }

      //@step 18
      state[nodeId] = "done";
      return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_JAVA = buildStructuredCode(
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
  //#endregion graph-types

  //#region cycle-detection function open
  /**
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  public static boolean hasDirectedCycle(GraphData graph) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Map<String, String> state = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          //@step 4
          state.put(node.id(), "new");
      }

      for (GraphNode node : graph.nodes()) {
          if ("new".equals(state.get(node.id())) && dfs(node.id(), adjacency, state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  private static boolean dfs(
      String nodeId,
      Map<String, List<String>> adjacency,
      Map<String, String> state
  ) {
      //@step 11
      state.put(nodeId, "stack");

      //@step 12
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          //@step 13
          if ("stack".equals(state.get(neighbor))) {
              return true;
          }

          //@step 14
          if ("new".equals(state.get(neighbor))) {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true;
              }
          }
      }

      //@step 18
      state.put(nodeId, "done");
      return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_CPP = buildStructuredCode(
  `
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
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  bool hasDirectedCycle(const GraphData& graph) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_map<std::string, std::string> state;

      for (const auto& node : graph.nodes) {
          //@step 4
          state[node.id] = "new";
      }

      for (const auto& node : graph.nodes) {
          if (state[node.id] == "new" && dfs(node.id, adjacency, state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  bool dfs(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_map<std::string, std::string>& state
  ) {
      //@step 11
      state[nodeId] = "stack";

      //@step 12
      for (const auto& neighbor : adjacency.at(nodeId)) {
          //@step 13
          if (state[neighbor] == "stack") {
              return true;
          }

          //@step 14
          if (state[neighbor] == "new") {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true;
              }
          }
      }

      //@step 18
      state[nodeId] = "done";
      return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_GO = buildStructuredCode(
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
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  func HasDirectedCycle(graph GraphData) bool {
      adjacency := buildAdjacency(graph)
      state := map[string]string{}

      for _, node := range graph.Nodes {
          //@step 4
          state[node.ID] = "new"
      }

      for _, node := range graph.Nodes {
          if state[node.ID] == "new" && dfs(node.ID, adjacency, state) {
              return true
          }
      }

      //@step 9
      return false
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  func dfs(nodeID string, adjacency map[string][]string, state map[string]string) bool {
      //@step 11
      state[nodeID] = "stack"

      //@step 12
      for _, neighbor := range adjacency[nodeID] {
          //@step 13
          if state[neighbor] == "stack" {
              return true
          }

          //@step 14
          if state[neighbor] == "new" {
              //@step 15
              if dfs(neighbor, adjacency, state) {
                  return true
              }
          }
      }

      //@step 18
      state[nodeID] = "done"
      return false
  }
  //#endregion dfs

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

const CYCLE_DETECTION_RUST = buildStructuredCode(
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
  //#endregion graph-types

  /**
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  fn has_directed_cycle(graph: &GraphData) -> bool {
      let adjacency = build_adjacency(graph);
      let mut state = HashMap::new();

      for node in &graph.nodes {
          //@step 4
          state.insert(node.id.clone(), "new".to_string());
      }

      for node in &graph.nodes {
          if state.get(&node.id).map(String::as_str) == Some("new")
              && dfs(&node.id, &adjacency, &mut state)
          {
              return true;
          }
      }

      //@step 9
      false
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  fn dfs(
      node_id: &str,
      adjacency: &HashMap<String, Vec<String>>,
      state: &mut HashMap<String, String>,
  ) -> bool {
      //@step 11
      state.insert(node_id.to_string(), "stack".to_string());

      //@step 12
      for neighbor in adjacency.get(node_id).cloned().unwrap_or_default() {
          //@step 13
          if state.get(&neighbor).map(String::as_str) == Some("stack") {
              return true;
          }

          //@step 14
          if state.get(&neighbor).map(String::as_str) == Some("new") {
              //@step 15
              if dfs(&neighbor, adjacency, state) {
                  return true;
              }
          }
      }

      //@step 18
      state.insert(node_id.to_string(), "done".to_string());
      false
  }
  //#endregion dfs

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

const CYCLE_DETECTION_SWIFT = buildStructuredCode(
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

  typealias VisitState = String
  //#endregion graph-types

  /**
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  func hasDirectedCycle(graph: GraphData) -> Bool {
      let adjacency = buildAdjacency(graph: graph)
      var state: [String: VisitState] = [:]

      for node in graph.nodes {
          //@step 4
          state[node.id] = "new"
      }

      for node in graph.nodes {
          if state[node.id] == "new" && dfs(nodeId: node.id, adjacency: adjacency, state: &state) {
              return true
          }
      }

      //@step 9
      return false
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  func dfs(
      nodeId: String,
      adjacency: [String: [String]],
      state: inout [String: VisitState],
  ) -> Bool {
      //@step 11
      state[nodeId] = "stack"

      //@step 12
      for neighbor in adjacency[nodeId] ?? [] {
          //@step 13
          if state[neighbor] == "stack" {
              return true
          }

          //@step 14
          if state[neighbor] == "new" {
              //@step 15
              if dfs(nodeId: neighbor, adjacency: adjacency, state: &state) {
                  return true
              }
          }
      }

      //@step 18
      state[nodeId] = "done"
      return false
  }
  //#endregion dfs

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

const CYCLE_DETECTION_PHP = buildStructuredCode(
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
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  function hasDirectedCycle(GraphData $graph): bool
  {
      $adjacency = buildAdjacency($graph);
      $state = [];

      foreach ($graph->nodes as $node) {
          //@step 4
          $state[$node->id] = 'new';
      }

      foreach ($graph->nodes as $node) {
          if (($state[$node->id] ?? null) === 'new' && dfs($node->id, $adjacency, $state)) {
              return true;
          }
      }

      //@step 9
      return false;
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  function dfs(string $nodeId, array $adjacency, array &$state): bool
  {
      //@step 11
      $state[$nodeId] = 'stack';

      //@step 12
      foreach ($adjacency[$nodeId] ?? [] as $neighbor) {
          //@step 13
          if (($state[$neighbor] ?? null) === 'stack') {
              return true;
          }

          //@step 14
          if (($state[$neighbor] ?? null) === 'new') {
              //@step 15
              if (dfs($neighbor, $adjacency, $state)) {
                  return true;
              }
          }
      }

      //@step 18
      $state[$nodeId] = 'done';
      return false;
  }
  //#endregion dfs

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

const CYCLE_DETECTION_KOTLIN = buildStructuredCode(
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
   * Detects whether a directed graph contains a cycle.
   * Input: directed graph.
   * Returns: true if any DFS walk reaches a node already on the recursion stack.
   */
  //#region cycle-detection function open
  fun hasDirectedCycle(graph: GraphData): Boolean {
      val adjacency = buildAdjacency(graph)
      val state = mutableMapOf<String, String>()

      for (node in graph.nodes) {
          //@step 4
          state[node.id] = "new"
      }

      for (node in graph.nodes) {
          if (state[node.id] == "new" && dfs(node.id, adjacency, state)) {
              return true
          }
      }

      //@step 9
      return false
  }
  //#endregion cycle-detection

  //#region dfs helper collapsed
  fun dfs(
      nodeId: String,
      adjacency: Map<String, List<String>>,
      state: MutableMap<String, String>,
  ): Boolean {
      //@step 11
      state[nodeId] = "stack"

      //@step 12
      for (neighbor in adjacency[nodeId].orEmpty()) {
          //@step 13
          if (state[neighbor] == "stack") {
              return true
          }

          //@step 14
          if (state[neighbor] == "new") {
              //@step 15
              if (dfs(neighbor, adjacency, state)) {
                  return true
              }
          }
      }

      //@step 18
      state[nodeId] = "done"
      return false
  }
  //#endregion dfs

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

export const CYCLE_DETECTION_CODE = CYCLE_DETECTION_TS.lines;
export const CYCLE_DETECTION_CODE_REGIONS = CYCLE_DETECTION_TS.regions;
export const CYCLE_DETECTION_CODE_HIGHLIGHT_MAP = CYCLE_DETECTION_TS.highlightMap;
export const CYCLE_DETECTION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CYCLE_DETECTION_TS.lines,
    regions: CYCLE_DETECTION_TS.regions,
    highlightMap: CYCLE_DETECTION_TS.highlightMap,
    source: CYCLE_DETECTION_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: CYCLE_DETECTION_JS.lines,
    regions: CYCLE_DETECTION_JS.regions,
    highlightMap: CYCLE_DETECTION_JS.highlightMap,
    source: CYCLE_DETECTION_JS.source,
  },
  python: {
    language: 'python',
    lines: CYCLE_DETECTION_PY.lines,
    regions: CYCLE_DETECTION_PY.regions,
    highlightMap: CYCLE_DETECTION_PY.highlightMap,
    source: CYCLE_DETECTION_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CYCLE_DETECTION_CS.lines,
    regions: CYCLE_DETECTION_CS.regions,
    highlightMap: CYCLE_DETECTION_CS.highlightMap,
    source: CYCLE_DETECTION_CS.source,
  },
  java: {
    language: 'java',
    lines: CYCLE_DETECTION_JAVA.lines,
    regions: CYCLE_DETECTION_JAVA.regions,
    highlightMap: CYCLE_DETECTION_JAVA.highlightMap,
    source: CYCLE_DETECTION_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CYCLE_DETECTION_CPP.lines,
    regions: CYCLE_DETECTION_CPP.regions,
    highlightMap: CYCLE_DETECTION_CPP.highlightMap,
    source: CYCLE_DETECTION_CPP.source,
  },
  go: {
    language: 'go',
    lines: CYCLE_DETECTION_GO.lines,
    regions: CYCLE_DETECTION_GO.regions,
    highlightMap: CYCLE_DETECTION_GO.highlightMap,
    source: CYCLE_DETECTION_GO.source,
  },
  rust: {
    language: 'rust',
    lines: CYCLE_DETECTION_RUST.lines,
    regions: CYCLE_DETECTION_RUST.regions,
    highlightMap: CYCLE_DETECTION_RUST.highlightMap,
    source: CYCLE_DETECTION_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: CYCLE_DETECTION_SWIFT.lines,
    regions: CYCLE_DETECTION_SWIFT.regions,
    highlightMap: CYCLE_DETECTION_SWIFT.highlightMap,
    source: CYCLE_DETECTION_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: CYCLE_DETECTION_PHP.lines,
    regions: CYCLE_DETECTION_PHP.regions,
    highlightMap: CYCLE_DETECTION_PHP.highlightMap,
    source: CYCLE_DETECTION_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: CYCLE_DETECTION_KOTLIN.lines,
    regions: CYCLE_DETECTION_KOTLIN.regions,
    highlightMap: CYCLE_DETECTION_KOTLIN.highlightMap,
    source: CYCLE_DETECTION_KOTLIN.source,
  },
};
