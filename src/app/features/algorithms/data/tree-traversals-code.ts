import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TREE_TRAVERSALS_TS = buildStructuredCode(`
  //#region tree-node interface collapsed
  interface TreeNode<T> {
    readonly value: T;
    readonly left: TreeNode<T> | null;
    readonly right: TreeNode<T> | null;
  }
  //#endregion tree-node

  /**
   * Walk a binary tree in the four canonical orders.
   * Each traversal emits the node labels in the visit order;
   * DFS variants share the same skeleton and differ only by
   * where the \`visit(node)\` call sits relative to the recursive
   * descent.
   */
  //#region preorder function open
  function preorder<T>(node: TreeNode<T> | null, out: T[]): void {
    if (node === null) return;

    //@step 2
    out.push(node.value); // visit BEFORE descending

    //@step 3
    preorder(node.left, out);

    //@step 6
    preorder(node.right, out);
  }

  function inorder<T>(node: TreeNode<T> | null, out: T[]): void {
    if (node === null) return;

    //@step 4
    inorder(node.left, out);

    //@step 5
    out.push(node.value); // visit BETWEEN children

    //@step 6
    inorder(node.right, out);
  }

  function postorder<T>(node: TreeNode<T> | null, out: T[]): void {
    if (node === null) return;

    //@step 4
    postorder(node.left, out);

    //@step 6
    postorder(node.right, out);

    //@step 7
    out.push(node.value); // visit AFTER descending both subtrees
  }

  function levelOrder<T>(root: TreeNode<T> | null, out: T[]): void {
    if (root === null) return;

    //@step 3
    const queue: TreeNode<T>[] = [root];

    while (queue.length > 0) {
      //@step 5
      const node = queue.shift()!;
      out.push(node.value);

      //@step 7
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    //@step 9
    // queue drained — every node has been visited level by level
  }
  //#endregion preorder
`);

export const TREE_TRAVERSALS_CODE = TREE_TRAVERSALS_TS.lines;
export const TREE_TRAVERSALS_CODE_REGIONS = TREE_TRAVERSALS_TS.regions;
export const TREE_TRAVERSALS_CODE_HIGHLIGHT_MAP = TREE_TRAVERSALS_TS.highlightMap;
export const TREE_TRAVERSALS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TREE_TRAVERSALS_TS.lines,
    regions: TREE_TRAVERSALS_TS.regions,
    highlightMap: TREE_TRAVERSALS_TS.highlightMap,
    source: TREE_TRAVERSALS_TS.source,
  },
};
