import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BELLMAN_FORD_TS = buildStructuredCode(`
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
   * Compute shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  function bellmanFord(
    graph: WeightedGraphData,
    source: string,
  ): {
    distance: Map<string, number>;
    parent: Map<string, string | null>;
    hasNegativeCycle: boolean;
  } {
    const distance = new Map<string, number>();
    const parent = new Map<string, string | null>();

    for (const node of graph.nodes) {
      distance.set(node.id, Number.POSITIVE_INFINITY);
      parent.set(node.id, null);
    }

    distance.set(source, 0);

    for (let pass = 1; pass < graph.nodes.length; pass += 1) {
      //@step 5
      let changed = false;

      for (const edge of graph.edges) {
        if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
          continue;
        }

        //@step 7
        const candidate =
          (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight;

        //@step 8
        if (candidate >= (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          continue;
        }

        //@step 9
        distance.set(edge.to, candidate);
        parent.set(edge.to, edge.from);
        changed = true;
      }

      //@step 12
      if (!changed) {
        break;
      }
    }

    let hasNegativeCycle = false;
    for (const edge of graph.edges) {
      if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }

      //@step 14
      if (
        (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight <
        (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)
      ) {
        hasNegativeCycle = true;
        break;
      }
    }

    //@step 16
    return { distance, parent, hasNegativeCycle };
  }
  //#endregion bellman-ford
`);

const BELLMAN_FORD_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string, weight: number }} WeightedEdge
   * @typedef {{ nodes: GraphNode[], edges: WeightedEdge[] }} WeightedGraphData
   */
  //#endregion graph-types

  /**
   * Compute shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  function bellmanFord(graph, source) {
      const distance = new Map();
      const parent = new Map();

      for (const node of graph.nodes) {
          distance.set(node.id, Number.POSITIVE_INFINITY);
          parent.set(node.id, null);
      }

      distance.set(source, 0);

      for (let pass = 1; pass < graph.nodes.length; pass += 1) {
          //@step 5
          let changed = false;

          for (const edge of graph.edges) {
              if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
                  continue;
              }

              //@step 7
              const candidate =
                  (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight;

              //@step 8
              if (candidate >= (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
                  continue;
              }

              //@step 9
              distance.set(edge.to, candidate);
              parent.set(edge.to, edge.from);
              changed = true;
          }

          //@step 12
          if (!changed) {
              break;
          }
      }

      let hasNegativeCycle = false;
      for (const edge of graph.edges) {
          if (!Number.isFinite(distance.get(edge.from) ?? Number.POSITIVE_INFINITY)) {
              continue;
          }

          //@step 14
          if (
              (distance.get(edge.from) ?? Number.POSITIVE_INFINITY) + edge.weight <
              (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)
          ) {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return { distance, parent, hasNegativeCycle };
  }
  //#endregion bellman-ford
  `,
  'javascript',
);

const BELLMAN_FORD_PY = buildStructuredCode(
  `
  from dataclasses import dataclass


  //#region graph-types interface collapsed
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
  Compute shortest paths even when edge weights may be negative.
  Input: directed weighted graph and a source node id.
  Returns: distance map, predecessor map, and a negative-cycle flag.
  """
  //#region bellman-ford function open
  //@step 2
  def bellman_ford(
      graph: WeightedGraphData,
      source: str,
  ) -> tuple[dict[str, float], dict[str, str | None], bool]:
      distance = {node.id: float("inf") for node in graph.nodes}
      parent = {node.id: None for node in graph.nodes}
      distance[source] = 0.0

      for _pass in range(1, len(graph.nodes)):
          //@step 5
          changed = False

          for edge in graph.edges:
              if distance[edge.from_id] == float("inf"):
                  continue

              //@step 7
              candidate = distance[edge.from_id] + edge.weight

              //@step 8
              if candidate >= distance[edge.to]:
                  continue

              //@step 9
              distance[edge.to] = candidate
              parent[edge.to] = edge.from_id
              changed = True

          //@step 12
          if not changed:
              break

      has_negative_cycle = False
      for edge in graph.edges:
          if distance[edge.from_id] == float("inf"):
              continue

          //@step 14
          if distance[edge.from_id] + edge.weight < distance[edge.to]:
              has_negative_cycle = True
              break

      //@step 16
      return distance, parent, has_negative_cycle
  //#endregion bellman-ford
  `,
  'python',
);

const BELLMAN_FORD_CS = buildStructuredCode(
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
  /// Computes shortest paths even when edge weights may be negative.
  /// Input: directed weighted graph and a source node id.
  /// Returns: distance map, predecessor map, and a negative-cycle flag.
  /// </summary>
  //#region bellman-ford function open
  //@step 2
  public static (
      Dictionary<string, double> Distance,
      Dictionary<string, string?> Parent,
      bool HasNegativeCycle
  ) BellmanFord(WeightedGraphData graph, string source)
  {
      var distance = new Dictionary<string, double>();
      var parent = new Dictionary<string, string?>();

      foreach (var node in graph.Nodes)
      {
          distance[node.Id] = double.PositiveInfinity;
          parent[node.Id] = null;
      }

      distance[source] = 0.0;

      for (var pass = 1; pass < graph.Nodes.Count; pass += 1)
      {
          //@step 5
          var changed = false;

          foreach (var edge in graph.Edges)
          {
              if (double.IsPositiveInfinity(distance[edge.From]))
              {
                  continue;
              }

              //@step 7
              var candidate = distance[edge.From] + edge.Weight;

              //@step 8
              if (candidate >= distance[edge.To])
              {
                  continue;
              }

              //@step 9
              distance[edge.To] = candidate;
              parent[edge.To] = edge.From;
              changed = true;
          }

          //@step 12
          if (!changed)
          {
              break;
          }
      }

      var hasNegativeCycle = false;
      foreach (var edge in graph.Edges)
      {
          if (double.IsPositiveInfinity(distance[edge.From]))
          {
              continue;
          }

          //@step 14
          if (distance[edge.From] + edge.Weight < distance[edge.To])
          {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return (distance, parent, hasNegativeCycle);
  }
  //#endregion bellman-ford
  `,
  'csharp',
);

const BELLMAN_FORD_JAVA = buildStructuredCode(
  `
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  //#region graph-types interface collapsed
  public record GraphNode(String id) {}

  public record WeightedEdge(String from, String to, double weight) {}

  public record WeightedGraphData(
      List<GraphNode> nodes,
      List<WeightedEdge> edges
  ) {}
  //#endregion graph-types

  public record BellmanFordResult(
      Map<String, Double> distance,
      Map<String, String> parent,
      boolean hasNegativeCycle
  ) {}

  //#region bellman-ford function open
  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //@step 2
  public static BellmanFordResult bellmanFord(
      WeightedGraphData graph,
      String source
  ) {
      Map<String, Double> distance = new HashMap<>();
      Map<String, String> parent = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          distance.put(node.id(), Double.POSITIVE_INFINITY);
          parent.put(node.id(), null);
      }

      distance.put(source, 0.0);

      for (int pass = 1; pass < graph.nodes().size(); pass += 1) {
          //@step 5
          boolean changed = false;

          for (WeightedEdge edge : graph.edges()) {
              if (!Double.isFinite(distance.get(edge.from()))) {
                  continue;
              }

              //@step 7
              double candidate = distance.get(edge.from()) + edge.weight();

              //@step 8
              if (candidate >= distance.get(edge.to())) {
                  continue;
              }

              //@step 9
              distance.put(edge.to(), candidate);
              parent.put(edge.to(), edge.from());
              changed = true;
          }

          //@step 12
          if (!changed) {
              break;
          }
      }

      boolean hasNegativeCycle = false;
      for (WeightedEdge edge : graph.edges()) {
          if (!Double.isFinite(distance.get(edge.from()))) {
              continue;
          }

          //@step 14
          if (distance.get(edge.from()) + edge.weight() < distance.get(edge.to())) {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return new BellmanFordResult(distance, parent, hasNegativeCycle);
  }
  //#endregion bellman-ford
  `,
  'java',
);

const BELLMAN_FORD_CPP = buildStructuredCode(
  `
  #include <cmath>
  #include <limits>
  #include <string>
  #include <unordered_map>
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

  struct BellmanFordResult {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> parent;
      bool hasNegativeCycle;
  };
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  BellmanFordResult bellmanFord(
      const WeightedGraphData& graph,
      const std::string& source
  ) {
      std::unordered_map<std::string, double> distance;
      std::unordered_map<std::string, std::string> parent;

      for (const auto& node : graph.nodes) {
          distance[node.id] = std::numeric_limits<double>::infinity();
          parent[node.id] = "";
      }

      distance[source] = 0.0;

      for (int pass = 1; pass < static_cast<int>(graph.nodes.size()); pass += 1) {
          //@step 5
          bool changed = false;

          for (const auto& edge : graph.edges) {
              if (!std::isfinite(distance[edge.from])) {
                  continue;
              }

              //@step 7
              const double candidate = distance[edge.from] + edge.weight;

              //@step 8
              if (candidate >= distance[edge.to]) {
                  continue;
              }

              //@step 9
              distance[edge.to] = candidate;
              parent[edge.to] = edge.from;
              changed = true;
          }

          //@step 12
          if (!changed) {
              break;
          }
      }

      bool hasNegativeCycle = false;
      for (const auto& edge : graph.edges) {
          if (!std::isfinite(distance[edge.from])) {
              continue;
          }

          //@step 14
          if (distance[edge.from] + edge.weight < distance[edge.to]) {
              hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return { distance, parent, hasNegativeCycle };
  }
  //#endregion bellman-ford
  `,
  'cpp',
);

const BELLMAN_FORD_GO = buildStructuredCode(
  `
  package graphs

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

  type BellmanFordResult struct {
      Distance         map[string]float64
      Parent           map[string]*string
      HasNegativeCycle bool
  }
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  func BellmanFord(graph WeightedGraphData, source string) BellmanFordResult {
      distance := map[string]float64{}
      parent := map[string]*string{}

      for _, node := range graph.Nodes {
          distance[node.ID] = math.Inf(1)
          parent[node.ID] = nil
      }

      distance[source] = 0

      for pass := 1; pass < len(graph.Nodes); pass += 1 {
          //@step 5
          changed := false

          for _, edge := range graph.Edges {
              if math.IsInf(distance[edge.From], 1) {
                  continue
              }

              //@step 7
              candidate := distance[edge.From] + edge.Weight

              //@step 8
              if candidate >= distance[edge.To] {
                  continue
              }

              //@step 9
              distance[edge.To] = candidate
              parentValue := edge.From
              parent[edge.To] = &parentValue
              changed = true
          }

          //@step 12
          if !changed {
              break
          }
      }

      hasNegativeCycle := false
      for _, edge := range graph.Edges {
          if math.IsInf(distance[edge.From], 1) {
              continue
          }

          //@step 14
          if distance[edge.From]+edge.Weight < distance[edge.To] {
              hasNegativeCycle = true
              break
          }
      }

      //@step 16
      return BellmanFordResult{
          Distance: distance,
          Parent: parent,
          HasNegativeCycle: hasNegativeCycle,
      }
  }
  //#endregion bellman-ford
  `,
  'go',
);

const BELLMAN_FORD_RUST = buildStructuredCode(
  `
  use std::collections::HashMap;

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

  struct BellmanFordResult {
      distance: HashMap<String, f64>,
      parent: HashMap<String, Option<String>>,
      has_negative_cycle: bool,
  }
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  fn bellman_ford(graph: &WeightedGraphData, source: &str) -> BellmanFordResult {
      let mut distance = HashMap::new();
      let mut parent = HashMap::new();

      for node in &graph.nodes {
          distance.insert(node.id.clone(), f64::INFINITY);
          parent.insert(node.id.clone(), None);
      }

      distance.insert(source.to_string(), 0.0);

      for _pass in 1..graph.nodes.len() {
          //@step 5
          let mut changed = false;

          for edge in &graph.edges {
              if distance.get(&edge.from).copied().unwrap_or(f64::INFINITY).is_infinite() {
                  continue;
              }

              //@step 7
              let candidate =
                  distance.get(&edge.from).copied().unwrap_or(f64::INFINITY) + edge.weight;

              //@step 8
              if candidate >= distance.get(&edge.to).copied().unwrap_or(f64::INFINITY) {
                  continue;
              }

              //@step 9
              distance.insert(edge.to.clone(), candidate);
              parent.insert(edge.to.clone(), Some(edge.from.clone()));
              changed = true;
          }

          //@step 12
          if !changed {
              break;
          }
      }

      let mut has_negative_cycle = false;
      for edge in &graph.edges {
          if distance.get(&edge.from).copied().unwrap_or(f64::INFINITY).is_infinite() {
              continue;
          }

          //@step 14
          if distance.get(&edge.from).copied().unwrap_or(f64::INFINITY) + edge.weight
              < distance.get(&edge.to).copied().unwrap_or(f64::INFINITY)
          {
              has_negative_cycle = true;
              break;
          }
      }

      //@step 16
      BellmanFordResult {
          distance,
          parent,
          has_negative_cycle,
      }
  }
  //#endregion bellman-ford
  `,
  'rust',
);

const BELLMAN_FORD_SWIFT = buildStructuredCode(
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
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  func bellmanFord(
      graph: WeightedGraphData,
      source: String,
  ) -> (
      distance: [String: Double],
      parent: [String: String?],
      hasNegativeCycle: Bool
  ) {
      var distance: [String: Double] = [:]
      var parent: [String: String?] = [:]

      for node in graph.nodes {
          distance[node.id] = Double.infinity
          parent[node.id] = nil
      }

      distance[source] = 0

      for _ in 1..<graph.nodes.count {
          //@step 5
          var changed = false

          for edge in graph.edges {
              if !(distance[edge.from] ?? Double.infinity).isFinite {
                  continue
              }

              //@step 7
              let candidate = (distance[edge.from] ?? Double.infinity) + edge.weight

              //@step 8
              if candidate >= (distance[edge.to] ?? Double.infinity) {
                  continue
              }

              //@step 9
              distance[edge.to] = candidate
              parent[edge.to] = edge.from
              changed = true
          }

          //@step 12
          if !changed {
              break
          }
      }

      var hasNegativeCycle = false
      for edge in graph.edges {
          if !(distance[edge.from] ?? Double.infinity).isFinite {
              continue
          }

          //@step 14
          if (distance[edge.from] ?? Double.infinity) + edge.weight < (distance[edge.to] ?? Double.infinity) {
              hasNegativeCycle = true
              break
          }
      }

      //@step 16
      return (distance, parent, hasNegativeCycle)
  }
  //#endregion bellman-ford
  `,
  'swift',
);

const BELLMAN_FORD_PHP = buildStructuredCode(
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
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   *
   * @return array{
   *   distance: array<string, float>,
   *   parent: array<string, string|null>,
   *   hasNegativeCycle: bool
   * }
   */
  //#region bellman-ford function open
  //@step 2
  function bellmanFord(WeightedGraphData $graph, string $source): array
  {
      $distance = [];
      $parent = [];

      foreach ($graph->nodes as $node) {
          $distance[$node->id] = INF;
          $parent[$node->id] = null;
      }

      $distance[$source] = 0.0;

      for ($pass = 1; $pass < count($graph->nodes); $pass += 1) {
          //@step 5
          $changed = false;

          foreach ($graph->edges as $edge) {
              if (!is_finite($distance[$edge->from] ?? INF)) {
                  continue;
              }

              //@step 7
              $candidate = ($distance[$edge->from] ?? INF) + $edge->weight;

              //@step 8
              if ($candidate >= ($distance[$edge->to] ?? INF)) {
                  continue;
              }

              //@step 9
              $distance[$edge->to] = $candidate;
              $parent[$edge->to] = $edge->from;
              $changed = true;
          }

          //@step 12
          if (!$changed) {
              break;
          }
      }

      $hasNegativeCycle = false;
      foreach ($graph->edges as $edge) {
          if (!is_finite($distance[$edge->from] ?? INF)) {
              continue;
          }

          //@step 14
          if (($distance[$edge->from] ?? INF) + $edge->weight < ($distance[$edge->to] ?? INF)) {
              $hasNegativeCycle = true;
              break;
          }
      }

      //@step 16
      return [
          'distance' => $distance,
          'parent' => $parent,
          'hasNegativeCycle' => $hasNegativeCycle,
      ];
  }
  //#endregion bellman-ford
  `,
  'php',
);

const BELLMAN_FORD_KOTLIN = buildStructuredCode(
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

  data class BellmanFordResult(
      val distance: Map<String, Double>,
      val parent: Map<String, String?>,
      val hasNegativeCycle: Boolean,
  )
  //#endregion graph-types

  /**
   * Computes shortest paths even when edge weights may be negative.
   * Input: directed weighted graph and a source node id.
   * Returns: distance map, predecessor map, and a negative-cycle flag.
   */
  //#region bellman-ford function open
  //@step 2
  fun bellmanFord(graph: WeightedGraphData, source: String): BellmanFordResult {
      val distance = mutableMapOf<String, Double>()
      val parent = mutableMapOf<String, String?>()

      for (node in graph.nodes) {
          distance[node.id] = Double.POSITIVE_INFINITY
          parent[node.id] = null
      }

      distance[source] = 0.0

      for (pass in 1 until graph.nodes.size) {
          //@step 5
          var changed = false

          for (edge in graph.edges) {
              if (!(distance[edge.from] ?: Double.POSITIVE_INFINITY).isFinite()) {
                  continue
              }

              //@step 7
              val candidate = (distance[edge.from] ?: Double.POSITIVE_INFINITY) + edge.weight

              //@step 8
              if (candidate >= (distance[edge.to] ?: Double.POSITIVE_INFINITY)) {
                  continue
              }

              //@step 9
              distance[edge.to] = candidate
              parent[edge.to] = edge.from
              changed = true
          }

          //@step 12
          if (!changed) {
              break
          }
      }

      var hasNegativeCycle = false
      for (edge in graph.edges) {
          if (!(distance[edge.from] ?: Double.POSITIVE_INFINITY).isFinite()) {
              continue
          }

          //@step 14
          if ((distance[edge.from] ?: Double.POSITIVE_INFINITY) + edge.weight <
              (distance[edge.to] ?: Double.POSITIVE_INFINITY)
          ) {
              hasNegativeCycle = true
              break
          }
      }

      //@step 16
      return BellmanFordResult(distance, parent, hasNegativeCycle)
  }
  //#endregion bellman-ford
  `,
  'kotlin',
);

export const BELLMAN_FORD_CODE = BELLMAN_FORD_TS.lines;
export const BELLMAN_FORD_CODE_REGIONS = BELLMAN_FORD_TS.regions;
export const BELLMAN_FORD_CODE_HIGHLIGHT_MAP = BELLMAN_FORD_TS.highlightMap;
export const BELLMAN_FORD_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BELLMAN_FORD_TS.lines,
    regions: BELLMAN_FORD_TS.regions,
    highlightMap: BELLMAN_FORD_TS.highlightMap,
    source: BELLMAN_FORD_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BELLMAN_FORD_JS.lines,
    regions: BELLMAN_FORD_JS.regions,
    highlightMap: BELLMAN_FORD_JS.highlightMap,
    source: BELLMAN_FORD_JS.source,
  },
  python: {
    language: 'python',
    lines: BELLMAN_FORD_PY.lines,
    regions: BELLMAN_FORD_PY.regions,
    highlightMap: BELLMAN_FORD_PY.highlightMap,
    source: BELLMAN_FORD_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BELLMAN_FORD_CS.lines,
    regions: BELLMAN_FORD_CS.regions,
    highlightMap: BELLMAN_FORD_CS.highlightMap,
    source: BELLMAN_FORD_CS.source,
  },
  java: {
    language: 'java',
    lines: BELLMAN_FORD_JAVA.lines,
    regions: BELLMAN_FORD_JAVA.regions,
    highlightMap: BELLMAN_FORD_JAVA.highlightMap,
    source: BELLMAN_FORD_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BELLMAN_FORD_CPP.lines,
    regions: BELLMAN_FORD_CPP.regions,
    highlightMap: BELLMAN_FORD_CPP.highlightMap,
    source: BELLMAN_FORD_CPP.source,
  },
  go: {
    language: 'go',
    lines: BELLMAN_FORD_GO.lines,
    regions: BELLMAN_FORD_GO.regions,
    highlightMap: BELLMAN_FORD_GO.highlightMap,
    source: BELLMAN_FORD_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BELLMAN_FORD_RUST.lines,
    regions: BELLMAN_FORD_RUST.regions,
    highlightMap: BELLMAN_FORD_RUST.highlightMap,
    source: BELLMAN_FORD_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BELLMAN_FORD_SWIFT.lines,
    regions: BELLMAN_FORD_SWIFT.regions,
    highlightMap: BELLMAN_FORD_SWIFT.highlightMap,
    source: BELLMAN_FORD_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BELLMAN_FORD_PHP.lines,
    regions: BELLMAN_FORD_PHP.regions,
    highlightMap: BELLMAN_FORD_PHP.highlightMap,
    source: BELLMAN_FORD_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BELLMAN_FORD_KOTLIN.lines,
    regions: BELLMAN_FORD_KOTLIN.regions,
    highlightMap: BELLMAN_FORD_KOTLIN.highlightMap,
    source: BELLMAN_FORD_KOTLIN.source,
  },
};
