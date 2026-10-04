import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText, isI18nText } from '../../../../core/i18n/translatable-text';
import { backtrackingGenerator } from '../../algorithms/backtracking/backtracking';
import { mctsGenerator } from '../../algorithms/mcts/mcts';
import { minimaxAlphaBetaGenerator } from '../../algorithms/minimax-alpha-beta/minimax-alpha-beta';
import { CallTreeLabTraceState, CallTreeNode } from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import {
  createMcTsScenario,
  createMinimaxScenario,
  createNQueensScenario,
} from '../../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
import {
  CALL_TREE_NODE_RADIUS,
  boardCells,
  boardPlacedCount,
  callTreeCurrentId,
  callTreeGlyph,
  callTreeMetrics,
  callTreeNodeTone,
  callTreeNodeValue,
  callTreePathRows,
  callTreeScene,
  callTreeSlots,
  followScroll,
} from './call-tree-display.utils';

const TITLES = I18N_KEY.features.algorithms.display.callTree.titles;

function states(steps: Iterable<SortStep>): CallTreeLabTraceState[] {
  return [...steps].flatMap((step) => (step.callTreeLab ? [step.callTreeLab] : []));
}

const queens = () => states(backtrackingGenerator(createNQueensScenario(5, 'classic')));
const minimax = () => states(minimaxAlphaBetaGenerator(createMinimaxScenario(9, 'prunable')));
const mcts = () => states(mctsGenerator(createMcTsScenario(10, 'classic')));

function node(id: string, parentId: string | null, phase: CallTreeNode['phase'] = 'explored'): CallTreeNode {
  return { id, parentId, title: id, subtitle: null, badge: null, phase, stats: [], edgeLabel: null };
}

describe('call-tree layout', () => {
  it('gives leaves sequential slots and centres parents over their children', () => {
    const { slots, leafCount, maxDepth } = callTreeSlots([node('a', null), node('b', 'a'), node('c', 'a'), node('d', 'c'), node('e', 'c')]);
    expect(leafCount).toBe(3);
    expect(maxDepth).toBe(2);
    expect(slots.get('b')).toEqual({ slot: 0, depth: 1 });
    expect(slots.get('c')).toEqual({ slot: 1.5, depth: 1 });
    expect(slots.get('a')).toEqual({ slot: 0.75, depth: 0 });
  });

  it('stretches gaps to fit and clamps them so nodes never touch', () => {
    const roomy = callTreeMetrics(3, 2, 600, 400);
    expect(roomy.leafGap).toBe(56);
    expect(roomy.offsetY).toBeGreaterThan(0);
    expect(roomy.width).toBe(600);
    expect(roomy.offsetX).toBeGreaterThan(0);
    const crowded = callTreeMetrics(80, 6, 600, 300);
    expect(crowded.leafGap).toBeGreaterThan(CALL_TREE_NODE_RADIUS * 2);
    expect(crowded.width).toBeGreaterThan(600);
    expect(crowded.levelGap).toBe(60);
    expect(crowded.offsetX).toBe(0);
  });

  it('builds a scene whose nodes stay inside its box', () => {
    for (const state of [...queens(), ...minimax(), ...mcts()]) {
      const scene = callTreeScene(state, 640, 360);
      expect(scene.nodes).toHaveLength(state.nodes.length);
      for (const view of scene.nodes) {
        expect(view.x - CALL_TREE_NODE_RADIUS).toBeGreaterThanOrEqual(0);
        expect(view.x + CALL_TREE_NODE_RADIUS).toBeLessThanOrEqual(scene.width);
        expect(view.y + CALL_TREE_NODE_RADIUS).toBeLessThanOrEqual(scene.height);
      }
      expect(scene.nodes.filter((view) => view.current).length).toBeLessThanOrEqual(1);
    }
  });

  it('scrolls only when the current node leaves the view', () => {
    const view = { left: 0, top: 0, width: 400, height: 300 };
    expect(followScroll({ x: 200, y: 150 }, view, 40)).toBeNull();
    expect(followScroll({ x: 900, y: 150 }, view, 40)).toEqual({ left: 700, top: 0 });
    expect(followScroll({ x: 20, y: 150 }, { ...view, left: 300 }, 40)).toEqual({ left: 0, top: 0 });
  });
});

describe('call-tree tones', () => {
  it('lights exactly one current node while searching and none on the result', () => {
    const all = queens();
    const probe = all.find((state) => state.tone === 'descend');
    expect(probe && callTreeCurrentId(probe)).toBe(probe?.activePath[probe.activePath.length - 1]);
    const solved = all.find((state) => state.tone === 'solve');
    expect(solved && callTreeCurrentId(solved)).toBeNull();
    const scene = callTreeScene(solved ?? null, 640, 360);
    const onPath = new Set(solved?.activePath ?? []);
    expect(scene.nodes.filter((view) => onPath.has(view.id)).every((view) => view.tone === 'lime')).toBe(true);
    expect(scene.edges.some((edge) => edge.tone === 'lime')).toBe(true);
  });

  it('marks conflicts pink with a cross and dims them once the search moves on', () => {
    const conflict = node('x', 'a', 'conflict');
    expect(callTreeNodeTone(conflict, 'backtracking', { current: false, onPath: true, result: false })).toEqual({ tone: 'pink', dim: false, mark: 'cross' });
    expect(callTreeNodeTone(conflict, 'backtracking', { current: false, onPath: false, result: false })).toEqual({ tone: 'pink', dim: true, mark: 'cross' });
    expect(callTreeNodeTone(node('p', 'a', 'pruned'), 'minimax', { current: false, onPath: false, result: false }).tone).toBe('pink');
    expect(callTreeNodeTone(node('b', 'a', 'backtracked'), 'backtracking', { current: false, onPath: false, result: false })).toEqual({ tone: 'slate', dim: true, mark: 'undo' });
  });

  it('settles explored minimax nodes lime but keeps visited MCTS nodes slate', () => {
    const flags = { current: false, onPath: false, result: false };
    expect(callTreeNodeTone(node('m', 'a'), 'minimax', flags).tone).toBe('lime');
    expect(callTreeNodeTone(node('m', 'a'), 'mcts', flags).tone).toBe('slate');
    expect(callTreeNodeTone(node('m', 'a', 'current'), 'mcts', { ...flags, onPath: true }).tone).toBe('path');
  });

  it('draws pruned minimax branches on the prunable preset', () => {
    const last = minimax().at(-1);
    const scene = callTreeScene(last ?? null, 640, 360);
    expect(scene.nodes.some((view) => view.tone === 'pink' && view.mark === 'cross')).toBe(true);
  });
});

describe('call-tree labels', () => {
  it('puts the decision inside the ring', () => {
    expect(callTreeGlyph('backtracking', i18nText(TITLES.queen, { row: 2, col: 3 }))).toEqual({ text: '3', dot: true });
    expect(callTreeGlyph('backtracking', i18nText(TITLES.root))).toEqual({ text: '', dot: false });
    expect(callTreeGlyph('minimax', i18nText(TITLES.max, { depth: 2 }))).toEqual({ text: '▲', dot: false });
    expect(callTreeGlyph('minimax', i18nText(TITLES.min, { depth: 1 }))).toEqual({ text: '▼', dot: false });
    expect(callTreeGlyph('minimax', i18nText(TITLES.leaf, { value: 4 }))).toEqual({ text: '', dot: false });
    expect(callTreeGlyph('mcts', i18nText(TITLES.arm, { arm: 2 }))).toEqual({ text: '2', dot: true });
    expect(callTreeGlyph('mcts', i18nText(TITLES.root))).toEqual({ text: '', dot: false });
  });

  it('emits every generator title as a title key', () => {
    const titles = [...queens(), ...minimax(), ...mcts()].flatMap((state) => state.nodes.map((entry) => entry.title));
    for (const title of titles) {
      expect(isI18nText(title) && Object.values(TITLES).includes(title.key as never)).toBe(true);
    }
  });

  it('reads the value under a node from its stats', () => {
    const settled = minimax().at(-1)?.nodes.find((entry) => entry.parentId === null);
    expect(settled && callTreeNodeValue(settled)).toMatch(/^-?\d+$/);
    const visited = mcts().at(-1)?.nodes.find((entry) => entry.parentId === null);
    expect(Number(visited && callTreeNodeValue(visited))).toBeGreaterThan(0);
    expect(queens().at(-1)?.nodes.every((entry) => callTreeNodeValue(entry) === null)).toBe(true);
  });

  it('lists the active path frontier first like a stack with the root at the bottom', () => {
    const probe = queens().find((state) => state.activePath.length > 2 && state.tone === 'descend');
    const rows = callTreePathRows(probe ?? null);
    expect(rows.at(-1)?.title).toEqual(i18nText(TITLES.root));
    expect(rows[0]?.tone).toBe('now');
    expect(rows.map((row) => row.depth)).toEqual(rows.map((_, index) => rows.length - 1 - index));
  });

  it('keeps following the path end after the search settles', () => {
    const last = minimax().at(-1);
    const scene = callTreeScene(last ?? null, 400, 300);
    expect(scene.focus?.id).toBe(last?.rootId);
    expect(scene.nodes.some((view) => view.current)).toBe(false);
  });
});

describe('call-tree board', () => {
  it('maps board cells onto tones and counts queens', () => {
    const solved = queens().find((state) => state.tone === 'solve');
    const board = solved?.sidecar ?? null;
    const cells = boardCells(board);
    expect(cells).toHaveLength(25);
    expect(boardPlacedCount(board)).toBe(5);
    expect(cells.filter((cell) => cell.tone === 'lime').every((cell) => cell.glyph === '♛')).toBe(true);
    const conflict = queens().find((state) => state.tone === 'prune');
    expect(boardCells(conflict?.sidecar ?? null).some((cell) => cell.tone === 'pink' && cell.glyph === '×')).toBe(true);
    expect(boardCells(null)).toEqual([]);
  });
});
