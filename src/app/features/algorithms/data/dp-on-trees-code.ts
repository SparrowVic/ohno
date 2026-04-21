import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TREE_DP_TS = buildStructuredCode(`
  //#region tree-node interface collapsed
  interface TreeNode {
    readonly weight: number;
    readonly neighbors: number[];
  }
  //#endregion tree-node

  /**
   * Compute a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  function treeDp(tree: TreeNode[], root = 0): number {
    const take = Array.from({ length: tree.length }, () => 0);
    const skip = Array.from({ length: tree.length }, () => 0);
    const parent = Array.from({ length: tree.length }, () => -1);

    //@step 2
    function dfs(node: number, from: number): void {
      parent[node] = from;
      take[node] = tree[node].weight;
      skip[node] = 0;

      if (tree[node].neighbors.length === (from === -1 ? 0 : 1)) {
        //@step 5
        return;
      }

      for (const neighbor of tree[node].neighbors) {
        if (neighbor === from) {
          continue;
        }

        dfs(neighbor, node);

        //@step 6
        take[node] += skip[neighbor];
        skip[node] += Math.max(take[neighbor], skip[neighbor]);
      }

      //@step 8
      take[node] = take[node];
    }

    dfs(root, -1);

    function trace(node: number, parentTaken: boolean): void {
      //@step 11
      const takeNode = !parentTaken && take[node] >= skip[node];
      for (const neighbor of tree[node].neighbors) {
        if (neighbor === parent[node]) {
          continue;
        }

        trace(neighbor, takeNode);
      }
    }

    trace(root, false);

    //@step 12
    return Math.max(take[root], skip[root]);
  }
  //#endregion tree-dp
`);

const TREE_DP_PY = buildStructuredCode(
  `
  from typing import TypedDict


  //#region tree-node interface collapsed
  class TreeNode(TypedDict):
      weight: int
      neighbors: list[int]
  //#endregion tree-node

  """
  Compute a maximum-weight independent set on a tree.
  Input: rooted tree as adjacency lists plus node weights.
  Returns: best achievable total weight.
  """
  //#region tree-dp function open
  def tree_dp(tree: list[TreeNode], root: int = 0) -> int:
      take = [0] * len(tree)
      skip = [0] * len(tree)
      parent = [-1] * len(tree)

      //@step 2
      def dfs(node: int, parent_node: int) -> None:
          parent[node] = parent_node
          take[node] = tree[node]["weight"]
          skip[node] = 0

          if len(tree[node]["neighbors"]) == (0 if parent_node == -1 else 1):
              //@step 5
              return

          for neighbor in tree[node]["neighbors"]:
              if neighbor == parent_node:
                  continue

              dfs(neighbor, node)

              //@step 6
              take[node] += skip[neighbor]
              skip[node] += max(take[neighbor], skip[neighbor])

          //@step 8
          take[node] = take[node]

      dfs(root, -1)

      def trace(node: int, parent_taken: bool) -> None:
          //@step 11
          take_node = not parent_taken and take[node] >= skip[node]
          for neighbor in tree[node]["neighbors"]:
              if neighbor == parent[node]:
                  continue
              trace(neighbor, take_node)

      trace(root, False)

      //@step 12
      return max(take[root], skip[root])
  //#endregion tree-dp
  `,
  'python',
);

const TREE_DP_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region tree-node interface collapsed
  public sealed class TreeNode
  {
      public required int Weight { get; init; }
      public required List<int> Neighbors { get; init; }
  }
  //#endregion tree-node

  /// <summary>
  /// Computes a maximum-weight independent set on a tree.
  /// Input: rooted tree as adjacency lists plus node weights.
  /// Returns: best achievable total weight.
  /// </summary>
  //#region tree-dp function open
  public static int TreeDp(IReadOnlyList<TreeNode> tree, int root = 0)
  {
      var take = new int[tree.Count];
      var skip = new int[tree.Count];
      var parent = new int[tree.Count];
      Array.Fill(parent, -1);

      //@step 2
      void Dfs(int node, int parentNode)
      {
          parent[node] = parentNode;
          take[node] = tree[node].Weight;
          skip[node] = 0;

          if (tree[node].Neighbors.Count == (parentNode == -1 ? 0 : 1))
          {
              //@step 5
              return;
          }

          foreach (var neighbor in tree[node].Neighbors)
          {
              if (neighbor == parentNode)
              {
                  continue;
              }

              Dfs(neighbor, node);

              //@step 6
              take[node] += skip[neighbor];
              skip[node] += Math.Max(take[neighbor], skip[neighbor]);
          }

          //@step 8
          take[node] = take[node];
      }

      Dfs(root, -1);

      void Trace(int node, bool parentTaken)
      {
          //@step 11
          var takeNode = !parentTaken && take[node] >= skip[node];
          foreach (var neighbor in tree[node].Neighbors)
          {
              if (neighbor == parent[node])
              {
                  continue;
              }

              Trace(neighbor, takeNode);
          }
      }

      Trace(root, false);

      //@step 12
      return Math.Max(take[root], skip[root]);
  }
  //#endregion tree-dp
  `,
  'csharp',
);

const TREE_DP_JAVA = buildStructuredCode(
  `
  import java.util.List;

  //#region tree-node interface collapsed
  public record TreeNode(int weight, List<Integer> neighbors) {}
  //#endregion tree-node

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  public static int treeDp(List<TreeNode> tree, int root) {
      int[] take = new int[tree.size()];
      int[] skip = new int[tree.size()];
      int[] parent = new int[tree.size()];
      java.util.Arrays.fill(parent, -1);

      //@step 2
      dfs(tree, root, -1, take, skip, parent);
      trace(tree, root, false, take, skip, parent);

      //@step 12
      return Math.max(take[root], skip[root]);
  }
  //#endregion tree-dp

  //#region traversal helper collapsed
  private static void dfs(
      List<TreeNode> tree,
      int node,
      int parentNode,
      int[] take,
      int[] skip,
      int[] parent
  ) {
      parent[node] = parentNode;
      take[node] = tree.get(node).weight();
      skip[node] = 0;

      if (tree.get(node).neighbors().size() == (parentNode == -1 ? 0 : 1)) {
          //@step 5
          return;
      }

      for (int neighbor : tree.get(node).neighbors()) {
          if (neighbor == parentNode) {
              continue;
          }

          dfs(tree, neighbor, node, take, skip, parent);

          //@step 6
          take[node] += skip[neighbor];
          skip[node] += Math.max(take[neighbor], skip[neighbor]);
      }

      //@step 8
      take[node] = take[node];
  }

  private static void trace(
      List<TreeNode> tree,
      int node,
      boolean parentTaken,
      int[] take,
      int[] skip,
      int[] parent
  ) {
      //@step 11
      boolean takeNode = !parentTaken && take[node] >= skip[node];
      for (int neighbor : tree.get(node).neighbors()) {
          if (neighbor == parent[node]) {
              continue;
          }

          trace(tree, neighbor, takeNode, take, skip, parent);
      }
  }
  //#endregion traversal
  `,
  'java',
);

const TREE_DP_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  struct TreeNode {
      int weight;
      std::vector<int> neighbors;
  };

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  int treeDp(const std::vector<TreeNode>& tree, int root = 0) {
      std::vector<int> take(tree.size(), 0);
      std::vector<int> skip(tree.size(), 0);
      std::vector<int> parent(tree.size(), -1);

      //@step 2
      dfs(tree, root, -1, take, skip, parent);
      trace(tree, root, false, take, skip, parent);

      //@step 12
      return std::max(take[root], skip[root]);
  }
  //#endregion tree-dp

  //#region traversal helper collapsed
  void dfs(
      const std::vector<TreeNode>& tree,
      int node,
      int parentNode,
      std::vector<int>& take,
      std::vector<int>& skip,
      std::vector<int>& parent
  ) {
      parent[node] = parentNode;
      take[node] = tree[node].weight;
      skip[node] = 0;

      if (tree[node].neighbors.size() == static_cast<std::size_t>(parentNode == -1 ? 0 : 1)) {
          //@step 5
          return;
      }

      for (int neighbor : tree[node].neighbors) {
          if (neighbor == parentNode) {
              continue;
          }

          dfs(tree, neighbor, node, take, skip, parent);

          //@step 6
          take[node] += skip[neighbor];
          skip[node] += std::max(take[neighbor], skip[neighbor]);
      }

      //@step 8
      take[node] = take[node];
  }

  void trace(
      const std::vector<TreeNode>& tree,
      int node,
      bool parentTaken,
      const std::vector<int>& take,
      const std::vector<int>& skip,
      const std::vector<int>& parent
  ) {
      //@step 11
      bool takeNode = !parentTaken && take[node] >= skip[node];
      for (int neighbor : tree[node].neighbors) {
          if (neighbor == parent[node]) {
              continue;
          }

          trace(tree, neighbor, takeNode, take, skip, parent);
      }
  }
  //#endregion traversal
  `,
  'cpp',
);

const TREE_DP_JS = buildStructuredCode(
  `
  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  function treeDp(tree, root = 0) {
      const take = Array.from({ length: tree.length }, () => 0);
      const skip = Array.from({ length: tree.length }, () => 0);
      const parent = Array.from({ length: tree.length }, () => -1);

      //@step 2
      function dfs(node, from) {
          parent[node] = from;
          take[node] = tree[node].weight;
          skip[node] = 0;

          if (tree[node].neighbors.length === (from === -1 ? 0 : 1)) {
              //@step 5
              return;
          }

          for (const neighbor of tree[node].neighbors) {
              if (neighbor === from) {
                  continue;
              }

              dfs(neighbor, node);

              //@step 6
              take[node] += skip[neighbor];
              skip[node] += Math.max(take[neighbor], skip[neighbor]);
          }

          //@step 8
          take[node] = take[node];
      }

      dfs(root, -1);

      function trace(node, parentTaken) {
          //@step 11
          const takeNode = !parentTaken && take[node] >= skip[node];
          for (const neighbor of tree[node].neighbors) {
              if (neighbor === parent[node]) {
                  continue;
              }

              trace(neighbor, takeNode);
          }
      }

      trace(root, false);

      //@step 12
      return Math.max(take[root], skip[root]);
  }
  //#endregion tree-dp
  `,
  'javascript',
);

const TREE_DP_GO = buildStructuredCode(
  `
  package dp

  //#region tree-node interface collapsed
  type TreeNode struct {
      Weight int
      Neighbors []int
  }
  //#endregion tree-node

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  func TreeDP(tree []TreeNode, root int) int {
      take := make([]int, len(tree))
      skip := make([]int, len(tree))
      parent := make([]int, len(tree))
      for i := range parent {
          parent[i] = -1
      }

      var dfs func(int, int)
      //@step 2
      dfs = func(node int, from int) {
          parent[node] = from
          take[node] = tree[node].Weight
          skip[node] = 0

          expectedDegree := 0
          if from != -1 {
              expectedDegree = 1
          }
          if len(tree[node].Neighbors) == expectedDegree {
              //@step 5
              return
          }

          for _, neighbor := range tree[node].Neighbors {
              if neighbor == from {
                  continue
              }

              dfs(neighbor, node)

              //@step 6
              take[node] += skip[neighbor]
              skip[node] += maxInt(take[neighbor], skip[neighbor])
          }

          //@step 8
          take[node] = take[node]
      }

      dfs(root, -1)

      var trace func(int, bool)
      trace = func(node int, parentTaken bool) {
          //@step 11
          takeNode := !parentTaken && take[node] >= skip[node]
          for _, neighbor := range tree[node].Neighbors {
              if neighbor == parent[node] {
                  continue
              }

              trace(neighbor, takeNode)
          }
      }

      trace(root, false)

      //@step 12
      return maxInt(take[root], skip[root])
  }
  //#endregion tree-dp

  //#region max helper collapsed
  func maxInt(a int, b int) int {
      if a > b {
          return a
      }
      return b
  }
  //#endregion max
  `,
  'go',
);

const TREE_DP_RUST = buildStructuredCode(
  `
  //#region tree-node interface collapsed
  struct TreeNode {
      weight: i32,
      neighbors: Vec<usize>,
  }
  //#endregion tree-node

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  fn tree_dp(tree: &[TreeNode], root: usize) -> i32 {
      let mut take = vec![0; tree.len()];
      let mut skip = vec![0; tree.len()];
      let mut parent = vec![-1isize; tree.len()];

      //@step 2
      dfs(tree, root, -1, &mut take, &mut skip, &mut parent);
      trace(tree, root, false, &take, &skip, &parent);

      //@step 12
      take[root].max(skip[root])
  }
  //#endregion tree-dp

  //#region traversal helper collapsed
  fn dfs(
      tree: &[TreeNode],
      node: usize,
      from: isize,
      take: &mut [i32],
      skip: &mut [i32],
      parent: &mut [isize],
  ) {
      parent[node] = from;
      take[node] = tree[node].weight;
      skip[node] = 0;

      if tree[node].neighbors.len() == if from == -1 { 0 } else { 1 } {
          //@step 5
          return;
      }

      for &neighbor in &tree[node].neighbors {
          if neighbor as isize == from {
              continue;
          }

          dfs(tree, neighbor, node as isize, take, skip, parent);

          //@step 6
          take[node] += skip[neighbor];
          skip[node] += take[neighbor].max(skip[neighbor]);
      }

      //@step 8
      take[node] = take[node];
  }

  fn trace(
      tree: &[TreeNode],
      node: usize,
      parent_taken: bool,
      take: &[i32],
      skip: &[i32],
      parent: &[isize],
  ) {
      //@step 11
      let take_node = !parent_taken && take[node] >= skip[node];
      for &neighbor in &tree[node].neighbors {
          if neighbor as isize == parent[node] {
              continue;
          }

          trace(tree, neighbor, take_node, take, skip, parent);
      }
  }
  //#endregion traversal
  `,
  'rust',
);

const TREE_DP_SWIFT = buildStructuredCode(
  `
  //#region tree-node interface collapsed
  struct TreeNode {
      let weight: Int
      let neighbors: [Int]
  }
  //#endregion tree-node

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  func treeDp(_ tree: [TreeNode], root: Int = 0) -> Int {
      var take = Array(repeating: 0, count: tree.count)
      var skip = Array(repeating: 0, count: tree.count)
      var parent = Array(repeating: -1, count: tree.count)

      //@step 2
      func dfs(_ node: Int, _ from: Int) {
          parent[node] = from
          take[node] = tree[node].weight
          skip[node] = 0

          if tree[node].neighbors.count == (from == -1 ? 0 : 1) {
              //@step 5
              return
          }

          for neighbor in tree[node].neighbors where neighbor != from {
              dfs(neighbor, node)

              //@step 6
              take[node] += skip[neighbor]
              skip[node] += max(take[neighbor], skip[neighbor])
          }

          //@step 8
          take[node] = take[node]
      }

      dfs(root, -1)

      func trace(_ node: Int, _ parentTaken: Bool) {
          //@step 11
          let takeNode = !parentTaken && take[node] >= skip[node]
          for neighbor in tree[node].neighbors where neighbor != parent[node] {
              trace(neighbor, takeNode)
          }
      }

      trace(root, false)

      //@step 12
      return max(take[root], skip[root])
  }
  //#endregion tree-dp
  `,
  'swift',
);

const TREE_DP_PHP = buildStructuredCode(
  `
  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  function treeDp(array $tree, int $root = 0): int
  {
      $take = array_fill(0, count($tree), 0);
      $skip = array_fill(0, count($tree), 0);
      $parent = array_fill(0, count($tree), -1);

      $dfs = null;
      //@step 2
      $dfs = function (int $node, int $from) use (&$dfs, &$tree, &$take, &$skip, &$parent): void {
          $parent[$node] = $from;
          $take[$node] = $tree[$node]['weight'];
          $skip[$node] = 0;

          if (count($tree[$node]['neighbors']) === ($from === -1 ? 0 : 1)) {
              //@step 5
              return;
          }

          foreach ($tree[$node]['neighbors'] as $neighbor) {
              if ($neighbor === $from) {
                  continue;
              }

              $dfs($neighbor, $node);

              //@step 6
              $take[$node] += $skip[$neighbor];
              $skip[$node] += max($take[$neighbor], $skip[$neighbor]);
          }

          //@step 8
          $take[$node] = $take[$node];
      };

      $dfs($root, -1);

      $trace = null;
      $trace = function (int $node, bool $parentTaken) use (&$trace, &$tree, &$take, &$skip, &$parent): void {
          //@step 11
          $takeNode = !$parentTaken && $take[$node] >= $skip[$node];
          foreach ($tree[$node]['neighbors'] as $neighbor) {
              if ($neighbor === $parent[$node]) {
                  continue;
              }

              $trace($neighbor, $takeNode);
          }
      };

      $trace($root, false);

      //@step 12
      return max($take[$root], $skip[$root]);
  }
  //#endregion tree-dp
  `,
  'php',
);

const TREE_DP_KOTLIN = buildStructuredCode(
  `
  //#region tree-node interface collapsed
  data class TreeNode(
      val weight: Int,
      val neighbors: List<Int>,
  )
  //#endregion tree-node

  /**
   * Computes a maximum-weight independent set on a tree.
   * Input: rooted tree as adjacency lists plus node weights.
   * Returns: best achievable total weight.
   */
  //#region tree-dp function open
  fun treeDp(tree: List<TreeNode>, root: Int = 0): Int {
      val take = IntArray(tree.size)
      val skip = IntArray(tree.size)
      val parent = IntArray(tree.size) { -1 }

      //@step 2
      fun dfs(node: Int, from: Int) {
          parent[node] = from
          take[node] = tree[node].weight
          skip[node] = 0

          if (tree[node].neighbors.size == if (from == -1) 0 else 1) {
              //@step 5
              return
          }

          for (neighbor in tree[node].neighbors) {
              if (neighbor == from) {
                  continue
              }

              dfs(neighbor, node)

              //@step 6
              take[node] += skip[neighbor]
              skip[node] += maxOf(take[neighbor], skip[neighbor])
          }

          //@step 8
          take[node] = take[node]
      }

      dfs(root, -1)

      fun trace(node: Int, parentTaken: Boolean) {
          //@step 11
          val takeNode = !parentTaken && take[node] >= skip[node]
          for (neighbor in tree[node].neighbors) {
              if (neighbor == parent[node]) {
                  continue
              }

              trace(neighbor, takeNode)
          }
      }

      trace(root, false)

      //@step 12
      return maxOf(take[root], skip[root])
  }
  //#endregion tree-dp
  `,
  'kotlin',
);

export const DP_ON_TREES_CODE = TREE_DP_TS.lines;
export const DP_ON_TREES_CODE_REGIONS = TREE_DP_TS.regions;
export const DP_ON_TREES_CODE_HIGHLIGHT_MAP = TREE_DP_TS.highlightMap;
export const DP_ON_TREES_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TREE_DP_TS.lines,
    regions: TREE_DP_TS.regions,
    highlightMap: TREE_DP_TS.highlightMap,
    source: TREE_DP_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: TREE_DP_JS.lines,
    regions: TREE_DP_JS.regions,
    highlightMap: TREE_DP_JS.highlightMap,
    source: TREE_DP_JS.source,
  },
  python: {
    language: 'python',
    lines: TREE_DP_PY.lines,
    regions: TREE_DP_PY.regions,
    highlightMap: TREE_DP_PY.highlightMap,
    source: TREE_DP_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: TREE_DP_CS.lines,
    regions: TREE_DP_CS.regions,
    highlightMap: TREE_DP_CS.highlightMap,
    source: TREE_DP_CS.source,
  },
  java: {
    language: 'java',
    lines: TREE_DP_JAVA.lines,
    regions: TREE_DP_JAVA.regions,
    highlightMap: TREE_DP_JAVA.highlightMap,
    source: TREE_DP_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: TREE_DP_CPP.lines,
    regions: TREE_DP_CPP.regions,
    highlightMap: TREE_DP_CPP.highlightMap,
    source: TREE_DP_CPP.source,
  },
  go: {
    language: 'go',
    lines: TREE_DP_GO.lines,
    regions: TREE_DP_GO.regions,
    highlightMap: TREE_DP_GO.highlightMap,
    source: TREE_DP_GO.source,
  },
  rust: {
    language: 'rust',
    lines: TREE_DP_RUST.lines,
    regions: TREE_DP_RUST.regions,
    highlightMap: TREE_DP_RUST.highlightMap,
    source: TREE_DP_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: TREE_DP_SWIFT.lines,
    regions: TREE_DP_SWIFT.regions,
    highlightMap: TREE_DP_SWIFT.highlightMap,
    source: TREE_DP_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: TREE_DP_PHP.lines,
    regions: TREE_DP_PHP.regions,
    highlightMap: TREE_DP_PHP.highlightMap,
    source: TREE_DP_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: TREE_DP_KOTLIN.lines,
    regions: TREE_DP_KOTLIN.regions,
    highlightMap: TREE_DP_KOTLIN.highlightMap,
    source: TREE_DP_KOTLIN.source,
  },
};
