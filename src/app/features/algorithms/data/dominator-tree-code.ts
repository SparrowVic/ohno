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
};
