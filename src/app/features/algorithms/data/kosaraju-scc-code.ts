import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const KOSARAJU_SCC_TS = buildStructuredCode(`
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
   * Partition a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  function kosarajuScc(graph: GraphData): string[][] {
    const adjacency = buildAdjacency(graph);
    const visited = new Set<string>();
    const finishOrder: string[] = [];

    for (const node of graph.nodes) {
      //@step 4
      if (!visited.has(node.id)) {
        dfsOriginal(node.id);
      }
    }

    //@step 8
    const reversed = buildReversedAdjacency(graph);
    const assigned = new Set<string>();
    const components: string[][] = [];

    //@step 9
    for (let index = finishOrder.length - 1; index >= 0; index -= 1) {
      const nodeId = finishOrder[index]!;

      //@step 11
      if (assigned.has(nodeId)) {
        continue;
      }

      const component: string[] = [];

      //@step 12
      dfsReverse(nodeId, reversed, assigned, component);

      //@step 13
      components.push(component);
    }

    //@step 15
    return components;

    //#region dfs-original helper collapsed
    function dfsOriginal(nodeId: string): void {
      //@step 5
      visited.add(nodeId);

      //@step 6
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          dfsOriginal(neighbor);
        }
      }

      //@step 7
      finishOrder.push(nodeId);
    }
    //#endregion dfs-original

    //#region dfs-reverse helper collapsed
    function dfsReverse(
      nodeId: string,
      reverseAdjacency: ReadonlyMap<string, readonly string[]>,
      seen: Set<string>,
      component: string[],
    ): void {
      seen.add(nodeId);
      component.push(nodeId);

      for (const neighbor of reverseAdjacency.get(nodeId) ?? []) {
        if (!seen.has(neighbor)) {
          dfsReverse(neighbor, reverseAdjacency, seen, component);
        }
      }
    }
    //#endregion dfs-reverse
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  function buildReversedAdjacency(graph: GraphData): Map<string, string[]> {
    const reversed = new Map<string, string[]>();

    for (const node of graph.nodes) {
      reversed.set(node.id, []);
    }

    for (const edge of graph.edges) {
      reversed.get(edge.to)?.push(edge.from);
    }

    return reversed;
  }
  //#endregion build-reversed
`);

const KOSARAJU_SCC_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Partition a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  function kosarajuScc(graph) {
      const adjacency = buildAdjacency(graph);
      const visited = new Set();
      const finishOrder = [];

      function dfsOriginal(nodeId) {
          //@step 5
          visited.add(nodeId);

          //@step 6
          for (const neighbor of adjacency.get(nodeId) ?? []) {
              if (!visited.has(neighbor)) {
                  dfsOriginal(neighbor);
              }
          }

          //@step 7
          finishOrder.push(nodeId);
      }

      for (const node of graph.nodes) {
          //@step 4
          if (!visited.has(node.id)) {
              dfsOriginal(node.id);
          }
      }

      //@step 8
      const reversed = buildReversedAdjacency(graph);
      const assigned = new Set();
      const components = [];

      function dfsReverse(nodeId, component) {
          assigned.add(nodeId);
          component.push(nodeId);

          for (const neighbor of reversed.get(nodeId) ?? []) {
              if (!assigned.has(neighbor)) {
                  dfsReverse(neighbor, component);
              }
          }
      }

      //@step 9
      for (let index = finishOrder.length - 1; index >= 0; index -= 1) {
          const nodeId = finishOrder[index];

          //@step 11
          if (assigned.has(nodeId)) {
              continue;
          }

          const component = [];

          //@step 12
          dfsReverse(nodeId, component);

          //@step 13
          components.push(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  function buildReversedAdjacency(graph) {
      const reversed = new Map();

      for (const node of graph.nodes) {
          reversed.set(node.id, []);
      }

      for (const edge of graph.edges) {
          reversed.get(edge.to)?.push(edge.from);
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'javascript',
);

const KOSARAJU_SCC_PY = buildStructuredCode(
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
  Partition a directed graph into strongly connected components with Kosaraju's algorithm.
  Input: directed graph.
  Returns: SCCs in reverse finishing-time order.
  """
  //#region kosaraju function open
  //@step 2
  def kosaraju_scc(graph: GraphData) -> list[list[str]]:
      adjacency = build_adjacency(graph)
      visited: set[str] = set()
      finish_order: list[str] = []

      def dfs_original(node_id: str) -> None:
          //@step 5
          visited.add(node_id)

          //@step 6
          for neighbor in adjacency.get(node_id, []):
              if neighbor not in visited:
                  dfs_original(neighbor)

          //@step 7
          finish_order.append(node_id)

      for node in graph.nodes:
          //@step 4
          if node.id not in visited:
              dfs_original(node.id)

      //@step 8
      reversed_adjacency = build_reversed_adjacency(graph)
      assigned: set[str] = set()
      components: list[list[str]] = []

      def dfs_reverse(node_id: str, component: list[str]) -> None:
          assigned.add(node_id)
          component.append(node_id)

          for neighbor in reversed_adjacency.get(node_id, []):
              if neighbor not in assigned:
                  dfs_reverse(neighbor, component)

      //@step 9
      for node_id in reversed(finish_order):
          //@step 11
          if node_id in assigned:
              continue

          component: list[str] = []

          //@step 12
          dfs_reverse(node_id, component)

          //@step 13
          components.append(component)

      //@step 15
      return components
  //#endregion kosaraju

  //#region build-adjacency helper collapsed
  def build_adjacency(graph: GraphData) -> dict[str, list[str]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge.to)

      return adjacency
  //#endregion build-adjacency

  //#region build-reversed helper collapsed
  def build_reversed_adjacency(graph: GraphData) -> dict[str, list[str]]:
      reversed_adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          reversed_adjacency.setdefault(edge.to, []).append(edge.from_id)

      return reversed_adjacency
  //#endregion build-reversed
  `,
  'python',
);

const KOSARAJU_SCC_CS = buildStructuredCode(
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
  /// Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
  /// Input: directed graph.
  /// Returns: SCCs in reverse finishing-time order.
  /// </summary>
  //#region kosaraju function open
  //@step 2
  public static List<List<string>> KosarajuScc(GraphData graph)
  {
      var adjacency = BuildAdjacency(graph);
      var visited = new HashSet<string>();
      var finishOrder = new List<string>();

      void DfsOriginal(string nodeId)
      {
          //@step 5
          visited.Add(nodeId);

          //@step 6
          foreach (var neighbor in adjacency.GetValueOrDefault(nodeId, []))
          {
              if (!visited.Contains(neighbor))
              {
                  DfsOriginal(neighbor);
              }
          }

          //@step 7
          finishOrder.Add(nodeId);
      }

      foreach (var node in graph.Nodes)
      {
          //@step 4
          if (!visited.Contains(node.Id))
          {
              DfsOriginal(node.Id);
          }
      }

      //@step 8
      var reversed = BuildReversedAdjacency(graph);
      var assigned = new HashSet<string>();
      var components = new List<List<string>>();

      void DfsReverse(string nodeId, List<string> component)
      {
          assigned.Add(nodeId);
          component.Add(nodeId);

          foreach (var neighbor in reversed.GetValueOrDefault(nodeId, []))
          {
              if (!assigned.Contains(neighbor))
              {
                  DfsReverse(neighbor, component);
              }
          }
      }

      //@step 9
      for (var index = finishOrder.Count - 1; index >= 0; index -= 1)
      {
          var nodeId = finishOrder[index];

          //@step 11
          if (assigned.Contains(nodeId))
          {
              continue;
          }

          var component = new List<string>();

          //@step 12
          DfsReverse(nodeId, component);

          //@step 13
          components.Add(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  private static Dictionary<string, List<string>> BuildReversedAdjacency(GraphData graph)
  {
      var reversed = new Dictionary<string, List<string>>();

      foreach (var node in graph.Nodes)
      {
          reversed[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          reversed[edge.To].Add(edge.From);
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'csharp',
);

const KOSARAJU_SCC_JAVA = buildStructuredCode(
  `
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

  //#region kosaraju function open
  /**
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //@step 2
  public static List<List<String>> kosarajuScc(GraphData graph) {
      Map<String, List<String>> adjacency = buildAdjacency(graph);
      Set<String> visited = new HashSet<>();
      List<String> finishOrder = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          //@step 4
          if (!visited.contains(node.id())) {
              dfsOriginal(node.id(), adjacency, visited, finishOrder);
          }
      }

      //@step 8
      Map<String, List<String>> reversed = buildReversedAdjacency(graph);
      Set<String> assigned = new HashSet<>();
      List<List<String>> components = new ArrayList<>();

      //@step 9
      for (int index = finishOrder.size() - 1; index >= 0; index -= 1) {
          String nodeId = finishOrder.get(index);

          //@step 11
          if (assigned.contains(nodeId)) {
              continue;
          }

          List<String> component = new ArrayList<>();

          //@step 12
          dfsReverse(nodeId, reversed, assigned, component);

          //@step 13
          components.add(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

  //#region dfs-original helper collapsed
  private static void dfsOriginal(
      String nodeId,
      Map<String, List<String>> adjacency,
      Set<String> visited,
      List<String> finishOrder
  ) {
      //@step 5
      visited.add(nodeId);

      //@step 6
      for (String neighbor : adjacency.getOrDefault(nodeId, List.of())) {
          if (!visited.contains(neighbor)) {
              dfsOriginal(neighbor, adjacency, visited, finishOrder);
          }
      }

      //@step 7
      finishOrder.add(nodeId);
  }
  //#endregion dfs-original

  //#region dfs-reverse helper collapsed
  private static void dfsReverse(
      String nodeId,
      Map<String, List<String>> reversed,
      Set<String> assigned,
      List<String> component
  ) {
      assigned.add(nodeId);
      component.add(nodeId);

      for (String neighbor : reversed.getOrDefault(nodeId, List.of())) {
          if (!assigned.contains(neighbor)) {
              dfsReverse(neighbor, reversed, assigned, component);
          }
      }
  }
  //#endregion dfs-reverse

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

  //#region build-reversed helper collapsed
  private static Map<String, List<String>> buildReversedAdjacency(GraphData graph) {
      Map<String, List<String>> reversed = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          reversed.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          reversed.get(edge.to()).add(edge.from());
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'java',
);

const KOSARAJU_SCC_CPP = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  std::vector<std::vector<std::string>> kosarajuScc(const GraphData& graph) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_set<std::string> visited;
      std::vector<std::string> finishOrder;

      for (const auto& node : graph.nodes) {
          //@step 4
          if (!visited.contains(node.id)) {
              dfsOriginal(node.id, adjacency, visited, finishOrder);
          }
      }

      //@step 8
      auto reversed = buildReversedAdjacency(graph);
      std::unordered_set<std::string> assigned;
      std::vector<std::vector<std::string>> components;

      //@step 9
      for (int index = static_cast<int>(finishOrder.size()) - 1; index >= 0; index -= 1) {
          const auto& nodeId = finishOrder[index];

          //@step 11
          if (assigned.contains(nodeId)) {
              continue;
          }

          std::vector<std::string> component;

          //@step 12
          dfsReverse(nodeId, reversed, assigned, component);

          //@step 13
          components.push_back(component);
      }

      //@step 15
      return components;
  }
  //#endregion kosaraju

  //#region dfs-original helper collapsed
  void dfsOriginal(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& adjacency,
      std::unordered_set<std::string>& visited,
      std::vector<std::string>& finishOrder
  ) {
      //@step 5
      visited.insert(nodeId);

      //@step 6
      for (const auto& neighbor : adjacency.at(nodeId)) {
          if (!visited.contains(neighbor)) {
              dfsOriginal(neighbor, adjacency, visited, finishOrder);
          }
      }

      //@step 7
      finishOrder.push_back(nodeId);
  }
  //#endregion dfs-original

  //#region dfs-reverse helper collapsed
  void dfsReverse(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<std::string>>& reversed,
      std::unordered_set<std::string>& assigned,
      std::vector<std::string>& component
  ) {
      assigned.insert(nodeId);
      component.push_back(nodeId);

      for (const auto& neighbor : reversed.at(nodeId)) {
          if (!assigned.contains(neighbor)) {
              dfsReverse(neighbor, reversed, assigned, component);
          }
      }
  }
  //#endregion dfs-reverse

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

  //#region build-reversed helper collapsed
  std::unordered_map<std::string, std::vector<std::string>> buildReversedAdjacency(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<std::string>> reversed;

      for (const auto& node : graph.nodes) {
          reversed[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          reversed[edge.to].push_back(edge.from);
      }

      return reversed;
  }
  //#endregion build-reversed
  `,
  'cpp',
);

const KOSARAJU_SCC_GO = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  func KosarajuScc(graph GraphData) [][]string {
      adjacency := buildAdjacency(graph)
      visited := map[string]struct{}{}
      finishOrder := []string{}

      var dfsOriginal func(string)
      dfsOriginal = func(nodeID string) {
          //@step 5
          visited[nodeID] = struct{}{}

          //@step 6
          for _, neighbor := range adjacency[nodeID] {
              if _, seen := visited[neighbor]; !seen {
                  dfsOriginal(neighbor)
              }
          }

          //@step 7
          finishOrder = append(finishOrder, nodeID)
      }

      for _, node := range graph.Nodes {
          //@step 4
          if _, seen := visited[node.ID]; !seen {
              dfsOriginal(node.ID)
          }
      }

      //@step 8
      reversed := buildReversedAdjacency(graph)
      assigned := map[string]struct{}{}
      components := [][]string{}

      var dfsReverse func(string, *[]string)
      dfsReverse = func(nodeID string, component *[]string) {
          assigned[nodeID] = struct{}{}
          *component = append(*component, nodeID)

          for _, neighbor := range reversed[nodeID] {
              if _, seen := assigned[neighbor]; !seen {
                  dfsReverse(neighbor, component)
              }
          }
      }

      //@step 9
      for index := len(finishOrder) - 1; index >= 0; index -= 1 {
          nodeID := finishOrder[index]

          //@step 11
          if _, seen := assigned[nodeID]; seen {
              continue
          }

          component := []string{}

          //@step 12
          dfsReverse(nodeID, &component)

          //@step 13
          components = append(components, component)
      }

      //@step 15
      return components
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  func buildReversedAdjacency(graph GraphData) map[string][]string {
      reversed := make(map[string][]string)

      for _, node := range graph.Nodes {
          reversed[node.ID] = []string{}
      }

      for _, edge := range graph.Edges {
          reversed[edge.To] = append(reversed[edge.To], edge.From)
      }

      return reversed
  }
  //#endregion build-reversed
  `,
  'go',
);

const KOSARAJU_SCC_RUST = buildStructuredCode(
  `
  use std::collections::{HashMap, HashSet};

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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  fn kosaraju_scc(graph: &GraphData) -> Vec<Vec<String>> {
      let adjacency = build_adjacency(graph);
      let mut visited = HashSet::new();
      let mut finish_order = Vec::new();

      for node in &graph.nodes {
          //@step 4
          if !visited.contains(&node.id) {
              dfs_original(&node.id, &adjacency, &mut visited, &mut finish_order);
          }
      }

      //@step 8
      let reversed = build_reversed_adjacency(graph);
      let mut assigned = HashSet::new();
      let mut components = Vec::new();

      //@step 9
      for node_id in finish_order.iter().rev() {
          //@step 11
          if assigned.contains(node_id) {
              continue;
          }

          let mut component = Vec::new();

          //@step 12
          dfs_reverse(node_id, &reversed, &mut assigned, &mut component);

          //@step 13
          components.push(component);
      }

      //@step 15
      components
  }
  //#endregion kosaraju

  //#region dfs-original helper collapsed
  fn dfs_original(
      node_id: &str,
      adjacency: &HashMap<String, Vec<String>>,
      visited: &mut HashSet<String>,
      finish_order: &mut Vec<String>,
  ) {
      //@step 5
      visited.insert(node_id.to_string());

      //@step 6
      for neighbor in adjacency.get(node_id).cloned().unwrap_or_default() {
          if !visited.contains(&neighbor) {
              dfs_original(&neighbor, adjacency, visited, finish_order);
          }
      }

      //@step 7
      finish_order.push(node_id.to_string());
  }
  //#endregion dfs-original

  //#region dfs-reverse helper collapsed
  fn dfs_reverse(
      node_id: &str,
      reverse_adjacency: &HashMap<String, Vec<String>>,
      seen: &mut HashSet<String>,
      component: &mut Vec<String>,
  ) {
      seen.insert(node_id.to_string());
      component.push(node_id.to_string());

      for neighbor in reverse_adjacency.get(node_id).cloned().unwrap_or_default() {
          if !seen.contains(&neighbor) {
              dfs_reverse(&neighbor, reverse_adjacency, seen, component);
          }
      }
  }
  //#endregion dfs-reverse

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

  //#region build-reversed helper collapsed
  fn build_reversed_adjacency(graph: &GraphData) -> HashMap<String, Vec<String>> {
      let mut reversed = HashMap::new();

      for node in &graph.nodes {
          reversed.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          reversed.entry(edge.to.clone()).or_insert_with(Vec::new).push(edge.from.clone());
      }

      reversed
  }
  //#endregion build-reversed
  `,
  'rust',
);

const KOSARAJU_SCC_SWIFT = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  func kosarajuScc(graph: GraphData) -> [[String]] {
      let adjacency = buildAdjacency(graph: graph)
      var visited = Set<String>()
      var finishOrder: [String] = []

      func dfsOriginal(_ nodeId: String) {
          //@step 5
          visited.insert(nodeId)

          //@step 6
          for neighbor in adjacency[nodeId] ?? [] {
              if !visited.contains(neighbor) {
                  dfsOriginal(neighbor)
              }
          }

          //@step 7
          finishOrder.append(nodeId)
      }

      for node in graph.nodes {
          //@step 4
          if !visited.contains(node.id) {
              dfsOriginal(node.id)
          }
      }

      //@step 8
      let reversed = buildReversedAdjacency(graph: graph)
      var assigned = Set<String>()
      var components: [[String]] = []

      func dfsReverse(_ nodeId: String, component: inout [String]) {
          assigned.insert(nodeId)
          component.append(nodeId)

          for neighbor in reversed[nodeId] ?? [] {
              if !assigned.contains(neighbor) {
                  dfsReverse(neighbor, component: &component)
              }
          }
      }

      //@step 9
      for nodeId in finishOrder.reversed() {
          //@step 11
          if assigned.contains(nodeId) {
              continue
          }

          var component: [String] = []

          //@step 12
          dfsReverse(nodeId, component: &component)

          //@step 13
          components.append(component)
      }

      //@step 15
      return components
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  func buildReversedAdjacency(graph: GraphData) -> [String: [String]] {
      var reversed: [String: [String]] = [:]

      for node in graph.nodes {
          reversed[node.id] = []
      }

      for edge in graph.edges {
          reversed[edge.to, default: []].append(edge.from)
      }

      return reversed
  }
  //#endregion build-reversed
  `,
  'swift',
);

const KOSARAJU_SCC_PHP = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   *
   * @return list<list<string>>
   */
  //#region kosaraju function open
  //@step 2
  function kosarajuScc(GraphData $graph): array
  {
      $adjacency = buildAdjacency($graph);
      $visited = [];
      $finishOrder = [];

      $dfsOriginal = function (string $nodeId) use (&$dfsOriginal, $adjacency, &$visited, &$finishOrder): void {
          //@step 5
          $visited[$nodeId] = true;

          //@step 6
          foreach ($adjacency[$nodeId] ?? [] as $neighbor) {
              if (!isset($visited[$neighbor])) {
                  $dfsOriginal($neighbor);
              }
          }

          //@step 7
          $finishOrder[] = $nodeId;
      };

      foreach ($graph->nodes as $node) {
          //@step 4
          if (!isset($visited[$node->id])) {
              $dfsOriginal($node->id);
          }
      }

      //@step 8
      $reversed = buildReversedAdjacency($graph);
      $assigned = [];
      $components = [];

      $dfsReverse = function (string $nodeId, array &$component) use (&$dfsReverse, $reversed, &$assigned): void {
          $assigned[$nodeId] = true;
          $component[] = $nodeId;

          foreach ($reversed[$nodeId] ?? [] as $neighbor) {
              if (!isset($assigned[$neighbor])) {
                  $dfsReverse($neighbor, $component);
              }
          }
      };

      //@step 9
      for ($index = count($finishOrder) - 1; $index >= 0; $index -= 1) {
          $nodeId = $finishOrder[$index];

          //@step 11
          if (isset($assigned[$nodeId])) {
              continue;
          }

          $component = [];

          //@step 12
          $dfsReverse($nodeId, $component);

          //@step 13
          $components[] = $component;
      }

      //@step 15
      return $components;
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  function buildReversedAdjacency(GraphData $graph): array
  {
      $reversed = [];

      foreach ($graph->nodes as $node) {
          $reversed[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $reversed[$edge->to][] = $edge->from;
      }

      return $reversed;
  }
  //#endregion build-reversed
  `,
  'php',
);

const KOSARAJU_SCC_KOTLIN = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Kosaraju's algorithm.
   * Input: directed graph.
   * Returns: SCCs in reverse finishing-time order.
   */
  //#region kosaraju function open
  //@step 2
  fun kosarajuScc(graph: GraphData): List<List<String>> {
      val adjacency = buildAdjacency(graph)
      val visited = mutableSetOf<String>()
      val finishOrder = mutableListOf<String>()

      fun dfsOriginal(nodeId: String) {
          //@step 5
          visited += nodeId

          //@step 6
          for (neighbor in adjacency[nodeId].orEmpty()) {
              if (neighbor !in visited) {
                  dfsOriginal(neighbor)
              }
          }

          //@step 7
          finishOrder += nodeId
      }

      for (node in graph.nodes) {
          //@step 4
          if (node.id !in visited) {
              dfsOriginal(node.id)
          }
      }

      //@step 8
      val reversed = buildReversedAdjacency(graph)
      val assigned = mutableSetOf<String>()
      val components = mutableListOf<List<String>>()

      fun dfsReverse(nodeId: String, component: MutableList<String>) {
          assigned += nodeId
          component += nodeId

          for (neighbor in reversed[nodeId].orEmpty()) {
              if (neighbor !in assigned) {
                  dfsReverse(neighbor, component)
              }
          }
      }

      //@step 9
      for (nodeId in finishOrder.asReversed()) {
          //@step 11
          if (nodeId in assigned) {
              continue
          }

          val component = mutableListOf<String>()

          //@step 12
          dfsReverse(nodeId, component)

          //@step 13
          components += component
      }

      //@step 15
      return components
  }
  //#endregion kosaraju

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

  //#region build-reversed helper collapsed
  fun buildReversedAdjacency(graph: GraphData): MutableMap<String, MutableList<String>> {
      val reversed = mutableMapOf<String, MutableList<String>>()

      for (node in graph.nodes) {
          reversed[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          reversed.getOrPut(edge.to) { mutableListOf() }.add(edge.from)
      }

      return reversed
  }
  //#endregion build-reversed
  `,
  'kotlin',
);

export const KOSARAJU_SCC_CODE = KOSARAJU_SCC_TS.lines;
export const KOSARAJU_SCC_CODE_REGIONS = KOSARAJU_SCC_TS.regions;
export const KOSARAJU_SCC_CODE_HIGHLIGHT_MAP = KOSARAJU_SCC_TS.highlightMap;
export const KOSARAJU_SCC_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KOSARAJU_SCC_TS.lines,
    regions: KOSARAJU_SCC_TS.regions,
    highlightMap: KOSARAJU_SCC_TS.highlightMap,
    source: KOSARAJU_SCC_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: KOSARAJU_SCC_JS.lines,
    regions: KOSARAJU_SCC_JS.regions,
    highlightMap: KOSARAJU_SCC_JS.highlightMap,
    source: KOSARAJU_SCC_JS.source,
  },
  python: {
    language: 'python',
    lines: KOSARAJU_SCC_PY.lines,
    regions: KOSARAJU_SCC_PY.regions,
    highlightMap: KOSARAJU_SCC_PY.highlightMap,
    source: KOSARAJU_SCC_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: KOSARAJU_SCC_CS.lines,
    regions: KOSARAJU_SCC_CS.regions,
    highlightMap: KOSARAJU_SCC_CS.highlightMap,
    source: KOSARAJU_SCC_CS.source,
  },
  java: {
    language: 'java',
    lines: KOSARAJU_SCC_JAVA.lines,
    regions: KOSARAJU_SCC_JAVA.regions,
    highlightMap: KOSARAJU_SCC_JAVA.highlightMap,
    source: KOSARAJU_SCC_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: KOSARAJU_SCC_CPP.lines,
    regions: KOSARAJU_SCC_CPP.regions,
    highlightMap: KOSARAJU_SCC_CPP.highlightMap,
    source: KOSARAJU_SCC_CPP.source,
  },
  go: {
    language: 'go',
    lines: KOSARAJU_SCC_GO.lines,
    regions: KOSARAJU_SCC_GO.regions,
    highlightMap: KOSARAJU_SCC_GO.highlightMap,
    source: KOSARAJU_SCC_GO.source,
  },
  rust: {
    language: 'rust',
    lines: KOSARAJU_SCC_RUST.lines,
    regions: KOSARAJU_SCC_RUST.regions,
    highlightMap: KOSARAJU_SCC_RUST.highlightMap,
    source: KOSARAJU_SCC_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: KOSARAJU_SCC_SWIFT.lines,
    regions: KOSARAJU_SCC_SWIFT.regions,
    highlightMap: KOSARAJU_SCC_SWIFT.highlightMap,
    source: KOSARAJU_SCC_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: KOSARAJU_SCC_PHP.lines,
    regions: KOSARAJU_SCC_PHP.regions,
    highlightMap: KOSARAJU_SCC_PHP.highlightMap,
    source: KOSARAJU_SCC_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: KOSARAJU_SCC_KOTLIN.lines,
    regions: KOSARAJU_SCC_KOTLIN.regions,
    highlightMap: KOSARAJU_SCC_KOTLIN.highlightMap,
    source: KOSARAJU_SCC_KOTLIN.source,
  },
};
