import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const EULER_PATH_CIRCUIT_TS = buildStructuredCode(`
  //#region graph-types interface collapsed
  interface GraphNode {
    readonly id: string;
  }

  interface GraphEdge {
    readonly id: string;
    readonly from: string;
    readonly to: string;
  }

  interface GraphData {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
  }

  interface EulerAdjacencyEntry {
    readonly edgeId: string;
    readonly neighbor: string;
  }
  //#endregion graph-types

  /**
   * Build an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  function hierholzer(graph: GraphData): string[] {
    const adjacency = buildUndirectedAdjacency(graph);
    const oddNodes = graph.nodes
      .filter((node) => ((adjacency.get(node.id)?.length ?? 0) & 1) === 1)
      .map((node) => node.id);

    //@step 2
    const start = oddNodes[0] ?? graph.nodes[0]?.id ?? '';
    const stack: string[] = [start];
    const trail: string[] = [];
    const usedEdges = new Set<string>();

    while (stack.length > 0) {
      //@step 4
      const current = stack[stack.length - 1]!;
      const next = findUnusedEdge(current, adjacency, usedEdges);

      //@step 5
      if (next !== null) {
        usedEdges.add(next.edgeId);

        //@step 6
        stack.push(next.neighbor);
        continue;
      }

      const sealed = stack.pop()!;

      //@step 8
      trail.push(sealed);
    }

    //@step 9
    return [...trail].reverse();
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(
    graph: GraphData,
  ): Map<string, EulerAdjacencyEntry[]> {
    const adjacency = new Map<string, EulerAdjacencyEntry[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push({ edgeId: edge.id, neighbor: edge.to });
      adjacency.get(edge.to)?.push({ edgeId: edge.id, neighbor: edge.from });
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  function findUnusedEdge(
    nodeId: string,
    adjacency: ReadonlyMap<string, readonly EulerAdjacencyEntry[]>,
    usedEdges: ReadonlySet<string>,
  ): EulerAdjacencyEntry | null {
    for (const entry of adjacency.get(nodeId) ?? []) {
      if (!usedEdges.has(entry.edgeId)) {
        return entry;
      }
    }

    return null;
  }
  //#endregion find-unused
`);

const EULER_PATH_CIRCUIT_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ id: string, from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   * @typedef {{ edgeId: string, neighbor: string }} EulerAdjacencyEntry
   */
  //#endregion graph-types

  /**
   * Build an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  function hierholzer(graph) {
      const adjacency = buildUndirectedAdjacency(graph);
      const oddNodes = graph.nodes
          .filter((node) => ((adjacency.get(node.id)?.length ?? 0) & 1) === 1)
          .map((node) => node.id);

      //@step 2
      const start = oddNodes[0] ?? graph.nodes[0]?.id ?? '';
      const stack = [start];
      const trail = [];
      const usedEdges = new Set();

      while (stack.length > 0) {
          //@step 4
          const current = stack[stack.length - 1];
          const next = findUnusedEdge(current, adjacency, usedEdges);

          //@step 5
          if (next !== null) {
              usedEdges.add(next.edgeId);

              //@step 6
              stack.push(next.neighbor);
              continue;
          }

          const sealed = stack.pop();

          //@step 8
          trail.push(sealed);
      }

      //@step 9
      return [...trail].reverse();
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(graph) {
      const adjacency = new Map();

      for (const node of graph.nodes) {
          adjacency.set(node.id, []);
      }

      for (const edge of graph.edges) {
          adjacency.get(edge.from)?.push({ edgeId: edge.id, neighbor: edge.to });
          adjacency.get(edge.to)?.push({ edgeId: edge.id, neighbor: edge.from });
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  function findUnusedEdge(nodeId, adjacency, usedEdges) {
      for (const entry of adjacency.get(nodeId) ?? []) {
          if (!usedEdges.has(entry.edgeId)) {
              return entry;
          }
      }

      return null;
  }
  //#endregion find-unused
  `,
  'javascript',
);

const EULER_PATH_CIRCUIT_PY = buildStructuredCode(
  `
  from dataclasses import dataclass


  //#region graph-types interface collapsed
  @dataclass(frozen=True)
  class GraphNode:
      id: str


  @dataclass(frozen=True)
  class GraphEdge:
      id: str
      from_id: str
      to: str


  @dataclass(frozen=True)
  class GraphData:
      nodes: list[GraphNode]
      edges: list[GraphEdge]
  //#endregion graph-types

  """
  Build an Euler path or circuit with Hierholzer's algorithm.
  Input: undirected graph with an Eulerian path/circuit.
  Returns: node order of the Euler walk.
  """
  //#region hierholzer function open
  def hierholzer(graph: GraphData) -> list[str]:
      adjacency = build_undirected_adjacency(graph)
      odd_nodes = [
          node.id
          for node in graph.nodes
          if len(adjacency.get(node.id, [])) % 2 == 1
      ]

      //@step 2
      start = odd_nodes[0] if odd_nodes else (graph.nodes[0].id if graph.nodes else "")
      stack = [start]
      trail: list[str] = []
      used_edges: set[str] = set()

      while stack:
          //@step 4
          current = stack[-1]
          next_edge = find_unused_edge(current, adjacency, used_edges)

          //@step 5
          if next_edge is not None:
              used_edges.add(next_edge["edge_id"])

              //@step 6
              stack.append(next_edge["neighbor"])
              continue

          sealed = stack.pop()

          //@step 8
          trail.append(sealed)

      //@step 9
      return list(reversed(trail))
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  def build_undirected_adjacency(
      graph: GraphData,
  ) -> dict[str, list[dict[str, str]]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(
              {"edge_id": edge.id, "neighbor": edge.to}
          )
          adjacency.setdefault(edge.to, []).append(
              {"edge_id": edge.id, "neighbor": edge.from_id}
          )

      return adjacency
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  def find_unused_edge(
      node_id: str,
      adjacency: dict[str, list[dict[str, str]]],
      used_edges: set[str],
  ) -> dict[str, str] | None:
      for entry in adjacency.get(node_id, []):
          if entry["edge_id"] not in used_edges:
              return entry

      return None
  //#endregion find-unused
  `,
  'python',
);

const EULER_PATH_CIRCUIT_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct GraphEdge(string Id, string From, string To);

  public sealed record GraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<GraphEdge> Edges
  );

  public readonly record struct EulerAdjacencyEntry(string EdgeId, string Neighbor);
  //#endregion graph-types

  /// <summary>
  /// Builds an Euler path or circuit with Hierholzer's algorithm.
  /// Input: undirected graph with an Eulerian path/circuit.
  /// Returns: node order of the Euler walk.
  /// </summary>
  //#region hierholzer function open
  public static List<string> Hierholzer(GraphData graph)
  {
      var adjacency = BuildUndirectedAdjacency(graph);
      var oddNodes = new List<string>();

      foreach (var node in graph.Nodes)
      {
          if ((adjacency.GetValueOrDefault(node.Id, []).Count & 1) == 1)
          {
              oddNodes.Add(node.Id);
          }
      }

      //@step 2
      var start = oddNodes.Count > 0 ? oddNodes[0] : graph.Nodes.Count > 0 ? graph.Nodes[0].Id : string.Empty;
      var stack = new List<string> { start };
      var trail = new List<string>();
      var usedEdges = new HashSet<string>();

      while (stack.Count > 0)
      {
          //@step 4
          var current = stack[^1];
          var next = FindUnusedEdge(current, adjacency, usedEdges);

          //@step 5
          if (next is not null)
          {
              usedEdges.Add(next.Value.EdgeId);

              //@step 6
              stack.Add(next.Value.Neighbor);
              continue;
          }

          var sealedNode = stack[^1];
          stack.RemoveAt(stack.Count - 1);

          //@step 8
          trail.Add(sealedNode);
      }

      trail.Reverse();

      //@step 9
      return trail;
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<EulerAdjacencyEntry>> BuildUndirectedAdjacency(GraphData graph)
  {
      var adjacency = new Dictionary<string, List<EulerAdjacencyEntry>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(new EulerAdjacencyEntry(edge.Id, edge.To));
          adjacency[edge.To].Add(new EulerAdjacencyEntry(edge.Id, edge.From));
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  private static EulerAdjacencyEntry? FindUnusedEdge(
      string nodeId,
      IReadOnlyDictionary<string, List<EulerAdjacencyEntry>> adjacency,
      IReadOnlySet<string> usedEdges
  )
  {
      foreach (var entry in adjacency.GetValueOrDefault(nodeId, []))
      {
          if (!usedEdges.Contains(entry.EdgeId))
          {
              return entry;
          }
      }

      return null;
  }
  //#endregion find-unused
  `,
  'csharp',
);

const EULER_PATH_CIRCUIT_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.HashSet;
  import java.util.List;
  import java.util.Map;
  import java.util.Set;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record GraphEdge(String id, String from, String to) {}

  public record GraphData(
      List<GraphNode> nodes,
      List<GraphEdge> edges
  ) {}

  public record EulerAdjacencyEntry(String edgeId, String neighbor) {}
  //#endregion graph-types

  //#region hierholzer function open
  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  public static List<String> hierholzer(GraphData graph) {
      Map<String, List<EulerAdjacencyEntry>> adjacency = buildUndirectedAdjacency(graph);
      List<String> oddNodes = new ArrayList<>();

      for (GraphNode node : graph.nodes()) {
          if ((adjacency.getOrDefault(node.id(), List.of()).size() & 1) == 1) {
              oddNodes.add(node.id());
          }
      }

      //@step 2
      String start = !oddNodes.isEmpty()
          ? oddNodes.get(0)
          : graph.nodes().isEmpty() ? "" : graph.nodes().get(0).id();
      List<String> stack = new ArrayList<>(List.of(start));
      List<String> trail = new ArrayList<>();
      Set<String> usedEdges = new HashSet<>();

      while (!stack.isEmpty()) {
          //@step 4
          String current = stack.get(stack.size() - 1);
          EulerAdjacencyEntry next = findUnusedEdge(current, adjacency, usedEdges);

          //@step 5
          if (next != null) {
              usedEdges.add(next.edgeId());

              //@step 6
              stack.add(next.neighbor());
              continue;
          }

          String sealedNode = stack.remove(stack.size() - 1);

          //@step 8
          trail.add(sealedNode);
      }

      java.util.Collections.reverse(trail);

      //@step 9
      return trail;
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  private static Map<String, List<EulerAdjacencyEntry>> buildUndirectedAdjacency(GraphData graph) {
      Map<String, List<EulerAdjacencyEntry>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(new EulerAdjacencyEntry(edge.id(), edge.to()));
          adjacency.get(edge.to()).add(new EulerAdjacencyEntry(edge.id(), edge.from()));
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  private static EulerAdjacencyEntry findUnusedEdge(
      String nodeId,
      Map<String, List<EulerAdjacencyEntry>> adjacency,
      Set<String> usedEdges
  ) {
      for (EulerAdjacencyEntry entry : adjacency.getOrDefault(nodeId, List.of())) {
          if (!usedEdges.contains(entry.edgeId())) {
              return entry;
          }
      }

      return null;
  }
  //#endregion find-unused
  `,
  'java',
);

const EULER_PATH_CIRCUIT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
  #include <vector>

  //#region graph-types interface collapsed
  struct GraphNode {
      std::string id;
  };

  struct GraphEdge {
      std::string id;
      std::string from;
      std::string to;
  };

  struct GraphData {
      std::vector<GraphNode> nodes;
      std::vector<GraphEdge> edges;
  };

  struct EulerAdjacencyEntry {
      std::string edgeId;
      std::string neighbor;
  };
  //#endregion graph-types

  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  std::vector<std::string> hierholzer(const GraphData& graph) {
      auto adjacency = buildUndirectedAdjacency(graph);
      std::vector<std::string> oddNodes;

      for (const auto& node : graph.nodes) {
          if ((adjacency[node.id].size() & 1U) == 1U) {
              oddNodes.push_back(node.id);
          }
      }

      //@step 2
      std::string start = !oddNodes.empty() ? oddNodes.front() : graph.nodes.empty() ? "" : graph.nodes.front().id;
      std::vector<std::string> stack = { start };
      std::vector<std::string> trail;
      std::unordered_set<std::string> usedEdges;

      while (!stack.empty()) {
          //@step 4
          const std::string& current = stack.back();
          auto next = findUnusedEdge(current, adjacency, usedEdges);

          //@step 5
          if (next.has_value()) {
              usedEdges.insert(next->edgeId);

              //@step 6
              stack.push_back(next->neighbor);
              continue;
          }

          auto sealedNode = stack.back();
          stack.pop_back();

          //@step 8
          trail.push_back(sealedNode);
      }

      std::reverse(trail.begin(), trail.end());

      //@step 9
      return trail;
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<EulerAdjacencyEntry>> buildUndirectedAdjacency(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<EulerAdjacencyEntry>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back({ edge.id, edge.to });
          adjacency[edge.to].push_back({ edge.id, edge.from });
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  std::optional<EulerAdjacencyEntry> findUnusedEdge(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::vector<EulerAdjacencyEntry>>& adjacency,
      const std::unordered_set<std::string>& usedEdges
  ) {
      for (const auto& entry : adjacency.at(nodeId)) {
          if (!usedEdges.contains(entry.edgeId)) {
              return entry;
          }
      }

      return std::nullopt;
  }
  //#endregion find-unused
  `,
  'cpp',
);

const EULER_PATH_CIRCUIT_GO = buildStructuredCode(
  `
  package graphs

  //#region graph-types interface collapsed
  type GraphNode struct {
      ID string
  }

  type GraphEdge struct {
      ID   string
      From string
      To   string
  }

  type GraphData struct {
      Nodes []GraphNode
      Edges []GraphEdge
  }

  type EulerAdjacencyEntry struct {
      EdgeID   string
      Neighbor string
  }
  //#endregion graph-types

  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  func Hierholzer(graph GraphData) []string {
      adjacency := buildUndirectedAdjacency(graph)
      oddNodes := []string{}
      for _, node := range graph.Nodes {
          if len(adjacency[node.ID])%2 == 1 {
              oddNodes = append(oddNodes, node.ID)
          }
      }

      //@step 2
      start := ""
      if len(oddNodes) > 0 {
          start = oddNodes[0]
      } else if len(graph.Nodes) > 0 {
          start = graph.Nodes[0].ID
      }
      stack := []string{start}
      trail := []string{}
      usedEdges := map[string]struct{}{}

      for len(stack) > 0 {
          //@step 4
          current := stack[len(stack)-1]
          next, ok := findUnusedEdge(current, adjacency, usedEdges)

          //@step 5
          if ok {
              usedEdges[next.EdgeID] = struct{}{}

              //@step 6
              stack = append(stack, next.Neighbor)
              continue
          }

          sealed := stack[len(stack)-1]
          stack = stack[:len(stack)-1]

          //@step 8
          trail = append(trail, sealed)
      }

      //@step 9
      for left, right := 0, len(trail)-1; left < right; left, right = left+1, right-1 {
          trail[left], trail[right] = trail[right], trail[left]
      }
      return trail
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  func buildUndirectedAdjacency(graph GraphData) map[string][]EulerAdjacencyEntry {
      adjacency := make(map[string][]EulerAdjacencyEntry)

      for _, node := range graph.Nodes {
          adjacency[node.ID] = []EulerAdjacencyEntry{}
      }

      for _, edge := range graph.Edges {
          adjacency[edge.From] = append(adjacency[edge.From], EulerAdjacencyEntry{
              EdgeID: edge.ID,
              Neighbor: edge.To,
          })
          adjacency[edge.To] = append(adjacency[edge.To], EulerAdjacencyEntry{
              EdgeID: edge.ID,
              Neighbor: edge.From,
          })
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  func findUnusedEdge(
      nodeID string,
      adjacency map[string][]EulerAdjacencyEntry,
      usedEdges map[string]struct{},
  ) (EulerAdjacencyEntry, bool) {
      for _, entry := range adjacency[nodeID] {
          if _, used := usedEdges[entry.EdgeID]; !used {
              return entry, true
          }
      }

      return EulerAdjacencyEntry{}, false
  }
  //#endregion find-unused
  `,
  'go',
);

const EULER_PATH_CIRCUIT_RUST = buildStructuredCode(
  `
  use std::collections::{HashMap, HashSet};

  //#region graph-types interface collapsed
  #[derive(Clone)]
  struct GraphNode {
      id: String,
  }

  #[derive(Clone)]
  struct GraphEdge {
      id: String,
      from: String,
      to: String,
  }

  struct GraphData {
      nodes: Vec<GraphNode>,
      edges: Vec<GraphEdge>,
  }

  #[derive(Clone)]
  struct EulerAdjacencyEntry {
      edge_id: String,
      neighbor: String,
  }
  //#endregion graph-types

  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  fn hierholzer(graph: &GraphData) -> Vec<String> {
      let adjacency = build_undirected_adjacency(graph);
      let odd_nodes: Vec<String> = graph
          .nodes
          .iter()
          .filter(|node| (adjacency.get(&node.id).map(Vec::len).unwrap_or(0) & 1) == 1)
          .map(|node| node.id.clone())
          .collect();

      //@step 2
      let start = odd_nodes
          .first()
          .cloned()
          .or_else(|| graph.nodes.first().map(|node| node.id.clone()))
          .unwrap_or_default();
      let mut stack = vec![start];
      let mut trail = Vec::new();
      let mut used_edges = HashSet::new();

      while !stack.is_empty() {
          //@step 4
          let current = stack.last().cloned().unwrap_or_default();
          let next = find_unused_edge(&current, &adjacency, &used_edges);

          //@step 5
          if let Some(next) = next {
              used_edges.insert(next.edge_id.clone());

              //@step 6
              stack.push(next.neighbor);
              continue;
          }

          let sealed = stack.pop().unwrap();

          //@step 8
          trail.push(sealed);
      }

      //@step 9
      trail.reverse();
      trail
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  fn build_undirected_adjacency(graph: &GraphData) -> HashMap<String, Vec<EulerAdjacencyEntry>> {
      let mut adjacency = HashMap::new();

      for node in &graph.nodes {
          adjacency.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          adjacency.entry(edge.from.clone()).or_insert_with(Vec::new).push(EulerAdjacencyEntry {
              edge_id: edge.id.clone(),
              neighbor: edge.to.clone(),
          });
          adjacency.entry(edge.to.clone()).or_insert_with(Vec::new).push(EulerAdjacencyEntry {
              edge_id: edge.id.clone(),
              neighbor: edge.from.clone(),
          });
      }

      adjacency
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  fn find_unused_edge(
      node_id: &str,
      adjacency: &HashMap<String, Vec<EulerAdjacencyEntry>>,
      used_edges: &HashSet<String>,
  ) -> Option<EulerAdjacencyEntry> {
      for entry in adjacency.get(node_id).cloned().unwrap_or_default() {
          if !used_edges.contains(&entry.edge_id) {
              return Some(entry);
          }
      }

      None
  }
  //#endregion find-unused
  `,
  'rust',
);

const EULER_PATH_CIRCUIT_SWIFT = buildStructuredCode(
  `
  import Foundation

  //#region graph-types interface collapsed
  struct GraphNode {
      let id: String
  }

  struct GraphEdge {
      let id: String
      let from: String
      let to: String
  }

  struct GraphData {
      let nodes: [GraphNode]
      let edges: [GraphEdge]
  }

  struct EulerAdjacencyEntry {
      let edgeId: String
      let neighbor: String
  }
  //#endregion graph-types

  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  func hierholzer(graph: GraphData) -> [String] {
      let adjacency = buildUndirectedAdjacency(graph: graph)
      let oddNodes = graph.nodes
          .filter { ((adjacency[$0.id]?.count ?? 0) & 1) == 1 }
          .map(\.id)

      //@step 2
      let start = oddNodes.first ?? graph.nodes.first?.id ?? ""
      var stack = [start]
      var trail: [String] = []
      var usedEdges = Set<String>()

      while !stack.isEmpty {
          //@step 4
          let current = stack.last!
          let next = findUnusedEdge(nodeId: current, adjacency: adjacency, usedEdges: usedEdges)

          //@step 5
          if let next {
              usedEdges.insert(next.edgeId)

              //@step 6
              stack.append(next.neighbor)
              continue
          }

          let sealed = stack.removeLast()

          //@step 8
          trail.append(sealed)
      }

      //@step 9
      return trail.reversed()
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  func buildUndirectedAdjacency(graph: GraphData) -> [String: [EulerAdjacencyEntry]] {
      var adjacency: [String: [EulerAdjacencyEntry]] = [:]

      for node in graph.nodes {
          adjacency[node.id] = []
      }

      for edge in graph.edges {
          adjacency[edge.from, default: []].append(
              EulerAdjacencyEntry(edgeId: edge.id, neighbor: edge.to)
          )
          adjacency[edge.to, default: []].append(
              EulerAdjacencyEntry(edgeId: edge.id, neighbor: edge.from)
          )
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  func findUnusedEdge(
      nodeId: String,
      adjacency: [String: [EulerAdjacencyEntry]],
      usedEdges: Set<String>,
  ) -> EulerAdjacencyEntry? {
      for entry in adjacency[nodeId] ?? [] {
          if !usedEdges.contains(entry.edgeId) {
              return entry
          }
      }

      return nil
  }
  //#endregion find-unused
  `,
  'swift',
);

const EULER_PATH_CIRCUIT_PHP = buildStructuredCode(
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
          public string $id,
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
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   *
   * @return list<string>
   */
  //#region hierholzer function open
  function hierholzer(GraphData $graph): array
  {
      $adjacency = buildUndirectedAdjacency($graph);
      $oddNodes = array_values(array_map(
          fn (GraphNode $node): string => $node->id,
          array_filter(
              $graph->nodes,
              fn (GraphNode $node): bool => ((count($adjacency[$node->id] ?? []) & 1) === 1),
          ),
      ));

      //@step 2
      $start = $oddNodes[0] ?? ($graph->nodes[0]->id ?? '');
      $stack = [$start];
      $trail = [];
      $usedEdges = [];

      while ($stack !== []) {
          //@step 4
          $current = $stack[count($stack) - 1];
          $next = findUnusedEdge($current, $adjacency, $usedEdges);

          //@step 5
          if ($next !== null) {
              $usedEdges[$next['edgeId']] = true;

              //@step 6
              $stack[] = $next['neighbor'];
              continue;
          }

          $sealed = array_pop($stack);

          //@step 8
          $trail[] = $sealed;
      }

      //@step 9
      return array_reverse($trail);
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  function buildUndirectedAdjacency(GraphData $graph): array
  {
      $adjacency = [];

      foreach ($graph->nodes as $node) {
          $adjacency[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $adjacency[$edge->from][] = ['edgeId' => $edge->id, 'neighbor' => $edge->to];
          $adjacency[$edge->to][] = ['edgeId' => $edge->id, 'neighbor' => $edge->from];
      }

      return $adjacency;
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  function findUnusedEdge(string $nodeId, array $adjacency, array $usedEdges): ?array
  {
      foreach ($adjacency[$nodeId] ?? [] as $entry) {
          if (!isset($usedEdges[$entry['edgeId']])) {
              return $entry;
          }
      }

      return null;
  }
  //#endregion find-unused
  `,
  'php',
);

const EULER_PATH_CIRCUIT_KOTLIN = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  data class GraphNode(val id: String)

  data class GraphEdge(
      val id: String,
      val from: String,
      val to: String,
  )

  data class GraphData(
      val nodes: List<GraphNode>,
      val edges: List<GraphEdge>,
  )

  data class EulerAdjacencyEntry(
      val edgeId: String,
      val neighbor: String,
  )
  //#endregion graph-types

  /**
   * Builds an Euler path or circuit with Hierholzer's algorithm.
   * Input: undirected graph with an Eulerian path/circuit.
   * Returns: node order of the Euler walk.
   */
  //#region hierholzer function open
  fun hierholzer(graph: GraphData): List<String> {
      val adjacency = buildUndirectedAdjacency(graph)
      val oddNodes = graph.nodes
          .filter { ((adjacency[it.id]?.size ?: 0) and 1) == 1 }
          .map { it.id }

      //@step 2
      val start = oddNodes.firstOrNull() ?: graph.nodes.firstOrNull()?.id.orEmpty()
      val stack = mutableListOf(start)
      val trail = mutableListOf<String>()
      val usedEdges = mutableSetOf<String>()

      while (stack.isNotEmpty()) {
          //@step 4
          val current = stack.last()
          val next = findUnusedEdge(current, adjacency, usedEdges)

          //@step 5
          if (next != null) {
              usedEdges += next.edgeId

              //@step 6
              stack += next.neighbor
              continue
          }

          val sealed = stack.removeAt(stack.lastIndex)

          //@step 8
          trail += sealed
      }

      //@step 9
      return trail.asReversed()
  }
  //#endregion hierholzer

  //#region build-adjacency helper collapsed
  fun buildUndirectedAdjacency(graph: GraphData): MutableMap<String, MutableList<EulerAdjacencyEntry>> {
      val adjacency = mutableMapOf<String, MutableList<EulerAdjacencyEntry>>()

      for (node in graph.nodes) {
          adjacency[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          adjacency.getOrPut(edge.from) { mutableListOf() }.add(
              EulerAdjacencyEntry(edge.id, edge.to)
          )
          adjacency.getOrPut(edge.to) { mutableListOf() }.add(
              EulerAdjacencyEntry(edge.id, edge.from)
          )
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region find-unused helper collapsed
  fun findUnusedEdge(
      nodeId: String,
      adjacency: Map<String, List<EulerAdjacencyEntry>>,
      usedEdges: Set<String>,
  ): EulerAdjacencyEntry? {
      for (entry in adjacency[nodeId].orEmpty()) {
          if (entry.edgeId !in usedEdges) {
              return entry
          }
      }

      return null
  }
  //#endregion find-unused
  `,
  'kotlin',
);

export const EULER_PATH_CIRCUIT_CODE = EULER_PATH_CIRCUIT_TS.lines;
export const EULER_PATH_CIRCUIT_CODE_REGIONS = EULER_PATH_CIRCUIT_TS.regions;
export const EULER_PATH_CIRCUIT_CODE_HIGHLIGHT_MAP = EULER_PATH_CIRCUIT_TS.highlightMap;
export const EULER_PATH_CIRCUIT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: EULER_PATH_CIRCUIT_TS.lines,
    regions: EULER_PATH_CIRCUIT_TS.regions,
    highlightMap: EULER_PATH_CIRCUIT_TS.highlightMap,
    source: EULER_PATH_CIRCUIT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: EULER_PATH_CIRCUIT_JS.lines,
    regions: EULER_PATH_CIRCUIT_JS.regions,
    highlightMap: EULER_PATH_CIRCUIT_JS.highlightMap,
    source: EULER_PATH_CIRCUIT_JS.source,
  },
  python: {
    language: 'python',
    lines: EULER_PATH_CIRCUIT_PY.lines,
    regions: EULER_PATH_CIRCUIT_PY.regions,
    highlightMap: EULER_PATH_CIRCUIT_PY.highlightMap,
    source: EULER_PATH_CIRCUIT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: EULER_PATH_CIRCUIT_CS.lines,
    regions: EULER_PATH_CIRCUIT_CS.regions,
    highlightMap: EULER_PATH_CIRCUIT_CS.highlightMap,
    source: EULER_PATH_CIRCUIT_CS.source,
  },
  java: {
    language: 'java',
    lines: EULER_PATH_CIRCUIT_JAVA.lines,
    regions: EULER_PATH_CIRCUIT_JAVA.regions,
    highlightMap: EULER_PATH_CIRCUIT_JAVA.highlightMap,
    source: EULER_PATH_CIRCUIT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: EULER_PATH_CIRCUIT_CPP.lines,
    regions: EULER_PATH_CIRCUIT_CPP.regions,
    highlightMap: EULER_PATH_CIRCUIT_CPP.highlightMap,
    source: EULER_PATH_CIRCUIT_CPP.source,
  },
  go: {
    language: 'go',
    lines: EULER_PATH_CIRCUIT_GO.lines,
    regions: EULER_PATH_CIRCUIT_GO.regions,
    highlightMap: EULER_PATH_CIRCUIT_GO.highlightMap,
    source: EULER_PATH_CIRCUIT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: EULER_PATH_CIRCUIT_RUST.lines,
    regions: EULER_PATH_CIRCUIT_RUST.regions,
    highlightMap: EULER_PATH_CIRCUIT_RUST.highlightMap,
    source: EULER_PATH_CIRCUIT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: EULER_PATH_CIRCUIT_SWIFT.lines,
    regions: EULER_PATH_CIRCUIT_SWIFT.regions,
    highlightMap: EULER_PATH_CIRCUIT_SWIFT.highlightMap,
    source: EULER_PATH_CIRCUIT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: EULER_PATH_CIRCUIT_PHP.lines,
    regions: EULER_PATH_CIRCUIT_PHP.regions,
    highlightMap: EULER_PATH_CIRCUIT_PHP.highlightMap,
    source: EULER_PATH_CIRCUIT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: EULER_PATH_CIRCUIT_KOTLIN.lines,
    regions: EULER_PATH_CIRCUIT_KOTLIN.regions,
    highlightMap: EULER_PATH_CIRCUIT_KOTLIN.highlightMap,
    source: EULER_PATH_CIRCUIT_KOTLIN.source,
  },
};
