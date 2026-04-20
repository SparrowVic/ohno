import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const DIJKSTRA_TS = buildStructuredCode(`
  //#region graph-types interface collapsed
  interface GraphNode {
    readonly id: string;
  }

  interface WeightedEdge {
    readonly from: string;
    readonly to: string;
    readonly weight: number;
  }

  interface WeightedGraphData {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly WeightedEdge[];
  }
  //#endregion graph-types

  /**
   * Compute single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  function dijkstra(
    graph: WeightedGraphData,
    source: string,
  ): {
    distance: Map<string, number>;
    previous: Map<string, string | null>;
  } {
    const adjacency = buildAdjacency(graph);
    const distance = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unsettled = new Set<string>();

    for (const node of graph.nodes) {
      distance.set(node.id, Number.POSITIVE_INFINITY);
      previous.set(node.id, null);
      unsettled.add(node.id);
    }

    distance.set(source, 0);

    //@step 5
    while (unsettled.size > 0) {
      const current = extractMinVertex(unsettled, distance);
      if (
        current === null ||
        !Number.isFinite(distance.get(current) ?? Number.POSITIVE_INFINITY)
      ) {
        break;
      }

      //@step 7
      for (const edge of adjacency.get(current) ?? []) {
        //@step 8
        const candidate =
          (distance.get(current) ?? Number.POSITIVE_INFINITY) + edge.weight;

        //@step 9
        if (candidate < (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          distance.set(edge.to, candidate);
          previous.set(edge.to, current);
        }
      }

      //@step 12
      unsettled.delete(current);
    }

    //@step 14
    return { distance, previous };
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  function buildAdjacency(
    graph: WeightedGraphData,
  ): Map<string, WeightedEdge[]> {
    const adjacency = new Map<string, WeightedEdge[]>();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge);
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  function extractMinVertex(
    unsettled: ReadonlySet<string>,
    distance: ReadonlyMap<string, number>,
  ): string | null {
    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of unsettled) {
      const candidate = distance.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (candidate < bestDistance) {
        bestDistance = candidate;
        bestId = nodeId;
      }
    }

    return bestId;
  }
  //#endregion extract-min
`);

const DIJKSTRA_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string, weight: number }} WeightedEdge
   * @typedef {{ nodes: GraphNode[], edges: WeightedEdge[] }} WeightedGraphData
   */
  //#endregion graph-types

  /**
   * Compute single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  function dijkstra(graph, source) {
    const adjacency = buildAdjacency(graph);
    const distance = new Map();
    const previous = new Map();
    const unsettled = new Set();

    for (const node of graph.nodes) {
      distance.set(node.id, Number.POSITIVE_INFINITY);
      previous.set(node.id, null);
      unsettled.add(node.id);
    }

    distance.set(source, 0);

    //@step 5
    while (unsettled.size > 0) {
      const current = extractMinVertex(unsettled, distance);
      if (
        current === null ||
        !Number.isFinite(distance.get(current) ?? Number.POSITIVE_INFINITY)
      ) {
        break;
      }

      //@step 7
      for (const edge of adjacency.get(current) ?? []) {
        //@step 8
        const candidate =
          (distance.get(current) ?? Number.POSITIVE_INFINITY) + edge.weight;

        //@step 9
        if (candidate < (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          distance.set(edge.to, candidate);
          previous.set(edge.to, current);
        }
      }

      //@step 12
      unsettled.delete(current);
    }

    //@step 14
    return { distance, previous };
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  function buildAdjacency(graph) {
    const adjacency = new Map();

    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.from)?.push(edge);
    }

    return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  function extractMinVertex(unsettled, distance) {
    let bestId = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of unsettled) {
      const candidate = distance.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (candidate < bestDistance) {
        bestDistance = candidate;
        bestId = nodeId;
      }
    }

    return bestId;
  }
  //#endregion extract-min
  `,
  'javascript',
);

const DIJKSTRA_PY = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  from dataclasses import dataclass


  @dataclass(frozen=True)
  class GraphNode:
      id: str


  @dataclass(frozen=True)
  class WeightedEdge:
      from_id: str
      to: str
      weight: float


  @dataclass(frozen=True)
  class WeightedGraphData:
      nodes: list[GraphNode]
      edges: list[WeightedEdge]
  //#endregion graph-types

  """
  Compute single-source shortest paths with Dijkstra's algorithm.
  Input: directed weighted graph with non-negative edge weights and a source id.
  Returns: distance and predecessor maps for the shortest-path tree.
  """
  //#region dijkstra function open
  //@step 2
  def dijkstra(
      graph: WeightedGraphData,
      source: str,
  ) -> tuple[dict[str, float], dict[str, str | None]]:
      adjacency = build_adjacency(graph)
      distance = {node.id: float("inf") for node in graph.nodes}
      previous = {node.id: None for node in graph.nodes}
      unsettled = {node.id for node in graph.nodes}

      distance[source] = 0.0

      //@step 5
      while unsettled:
          current = extract_min_vertex(unsettled, distance)
          if current is None or distance[current] == float("inf"):
              break

          //@step 7
          for edge in adjacency.get(current, []):
              //@step 8
              candidate = distance[current] + edge.weight

              //@step 9
              if candidate < distance[edge.to]:
                  distance[edge.to] = candidate
                  previous[edge.to] = current

          //@step 12
          unsettled.remove(current)

      //@step 14
      return distance, previous
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  def build_adjacency(graph: WeightedGraphData) -> dict[str, list[WeightedEdge]]:
      adjacency = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          adjacency.setdefault(edge.from_id, []).append(edge)

      return adjacency
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  def extract_min_vertex(
      unsettled: set[str],
      distance: dict[str, float],
  ) -> str | None:
      best_id: str | None = None
      best_distance = float("inf")

      for node_id in unsettled:
          candidate = distance[node_id]
          if candidate < best_distance:
              best_distance = candidate
              best_id = node_id

      return best_id
  //#endregion extract-min
  `,
  'python',
);

const DIJKSTRA_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region graph-types interface collapsed
  public readonly record struct GraphNode(string Id);

  public readonly record struct WeightedEdge(string From, string To, double Weight);

  public sealed record WeightedGraphData(
      IReadOnlyList<GraphNode> Nodes,
      IReadOnlyList<WeightedEdge> Edges
  );
  //#endregion graph-types

  /// <summary>
  /// Computes single-source shortest paths with Dijkstra's algorithm.
  /// Input: directed weighted graph with non-negative edge weights and a source id.
  /// Returns: distance and predecessor maps for the shortest-path tree.
  /// </summary>
  //#region dijkstra function open
  //@step 2
  public static (
      Dictionary<string, double> Distance,
      Dictionary<string, string?> Previous
  ) Dijkstra(WeightedGraphData graph, string source)
  {
      var adjacency = BuildAdjacency(graph);
      var distance = new Dictionary<string, double>();
      var previous = new Dictionary<string, string?>();
      var unsettled = new HashSet<string>();

      foreach (var node in graph.Nodes)
      {
          distance[node.Id] = double.PositiveInfinity;
          previous[node.Id] = null;
          unsettled.Add(node.Id);
      }

      distance[source] = 0.0;

      //@step 5
      while (unsettled.Count > 0)
      {
          var current = ExtractMinVertex(unsettled, distance);
          if (current is null || double.IsPositiveInfinity(distance[current]))
          {
              break;
          }

          //@step 7
          foreach (var edge in adjacency.GetValueOrDefault(current, []))
          {
              //@step 8
              var candidate = distance[current] + edge.Weight;

              //@step 9
              if (candidate < distance[edge.To])
              {
                  distance[edge.To] = candidate;
                  previous[edge.To] = current;
              }
          }

          //@step 12
          unsettled.Remove(current);
      }

      //@step 14
      return (distance, previous);
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  private static Dictionary<string, List<WeightedEdge>> BuildAdjacency(WeightedGraphData graph)
  {
      var adjacency = new Dictionary<string, List<WeightedEdge>>();

      foreach (var node in graph.Nodes)
      {
          adjacency[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          adjacency[edge.From].Add(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static string? ExtractMinVertex(
      IReadOnlySet<string> unsettled,
      IReadOnlyDictionary<string, double> distance
  )
  {
      string? bestId = null;
      var bestDistance = double.PositiveInfinity;

      foreach (var nodeId in unsettled)
      {
          var candidate = distance[nodeId];
          if (candidate < bestDistance)
          {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'csharp',
);

const DIJKSTRA_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.HashSet;
  import java.util.List;
  import java.util.Map;
  import java.util.Set;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record WeightedEdge(String from, String to, double weight) {}

  public record WeightedGraphData(
      List<GraphNode> nodes,
      List<WeightedEdge> edges
  ) {}
  //#endregion graph-types

  //#region dijkstra function open
  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //@step 2
  public static Result dijkstra(WeightedGraphData graph, String source) {
      Map<String, List<WeightedEdge>> adjacency = buildAdjacency(graph);
      Map<String, Double> distance = new HashMap<>();
      Map<String, String> previous = new HashMap<>();
      Set<String> unsettled = new HashSet<>();

      for (GraphNode node : graph.nodes()) {
          distance.put(node.id(), Double.POSITIVE_INFINITY);
          previous.put(node.id(), null);
          unsettled.add(node.id());
      }

      distance.put(source, 0.0);

      //@step 5
      while (!unsettled.isEmpty()) {
          String current = extractMinVertex(unsettled, distance);
          if (current == null || !Double.isFinite(distance.get(current))) {
              break;
          }

          //@step 7
          for (WeightedEdge edge : adjacency.getOrDefault(current, List.of())) {
              //@step 8
              double candidate = distance.get(current) + edge.weight();

              //@step 9
              if (candidate < distance.get(edge.to())) {
                  distance.put(edge.to(), candidate);
                  previous.put(edge.to(), current);
              }
          }

          //@step 12
          unsettled.remove(current);
      }

      //@step 14
      return new Result(distance, previous);
  }
  //#endregion dijkstra

  //#region result helper collapsed
  public record Result(
      Map<String, Double> distance,
      Map<String, String> previous
  ) {}
  //#endregion result

  //#region build-adjacency helper collapsed
  private static Map<String, List<WeightedEdge>> buildAdjacency(WeightedGraphData graph) {
      Map<String, List<WeightedEdge>> adjacency = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          adjacency.put(node.id(), new ArrayList<>());
      }

      for (WeightedEdge edge : graph.edges()) {
          adjacency.get(edge.from()).add(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  private static String extractMinVertex(
      Set<String> unsettled,
      Map<String, Double> distance
  ) {
      String bestId = null;
      double bestDistance = Double.POSITIVE_INFINITY;

      for (String nodeId : unsettled) {
          double candidate = distance.get(nodeId);
          if (candidate < bestDistance) {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'java',
);

const DIJKSTRA_CPP = buildStructuredCode(
  `
  #include <cmath>
  #include <limits>
  #include <string>
  #include <unordered_map>
  #include <unordered_set>
  #include <utility>
  #include <vector>

  //#region graph-types interface collapsed
  struct GraphNode {
      std::string id;
  };

  struct WeightedEdge {
      std::string from;
      std::string to;
      double weight;
  };

  struct WeightedGraphData {
      std::vector<GraphNode> nodes;
      std::vector<WeightedEdge> edges;
  };

  struct DijkstraResult {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> previous;
  };
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  DijkstraResult dijkstra(const WeightedGraphData& graph, const std::string& source) {
      auto adjacency = buildAdjacency(graph);
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> previous;
      std::unordered_set<std::string> unsettled;

      for (const auto& node : graph.nodes) {
          distance[node.id] = std::numeric_limits<double>::infinity();
          previous[node.id] = "";
          unsettled.insert(node.id);
      }

      distance[source] = 0.0;

      //@step 5
      while (!unsettled.empty()) {
          const auto current = extractMinVertex(unsettled, distance);
          if (current.empty() || !std::isfinite(distance[current])) {
              break;
          }

          //@step 7
          for (const auto& edge : adjacency[current]) {
              //@step 8
              const double candidate = distance[current] + edge.weight;

              //@step 9
              if (candidate < distance[edge.to]) {
                  distance[edge.to] = candidate;
                  previous[edge.to] = current;
              }
          }

          //@step 12
          unsettled.erase(current);
      }

      //@step 14
      return { distance, previous };
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  std::unordered_map<std::string, std::vector<WeightedEdge>> buildAdjacency(
      const WeightedGraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<WeightedEdge>> adjacency;

      for (const auto& node : graph.nodes) {
          adjacency[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          adjacency[edge.from].push_back(edge);
      }

      return adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  std::string extractMinVertex(
      const std::unordered_set<std::string>& unsettled,
      const std::unordered_map<std::string, double>& distance
  ) {
      std::string bestId;
      double bestDistance = std::numeric_limits<double>::infinity();

      for (const auto& nodeId : unsettled) {
          const double candidate = distance.at(nodeId);
          if (candidate < bestDistance) {
              bestDistance = candidate;
              bestId = nodeId;
          }
      }

      return bestId;
  }
  //#endregion extract-min
  `,
  'cpp',
);

const DIJKSTRA_GO = buildStructuredCode(
  `
  package dijkstra

  import "math"

  //#region graph-types interface collapsed
  type GraphNode struct {
      ID string
  }

  type WeightedEdge struct {
      From   string
      To     string
      Weight float64
  }

  type WeightedGraphData struct {
      Nodes []GraphNode
      Edges []WeightedEdge
  }

  type DijkstraResult struct {
      Distance map[string]float64
      Previous map[string]string
  }
  //#endregion graph-types

  //#region dijkstra function open
  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //@step 2
  func Dijkstra(graph WeightedGraphData, source string) DijkstraResult {
      adjacency := buildAdjacency(graph)
      distance := make(map[string]float64)
      previous := make(map[string]string)
      unsettled := make(map[string]struct{})

      for _, node := range graph.Nodes {
          distance[node.ID] = math.Inf(1)
          previous[node.ID] = ""
          unsettled[node.ID] = struct{}{}
      }

      distance[source] = 0

      //@step 5
      for len(unsettled) > 0 {
          current, ok := extractMinVertex(unsettled, distance)
          if !ok || math.IsInf(distance[current], 1) {
              break
          }

          //@step 7
          for _, edge := range adjacency[current] {
              //@step 8
              candidate := distance[current] + edge.Weight

              //@step 9
              if candidate < distance[edge.To] {
                  distance[edge.To] = candidate
                  previous[edge.To] = current
              }
          }

          //@step 12
          delete(unsettled, current)
      }

      //@step 14
      return DijkstraResult{Distance: distance, Previous: previous}
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  func buildAdjacency(graph WeightedGraphData) map[string][]WeightedEdge {
      adjacency := make(map[string][]WeightedEdge)

      for _, node := range graph.Nodes {
          adjacency[node.ID] = []WeightedEdge{}
      }

      for _, edge := range graph.Edges {
          adjacency[edge.From] = append(adjacency[edge.From], edge)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  func extractMinVertex(
      unsettled map[string]struct{},
      distance map[string]float64,
  ) (string, bool) {
      bestID := ""
      bestDistance := math.Inf(1)
      found := false

      for nodeID := range unsettled {
          candidate := distance[nodeID]
          if candidate < bestDistance {
              bestDistance = candidate
              bestID = nodeID
              found = true
          }
      }

      return bestID, found
  }
  //#endregion extract-min
  `,
  'go',
);

const DIJKSTRA_RUST = buildStructuredCode(
  `
  use std::collections::{HashMap, HashSet};

  //#region graph-types interface collapsed
  #[derive(Clone)]
  struct GraphNode {
      id: String,
  }

  #[derive(Clone)]
  struct WeightedEdge {
      from: String,
      to: String,
      weight: f64,
  }

  struct WeightedGraphData {
      nodes: Vec<GraphNode>,
      edges: Vec<WeightedEdge>,
  }

  struct DijkstraResult {
      distance: HashMap<String, f64>,
      previous: HashMap<String, Option<String>>,
  }
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  fn dijkstra(graph: &WeightedGraphData, source: &str) -> DijkstraResult {
      let adjacency = build_adjacency(graph);
      let mut distance = HashMap::new();
      let mut previous = HashMap::new();
      let mut unsettled = HashSet::new();

      for node in &graph.nodes {
          distance.insert(node.id.clone(), f64::INFINITY);
          previous.insert(node.id.clone(), None);
          unsettled.insert(node.id.clone());
      }

      distance.insert(source.to_string(), 0.0);

      //@step 5
      while !unsettled.is_empty() {
          let Some(current) = extract_min_vertex(&unsettled, &distance) else {
              break;
          };
          if !distance
              .get(&current)
              .copied()
              .unwrap_or(f64::INFINITY)
              .is_finite()
          {
              break;
          }

          //@step 7
          if let Some(edges) = adjacency.get(&current) {
              for edge in edges {
                  //@step 8
                  let candidate =
                      distance.get(&current).copied().unwrap_or(f64::INFINITY) + edge.weight;

                  //@step 9
                  if candidate < distance.get(&edge.to).copied().unwrap_or(f64::INFINITY) {
                      distance.insert(edge.to.clone(), candidate);
                      previous.insert(edge.to.clone(), Some(current.clone()));
                  }
              }
          }

          //@step 12
          unsettled.remove(&current);
      }

      //@step 14
      DijkstraResult { distance, previous }
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  fn build_adjacency(graph: &WeightedGraphData) -> HashMap<String, Vec<WeightedEdge>> {
      let mut adjacency = HashMap::new();

      for node in &graph.nodes {
          adjacency.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          adjacency.entry(edge.from.clone()).or_insert_with(Vec::new).push(edge.clone());
      }

      adjacency
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  fn extract_min_vertex(
      unsettled: &HashSet<String>,
      distance: &HashMap<String, f64>,
  ) -> Option<String> {
      let mut best_id: Option<String> = None;
      let mut best_distance = f64::INFINITY;

      for node_id in unsettled {
          let candidate = distance.get(node_id).copied().unwrap_or(f64::INFINITY);
          if candidate < best_distance {
              best_distance = candidate;
              best_id = Some(node_id.clone());
          }
      }

      best_id
  }
  //#endregion extract-min
  `,
  'rust',
);

const DIJKSTRA_SWIFT = buildStructuredCode(
  `
  import Foundation

  //#region graph-types interface collapsed
  struct GraphNode {
      let id: String
  }

  struct WeightedEdge {
      let from: String
      let to: String
      let weight: Double
  }

  struct WeightedGraphData {
      let nodes: [GraphNode]
      let edges: [WeightedEdge]
  }

  struct DijkstraResult {
      let distance: [String: Double]
      let previous: [String: String]
  }
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  func dijkstra(graph: WeightedGraphData, source: String) -> DijkstraResult {
      let adjacency = buildAdjacency(graph: graph)
      var distance: [String: Double] = [:]
      var previous: [String: String] = [:]
      var unsettled = Set<String>()

      for node in graph.nodes {
          distance[node.id] = .infinity
          previous[node.id] = ""
          unsettled.insert(node.id)
      }

      distance[source] = 0

      //@step 5
      while !unsettled.isEmpty {
          guard let current = extractMinVertex(unsettled: unsettled, distance: distance),
                (distance[current] ?? .infinity).isFinite else {
              break
          }

          //@step 7
          for edge in adjacency[current] ?? [] {
              //@step 8
              let candidate = (distance[current] ?? .infinity) + edge.weight

              //@step 9
              if candidate < (distance[edge.to] ?? .infinity) {
                  distance[edge.to] = candidate
                  previous[edge.to] = current
              }
          }

          //@step 12
          unsettled.remove(current)
      }

      //@step 14
      return DijkstraResult(distance: distance, previous: previous)
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  func buildAdjacency(graph: WeightedGraphData) -> [String: [WeightedEdge]] {
      var adjacency: [String: [WeightedEdge]] = [:]

      for node in graph.nodes {
          adjacency[node.id] = []
      }

      for edge in graph.edges {
          adjacency[edge.from, default: []].append(edge)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  func extractMinVertex(
      unsettled: Set<String>,
      distance: [String: Double],
  ) -> String? {
      var bestId: String?
      var bestDistance = Double.infinity

      for nodeId in unsettled {
          let candidate = distance[nodeId] ?? .infinity
          if candidate < bestDistance {
              bestDistance = candidate
              bestId = nodeId
          }
      }

      return bestId
  }
  //#endregion extract-min
  `,
  'swift',
);

const DIJKSTRA_PHP = buildStructuredCode(
  `
  <?php

  //#region graph-types interface collapsed
  final class GraphNode
  {
      public function __construct(public string $id) {}
  }

  final class WeightedEdge
  {
      public function __construct(
          public string $from,
          public string $to,
          public float $weight,
      ) {}
  }

  final class WeightedGraphData
  {
      /**
       * @param list<GraphNode> $nodes
       * @param list<WeightedEdge> $edges
       */
      public function __construct(
          public array $nodes,
          public array $edges,
      ) {}
  }
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   *
   * @return array{
   *   distance: array<string, float>,
   *   previous: array<string, string|null>
   * }
   */
  //#region dijkstra function open
  //@step 2
  function dijkstra(WeightedGraphData $graph, string $source): array
  {
      $adjacency = buildAdjacency($graph);
      $distance = [];
      $previous = [];
      $unsettled = [];

      foreach ($graph->nodes as $node) {
          $distance[$node->id] = INF;
          $previous[$node->id] = null;
          $unsettled[$node->id] = true;
      }

      $distance[$source] = 0.0;

      //@step 5
      while ($unsettled !== []) {
          $current = extractMinVertex($unsettled, $distance);
          if ($current === null || !is_finite($distance[$current] ?? INF)) {
              break;
          }

          //@step 7
          foreach ($adjacency[$current] ?? [] as $edge) {
              //@step 8
              $candidate = ($distance[$current] ?? INF) + $edge->weight;

              //@step 9
              if ($candidate < ($distance[$edge->to] ?? INF)) {
                  $distance[$edge->to] = $candidate;
                  $previous[$edge->to] = $current;
              }
          }

          //@step 12
          unset($unsettled[$current]);
      }

      //@step 14
      return ['distance' => $distance, 'previous' => $previous];
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  function buildAdjacency(WeightedGraphData $graph): array
  {
      $adjacency = [];

      foreach ($graph->nodes as $node) {
          $adjacency[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $adjacency[$edge->from][] = $edge;
      }

      return $adjacency;
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  function extractMinVertex(array $unsettled, array $distance): ?string
  {
      $bestId = null;
      $bestDistance = INF;

      foreach (array_keys($unsettled) as $nodeId) {
          $candidate = $distance[$nodeId] ?? INF;
          if ($candidate < $bestDistance) {
              $bestDistance = $candidate;
              $bestId = $nodeId;
          }
      }

      return $bestId;
  }
  //#endregion extract-min
  `,
  'php',
);

const DIJKSTRA_KOTLIN = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  data class GraphNode(val id: String)

  data class WeightedEdge(
      val from: String,
      val to: String,
      val weight: Double,
  )

  data class WeightedGraphData(
      val nodes: List<GraphNode>,
      val edges: List<WeightedEdge>,
  )

  data class DijkstraResult(
      val distance: Map<String, Double>,
      val previous: Map<String, String?>,
  )
  //#endregion graph-types

  /**
   * Computes single-source shortest paths with Dijkstra's algorithm.
   * Input: directed weighted graph with non-negative edge weights and a source id.
   * Returns: distance and predecessor maps for the shortest-path tree.
   */
  //#region dijkstra function open
  //@step 2
  fun dijkstra(graph: WeightedGraphData, source: String): DijkstraResult {
      val adjacency = buildAdjacency(graph)
      val distance = mutableMapOf<String, Double>()
      val previous = mutableMapOf<String, String?>()
      val unsettled = mutableSetOf<String>()

      for (node in graph.nodes) {
          distance[node.id] = Double.POSITIVE_INFINITY
          previous[node.id] = null
          unsettled += node.id
      }

      distance[source] = 0.0

      //@step 5
      while (unsettled.isNotEmpty()) {
          val current = extractMinVertex(unsettled, distance)
          if (current == null || !(distance[current] ?: Double.POSITIVE_INFINITY).isFinite()) {
              break
          }

          //@step 7
          for (edge in adjacency[current].orEmpty()) {
              //@step 8
              val candidate = (distance[current] ?: Double.POSITIVE_INFINITY) + edge.weight

              //@step 9
              if (candidate < (distance[edge.to] ?: Double.POSITIVE_INFINITY)) {
                  distance[edge.to] = candidate
                  previous[edge.to] = current
              }
          }

          //@step 12
          unsettled -= current
      }

      //@step 14
      return DijkstraResult(distance, previous)
  }
  //#endregion dijkstra

  //#region build-adjacency helper collapsed
  fun buildAdjacency(graph: WeightedGraphData): MutableMap<String, MutableList<WeightedEdge>> {
      val adjacency = mutableMapOf<String, MutableList<WeightedEdge>>()

      for (node in graph.nodes) {
          adjacency[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          adjacency.getOrPut(edge.from) { mutableListOf() }.add(edge)
      }

      return adjacency
  }
  //#endregion build-adjacency

  //#region extract-min helper collapsed
  fun extractMinVertex(
      unsettled: Set<String>,
      distance: Map<String, Double>,
  ): String? {
      var bestId: String? = null
      var bestDistance = Double.POSITIVE_INFINITY

      for (nodeId in unsettled) {
          val candidate = distance[nodeId] ?: Double.POSITIVE_INFINITY
          if (candidate < bestDistance) {
              bestDistance = candidate
              bestId = nodeId
          }
      }

      return bestId
  }
  //#endregion extract-min
  `,
  'kotlin',
);

export const DIJKSTRA_CODE = DIJKSTRA_TS.lines;
export const DIJKSTRA_CODE_REGIONS = DIJKSTRA_TS.regions;
export const DIJKSTRA_CODE_HIGHLIGHT_MAP = DIJKSTRA_TS.highlightMap;
export const DIJKSTRA_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: DIJKSTRA_TS.lines,
    regions: DIJKSTRA_TS.regions,
    highlightMap: DIJKSTRA_TS.highlightMap,
    source: DIJKSTRA_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: DIJKSTRA_JS.lines,
    regions: DIJKSTRA_JS.regions,
    highlightMap: DIJKSTRA_JS.highlightMap,
    source: DIJKSTRA_JS.source,
  },
  python: {
    language: 'python',
    lines: DIJKSTRA_PY.lines,
    regions: DIJKSTRA_PY.regions,
    highlightMap: DIJKSTRA_PY.highlightMap,
    source: DIJKSTRA_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: DIJKSTRA_CS.lines,
    regions: DIJKSTRA_CS.regions,
    highlightMap: DIJKSTRA_CS.highlightMap,
    source: DIJKSTRA_CS.source,
  },
  java: {
    language: 'java',
    lines: DIJKSTRA_JAVA.lines,
    regions: DIJKSTRA_JAVA.regions,
    highlightMap: DIJKSTRA_JAVA.highlightMap,
    source: DIJKSTRA_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: DIJKSTRA_CPP.lines,
    regions: DIJKSTRA_CPP.regions,
    highlightMap: DIJKSTRA_CPP.highlightMap,
    source: DIJKSTRA_CPP.source,
  },
  go: {
    language: 'go',
    lines: DIJKSTRA_GO.lines,
    regions: DIJKSTRA_GO.regions,
    highlightMap: DIJKSTRA_GO.highlightMap,
    source: DIJKSTRA_GO.source,
  },
  rust: {
    language: 'rust',
    lines: DIJKSTRA_RUST.lines,
    regions: DIJKSTRA_RUST.regions,
    highlightMap: DIJKSTRA_RUST.highlightMap,
    source: DIJKSTRA_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: DIJKSTRA_SWIFT.lines,
    regions: DIJKSTRA_SWIFT.regions,
    highlightMap: DIJKSTRA_SWIFT.highlightMap,
    source: DIJKSTRA_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: DIJKSTRA_PHP.lines,
    regions: DIJKSTRA_PHP.regions,
    highlightMap: DIJKSTRA_PHP.highlightMap,
    source: DIJKSTRA_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: DIJKSTRA_KOTLIN.lines,
    regions: DIJKSTRA_KOTLIN.regions,
    highlightMap: DIJKSTRA_KOTLIN.highlightMap,
    source: DIJKSTRA_KOTLIN.source,
  },
};
