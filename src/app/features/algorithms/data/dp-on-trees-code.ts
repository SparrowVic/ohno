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

export const DP_ON_TREES_CODE = TREE_DP_TS.lines;
export const DP_ON_TREES_CODE_REGIONS = TREE_DP_TS.regions;
export const DP_ON_TREES_CODE_HIGHLIGHT_MAP = TREE_DP_TS.highlightMap;
export const DP_ON_TREES_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: TREE_DP_TS.lines, regions: TREE_DP_TS.regions, highlightMap: TREE_DP_TS.highlightMap, source: TREE_DP_TS.source },
  python: { language: 'python', lines: TREE_DP_PY.lines, regions: TREE_DP_PY.regions, highlightMap: TREE_DP_PY.highlightMap, source: TREE_DP_PY.source },
  csharp: { language: 'csharp', lines: TREE_DP_CS.lines, regions: TREE_DP_CS.regions, highlightMap: TREE_DP_CS.highlightMap, source: TREE_DP_CS.source },
  java: { language: 'java', lines: TREE_DP_JAVA.lines, regions: TREE_DP_JAVA.regions, highlightMap: TREE_DP_JAVA.highlightMap, source: TREE_DP_JAVA.source },
  cpp: { language: 'cpp', lines: TREE_DP_CPP.lines, regions: TREE_DP_CPP.regions, highlightMap: TREE_DP_CPP.highlightMap, source: TREE_DP_CPP.source },
};
