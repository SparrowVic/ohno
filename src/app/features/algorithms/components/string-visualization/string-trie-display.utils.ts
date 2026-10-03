import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { AhoCorasickNodeView, AhoCorasickTraceState } from '../../models/string';
import { TREE_PAD, TreeBox, fitSpacing } from './string-compress-display.utils';
import {
  StringDisplay,
  StringFact,
  StringMarker,
  StringRackRow,
  StringTone,
  StringTree,
  StringTreeEdge,
  StringTreeNode,
  charCells,
  displayChar,
  head,
  row,
} from './string-tape.utils';

const STRING = I18N_KEY.features.algorithms.display.string;
const RACKS = I18N_KEY.features.algorithms.display.racks;

export function trieParents(patterns: readonly string[]): ReadonlyMap<number, number> {
  const parents = new Map<number, number>();
  const children = new Map<string, number>();
  let next = 1;
  for (const pattern of patterns) {
    let state = 0;
    for (const char of pattern) {
      const key = `${state}:${char}`;
      const existing = children.get(key);
      if (existing !== undefined) {
        state = existing;
        continue;
      }
      children.set(key, next);
      parents.set(next, state);
      state = next;
      next++;
    }
  }
  return parents;
}

export interface TriePoint {
  readonly x: number;
  readonly y: number;
}

export function trieSlots(ids: readonly number[], parents: ReadonlyMap<number, number>): { slots: Map<number, number>; leaves: number; depth: number } {
  const present = new Set(ids);
  const kids = new Map<number, number[]>();
  for (const id of ids) {
    if (id === 0) continue;
    const parent = parents.get(id);
    if (parent === undefined || !present.has(parent)) continue;
    const list = kids.get(parent) ?? [];
    list.push(id);
    kids.set(parent, list);
  }
  const slots = new Map<number, number>();
  let leaf = 0;
  let depth = 0;
  const visit = (id: number, level: number): number => {
    depth = Math.max(depth, level);
    const list = kids.get(id) ?? [];
    if (list.length === 0) {
      slots.set(id, leaf);
      leaf++;
      return leaf - 1;
    }
    const placed = list.map((child) => visit(child, level + 1));
    const slot = (placed[0]! + placed[placed.length - 1]!) / 2;
    slots.set(id, slot);
    return slot;
  };
  if (present.has(0)) visit(0, 0);
  return { slots, leaves: Math.max(1, leaf), depth };
}

const AHO_LEDS: Readonly<Record<AhoCorasickNodeView['tone'], LedColor>> = {
  root: 'violet',
  active: 'cyan',
  failure: 'pink',
  match: 'lime',
  ready: 'slate',
};

export function ahoTrie(state: AhoCorasickTraceState, box: TreeBox): StringTree {
  const parents = trieParents(state.patterns);
  const ids = state.nodes.map((node) => node.index);
  const { slots, leaves, depth } = trieSlots(ids, parents);
  const levels = new Map(state.nodes.map((node) => [node.index, node.depth] as const));
  const dx = fitSpacing(box.width - TREE_PAD, leaves, 38, 72);
  const dy = fitSpacing(box.height - TREE_PAD * 2, depth, 44, 70);
  const point = (id: number) => ({
    x: TREE_PAD / 2 + (slots.get(id) ?? 0) * dx + dx / 2,
    y: TREE_PAD + (levels.get(id) ?? 0) * dy,
  });
  const nodes: StringTreeNode[] = state.nodes.map((node) => {
    const at = point(node.index);
    return {
      id: node.id,
      x: at.x,
      y: at.y,
      label: node.index === 0 ? '' : displayChar(node.char),
      value: String(node.index),
      tone: node.outputs.length > 0 && node.tone === 'ready' ? 'lime' : AHO_LEDS[node.tone],
      current: node.id === state.activeNodeId,
    };
  });
  const edges: StringTreeEdge[] = [];
  for (const node of state.nodes) {
    const parent = parents.get(node.index);
    if (node.index === 0 || parent === undefined || !slots.has(parent)) continue;
    const from = point(parent);
    const to = point(node.index);
    edges.push({
      id: `t${node.index}`,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      tone: node.id === state.activeNodeId ? 'cyan' : node.tone === 'failure' ? 'pink' : 'plain',
      label: null,
      curved: false,
    });
  }
  const active = state.nodes.find((node) => node.id === state.activeNodeId);
  if (active && active.failId !== null && active.index !== 0 && state.phase !== 'build') {
    const from = point(active.index);
    const to = point(Number(active.failId));
    edges.push({ id: 'fail', x1: from.x, y1: from.y, x2: to.x, y2: to.y, tone: 'amber', label: null, curved: true });
  }
  return {
    caption: STRING.captions.trie,
    width: TREE_PAD + leaves * dx,
    height: TREE_PAD * 2 + depth * dy + 16,
    nodes,
    edges,
  };
}

export function ahoCorasickDisplay(state: AhoCorasickTraceState, box: TreeBox): StringDisplay {
  const current = state.currentTextIndex;
  const scanning = state.phase === 'scan' || state.phase === 'complete';
  const failing = state.failurePath.length > 0;
  const textTone = (index: number): StringTone => {
    if (!scanning) return 'idle';
    if (index === current) return failing ? 'pink' : 'cyan';
    if (state.matches.some((match) => index >= match.startIndex && index <= match.endIndex)) return 'lime';
    return current !== null && index < current ? 'dim' : 'idle';
  };
  const markers: StringMarker[] = [];
  if (scanning && current !== null) markers.push(head('head', failing ? 'pink' : 'cyan', 'text', 'text', current, RACKS.head));
  const patternRows: StringRackRow[] = state.patterns.map((pattern) => {
    const hits = state.matches.filter((match) => match.pattern === pattern).length;
    return { id: pattern, lead: pattern, body: null, value: String(hits), tone: hits > 0 ? 'done' : 'default', led: hits > 0 ? 'lime' : 'slate' };
  });
  const matchRows: StringRackRow[] = state.matches.map((match, position) => ({
    id: `${match.pattern}-${match.startIndex}`,
    lead: match.pattern,
    body: i18nText(STRING.rows.span, { from: match.startIndex, to: match.endIndex }),
    value: String(match.startIndex),
    tone: position === state.matches.length - 1 ? 'done' : 'default',
    led: 'lime',
  }));
  const active = state.nodes.find((node) => node.id === state.activeNodeId);
  const facts: StringFact[] = [];
  if (active) facts.push({ id: 'node', label: STRING.facts.state, value: String(active.index), tone: failing ? 'pink' : 'cyan' });
  if (state.currentChar !== null) facts.push({ id: 'char', label: STRING.facts.char, value: state.currentChar, tone: 'cyan' });
  return {
    rows: [
      row('text', 'tape', charCells('t', state.text, 0, textTone), {
        caption: RACKS.text,
        aside: i18nText(STRING.aside.textLength, { n: state.text.length }),
      }),
    ],
    markers,
    racks: [
      { id: 'patterns', title: STRING.racks.patterns, meta: String(state.patterns.length), rows: patternRows, empty: [] },
      { id: 'matches', title: RACKS.matches, meta: String(state.matches.length), rows: matchRows, empty: matchRows.length ? [] : [STRING.notes.noTrieMatch] },
    ],
    facts,
    notes: [],
    tree: ahoTrie(state, box),
  };
}
