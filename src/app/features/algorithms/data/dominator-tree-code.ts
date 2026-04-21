import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const DOMINATOR_TREE_TS = buildStructuredCode(`
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
   * Compute the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  function dominatorTree(
    graph: GraphData,
    entry: string,
  ): Map<string, string | null> {
    const predecessors = buildPredecessorMap(graph);
    const nodeIds = graph.nodes.map((node) => node.id);
    const dom = new Map<string, Set<string>>();

    //@step 2
    for (const nodeId of nodeIds) {
      dom.set(
        nodeId,
        nodeId === entry ? new Set([nodeId]) : new Set(nodeIds),
      );
    }

    let changed = true;
    while (changed) {
      changed = false;

      for (const nodeId of nodeIds) {
        if (nodeId === entry) {
          continue;
        }

        const preds = predecessors.get(nodeId) ?? [];
        if (preds.length === 0) {
          continue;
        }

        //@step 4
        let intersection = new Set(dom.get(preds[0]!) ?? []);

        //@step 5
        for (const predId of preds.slice(1)) {
          intersection = intersect(intersection, dom.get(predId) ?? new Set());
        }

        //@step 6
        const next = new Set(intersection);
        next.add(nodeId);

        if (!sameSet(dom.get(nodeId) ?? new Set(), next)) {
          dom.set(nodeId, next);
          changed = true;
        }
      }
    }

    const idom = new Map<string, string | null>([[entry, null]]);

    for (const nodeId of nodeIds) {
      if (nodeId === entry) {
        continue;
      }

      //@step 8
      idom.set(nodeId, chooseImmediateDominator(nodeId, dom));
    }

    //@step 9
    return idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  function buildPredecessorMap(graph: GraphData): Map<string, string[]> {
    const predecessors = new Map<string, string[]>();

    for (const node of graph.nodes) {
      predecessors.set(node.id, []);
    }

    for (const edge of graph.edges) {
      predecessors.get(edge.to)?.push(edge.from);
    }

    return predecessors;
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  function intersect(
    left: ReadonlySet<string>,
    right: ReadonlySet<string>,
  ): Set<string> {
    const result = new Set<string>();

    for (const nodeId of left) {
      if (right.has(nodeId)) {
        result.add(nodeId);
      }
    }

    return result;
  }
  //#endregion intersect

  //#region same-set helper collapsed
  function sameSet(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
    if (left.size !== right.size) {
      return false;
    }

    for (const value of left) {
      if (!right.has(value)) {
        return false;
      }
    }

    return true;
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  function chooseImmediateDominator(
    nodeId: string,
    dom: ReadonlyMap<string, ReadonlySet<string>>,
  ): string | null {
    const strictDominators = [...(dom.get(nodeId) ?? new Set<string>())].filter(
      (candidate) => candidate !== nodeId,
    );

    return (
      strictDominators.find((candidate) =>
        strictDominators.every(
          (other) =>
            other === candidate || !(dom.get(other)?.has(candidate) ?? false),
        ),
      ) ?? null
    );
  }
  //#endregion choose-idom
`);

const DOMINATOR_TREE_JS = buildStructuredCode(
  `
  //#region graph-types interface collapsed
  /**
   * @typedef {{ id: string }} GraphNode
   * @typedef {{ from: string, to: string }} GraphEdge
   * @typedef {{ nodes: GraphNode[], edges: GraphEdge[] }} GraphData
   */
  //#endregion graph-types

  /**
   * Compute the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  function dominatorTree(graph, entry) {
      const predecessors = buildPredecessorMap(graph);
      const nodeIds = graph.nodes.map((node) => node.id);
      const dom = new Map();

      //@step 2
      for (const nodeId of nodeIds) {
          dom.set(nodeId, nodeId === entry ? new Set([nodeId]) : new Set(nodeIds));
      }

      let changed = true;
      while (changed) {
          changed = false;

          for (const nodeId of nodeIds) {
              if (nodeId === entry) {
                  continue;
              }

              const preds = predecessors.get(nodeId) ?? [];
              if (preds.length === 0) {
                  continue;
              }

              //@step 4
              let intersection = new Set(dom.get(preds[0]) ?? []);

              //@step 5
              for (const predId of preds.slice(1)) {
                  intersection = intersect(intersection, dom.get(predId) ?? new Set());
              }

              //@step 6
              const next = new Set(intersection);
              next.add(nodeId);

              if (!sameSet(dom.get(nodeId) ?? new Set(), next)) {
                  dom.set(nodeId, next);
                  changed = true;
              }
          }
      }

      const idom = new Map([[entry, null]]);

      for (const nodeId of nodeIds) {
          if (nodeId === entry) {
              continue;
          }

          //@step 8
          idom.set(nodeId, chooseImmediateDominator(nodeId, dom));
      }

      //@step 9
      return idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  function buildPredecessorMap(graph) {
      const predecessors = new Map();

      for (const node of graph.nodes) {
          predecessors.set(node.id, []);
      }

      for (const edge of graph.edges) {
          predecessors.get(edge.to)?.push(edge.from);
      }

      return predecessors;
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  function intersect(left, right) {
      const result = new Set();

      for (const nodeId of left) {
          if (right.has(nodeId)) {
              result.add(nodeId);
          }
      }

      return result;
  }
  //#endregion intersect

  //#region same-set helper collapsed
  function sameSet(left, right) {
      if (left.size !== right.size) {
          return false;
      }

      for (const value of left) {
          if (!right.has(value)) {
              return false;
          }
      }

      return true;
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  function chooseImmediateDominator(nodeId, dom) {
      const strictDominators = [...(dom.get(nodeId) ?? new Set())].filter(
          (candidate) => candidate !== nodeId,
      );

      return (
          strictDominators.find((candidate) =>
              strictDominators.every(
                  (other) =>
                      other === candidate || !(dom.get(other)?.has(candidate) ?? false),
              ),
          ) ?? null
      );
  }
  //#endregion choose-idom
  `,
  'javascript',
);

const DOMINATOR_TREE_PY = buildStructuredCode(
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
  Compute the immediate-dominator tree of a control-flow graph.
  Input: directed graph and the entry block id.
  Returns: map from node id to its immediate dominator.
  """
  //#region dominator function open
  def dominator_tree(graph: GraphData, entry: str) -> dict[str, str | None]:
      predecessors = build_predecessor_map(graph)
      node_ids = [node.id for node in graph.nodes]
      dom: dict[str, set[str]] = {}

      //@step 2
      for node_id in node_ids:
          dom[node_id] = {node_id} if node_id == entry else set(node_ids)

      changed = True
      while changed:
          changed = False

          for node_id in node_ids:
              if node_id == entry:
                  continue

              preds = predecessors.get(node_id, [])
              if not preds:
                  continue

              //@step 4
              intersection = set(dom[preds[0]])

              //@step 5
              for pred_id in preds[1:]:
                  intersection &= dom[pred_id]

              //@step 6
              next_set = set(intersection)
              next_set.add(node_id)

              if dom[node_id] != next_set:
                  dom[node_id] = next_set
                  changed = True

      idom: dict[str, str | None] = {entry: None}
      for node_id in node_ids:
          if node_id == entry:
              continue

          //@step 8
          idom[node_id] = choose_immediate_dominator(node_id, dom)

      //@step 9
      return idom
  //#endregion dominator

  //#region build-predecessor helper collapsed
  def build_predecessor_map(graph: GraphData) -> dict[str, list[str]]:
      predecessors = {node.id: [] for node in graph.nodes}

      for edge in graph.edges:
          predecessors.setdefault(edge.to, []).append(edge.from_id)

      return predecessors
  //#endregion build-predecessor

  //#region choose-idom helper collapsed
  def choose_immediate_dominator(
      node_id: str,
      dom: dict[str, set[str]],
  ) -> str | None:
      strict_dominators = [candidate for candidate in dom[node_id] if candidate != node_id]

      for candidate in strict_dominators:
          if all(other == candidate or candidate not in dom[other] for other in strict_dominators):
              return candidate

      return None
  //#endregion choose-idom
  `,
  'python',
);

const DOMINATOR_TREE_CS = buildStructuredCode(
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
  /// Computes the immediate-dominator tree of a control-flow graph.
  /// Input: directed graph and the entry block id.
  /// Returns: map from node id to its immediate dominator.
  /// </summary>
  //#region dominator function open
  public static Dictionary<string, string?> DominatorTree(
      GraphData graph,
      string entry
  )
  {
      var predecessors = BuildPredecessorMap(graph);
      var nodeIds = graph.Nodes.Select(node => node.Id).ToList();
      var dom = new Dictionary<string, HashSet<string>>();

      //@step 2
      foreach (var nodeId in nodeIds)
      {
          dom[nodeId] = nodeId == entry ? [nodeId] : [.. nodeIds];
      }

      var changed = true;
      while (changed)
      {
          changed = false;

          foreach (var nodeId in nodeIds)
          {
              if (nodeId == entry)
              {
                  continue;
              }

              var preds = predecessors.GetValueOrDefault(nodeId, []);
              if (preds.Count == 0)
              {
                  continue;
              }

              //@step 4
              var intersection = new HashSet<string>(dom[preds[0]]);

              //@step 5
              foreach (var predId in preds.Skip(1))
              {
                  intersection.IntersectWith(dom[predId]);
              }

              //@step 6
              var nextSet = new HashSet<string>(intersection) { nodeId };
              if (!dom[nodeId].SetEquals(nextSet))
              {
                  dom[nodeId] = nextSet;
                  changed = true;
              }
          }
      }

      var idom = new Dictionary<string, string?> { [entry] = null };
      foreach (var nodeId in nodeIds)
      {
          if (nodeId == entry)
          {
              continue;
          }

          //@step 8
          idom[nodeId] = ChooseImmediateDominator(nodeId, dom);
      }

      //@step 9
      return idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  private static Dictionary<string, List<string>> BuildPredecessorMap(GraphData graph)
  {
      var predecessors = new Dictionary<string, List<string>>();

      foreach (var node in graph.Nodes)
      {
          predecessors[node.Id] = [];
      }

      foreach (var edge in graph.Edges)
      {
          predecessors[edge.To].Add(edge.From);
      }

      return predecessors;
  }
  //#endregion build-predecessor

  //#region choose-idom helper collapsed
  private static string? ChooseImmediateDominator(
      string nodeId,
      IReadOnlyDictionary<string, HashSet<string>> dom
  )
  {
      var strictDominators = dom[nodeId].Where(candidate => candidate != nodeId).ToList();

      foreach (var candidate in strictDominators)
      {
          if (strictDominators.All(other => other == candidate || !dom[other].Contains(candidate)))
          {
              return candidate;
          }
      }

      return null;
  }
  //#endregion choose-idom
  `,
  'csharp',
);

const DOMINATOR_TREE_JAVA = buildStructuredCode(
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

  //#region dominator function open
  /**
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  public static Map<String, String> dominatorTree(GraphData graph, String entry) {
      Map<String, List<String>> predecessors = buildPredecessorMap(graph);
      List<String> nodeIds = graph.nodes().stream().map(GraphNode::id).toList();
      Map<String, Set<String>> dom = new HashMap<>();

      //@step 2
      for (String nodeId : nodeIds) {
          dom.put(nodeId, nodeId.equals(entry) ? new HashSet<>(Set.of(nodeId)) : new HashSet<>(nodeIds));
      }

      boolean changed = true;
      while (changed) {
          changed = false;

          for (String nodeId : nodeIds) {
            if (nodeId.equals(entry)) {
                continue;
            }

            List<String> preds = predecessors.getOrDefault(nodeId, List.of());
            if (preds.isEmpty()) {
                continue;
            }

            //@step 4
            Set<String> intersection = new HashSet<>(dom.get(preds.get(0)));

            //@step 5
            for (int index = 1; index < preds.size(); index += 1) {
                intersection.retainAll(dom.get(preds.get(index)));
            }

            //@step 6
            Set<String> nextSet = new HashSet<>(intersection);
            nextSet.add(nodeId);

            if (!dom.get(nodeId).equals(nextSet)) {
                dom.put(nodeId, nextSet);
                changed = true;
            }
          }
      }

      Map<String, String> idom = new HashMap<>();
      idom.put(entry, null);
      for (String nodeId : nodeIds) {
          if (nodeId.equals(entry)) {
              continue;
          }

          //@step 8
          idom.put(nodeId, chooseImmediateDominator(nodeId, dom));
      }

      //@step 9
      return idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  private static Map<String, List<String>> buildPredecessorMap(GraphData graph) {
      Map<String, List<String>> predecessors = new HashMap<>();

      for (GraphNode node : graph.nodes()) {
          predecessors.put(node.id(), new ArrayList<>());
      }

      for (GraphEdge edge : graph.edges()) {
          predecessors.get(edge.to()).add(edge.from());
      }

      return predecessors;
  }
  //#endregion build-predecessor

  //#region choose-idom helper collapsed
  private static String chooseImmediateDominator(
      String nodeId,
      Map<String, Set<String>> dom
  ) {
      List<String> strictDominators = dom.get(nodeId).stream()
          .filter(candidate -> !candidate.equals(nodeId))
          .toList();

      for (String candidate : strictDominators) {
          boolean deepest = strictDominators.stream()
              .allMatch(other -> other.equals(candidate) || !dom.get(other).contains(candidate));
          if (deepest) {
              return candidate;
          }
      }

      return null;
  }
  //#endregion choose-idom
  `,
  'java',
);

const DOMINATOR_TREE_CPP = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  std::unordered_map<std::string, std::string> dominatorTree(
      const GraphData& graph,
      const std::string& entry
  ) {
      auto predecessors = buildPredecessorMap(graph);
      std::vector<std::string> nodeIds;
      for (const auto& node : graph.nodes) {
          nodeIds.push_back(node.id);
      }

      std::unordered_map<std::string, std::unordered_set<std::string>> dom;

      //@step 2
      for (const auto& nodeId : nodeIds) {
          dom[nodeId] = nodeId == entry
              ? std::unordered_set<std::string>{ nodeId }
              : std::unordered_set<std::string>(nodeIds.begin(), nodeIds.end());
      }

      bool changed = true;
      while (changed) {
          changed = false;

          for (const auto& nodeId : nodeIds) {
              if (nodeId == entry) {
                  continue;
              }

              const auto& preds = predecessors[nodeId];
              if (preds.empty()) {
                  continue;
              }

              //@step 4
              auto intersection = dom[preds.front()];

              //@step 5
              for (int index = 1; index < static_cast<int>(preds.size()); index += 1) {
                  std::unordered_set<std::string> nextIntersection;
                  for (const auto& value : intersection) {
                      if (dom[preds[index]].contains(value)) {
                          nextIntersection.insert(value);
                      }
                  }
                  intersection = std::move(nextIntersection);
              }

              //@step 6
              auto nextSet = intersection;
              nextSet.insert(nodeId);

              if (dom[nodeId] != nextSet) {
                  dom[nodeId] = std::move(nextSet);
                  changed = true;
              }
          }
      }

      std::unordered_map<std::string, std::string> idom = { { entry, "" } };
      for (const auto& nodeId : nodeIds) {
          if (nodeId == entry) {
              continue;
          }

          //@step 8
          idom[nodeId] = chooseImmediateDominator(nodeId, dom);
      }

      //@step 9
      return idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  std::unordered_map<std::string, std::vector<std::string>> buildPredecessorMap(
      const GraphData& graph
  ) {
      std::unordered_map<std::string, std::vector<std::string>> predecessors;

      for (const auto& node : graph.nodes) {
          predecessors[node.id] = {};
      }

      for (const auto& edge : graph.edges) {
          predecessors[edge.to].push_back(edge.from);
      }

      return predecessors;
  }
  //#endregion build-predecessor

  //#region choose-idom helper collapsed
  std::string chooseImmediateDominator(
      const std::string& nodeId,
      const std::unordered_map<std::string, std::unordered_set<std::string>>& dom
  ) {
      std::vector<std::string> strictDominators;
      for (const auto& candidate : dom.at(nodeId)) {
          if (candidate != nodeId) {
              strictDominators.push_back(candidate);
          }
      }

      for (const auto& candidate : strictDominators) {
          bool deepest = true;
          for (const auto& other : strictDominators) {
              if (other != candidate && dom.at(other).contains(candidate)) {
                  deepest = false;
                  break;
              }
          }

          if (deepest) {
              return candidate;
          }
      }

      return "";
  }
  //#endregion choose-idom
  `,
  'cpp',
);

const DOMINATOR_TREE_GO = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  func DominatorTree(graph GraphData, entry string) map[string]*string {
      predecessors := buildPredecessorMap(graph)
      nodeIDs := []string{}
      for _, node := range graph.Nodes {
          nodeIDs = append(nodeIDs, node.ID)
      }
      dom := map[string]map[string]struct{}{}

      //@step 2
      for _, nodeID := range nodeIDs {
          if nodeID == entry {
              dom[nodeID] = map[string]struct{}{nodeID: {}}
          } else {
              dom[nodeID] = makeFullSet(nodeIDs)
          }
      }

      changed := true
      for changed {
          changed = false

          for _, nodeID := range nodeIDs {
              if nodeID == entry {
                  continue
              }

              preds := predecessors[nodeID]
              if len(preds) == 0 {
                  continue
              }

              //@step 4
              intersection := cloneSet(dom[preds[0]])

              //@step 5
              for _, predID := range preds[1:] {
                  intersection = intersect(intersection, dom[predID])
              }

              //@step 6
              next := cloneSet(intersection)
              next[nodeID] = struct{}{}

              if !sameSet(dom[nodeID], next) {
                  dom[nodeID] = next
                  changed = true
              }
          }
      }

      idom := map[string]*string{entry: nil}
      for _, nodeID := range nodeIDs {
          if nodeID == entry {
              continue
          }

          //@step 8
          idom[nodeID] = chooseImmediateDominator(nodeID, dom)
      }

      //@step 9
      return idom
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  func buildPredecessorMap(graph GraphData) map[string][]string {
      predecessors := make(map[string][]string)

      for _, node := range graph.Nodes {
          predecessors[node.ID] = []string{}
      }

      for _, edge := range graph.Edges {
          predecessors[edge.To] = append(predecessors[edge.To], edge.From)
      }

      return predecessors
  }
  //#endregion build-predecessor

  //#region make-full helper collapsed
  func makeFullSet(nodeIDs []string) map[string]struct{} {
      result := map[string]struct{}{}
      for _, nodeID := range nodeIDs {
          result[nodeID] = struct{}{}
      }
      return result
  }
  //#endregion make-full

  //#region clone-set helper collapsed
  func cloneSet(input map[string]struct{}) map[string]struct{} {
      result := map[string]struct{}{}
      for value := range input {
          result[value] = struct{}{}
      }
      return result
  }
  //#endregion clone-set

  //#region intersect helper collapsed
  func intersect(left map[string]struct{}, right map[string]struct{}) map[string]struct{} {
      result := map[string]struct{}{}
      for nodeID := range left {
          if _, ok := right[nodeID]; ok {
              result[nodeID] = struct{}{}
          }
      }
      return result
  }
  //#endregion intersect

  //#region same-set helper collapsed
  func sameSet(left map[string]struct{}, right map[string]struct{}) bool {
      if len(left) != len(right) {
          return false
      }
      for value := range left {
          if _, ok := right[value]; !ok {
              return false
          }
      }
      return true
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  func chooseImmediateDominator(
      nodeID string,
      dom map[string]map[string]struct{},
  ) *string {
      strictDominators := []string{}
      for candidate := range dom[nodeID] {
          if candidate != nodeID {
              strictDominators = append(strictDominators, candidate)
          }
      }

      for _, candidate := range strictDominators {
          valid := true
          for _, other := range strictDominators {
              if other == candidate {
                  continue
              }
              if _, ok := dom[other][candidate]; ok {
                  valid = false
                  break
              }
          }
          if valid {
              result := candidate
              return &result
          }
      }

      return nil
  }
  //#endregion choose-idom
  `,
  'go',
);

const DOMINATOR_TREE_RUST = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  fn dominator_tree(graph: &GraphData, entry: &str) -> HashMap<String, Option<String>> {
      let predecessors = build_predecessor_map(graph);
      let node_ids: Vec<String> = graph.nodes.iter().map(|node| node.id.clone()).collect();
      let mut dom = HashMap::new();

      //@step 2
      for node_id in &node_ids {
          dom.insert(
              node_id.clone(),
              if node_id == entry {
                  HashSet::from([node_id.clone()])
              } else {
                  node_ids.iter().cloned().collect()
              },
          );
      }

      let mut changed = true;
      while changed {
          changed = false;

          for node_id in &node_ids {
              if node_id == entry {
                  continue;
              }

              let preds = predecessors.get(node_id).cloned().unwrap_or_default();
              if preds.is_empty() {
                  continue;
              }

              //@step 4
              let mut intersection = dom.get(&preds[0]).cloned().unwrap_or_default();

              //@step 5
              for pred_id in preds.iter().skip(1) {
                  intersection = intersect(&intersection, dom.get(pred_id).unwrap_or(&HashSet::new()));
              }

              //@step 6
              let mut next = intersection.clone();
              next.insert(node_id.clone());

              if !same_set(dom.get(node_id).unwrap_or(&HashSet::new()), &next) {
                  dom.insert(node_id.clone(), next);
                  changed = true;
              }
          }
      }

      let mut idom = HashMap::from([(entry.to_string(), None)]);
      for node_id in &node_ids {
          if node_id == entry {
              continue;
          }

          //@step 8
          idom.insert(node_id.clone(), choose_immediate_dominator(node_id, &dom));
      }

      //@step 9
      idom
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  fn build_predecessor_map(graph: &GraphData) -> HashMap<String, Vec<String>> {
      let mut predecessors = HashMap::new();

      for node in &graph.nodes {
          predecessors.insert(node.id.clone(), Vec::new());
      }

      for edge in &graph.edges {
          predecessors.entry(edge.to.clone()).or_insert_with(Vec::new).push(edge.from.clone());
      }

      predecessors
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  fn intersect(left: &HashSet<String>, right: &HashSet<String>) -> HashSet<String> {
      left.iter().filter(|node_id| right.contains(*node_id)).cloned().collect()
  }
  //#endregion intersect

  //#region same-set helper collapsed
  fn same_set(left: &HashSet<String>, right: &HashSet<String>) -> bool {
      left == right
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  fn choose_immediate_dominator(
      node_id: &str,
      dom: &HashMap<String, HashSet<String>>,
  ) -> Option<String> {
      let strict_dominators: Vec<String> = dom
          .get(node_id)
          .cloned()
          .unwrap_or_default()
          .into_iter()
          .filter(|candidate| candidate != node_id)
          .collect();

      strict_dominators.iter().find(|candidate| {
          strict_dominators.iter().all(|other| {
              other == *candidate || !dom.get(other).map(|set| set.contains(*candidate)).unwrap_or(false)
          })
      }).cloned()
  }
  //#endregion choose-idom
  `,
  'rust',
);

const DOMINATOR_TREE_SWIFT = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  func dominatorTree(graph: GraphData, entry: String) -> [String: String?] {
      let predecessors = buildPredecessorMap(graph: graph)
      let nodeIds = graph.nodes.map(\.id)
      var dom: [String: Set<String>] = [:]

      //@step 2
      for nodeId in nodeIds {
          dom[nodeId] = nodeId == entry ? [nodeId] : Set(nodeIds)
      }

      var changed = true
      while changed {
          changed = false

          for nodeId in nodeIds {
              if nodeId == entry {
                  continue
              }

              let preds = predecessors[nodeId] ?? []
              if preds.isEmpty {
                  continue
              }

              //@step 4
              var intersection = dom[preds[0]] ?? []

              //@step 5
              for predId in preds.dropFirst() {
                  intersection = intersect(left: intersection, right: dom[predId] ?? [])
              }

              //@step 6
              var next = intersection
              next.insert(nodeId)

              if !sameSet(left: dom[nodeId] ?? [], right: next) {
                  dom[nodeId] = next
                  changed = true
              }
          }
      }

      var idom: [String: String?] = [entry: nil]
      for nodeId in nodeIds {
          if nodeId == entry {
              continue
          }

          //@step 8
          idom[nodeId] = chooseImmediateDominator(nodeId: nodeId, dom: dom)
      }

      //@step 9
      return idom
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  func buildPredecessorMap(graph: GraphData) -> [String: [String]] {
      var predecessors: [String: [String]] = [:]

      for node in graph.nodes {
          predecessors[node.id] = []
      }

      for edge in graph.edges {
          predecessors[edge.to, default: []].append(edge.from)
      }

      return predecessors
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  func intersect(left: Set<String>, right: Set<String>) -> Set<String> {
      left.intersection(right)
  }
  //#endregion intersect

  //#region same-set helper collapsed
  func sameSet(left: Set<String>, right: Set<String>) -> Bool {
      left == right
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  func chooseImmediateDominator(
      nodeId: String,
      dom: [String: Set<String>],
  ) -> String? {
      let strictDominators = (dom[nodeId] ?? []).filter { $0 != nodeId }

      return strictDominators.first { candidate in
          strictDominators.allSatisfy { other in
              other == candidate || !(dom[other]?.contains(candidate) ?? false)
          }
      }
  }
  //#endregion choose-idom
  `,
  'swift',
);

const DOMINATOR_TREE_PHP = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   *
   * @return array<string, string|null>
   */
  //#region dominator function open
  function dominatorTree(GraphData $graph, string $entry): array
  {
      $predecessors = buildPredecessorMap($graph);
      $nodeIds = array_map(fn (GraphNode $node): string => $node->id, $graph->nodes);
      $dom = [];

      //@step 2
      foreach ($nodeIds as $nodeId) {
          $dom[$nodeId] = ($nodeId === $entry)
              ? [$nodeId => true]
              : array_fill_keys($nodeIds, true);
      }

      $changed = true;
      while ($changed) {
          $changed = false;

          foreach ($nodeIds as $nodeId) {
              if ($nodeId === $entry) {
                  continue;
              }

              $preds = $predecessors[$nodeId] ?? [];
              if ($preds === []) {
                  continue;
              }

              //@step 4
              $intersection = $dom[$preds[0]] ?? [];

              //@step 5
              foreach (array_slice($preds, 1) as $predId) {
                  $intersection = intersect($intersection, $dom[$predId] ?? []);
              }

              //@step 6
              $next = $intersection;
              $next[$nodeId] = true;

              if (!sameSet($dom[$nodeId] ?? [], $next)) {
                  $dom[$nodeId] = $next;
                  $changed = true;
              }
          }
      }

      $idom = [$entry => null];
      foreach ($nodeIds as $nodeId) {
          if ($nodeId === $entry) {
              continue;
          }

          //@step 8
          $idom[$nodeId] = chooseImmediateDominator($nodeId, $dom);
      }

      //@step 9
      return $idom;
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  function buildPredecessorMap(GraphData $graph): array
  {
      $predecessors = [];

      foreach ($graph->nodes as $node) {
          $predecessors[$node->id] = [];
      }

      foreach ($graph->edges as $edge) {
          $predecessors[$edge->to][] = $edge->from;
      }

      return $predecessors;
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  function intersect(array $left, array $right): array
  {
      return array_intersect_key($left, $right);
  }
  //#endregion intersect

  //#region same-set helper collapsed
  function sameSet(array $left, array $right): bool
  {
      ksort($left);
      ksort($right);
      return $left === $right;
  }
  //#endregion same-set

  //#region choose-idom helper collapsed
  function chooseImmediateDominator(string $nodeId, array $dom): ?string
  {
      $strictDominators = array_values(array_filter(
          array_keys($dom[$nodeId] ?? []),
          fn (string $candidate): bool => $candidate !== $nodeId,
      ));

      foreach ($strictDominators as $candidate) {
          $valid = true;
          foreach ($strictDominators as $other) {
              if ($other === $candidate) {
                  continue;
              }
              if (($dom[$other][$candidate] ?? false) === true) {
                  $valid = false;
                  break;
              }
          }

          if ($valid) {
              return $candidate;
          }
      }

      return null;
  }
  //#endregion choose-idom
  `,
  'php',
);

const DOMINATOR_TREE_KOTLIN = buildStructuredCode(
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
   * Computes the immediate-dominator tree of a control-flow graph.
   * Input: directed graph and the entry block id.
   * Returns: map from node id to its immediate dominator.
   */
  //#region dominator function open
  fun dominatorTree(graph: GraphData, entry: String): Map<String, String?> {
      val predecessors = buildPredecessorMap(graph)
      val nodeIds = graph.nodes.map { it.id }
      val dom = mutableMapOf<String, MutableSet<String>>()

      //@step 2
      for (nodeId in nodeIds) {
          dom[nodeId] = if (nodeId == entry) mutableSetOf(nodeId) else nodeIds.toMutableSet()
      }

      var changed = true
      while (changed) {
          changed = false

          for (nodeId in nodeIds) {
              if (nodeId == entry) {
                  continue
              }

              val preds = predecessors[nodeId].orEmpty()
              if (preds.isEmpty()) {
                  continue
              }

              //@step 4
              var intersection = dom[preds[0]]?.toMutableSet() ?: mutableSetOf()

              //@step 5
              for (predId in preds.drop(1)) {
                  intersection = intersect(intersection, dom[predId] ?: mutableSetOf())
              }

              //@step 6
              val next = intersection.toMutableSet()
              next += nodeId

              if (!sameSet(dom[nodeId] ?: mutableSetOf(), next)) {
                  dom[nodeId] = next
                  changed = true
              }
          }
      }

      val idom = mutableMapOf<String, String?>(entry to null)
      for (nodeId in nodeIds) {
          if (nodeId == entry) {
              continue
          }

          //@step 8
          idom[nodeId] = chooseImmediateDominator(nodeId, dom)
      }

      //@step 9
      return idom
  }
  //#endregion dominator

  //#region build-predecessor helper collapsed
  fun buildPredecessorMap(graph: GraphData): MutableMap<String, MutableList<String>> {
      val predecessors = mutableMapOf<String, MutableList<String>>()

      for (node in graph.nodes) {
          predecessors[node.id] = mutableListOf()
      }

      for (edge in graph.edges) {
          predecessors.getOrPut(edge.to) { mutableListOf() }.add(edge.from)
      }

      return predecessors
  }
  //#endregion build-predecessor

  //#region intersect helper collapsed
  fun intersect(left: Set<String>, right: Set<String>): MutableSet<String> =
      left.intersect(right).toMutableSet()
  //#endregion intersect

  //#region same-set helper collapsed
  fun sameSet(left: Set<String>, right: Set<String>): Boolean = left == right
  //#endregion same-set

  //#region choose-idom helper collapsed
  fun chooseImmediateDominator(
      nodeId: String,
      dom: Map<String, Set<String>>,
  ): String? {
      val strictDominators = dom[nodeId].orEmpty().filter { it != nodeId }

      return strictDominators.firstOrNull { candidate ->
          strictDominators.all { other ->
              other == candidate || !(dom[other]?.contains(candidate) ?: false)
          }
      }
  }
  //#endregion choose-idom
  `,
  'kotlin',
);

export const DOMINATOR_TREE_CODE = DOMINATOR_TREE_TS.lines;
export const DOMINATOR_TREE_CODE_REGIONS = DOMINATOR_TREE_TS.regions;
export const DOMINATOR_TREE_CODE_HIGHLIGHT_MAP = DOMINATOR_TREE_TS.highlightMap;
export const DOMINATOR_TREE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: DOMINATOR_TREE_TS.lines,
    regions: DOMINATOR_TREE_TS.regions,
    highlightMap: DOMINATOR_TREE_TS.highlightMap,
    source: DOMINATOR_TREE_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: DOMINATOR_TREE_JS.lines,
    regions: DOMINATOR_TREE_JS.regions,
    highlightMap: DOMINATOR_TREE_JS.highlightMap,
    source: DOMINATOR_TREE_JS.source,
  },
  python: {
    language: 'python',
    lines: DOMINATOR_TREE_PY.lines,
    regions: DOMINATOR_TREE_PY.regions,
    highlightMap: DOMINATOR_TREE_PY.highlightMap,
    source: DOMINATOR_TREE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: DOMINATOR_TREE_CS.lines,
    regions: DOMINATOR_TREE_CS.regions,
    highlightMap: DOMINATOR_TREE_CS.highlightMap,
    source: DOMINATOR_TREE_CS.source,
  },
  java: {
    language: 'java',
    lines: DOMINATOR_TREE_JAVA.lines,
    regions: DOMINATOR_TREE_JAVA.regions,
    highlightMap: DOMINATOR_TREE_JAVA.highlightMap,
    source: DOMINATOR_TREE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: DOMINATOR_TREE_CPP.lines,
    regions: DOMINATOR_TREE_CPP.regions,
    highlightMap: DOMINATOR_TREE_CPP.highlightMap,
    source: DOMINATOR_TREE_CPP.source,
  },
  go: {
    language: 'go',
    lines: DOMINATOR_TREE_GO.lines,
    regions: DOMINATOR_TREE_GO.regions,
    highlightMap: DOMINATOR_TREE_GO.highlightMap,
    source: DOMINATOR_TREE_GO.source,
  },
  rust: {
    language: 'rust',
    lines: DOMINATOR_TREE_RUST.lines,
    regions: DOMINATOR_TREE_RUST.regions,
    highlightMap: DOMINATOR_TREE_RUST.highlightMap,
    source: DOMINATOR_TREE_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: DOMINATOR_TREE_SWIFT.lines,
    regions: DOMINATOR_TREE_SWIFT.regions,
    highlightMap: DOMINATOR_TREE_SWIFT.highlightMap,
    source: DOMINATOR_TREE_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: DOMINATOR_TREE_PHP.lines,
    regions: DOMINATOR_TREE_PHP.regions,
    highlightMap: DOMINATOR_TREE_PHP.highlightMap,
    source: DOMINATOR_TREE_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: DOMINATOR_TREE_KOTLIN.lines,
    regions: DOMINATOR_TREE_KOTLIN.regions,
    highlightMap: DOMINATOR_TREE_KOTLIN.highlightMap,
    source: DOMINATOR_TREE_KOTLIN.source,
  },
};
