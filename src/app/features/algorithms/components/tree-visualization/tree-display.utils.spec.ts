import { describe, expect, it } from 'vitest';

import { TreeNode, TreeNodeStatus, TreeTraversalTraceState } from '../../models/tree';
import {
  treeBounds,
  treeCapScale,
  treeEdgeTone,
  treeGaps,
  treeGlyphMetrics,
  treeIsComplete,
  treeIsFrontier,
  treeNodeTone,
  treeNodeValueText,
  treeOutputCells,
  treePendingRows,
  treeSegment,
  treeShowsTag,
  treeViewBoxAttr,
} from './tree-display.utils';

function node(id: string, label: string, value: number | null, depth: number, x: number, status: TreeNodeStatus = 'idle'): TreeNode {
  return { id, label, value, parentId: depth === 0 ? null : 'a', depth, x, y: depth * 82, status };
}

const NODES: readonly TreeNode[] = [
  node('a', 'A', 1, 0, 93),
  node('b', 'B', 2, 1, 62, 'onStack'),
  node('c', 'C', 3, 1, 124),
  node('d', 'D', 4, 2, 31, 'current'),
  node('e', 'E', 5, 2, 93, 'visited'),
];

function state(overrides: Partial<TreeTraversalTraceState> = {}): TreeTraversalTraceState {
  return {
    order: 'preorder',
    modeLabel: 'Preorder',
    phaseLabel: 'push',
    presetLabel: '',
    presetDescription: '',
    decisionLabel: '',
    nodes: NODES,
    edges: [],
    stack: ['a', 'b', 'd'],
    queue: [],
    output: ['A', 'B', 'D'],
    currentNodeId: 'd',
    rootId: 'a',
    totalNodes: 5,
    visitedCount: 3,
    computation: null,
    ...overrides,
  };
}

describe('tree display tones', () => {
  it('maps every status onto the semantic palette', () => {
    expect(treeNodeTone('current')).toBe('cyan');
    expect(treeNodeTone('visited')).toBe('lime');
    expect(treeNodeTone('onStack')).toBe('amber');
    expect(treeNodeTone('queued')).toBe('amber');
    expect(treeNodeTone('backtrack')).toBe('pink');
    expect(treeNodeTone('idle')).toBe('slate');
  });

  it('marks stacked and queued nodes as frontier', () => {
    expect(treeIsFrontier('onStack')).toBe(true);
    expect(treeIsFrontier('queued')).toBe(true);
    expect(treeIsFrontier('visited')).toBe(false);
  });

  it('prefers the live path over traversed edges', () => {
    expect(treeEdgeTone({ isOnPath: true, isTraversed: true }, false, 'visited')).toBe('cyan');
    expect(treeEdgeTone({ isOnPath: false, isTraversed: true }, false, 'visited')).toBe('lime');
    expect(treeEdgeTone({ isOnPath: false, isTraversed: false }, false, 'visited')).toBe('idle');
  });

  it('lights level-order edges once the child has been reached', () => {
    expect(treeEdgeTone({ isOnPath: false, isTraversed: false }, true, 'queued')).toBe('lime');
    expect(treeEdgeTone({ isOnPath: false, isTraversed: false }, true, 'idle')).toBe('idle');
    expect(treeEdgeTone({ isOnPath: false, isTraversed: false }, true, null)).toBe('idle');
  });
});

describe('tree node text', () => {
  it('shows the value and falls back to the label', () => {
    expect(treeNodeValueText({ label: 'A', value: 7 })).toBe('7');
    expect(treeNodeValueText({ label: 'A', value: null })).toBe('A');
  });

  it('tags a node only when its label differs from its value', () => {
    expect(treeShowsTag({ label: 'A', value: 1 })).toBe(true);
    expect(treeShowsTag({ label: '25', value: 25 })).toBe(false);
    expect(treeShowsTag({ label: 'A', value: null })).toBe(false);
  });
});

describe('tree geometry', () => {
  it('measures the tightest sibling and level gaps', () => {
    expect(treeGaps(NODES)).toEqual({ horizontal: 62, vertical: 82 });
  });

  it('falls back to layout gaps for a single node', () => {
    expect(treeGaps([node('a', 'A', 1, 0, 0)])).toEqual({ horizontal: 62, vertical: 82 });
  });

  it('pads the bounds and keeps a minimum span', () => {
    const box = treeBounds(NODES, { x: 10, top: 5, bottom: 15 });
    expect(box).toEqual({ x: -12.5, y: -5, width: 180, height: 184 });
    expect(treeViewBoxAttr(box)).toBe('-12.5 -5 180 184');
  });

  it('grows the box when the tree would be magnified past the cap', () => {
    const box = { x: 0, y: 0, width: 100, height: 100 };
    expect(treeCapScale(box, 400, 200, 1)).toEqual({ x: -150, y: -50, width: 400, height: 200 });
    expect(treeCapScale(box, 80, 80, 1)).toBe(box);
  });

  it('keeps Doto values at 14px or more and drops to mono when cramped', () => {
    const roomy = treeGlyphMetrics({ horizontal: 62, vertical: 82 }, 1);
    expect(roomy.ringPx).toBe(14);
    expect(roomy.valueDot).toBe(true);
    expect(roomy.valuePx).toBeGreaterThanOrEqual(14);
    expect(roomy.showTags).toBe(true);

    const cramped = treeGlyphMetrics({ horizontal: 62, vertical: 82 }, 0.3);
    expect(cramped.ringPx).toBe(9);
    expect(cramped.valueDot).toBe(false);
    expect(cramped.showTags).toBe(false);
  });

  it('trims segments to the ring edge', () => {
    expect(treeSegment({ x: 0, y: 0 }, { x: 0, y: 100 }, 10)).toEqual({ x1: 0, y1: 10, x2: 0, y2: 90 });
  });
});

describe('tree racks', () => {
  it('lists the stack top first with the top as head', () => {
    const rows = treePendingRows(state());
    expect(rows.map((row) => row.label)).toEqual(['D', 'B', 'A']);
    expect(rows.map((row) => row.tone)).toEqual(['head', 'default', 'default']);
    expect(rows[0]).toMatchObject({ value: '4', valueDot: true, depth: 2, showLabel: true });
  });

  it('lists the queue front first for level-order', () => {
    const rows = treePendingRows(state({ order: 'level-order', stack: [], queue: ['b', 'c'] }));
    expect(rows.map((row) => row.id)).toEqual(['b', 'c']);
    expect(rows[0].tone).toBe('head');
  });

  it('returns no rows without a state', () => {
    expect(treePendingRows(null)).toEqual([]);
    expect(treeOutputCells(null)).toEqual([]);
  });

  it('renders the visit order as values with the newest cyan', () => {
    const cells = treeOutputCells(state());
    expect(cells.map((cell) => cell.text)).toEqual(['1', '2', '4']);
    expect(cells.map((cell) => cell.tone)).toEqual(['lime', 'lime', 'cyan']);
  });

  it('settles the newest cell once the cursor has moved past it', () => {
    const moved = state({ currentNodeId: 'e' });
    expect(treeOutputCells(moved).map((cell) => cell.tone)).toEqual(['lime', 'lime', 'lime']);
    const idle = state({ currentNodeId: null });
    expect(treeOutputCells(idle).map((cell) => cell.tone)).toEqual(['lime', 'lime', 'lime']);
  });

  it('settles every cell once the traversal is complete', () => {
    const done = state({ output: ['A', 'B', 'D', 'E', 'C'], currentNodeId: null, stack: [] });
    expect(treeIsComplete(done)).toBe(true);
    expect(treeOutputCells(done).every((cell) => cell.tone === 'lime')).toBe(true);
  });
});
