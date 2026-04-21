import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const TARJAN_SCC_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Partition a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  function tarjanScc(graph) {
      const adjacency = buildAdjacency(graph);
      const index = new Map();
      const low = new Map();
      const stack = [];
      const onStack = new Set();
      const components = [];
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
      function strongConnect(nodeId) {
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
                  low.set(nodeId, Math.min(low.get(nodeId), low.get(neighbor)));
                  continue;
              }

              if (onStack.has(neighbor)) {
                  //@step 13
                  low.set(nodeId, Math.min(low.get(nodeId), index.get(neighbor)));
                  continue;
              }

              //@step 14
              continue;
          }

          if (low.get(nodeId) === index.get(nodeId)) {
              const component = [];

              //@step 16
              while (stack.length > 0) {
                  const member = stack.pop();
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

const TARJAN_SCC_GO = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  func TarjanScc(graph GraphData) [][]string {
      adjacency := buildAdjacency(graph)
      index := map[string]int{}
      low := map[string]int{}
      stack := []string{}
      onStack := map[string]struct{}{}
      components := [][]string{}
      nextIndex := 0

      for _, node := range graph.Nodes {
          index[node.ID] = 0
          low[node.ID] = 0
      }

      var strongConnect func(string)
      strongConnect = func(nodeID string) {
          nextIndex += 1
          //@step 6
          index[nodeID] = nextIndex
          low[nodeID] = nextIndex
          stack = append(stack, nodeID)
          onStack[nodeID] = struct{}{}

          //@step 8
          for _, neighbor := range adjacency[nodeID] {
              if index[neighbor] == 0 {
                  //@step 10
                  strongConnect(neighbor)

                  //@step 11
                  if low[neighbor] < low[nodeID] {
                      low[nodeID] = low[neighbor]
                  }
                  continue
              }

              if _, seen := onStack[neighbor]; seen {
                  //@step 13
                  if index[neighbor] < low[nodeID] {
                      low[nodeID] = index[neighbor]
                  }
                  continue
              }

              //@step 14
              continue
          }

          if low[nodeID] == index[nodeID] {
              component := []string{}

              //@step 16
              for len(stack) > 0 {
                  lastIndex := len(stack) - 1
                  member := stack[lastIndex]
                  stack = stack[:lastIndex]
                  delete(onStack, member)
                  component = append(component, member)

                  if member == nodeID {
                      break
                  }
              }

              components = append(components, component)
              return
          }

          //@step 17
          return
      }

      for _, node := range graph.Nodes {
          //@step 4
          if index[node.ID] == 0 {
              strongConnect(node.ID)
          }
      }

      //@step 18
      return components
  }
  //#endregion tarjan

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

const TARJAN_SCC_RUST = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  fn tarjan_scc(graph: &GraphData) -> Vec<Vec<String>> {
      let adjacency = build_adjacency(graph);
      let mut index = HashMap::new();
      let mut low = HashMap::new();
      let mut stack = Vec::new();
      let mut on_stack = HashSet::new();
      let mut components = Vec::new();
      let mut next_index = 0;

      for node in &graph.nodes {
          index.insert(node.id.clone(), 0);
          low.insert(node.id.clone(), 0);
      }

      for node in &graph.nodes {
          //@step 4
          if index.get(&node.id).copied().unwrap_or(0) == 0 {
              strong_connect(
                  &node.id,
                  &adjacency,
                  &mut index,
                  &mut low,
                  &mut stack,
                  &mut on_stack,
                  &mut components,
                  &mut next_index,
              );
          }
      }

      //@step 18
      components
  }
  //#endregion tarjan

  //#region strong-connect helper collapsed
  fn strong_connect(
      node_id: &str,
      adjacency: &HashMap<String, Vec<String>>,
      index: &mut HashMap<String, i32>,
      low: &mut HashMap<String, i32>,
      stack: &mut Vec<String>,
      on_stack: &mut HashSet<String>,
      components: &mut Vec<Vec<String>>,
      next_index: &mut i32,
  ) {
      *next_index += 1;
      //@step 6
      index.insert(node_id.to_string(), *next_index);
      low.insert(node_id.to_string(), *next_index);
      stack.push(node_id.to_string());
      on_stack.insert(node_id.to_string());

      //@step 8
      for neighbor in adjacency.get(node_id).cloned().unwrap_or_default() {
          if index.get(&neighbor).copied().unwrap_or(0) == 0 {
              //@step 10
              strong_connect(
                  &neighbor,
                  adjacency,
                  index,
                  low,
                  stack,
                  on_stack,
                  components,
                  next_index,
              );

              //@step 11
              let next_low = std::cmp::min(
                  low.get(node_id).copied().unwrap_or(i32::MAX),
                  low.get(&neighbor).copied().unwrap_or(i32::MAX),
              );
              low.insert(node_id.to_string(), next_low);
              continue;
          }

          if on_stack.contains(&neighbor) {
              //@step 13
              let next_low = std::cmp::min(
                  low.get(node_id).copied().unwrap_or(i32::MAX),
                  index.get(&neighbor).copied().unwrap_or(i32::MAX),
              );
              low.insert(node_id.to_string(), next_low);
              continue;
          }

          //@step 14
          continue;
      }

      if low.get(node_id).copied().unwrap_or(0) == index.get(node_id).copied().unwrap_or(0) {
          let mut component = Vec::new();

          //@step 16
          while !stack.is_empty() {
              let member = stack.pop().unwrap();
              on_stack.remove(&member);
              component.push(member.clone());

              if member == node_id {
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

const TARJAN_SCC_SWIFT = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  func tarjanScc(graph: GraphData) -> [[String]] {
      let adjacency = buildAdjacency(graph: graph)
      var index: [String: Int] = [:]
      var low: [String: Int] = [:]
      var stack: [String] = []
      var onStack = Set<String>()
      var components: [[String]] = []
      var nextIndex = 0

      for node in graph.nodes {
          index[node.id] = 0
          low[node.id] = 0
      }

      func strongConnect(_ nodeId: String) {
          nextIndex += 1
          //@step 6
          index[nodeId] = nextIndex
          low[nodeId] = nextIndex
          stack.append(nodeId)
          onStack.insert(nodeId)

          //@step 8
          for neighbor in adjacency[nodeId] ?? [] {
              if (index[neighbor] ?? 0) == 0 {
                  //@step 10
                  strongConnect(neighbor)

                  //@step 11
                  low[nodeId] = min(low[nodeId] ?? .max, low[neighbor] ?? .max)
                  continue
              }

              if onStack.contains(neighbor) {
                  //@step 13
                  low[nodeId] = min(low[nodeId] ?? .max, index[neighbor] ?? .max)
                  continue
              }

              //@step 14
              continue
          }

          if low[nodeId] == index[nodeId] {
              var component: [String] = []

              //@step 16
              while !stack.isEmpty {
                  let member = stack.removeLast()
                  onStack.remove(member)
                  component.append(member)

                  if member == nodeId {
                      break
                  }
              }

              components.append(component)
              return
          }

          //@step 17
          return
      }

      for node in graph.nodes {
          //@step 4
          if (index[node.id] ?? 0) == 0 {
              strongConnect(node.id)
          }
      }

      //@step 18
      return components
  }
  //#endregion tarjan

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

const TARJAN_SCC_PHP = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   *
   * @return list<list<string>>
   */
  //#region tarjan function open
  //@step 2
  function tarjanScc(GraphData $graph): array
  {
      $adjacency = buildAdjacency($graph);
      $index = [];
      $low = [];
      $stack = [];
      $onStack = [];
      $components = [];
      $nextIndex = 0;

      foreach ($graph->nodes as $node) {
          $index[$node->id] = null;
          $low[$node->id] = null;
      }

      $strongConnect = function (string $nodeId) use (
          &$strongConnect,
          $adjacency,
          &$index,
          &$low,
          &$stack,
          &$onStack,
          &$components,
          &$nextIndex,
      ): void {
          $nextIndex += 1;
          //@step 6
          $index[$nodeId] = $nextIndex;
          $low[$nodeId] = $nextIndex;
          $stack[] = $nodeId;
          $onStack[$nodeId] = true;

          //@step 8
          foreach ($adjacency[$nodeId] ?? [] as $neighbor) {
              if (($index[$neighbor] ?? null) === null) {
                  //@step 10
                  $strongConnect($neighbor);

                  //@step 11
                  $low[$nodeId] = min($low[$nodeId], $low[$neighbor]);
                  continue;
              }

              if (isset($onStack[$neighbor])) {
                  //@step 13
                  $low[$nodeId] = min($low[$nodeId], $index[$neighbor]);
                  continue;
              }

              //@step 14
              continue;
          }

          if ($low[$nodeId] === $index[$nodeId]) {
              $component = [];

              //@step 16
              while ($stack !== []) {
                  $member = array_pop($stack);
                  unset($onStack[$member]);
                  $component[] = $member;

                  if ($member === $nodeId) {
                      break;
                  }
              }

              $components[] = $component;
              return;
          }

          //@step 17
          return;
      };

      foreach ($graph->nodes as $node) {
          //@step 4
          if (($index[$node->id] ?? null) === null) {
              $strongConnect($node->id);
          }
      }

      //@step 18
      return $components;
  }
  //#endregion tarjan

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

const TARJAN_SCC_KOTLIN = buildStructuredCode(
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
   * Partitions a directed graph into strongly connected components with Tarjan's algorithm.
   * Input: directed graph.
   * Returns: SCCs in the order they are emitted by the DFS.
   */
  //#region tarjan function open
  //@step 2
  fun tarjanScc(graph: GraphData): List<List<String>> {
      val adjacency = buildAdjacency(graph)
      val index = mutableMapOf<String, Int?>()
      val low = mutableMapOf<String, Int?>()
      val stack = mutableListOf<String>()
      val onStack = mutableSetOf<String>()
      val components = mutableListOf<List<String>>()
      var nextIndex = 0

      for (node in graph.nodes) {
          index[node.id] = null
          low[node.id] = null
      }

      fun strongConnect(nodeId: String) {
          nextIndex += 1
          //@step 6
          index[nodeId] = nextIndex
          low[nodeId] = nextIndex
          stack += nodeId
          onStack += nodeId

          //@step 8
          for (neighbor in adjacency[nodeId].orEmpty()) {
              if (index[neighbor] == null) {
                  //@step 10
                  strongConnect(neighbor)

                  //@step 11
                  low[nodeId] = minOf(low[nodeId]!!, low[neighbor]!!)
                  continue
              }

              if (neighbor in onStack) {
                  //@step 13
                  low[nodeId] = minOf(low[nodeId]!!, index[neighbor]!!)
                  continue
              }

              //@step 14
              continue
          }

          if (low[nodeId] == index[nodeId]) {
              val component = mutableListOf<String>()

              //@step 16
              while (stack.isNotEmpty()) {
                  val member = stack.removeAt(stack.lastIndex)
                  onStack -= member
                  component += member

                  if (member == nodeId) {
                      break
                  }
              }

              components += component
              return
          }

          //@step 17
          return
      }

      for (node in graph.nodes) {
          //@step 4
          if (index[node.id] == null) {
              strongConnect(node.id)
          }
      }

      //@step 18
      return components
  }
  //#endregion tarjan

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
  javascript: {
    language: 'javascript',
    lines: TARJAN_SCC_JS.lines,
    regions: TARJAN_SCC_JS.regions,
    highlightMap: TARJAN_SCC_JS.highlightMap,
    source: TARJAN_SCC_JS.source,
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
  go: {
    language: 'go',
    lines: TARJAN_SCC_GO.lines,
    regions: TARJAN_SCC_GO.regions,
    highlightMap: TARJAN_SCC_GO.highlightMap,
    source: TARJAN_SCC_GO.source,
  },
  rust: {
    language: 'rust',
    lines: TARJAN_SCC_RUST.lines,
    regions: TARJAN_SCC_RUST.regions,
    highlightMap: TARJAN_SCC_RUST.highlightMap,
    source: TARJAN_SCC_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: TARJAN_SCC_SWIFT.lines,
    regions: TARJAN_SCC_SWIFT.regions,
    highlightMap: TARJAN_SCC_SWIFT.highlightMap,
    source: TARJAN_SCC_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: TARJAN_SCC_PHP.lines,
    regions: TARJAN_SCC_PHP.regions,
    highlightMap: TARJAN_SCC_PHP.highlightMap,
    source: TARJAN_SCC_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: TARJAN_SCC_KOTLIN.lines,
    regions: TARJAN_SCC_KOTLIN.regions,
    highlightMap: TARJAN_SCC_KOTLIN.highlightMap,
    source: TARJAN_SCC_KOTLIN.source,
  },
};
