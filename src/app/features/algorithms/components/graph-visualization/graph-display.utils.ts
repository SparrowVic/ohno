import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, translatableKey } from '../../../../core/i18n/translatable-text';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphStepState,
  GraphTone,
} from '../../models/graph';

export const GRAPH_NODE_RADIUS = 14;
export const GRAPH_VIEW_PADDING = { x: 28, top: 34, bottom: 40 } as const;

const LABELS = I18N_KEY.features.algorithms.display.graph.labels;
export type GraphDisplayTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';
export type GraphEdgeTone = Exclude<GraphDisplayTone, 'slate'> | 'rose' | 'soft' | 'base';
export type GraphRouteMode = 'shortest-tree' | 'bfs-tree' | 'dfs-tree';

export const GRAPH_EDGE_TONES: readonly GraphEdgeTone[] = [
  'base',
  'soft',
  'lime',
  'cyan',
  'pink',
  'rose',
  'red',
  'amber',
  'violet',
];

const GRAPH_TONE_COLORS: Readonly<Record<GraphTone, GraphDisplayTone>> = {
  left: 'cyan',
  right: 'pink',
  critical: 'red',
  bridge: 'amber',
  terminal: 'violet',
  steiner: 'lime',
  'component-a': 'cyan',
  'component-b': 'pink',
  'component-c': 'amber',
  'component-d': 'violet',
};

const DISTANCE_METRICS: ReadonlySet<string> = new Set([LABELS.distance, LABELS.level, LABELS.depth, LABELS.best, LABELS.cost]);

const DEFAULT_VIEW_BOX: GraphViewBox = { x: 0, y: 0, width: 960, height: 620 };
const MIN_VIEW_SPAN = 240;
const GLYPH_MAX_SCALE = 6;
const ZERO_PADDING: GraphViewPadding = { x: 0, top: 0, bottom: 0 };
const COMPONENT_TONES: ReadonlySet<GraphTone> = new Set(['component-a', 'component-b', 'component-c', 'component-d']);
const ENDPOINT_TONES: ReadonlySet<GraphTone> = new Set(['left', 'right']);
const DOT_MIN_PX = 14;
const DOT_MAX_GROWTH = 1.4;

export interface GraphPoint {
  readonly x: number;
  readonly y: number;
}

export interface GraphViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface GraphViewPadding {
  readonly x: number;
  readonly top: number;
  readonly bottom: number;
}

export interface GraphSegment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
}

export interface GraphRackRow {
  readonly id: string;
  readonly label: string;
  readonly fromLabel: string | null;
  readonly secondary: TranslatableText | null;
  readonly isSource: boolean;
  readonly value: string;
  readonly tone: RackRowTone;
}

export function graphToneColor(tone: GraphTone | null | undefined): GraphDisplayTone | null {
  return tone ? GRAPH_TONE_COLORS[tone] : null;
}

export function graphNodeTone(node: GraphNodeSnapshot, detailLabel?: TranslatableText | null): GraphDisplayTone {
  const tone = node.tone ?? null;
  if (tone && COMPONENT_TONES.has(tone)) {
    if (node.isCurrent) return 'cyan';
    if (node.isFrontier) return 'amber';
  }
  if (tone && ENDPOINT_TONES.has(tone) && translatableKey(detailLabel) === LABELS.eulerPath) return 'violet';
  const override = graphToneColor(tone);
  if (override) return override;
  if (node.isCurrent) return 'cyan';
  if (node.isSettled) return 'lime';
  if (node.isFrontier) return 'amber';
  if (node.isSource) return 'violet';
  return 'slate';
}

export function graphEdgeTone(edge: GraphEdgeSnapshot, onRoute: boolean): GraphEdgeTone {
  const override = graphToneColor(edge.tone);
  if (edge.isActive) return override === 'red' ? 'red' : 'pink';
  if (override === 'pink') return 'rose';
  if (override && override !== 'slate') return override;
  if (onRoute) return 'cyan';
  if (edge.isTree) return 'lime';
  if (edge.isRelaxed) return 'soft';
  return 'base';
}

export function isDistanceMetric(metricLabel: TranslatableText | null | undefined): boolean {
  const key = translatableKey(metricLabel);
  return key ? DISTANCE_METRICS.has(key) : false;
}

export function graphValueText(value: number | null, metricLabel: TranslatableText | null | undefined): string {
  if (value !== null) return String(value);
  return isDistanceMetric(metricLabel) ? '∞' : '—';
}

export function graphRouteMode(state: GraphStepState | null): GraphRouteMode | null {
  if (!state) return null;
  const metric = translatableKey(state.metricLabel);
  if (metric === LABELS.distance) return 'shortest-tree';
  if (metric === LABELS.level) return 'bfs-tree';
  if (metric === LABELS.depth && translatableKey(state.detailLabel) === LABELS.depthPath) return 'dfs-tree';
  return null;
}

export function graphRouteNodeIds(nodes: readonly GraphNodeSnapshot[], targetId: string | null): string[] {
  if (!targetId) return [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const path: string[] = [];
  const seen = new Set<string>();
  let currentId: string | null = targetId;
  while (currentId && byId.has(currentId) && !seen.has(currentId)) {
    seen.add(currentId);
    path.unshift(currentId);
    currentId = byId.get(currentId)?.previousId ?? null;
  }
  return path;
}

export function graphRouteEdgeIds(
  edges: readonly GraphEdgeSnapshot[],
  path: readonly string[],
): ReadonlySet<string> {
  const ids = new Set<string>();
  for (let index = 0; index < path.length - 1; index++) {
    const from = path[index];
    const to = path[index + 1];
    const edge = edges.find(
      (item) => (item.from === from && item.to === to) || (!item.directed && item.from === to && item.to === from),
    );
    if (edge) ids.add(edge.id);
  }
  return ids;
}

export function graphViewBox(nodes: readonly GraphPoint[], padding: GraphViewPadding): GraphViewBox {
  if (nodes.length === 0) return DEFAULT_VIEW_BOX;
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, MIN_VIEW_SPAN);
  const spanY = Math.max(maxY - minY, MIN_VIEW_SPAN / 2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    x: centerX - spanX / 2 - padding.x,
    y: centerY - spanY / 2 - padding.top,
    width: spanX + padding.x * 2,
    height: spanY + padding.top + padding.bottom,
  };
}

export function graphGlyphScale(
  content: GraphViewBox,
  width: number,
  height: number,
  screenPadding: GraphViewPadding = ZERO_PADDING,
): number {
  if (width <= 0 || height <= 0) return 1;
  const usableWidth = width - screenPadding.x * 2;
  const usableHeight = height - screenPadding.top - screenPadding.bottom;
  if (usableWidth <= 0 || usableHeight <= 0) return GLYPH_MAX_SCALE;
  const pixelsPerUnit = Math.min(usableWidth / content.width, usableHeight / content.height);
  return Math.min(GLYPH_MAX_SCALE, 1 / pixelsPerUnit);
}

export interface GraphValueFont {
  readonly size: number;
  readonly dot: boolean;
}

export function graphValueFont(
  box: GraphViewBox,
  width: number,
  height: number,
  glyphScale: number,
  baseSize: number,
): GraphValueFont {
  const base = baseSize * glyphScale;
  if (width <= 0 || height <= 0) return { size: base, dot: true };
  const scale = Math.min(width / box.width, height / box.height);
  const dotSize = Math.max(base, DOT_MIN_PX / scale);
  return dotSize <= base * DOT_MAX_GROWTH ? { size: dotSize, dot: true } : { size: base, dot: false };
}

export function graphViewBoxAttr(box: GraphViewBox): string {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

export function trimSegment(from: GraphPoint, to: GraphPoint, startInset: number, endInset: number): GraphSegment {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const limit = Math.max(0, length / 2 - 0.5);
  const start = Math.min(startInset, limit);
  const end = Math.min(endInset, limit);
  const ux = dx / length;
  const uy = dy / length;
  return {
    x1: from.x + ux * start,
    y1: from.y + uy * start,
    x2: to.x - ux * end,
    y2: to.y - uy * end,
    midX: (from.x + to.x) / 2,
    midY: (from.y + to.y) / 2,
  };
}

export function graphFrontierRows(state: GraphStepState | null): GraphRackRow[] {
  if (!state) return [];
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const showsPredecessor = translatableKey(state.secondaryLabel) === LABELS.previous;
  let headAssigned = false;
  return state.queue.map((entry, index) => {
    const node = byId.get(entry.nodeId) ?? null;
    const unreachable = entry.distance === null;
    const tone: RackRowTone = unreachable ? 'dim' : headAssigned ? 'default' : 'head';
    if (!unreachable) headAssigned = true;
    return {
      id: `${index}:${entry.nodeId}`,
      label: entry.label,
      fromLabel: node && showsPredecessor ? previousLabel(node, byId) : null,
      secondary: node?.secondaryText && !showsPredecessor ? node.secondaryText : null,
      isSource: false,
      value: graphValueText(entry.distance, state.metricLabel),
      tone,
    };
  });
}

export function graphCompletionRows(state: GraphStepState | null): GraphRackRow[] {
  if (!state) return [];
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const rank = new Map<string, number>();
  state.visitOrder.forEach((entry, index) => {
    if (typeof entry === 'string' && !rank.has(entry)) rank.set(entry, index);
  });
  const orderOf = (node: GraphNodeSnapshot): number =>
    rank.get(node.id) ?? rank.get(node.label) ?? Number.POSITIVE_INFINITY;
  return state.nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.isSettled)
    .sort((left, right) => {
      const leftOrder = orderOf(left.node);
      const rightOrder = orderOf(right.node);
      if (leftOrder !== rightOrder) return leftOrder < rightOrder ? -1 : 1;
      return left.index - right.index;
    })
    .map(({ node }) => ({
      id: node.id,
      label: node.label,
      fromLabel: node.isSource ? null : previousLabel(node, byId),
      secondary: null,
      isSource: node.isSource,
      value: graphValueText(node.distance, state.metricLabel),
      tone: 'done' as const,
    }));
}

function previousLabel(node: GraphNodeSnapshot, byId: ReadonlyMap<string, GraphNodeSnapshot>): string | null {
  if (!node.previousId) return null;
  return byId.get(node.previousId)?.label ?? node.previousId;
}
