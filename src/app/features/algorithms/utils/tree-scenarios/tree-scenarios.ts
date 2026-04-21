import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { TreePresetOption, TreeTraversalOrder } from '../../models/tree';
import { TreeSeedNode } from '../tree-layout/tree-layout';

export interface TreeTraversalScenario {
  readonly kind: 'tree-traversals';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly order: TreeTraversalOrder;
  readonly seeds: readonly TreeSeedNode[];
}

interface TreePresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): TreePresetKeys {
  return {
    label: t(`${baseKey}.label`),
    description: t(`${baseKey}.description`),
  };
}

const PRESET_KEYS = {
  preorderBalanced: presetKeys(
    'features.algorithms.scenarios.tree.treeTraversals.preorderBalanced',
  ),
  inorderBst: presetKeys('features.algorithms.scenarios.tree.treeTraversals.inorderBst'),
  postorderSizes: presetKeys('features.algorithms.scenarios.tree.treeTraversals.postorderSizes'),
  levelOrderWave: presetKeys('features.algorithms.scenarios.tree.treeTraversals.levelOrderWave'),
} as const;

export const TREE_TRAVERSALS_PRESETS: readonly TreePresetOption[] = [
  {
    id: 'preorder-balanced',
    label: PRESET_KEYS.preorderBalanced.label,
    description: PRESET_KEYS.preorderBalanced.description,
  },
  {
    id: 'inorder-bst',
    label: PRESET_KEYS.inorderBst.label,
    description: PRESET_KEYS.inorderBst.description,
  },
  {
    id: 'postorder-sizes',
    label: PRESET_KEYS.postorderSizes.label,
    description: PRESET_KEYS.postorderSizes.description,
  },
  {
    id: 'level-order-wave',
    label: PRESET_KEYS.levelOrderWave.label,
    description: PRESET_KEYS.levelOrderWave.description,
  },
];

export const DEFAULT_TREE_TRAVERSALS_PRESET_ID = 'preorder-balanced';

/** Build a balanced binary tree of `depth` levels. Labels are A..Z
 *  in a level-order walk so the displayed label order matches how the
 *  user would read the tree top-down. Values default to the label
 *  position to keep the output deterministic. */
function balancedTree(depth: number): readonly TreeSeedNode[] {
  const total = (1 << depth) - 1;
  const seeds: TreeSeedNode[] = [];
  for (let i = 0; i < total; i++) {
    const parentIndex = i === 0 ? -1 : Math.floor((i - 1) / 2);
    seeds.push({
      id: `n${i}`,
      label: indexLabel(i),
      value: i + 1,
      parentId: parentIndex >= 0 ? `n${parentIndex}` : null,
    });
  }
  return seeds;
}

/** A small deterministic BST whose inorder traversal produces a
 *  sorted sequence — designed to teach the "inorder = sorted"
 *  invariant. Shape: 7 nodes, moderate left/right imbalance so the
 *  traversal isn't trivially symmetric. */
function bstTree(): readonly TreeSeedNode[] {
  // BST values chosen so the inorder emits a clear ascending run.
  const values = [25, 14, 36, 7, 18, 30, 42];
  const root = { id: 'r', label: String(values[0]), value: values[0], parentId: null };
  const seeds: TreeSeedNode[] = [root];
  const insert = (value: number, parentId: string): void => {
    const id = `n${seeds.length}`;
    seeds.push({ id, label: String(value), value, parentId });
  };
  // Build structure by repeated insertions; uses the seed ids above.
  // Pre-ordered insertions so labels stay aligned with values.
  insert(values[1], 'r'); // left of 25
  insert(values[2], 'r'); // right of 25
  insert(values[3], seeds[1].id); // left of 14
  insert(values[4], seeds[1].id); // right of 14
  insert(values[5], seeds[2].id); // left of 36
  insert(values[6], seeds[2].id); // right of 36
  return seeds;
}

function indexLabel(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet[index % alphabet.length] + (index >= 26 ? String(Math.floor(index / 26)) : '');
}

/** Resolve a depth based on the UI size setting. Size options are
 *  degrees of tree density — 3 → 7 nodes, 4 → 15, 5 → 31. Stays
 *  readable on the canvas for any of these. */
function depthForSize(size: number): number {
  if (size >= 31) return 5;
  if (size >= 15) return 4;
  return 3;
}

export function createTreeTraversalScenario(
  size: number,
  presetId: string | null,
): TreeTraversalScenario {
  const id = presetId ?? DEFAULT_TREE_TRAVERSALS_PRESET_ID;
  const depth = depthForSize(size);

  switch (id) {
    case 'inorder-bst': {
      return {
        kind: 'tree-traversals',
        presetId: 'inorder-bst',
        presetLabel: PRESET_KEYS.inorderBst.label,
        presetDescription: PRESET_KEYS.inorderBst.description,
        order: 'inorder',
        seeds: bstTree(),
      };
    }
    case 'postorder-sizes': {
      return {
        kind: 'tree-traversals',
        presetId: 'postorder-sizes',
        presetLabel: PRESET_KEYS.postorderSizes.label,
        presetDescription: PRESET_KEYS.postorderSizes.description,
        order: 'postorder',
        seeds: balancedTree(depth),
      };
    }
    case 'level-order-wave': {
      return {
        kind: 'tree-traversals',
        presetId: 'level-order-wave',
        presetLabel: PRESET_KEYS.levelOrderWave.label,
        presetDescription: PRESET_KEYS.levelOrderWave.description,
        order: 'level-order',
        seeds: balancedTree(depth),
      };
    }
    case 'preorder-balanced':
    default: {
      return {
        kind: 'tree-traversals',
        presetId: 'preorder-balanced',
        presetLabel: PRESET_KEYS.preorderBalanced.label,
        presetDescription: PRESET_KEYS.preorderBalanced.description,
        order: 'preorder',
        seeds: balancedTree(depth),
      };
    }
  }
}
