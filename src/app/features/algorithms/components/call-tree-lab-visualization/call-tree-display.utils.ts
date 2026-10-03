import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  BoardCellState,
  CallTreeLabMode,
  CallTreeLabTraceState,
  CallTreeNode,
  CallTreeSidecarBoard,
} from '../../models/call-tree-lab';

const TITLES = I18N_KEY.features.algorithms.display.callTree.titles;

export const CALL_TREE_NODE_RADIUS = 14;
export const CALL_TREE_PADDING = { x: 26, top: 26, bottom: 34 } as const;

const LEAF_GAP = { min: 36, max: 56 } as const;
const LEVEL_GAP = { min: 60, max: 84 } as const;

const VALUE_STAT_KEYS: readonly string[] = [
  'features.algorithms.runtime.callTreeLab.minimax.stats.value',
  'features.algorithms.runtime.callTreeLab.minimax.stats.leaf',
  'features.algorithms.runtime.callTreeLab.mcts.stats.visits',
];

export type CallTreeNodeTone = 'cyan' | 'path' | 'lime' | 'pink' | 'slate';
export type CallTreeEdgeTone = 'cyan' | 'lime' | 'dim' | 'idle';
export type CallTreeMark = 'cross' | 'check' | 'undo' | null;
export type BoardCellTone = 'cyan' | 'pink' | 'lime' | 'queen' | 'attacked' | 'idle';

export interface CallTreeGlyph {
  readonly text: string;
  readonly dot: boolean;
}

export interface CallTreeNodeView {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly tone: CallTreeNodeTone;
  readonly glyph: CallTreeGlyph;
  readonly value: string | null;
  readonly mark: CallTreeMark;
  readonly current: boolean;
  readonly dim: boolean;
}

export interface CallTreeEdgeView {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly tone: CallTreeEdgeTone;
}

export interface CallTreeScene {
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly CallTreeNodeView[];
  readonly edges: readonly CallTreeEdgeView[];
  readonly focus: CallTreeNodeView | null;
}

export interface CallTreeSlots {
  readonly slots: ReadonlyMap<string, { readonly slot: number; readonly depth: number }>;
  readonly leafCount: number;
  readonly maxDepth: number;
}

export interface CallTreeMetrics {
  readonly leafGap: number;
  readonly levelGap: number;
  readonly width: number;
  readonly height: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface CallTreePathRow {
  readonly id: string;
  readonly depth: number;
  readonly title: TranslatableText;
  readonly value: string | null;
  readonly tone: RackRowTone;
}

export interface BoardCellView {
  readonly id: string;
  readonly tone: BoardCellTone;
  readonly glyph: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function callTreeSlots(nodes: readonly CallTreeNode[]): CallTreeSlots {
  const ids = new Set(nodes.map((node) => node.id));
  const children = new Map<string, string[]>();
  const roots: string[] = [];
  for (const node of nodes) {
    if (node.parentId !== null && ids.has(node.parentId)) {
      const siblings = children.get(node.parentId) ?? [];
      siblings.push(node.id);
      children.set(node.parentId, siblings);
    } else {
      roots.push(node.id);
    }
  }
  const slots = new Map<string, { slot: number; depth: number }>();
  let leafCount = 0;
  let maxDepth = 0;
  const assign = (id: string, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const kids = children.get(id) ?? [];
    if (kids.length === 0) {
      const slot = leafCount;
      leafCount += 1;
      slots.set(id, { slot, depth });
      return slot;
    }
    const kidSlots = kids.map((kid) => assign(kid, depth + 1));
    const slot = ((kidSlots[0] ?? 0) + (kidSlots[kidSlots.length - 1] ?? 0)) / 2;
    slots.set(id, { slot, depth });
    return slot;
  };
  for (const root of roots) assign(root, 0);
  return { slots, leafCount, maxDepth };
}

export function callTreeMetrics(leafCount: number, maxDepth: number, availableWidth: number, availableHeight: number): CallTreeMetrics {
  const innerWidth = availableWidth - CALL_TREE_PADDING.x * 2;
  const innerHeight = availableHeight - CALL_TREE_PADDING.top - CALL_TREE_PADDING.bottom;
  const leafGap = leafCount > 1 ? clamp(innerWidth / (leafCount - 1), LEAF_GAP.min, LEAF_GAP.max) : LEAF_GAP.max;
  const levelGap = maxDepth > 0 ? clamp(innerHeight / maxDepth, LEVEL_GAP.min, LEVEL_GAP.max) : LEVEL_GAP.max;
  const contentWidth = CALL_TREE_PADDING.x * 2 + Math.max(0, leafCount - 1) * leafGap;
  const contentHeight = CALL_TREE_PADDING.top + CALL_TREE_PADDING.bottom + maxDepth * levelGap;
  const width = Math.max(contentWidth, Math.floor(availableWidth));
  const height = Math.max(contentHeight, Math.floor(availableHeight));
  return {
    leafGap,
    levelGap,
    width,
    height,
    offsetX: (width - contentWidth) / 2,
    offsetY: (height - contentHeight) / 2,
  };
}

export function callTreeGlyph(mode: CallTreeLabMode, title: string): CallTreeGlyph {
  if (mode === 'backtracking') {
    const match = /^r\d+, c(\d+)$/.exec(title);
    return { text: match?.[1] ?? '', dot: match !== null };
  }
  if (mode === 'minimax') {
    if (title.startsWith('MAX')) return { text: '▲', dot: false };
    if (title.startsWith('MIN')) return { text: '▼', dot: false };
    return { text: '', dot: false };
  }
  const match = /#(\d+)$/.exec(title);
  return { text: match?.[1] ?? '', dot: match !== null };
}

export function callTreeTitle(title: string): TranslatableText {
  if (title === 'root' || /^row -?\d+$/.test(title)) return TITLES.root;
  const queen = /^r(\d+), c(\d+)$/.exec(title);
  if (queen) return i18nText(TITLES.queen, { row: queen[1] ?? '', col: queen[2] ?? '' });
  const player = /^(MAX|MIN)\(d=(\d+)\)$/.exec(title);
  if (player) return i18nText(player[1] === 'MAX' ? TITLES.max : TITLES.min, { depth: player[2] ?? '' });
  const leaf = /^leaf=(-?\d+)$/.exec(title);
  if (leaf) return i18nText(TITLES.leaf, { value: leaf[1] ?? '' });
  const arm = /^(arm|leaf) #(\d+)$/.exec(title);
  if (arm) return i18nText(arm[1] === 'arm' ? TITLES.arm : TITLES.rollout, arm[1] === 'arm' ? { arm: arm[2] ?? '' } : { leaf: arm[2] ?? '' });
  return title;
}

export function callTreeNodeValue(node: CallTreeNode): string | null {
  for (const key of VALUE_STAT_KEYS) {
    const stat = node.stats.find((entry) => entry.label === key);
    if (stat && typeof stat.value === 'string') return stat.value;
  }
  return null;
}

export function callTreeResultMode(state: CallTreeLabTraceState): boolean {
  return state.tone === 'solve' || state.tone === 'complete';
}

export function callTreeCurrentId(state: CallTreeLabTraceState): string | null {
  if (callTreeResultMode(state)) return null;
  return state.activePath[state.activePath.length - 1] ?? null;
}

export function callTreeNodeTone(
  node: CallTreeNode,
  mode: CallTreeLabMode,
  flags: { readonly current: boolean; readonly onPath: boolean; readonly result: boolean },
): { readonly tone: CallTreeNodeTone; readonly dim: boolean; readonly mark: CallTreeMark } {
  if (flags.current) return { tone: 'cyan', dim: false, mark: node.phase === 'conflict' ? 'cross' : null };
  switch (node.phase) {
    case 'solution':
      return { tone: 'lime', dim: false, mark: mode === 'backtracking' ? 'check' : null };
    case 'conflict':
      return { tone: 'pink', dim: !flags.onPath, mark: 'cross' };
    case 'pruned':
      return { tone: 'pink', dim: true, mark: 'cross' };
    case 'backtracked':
      return { tone: 'slate', dim: true, mark: 'undo' };
    case 'explored':
      if (flags.onPath && flags.result) return { tone: 'lime', dim: false, mark: null };
      return { tone: mode === 'minimax' ? 'lime' : 'slate', dim: false, mark: null };
    default:
      if (flags.onPath) return { tone: flags.result ? 'lime' : 'path', dim: false, mark: null };
      return { tone: 'slate', dim: false, mark: null };
  }
}

export function callTreeScene(state: CallTreeLabTraceState | null, availableWidth: number, availableHeight: number): CallTreeScene {
  if (!state || state.nodes.length === 0) {
    return { width: Math.max(0, availableWidth), height: Math.max(0, availableHeight), nodes: [], edges: [], focus: null };
  }
  const { slots, leafCount, maxDepth } = callTreeSlots(state.nodes);
  const metrics = callTreeMetrics(leafCount, maxDepth, availableWidth, availableHeight);
  const onPath = new Set(state.activePath);
  const result = callTreeResultMode(state);
  const currentId = callTreeCurrentId(state);
  const views: CallTreeNodeView[] = state.nodes.map((node) => {
    const slot = slots.get(node.id) ?? { slot: 0, depth: 0 };
    const look = callTreeNodeTone(node, state.mode, { current: node.id === currentId, onPath: onPath.has(node.id), result });
    return {
      id: node.id,
      x: metrics.offsetX + CALL_TREE_PADDING.x + slot.slot * metrics.leafGap,
      y: metrics.offsetY + CALL_TREE_PADDING.top + slot.depth * metrics.levelGap,
      tone: look.tone,
      glyph: callTreeGlyph(state.mode, node.title),
      value: callTreeNodeValue(node),
      mark: look.mark,
      current: node.id === currentId,
      dim: look.dim,
    };
  });
  const byId = new Map(views.map((view) => [view.id, view]));
  const edges: CallTreeEdgeView[] = [];
  for (const node of state.nodes) {
    const child = byId.get(node.id);
    const parent = node.parentId !== null ? byId.get(node.parentId) : undefined;
    if (!child || !parent) continue;
    const pathEdge = onPath.has(node.id) && onPath.has(parent.id);
    const tone: CallTreeEdgeTone = pathEdge ? (result ? 'lime' : 'cyan') : child.dim ? 'dim' : 'idle';
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const length = Math.hypot(dx, dy) || 1;
    const trim = CALL_TREE_NODE_RADIUS + 1.5;
    edges.push({
      id: `${parent.id}->${child.id}`,
      x1: parent.x + (dx / length) * trim,
      y1: parent.y + (dy / length) * trim,
      x2: child.x - (dx / length) * trim,
      y2: child.y - (dy / length) * trim,
      tone,
    });
  }
  const focusId = state.activePath[state.activePath.length - 1];
  return { width: metrics.width, height: metrics.height, nodes: views, edges, focus: focusId ? (byId.get(focusId) ?? null) : null };
}

export interface ScrollView {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export function followScroll(point: { readonly x: number; readonly y: number }, view: ScrollView, margin: number): { readonly left: number; readonly top: number } | null {
  const outX = point.x < view.left + margin || point.x > view.left + view.width - margin;
  const outY = point.y < view.top + margin || point.y > view.top + view.height - margin;
  if (!outX && !outY) return null;
  return {
    left: outX ? Math.max(0, point.x - view.width / 2) : view.left,
    top: outY ? Math.max(0, point.y - view.height / 2) : view.top,
  };
}

export function callTreePathRows(state: CallTreeLabTraceState | null): readonly CallTreePathRow[] {
  if (!state) return [];
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const result = callTreeResultMode(state);
  const lastIndex = state.activePath.length - 1;
  return state.activePath
    .flatMap((id, depth): CallTreePathRow[] => {
      const node = byId.get(id);
      if (!node) return [];
      const tone: RackRowTone = result ? 'done' : depth === lastIndex ? 'now' : 'default';
      return [{ id, depth, title: callTreeTitle(node.title), value: callTreeNodeValue(node), tone }];
    })
    .reverse();
}

const BOARD_CELL_TONES: Readonly<Record<BoardCellState, BoardCellTone>> = {
  idle: 'idle',
  placed: 'queen',
  current: 'cyan',
  candidate: 'cyan',
  attacked: 'attacked',
  conflict: 'pink',
  solution: 'lime',
};

const BOARD_CELL_GLYPHS: Readonly<Record<BoardCellState, string>> = {
  idle: '·',
  placed: '♛',
  current: '?',
  candidate: '?',
  attacked: '·',
  conflict: '×',
  solution: '♛',
};

export function boardCells(board: CallTreeSidecarBoard | null): readonly BoardCellView[] {
  if (!board) return [];
  return board.cells.map((cell) => ({
    id: `${cell.row}:${cell.col}`,
    tone: BOARD_CELL_TONES[cell.state],
    glyph: BOARD_CELL_GLYPHS[cell.state],
  }));
}

export function boardPlacedCount(board: CallTreeSidecarBoard | null): number {
  return board ? board.cells.filter((cell) => cell.state === 'placed' || cell.state === 'solution').length : 0;
}
