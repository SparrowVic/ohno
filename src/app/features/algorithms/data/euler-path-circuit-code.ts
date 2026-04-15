import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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
};
