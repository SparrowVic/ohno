import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import {
  NetworkEdgeSnapshot,
  NetworkEdgeStatus,
  NetworkMode,
  NetworkNodeSnapshot,
  NetworkNodeStatus,
} from '../../models/network';

export type NetworkTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';

export interface NetworkEdgeGeometry {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
}

export interface NetworkViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface NetworkBox {
  readonly cx: number;
  readonly cy: number;
  readonly width: number;
  readonly height: number;
}

export interface NetworkChipRequest {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly width: number;
  readonly height: number;
}

export interface NetworkPoint {
  readonly x: number;
  readonly y: number;
}

export interface NetworkRackEntry {
  readonly lead: string;
  readonly body: string;
  readonly value: string | null;
}

const LABELS = I18N_KEY.features.algorithms.display.network.labels;

const NETWORK_RACK_TITLE_KEYS: Readonly<Record<string, string>> = {
  'Level queue': LABELS.levelQueue,
  'Residual queue': LABELS.residualQueue,
  'Cost scan': LABELS.costScan,
  'Layer queue': LABELS.layerQueue,
  'BFS queue': LABELS.bfsQueue,
  'Positive flow': LABELS.positiveFlow,
  'Final positive flow': LABELS.finalPositiveFlow,
  'Committed flow': LABELS.committedFlow,
  'Final committed flow': LABELS.finalCommittedFlow,
  'Current matching': LABELS.currentMatching,
  'Final matching': LABELS.finalMatching,
};

const NETWORK_LINK_LABEL_KEYS: Readonly<Record<string, string>> = {
  start: LABELS.start,
  goal: LABELS.goal,
  free: LABELS.free,
  'carrying flow': LABELS.carryingFlow,
};

const NETWORK_EDGE_TEXT_KEYS: Readonly<Record<string, string>> = {
  match: LABELS.match,
  free: LABELS.freeEdge,
};

const NODE_TONES: Readonly<Record<NetworkNodeStatus, NetworkTone>> = {
  current: 'cyan',
  frontier: 'amber',
  linked: 'lime',
  visited: 'lime',
  source: 'violet',
  sink: 'violet',
  blocked: 'red',
  idle: 'slate',
};

const EDGE_TONES: Readonly<Record<NetworkEdgeStatus, NetworkTone>> = {
  base: 'slate',
  candidate: 'cyan',
  active: 'pink',
  augment: 'pink',
  matched: 'lime',
  flow: 'lime',
  saturated: 'amber',
  blocked: 'red',
};

const VIA_PATTERN = /^via (.+)$/;
const OUT_PATTERN = /^out (\d+)$/;
const RESIDUAL_PATTERN = /^res (-?\d+)$/;
const FLOW_ITEM_PATTERN = /^(\S+?)\s*→\s*(\S+) (-?\d+\/-?\d+)(?: @ (-?\d+))?$/;
const MATCH_ITEM_PATTERN = /^([^-\s]+)-([^-\s]+)$/;

export function networkNodeTone(status: NetworkNodeStatus): NetworkTone {
  return NODE_TONES[status];
}

export function networkEdgeTone(status: NetworkEdgeStatus): NetworkTone {
  return EDGE_TONES[status];
}

export function networkRackTitle(raw: string): TranslatableText {
  const key = NETWORK_RACK_TITLE_KEYS[raw];
  return key ? i18nText(key) : raw;
}

export function networkLinkLabel(raw: string | null): TranslatableText | null {
  if (!raw) return null;
  const key = NETWORK_LINK_LABEL_KEYS[raw];
  if (key) return i18nText(key);
  const via = VIA_PATTERN.exec(raw);
  if (via) return `← ${via[1]}`;
  const out = OUT_PATTERN.exec(raw);
  if (out) return i18nText(LABELS.out, { count: Number(out[1]) });
  return raw;
}

export function networkEdgeText(raw: string | null): TranslatableText | null {
  if (!raw) return null;
  const key = NETWORK_EDGE_TEXT_KEYS[raw];
  if (key) return i18nText(key);
  const residual = RESIDUAL_PATTERN.exec(raw);
  if (residual) return i18nText(LABELS.residual, { value: Number(residual[1]) });
  return raw;
}

export function networkLevelChip(mode: NetworkMode, level: number | null): TranslatableText | null {
  if (level === null) return null;
  const chips = I18N_KEY.features.algorithms.display.network.chips;
  return i18nText(mode === 'min-cost-max-flow' ? chips.cost : chips.level, { value: level });
}

export function networkParentLabel(raw: string | null): string | null {
  if (!raw) return null;
  const via = VIA_PATTERN.exec(raw);
  return via ? via[1] : null;
}

export function networkFocusEntry(raw: string): NetworkRackEntry {
  const flow = FLOW_ITEM_PATTERN.exec(raw);
  if (flow) {
    const cost = flow[4] === undefined ? '' : ` · c ${flow[4]}`;
    return { lead: flow[1], body: `→ ${flow[2]}${cost}`, value: flow[3] };
  }
  const match = MATCH_ITEM_PATTERN.exec(raw);
  if (match) return { lead: match[1], body: `↔ ${match[2]}`, value: null };
  return { lead: '', body: raw, value: null };
}

export function networkQueueEntry(label: string, nodes: readonly NetworkNodeSnapshot[]): NetworkRackEntry {
  const node = nodes.find((candidate) => candidate.label === label || candidate.id === label);
  const parent = networkParentLabel(node?.linkLabel ?? null);
  return {
    lead: label,
    body: parent ? `← ${parent}` : '—',
    value: node?.level === null || node?.level === undefined ? null : String(node.level),
  };
}

export function networkEdgeGeometry(
  edge: NetworkEdgeSnapshot,
  nodesById: ReadonlyMap<string, NetworkNodeSnapshot>,
  trimRadius: number,
): NetworkEdgeGeometry {
  const from = nodesById.get(edge.fromId);
  const to = nodesById.get(edge.toId);
  const fromX = from?.x ?? 0;
  const fromY = from?.y ?? 0;
  const toX = to?.x ?? 0;
  const toY = to?.y ?? 0;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.hypot(dx, dy) || 1;
  const trim = Math.max(0, Math.min(trimRadius, distance / 2 - 0.5));
  const ux = dx / distance;
  const uy = dy / distance;
  return {
    x1: fromX + ux * trim,
    y1: fromY + uy * trim,
    x2: toX - ux * trim,
    y2: toY - uy * trim,
    midX: (fromX + toX) / 2,
    midY: (fromY + toY) / 2,
  };
}

export function networkViewBox(
  nodes: readonly NetworkNodeSnapshot[],
  padX: number,
  padY: number,
): NetworkViewBox {
  if (nodes.length === 0) return { x: 0, y: 0, width: 960, height: 560 };
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: minX - padX,
    y: minY - padY,
    width: maxX - minX + padX * 2,
    height: maxY - minY + padY * 2,
  };
}

const CHIP_POSITIONS = [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75, 0.18, 0.82] as const;
const CHIP_SIDE_POSITIONS = [0.5, 0.36, 0.64] as const;

interface ChipCandidate {
  readonly box: NetworkBox;
  readonly penalty: number;
}

const SIDE_PENALTY = 240;
const DRIFT_PENALTY = 40;

function chipCandidates(chip: NetworkChipRequest): readonly ChipCandidate[] {
  const dx = chip.x2 - chip.x1;
  const dy = chip.y2 - chip.y1;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;
  const sideShift = Math.abs(normalX) * (chip.width / 2 + 4) + Math.abs(normalY) * (chip.height / 2 + 4);
  const at = (t: number, shift: number): ChipCandidate => ({
    box: {
      cx: chip.x1 + dx * t + normalX * shift,
      cy: chip.y1 + dy * t + normalY * shift,
      width: chip.width,
      height: chip.height,
    },
    penalty: Math.abs(t - 0.5) * DRIFT_PENALTY + (shift === 0 ? 0 : SIDE_PENALTY),
  });
  return [
    ...CHIP_POSITIONS.map((t) => at(t, 0)),
    ...CHIP_SIDE_POSITIONS.flatMap((t) => [at(t, sideShift), at(t, -sideShift)]),
  ];
}

function overlapArea(a: NetworkBox, b: NetworkBox, gap: number): number {
  const overlapX = (a.width + b.width) / 2 + gap - Math.abs(a.cx - b.cx);
  const overlapY = (a.height + b.height) / 2 + gap - Math.abs(a.cy - b.cy);
  return overlapX > 0 && overlapY > 0 ? overlapX * overlapY : 0;
}

export function placeEdgeChips(
  chips: readonly NetworkChipRequest[],
  obstacles: readonly NetworkBox[],
  gap = 4,
): readonly NetworkPoint[] {
  const placed: NetworkBox[] = [];
  const positions: NetworkPoint[] = chips.map((chip) => ({ x: (chip.x1 + chip.x2) / 2, y: (chip.y1 + chip.y2) / 2 }));
  const order = chips
    .map((chip, index) => ({ index, length: Math.hypot(chip.x2 - chip.x1, chip.y2 - chip.y1) }))
    .sort((left, right) => left.length - right.length || left.index - right.index);
  for (const { index } of order) {
    const chip = chips[index];
    let best: NetworkBox | null = null;
    let bestScore = Infinity;
    for (const { box, penalty } of chipCandidates(chip)) {
      const overlap = [...obstacles, ...placed].reduce((sum, other) => sum + overlapArea(box, other, gap), 0);
      const score = overlap + penalty;
      if (score < bestScore) {
        best = box;
        bestScore = score;
      }
    }
    if (best) {
      placed.push(best);
      positions[index] = { x: best.cx, y: best.cy };
    }
  }
  return positions;
}

export function estimateChipWidth(text: string, glyphWidth: number, padding: number, minWidth: number): number {
  return Math.max(minWidth, Math.ceil(Array.from(text).length * glyphWidth + padding * 2));
}
