import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import {
  BurrowsWheelerTraceState,
  HuffmanHeapItem,
  HuffmanTraceState,
  RleTraceState,
  StringRotationRow,
} from '../../models/string';
import {
  StringCell,
  StringDisplay,
  StringFact,
  StringMarker,
  StringRack,
  StringRackRow,
  StringRow,
  StringTone,
  StringTree,
  StringTreeEdge,
  StringTreeNode,
  band,
  cell,
  charCells,
  displayChar,
  head,
  row,
  valueCells,
} from './string-tape.utils';

const STRING = I18N_KEY.features.algorithms.display.string;
const RACKS = I18N_KEY.features.algorithms.display.racks;

export interface TreeBox {
  readonly width: number;
  readonly height: number;
}

function ratioFact(ratio: number | null): StringFact[] {
  return ratio === null ? [] : [{ id: 'ratio', label: STRING.facts.ratio, value: `${ratio.toFixed(2)}×`, tone: 'lime' }];
}

export function rleDisplay(state: RleTraceState): StringDisplay {
  const done = state.phase === 'complete';
  const covered = state.completedRuns.reduce((sum, run) => sum + run.count, 0);
  const scan = state.scanIndex;
  const groupEnd = scan ?? state.groupStart + state.groupCount - 1;
  const groupTone: StringTone = state.phase === 'emit' ? 'lime' : state.phase === 'extend' ? 'pink' : 'cyan';
  const activeGroup = !done && state.groupCount > 0;
  const sourceTone = (index: number): StringTone => {
    if (activeGroup && index === scan) return groupTone;
    if (activeGroup && index >= state.groupStart && index <= groupEnd) return groupTone === 'cyan' ? 'ink' : groupTone;
    if (index < covered) return 'dim';
    return 'idle';
  };
  const outputCells: StringCell[] = [];
  state.completedRuns.forEach((run, position) => {
    outputCells.push(cell(`oc${run.id}`, position * 2, String(run.count), 'amber'));
    outputCells.push(cell(`ox${run.id}`, position * 2 + 1, displayChar(run.char), 'lime'));
  });
  if (activeGroup && state.phase !== 'emit') {
    const column = state.completedRuns.length * 2;
    outputCells.push(cell('pc', column, String(state.groupCount), 'cyan'));
    outputCells.push(cell('px', column + 1, displayChar(state.groupChar), 'cyan'));
  }
  const markers: StringMarker[] = [];
  if (activeGroup) markers.push(band('run', groupTone, 'source', state.groupStart, groupEnd, STRING.marks.run));
  if (!done && scan !== null) markers.push(head('head', groupTone, 'source', 'source', scan, null));
  const runRows: StringRackRow[] = state.completedRuns.map((run, position) => ({
    id: run.id,
    lead: displayChar(run.char),
    body: null,
    value: String(run.count),
    tone: position === state.completedRuns.length - 1 && state.phase === 'emit' ? 'done' : 'default',
    led: 'lime',
  }));
  if (activeGroup && state.phase !== 'emit') {
    runRows.push({ id: 'pending', lead: displayChar(state.groupChar), body: null, value: String(state.groupCount), tone: 'now', led: 'cyan' });
  }
  return {
    rows: [
      row('source', 'tape', charCells('s', state.source, 0, sourceTone), {
        caption: STRING.captions.input,
        aside: i18nText(STRING.aside.textLength, { n: state.source.length }),
      }),
      row('output', 'tape', outputCells, {
        caption: STRING.captions.output,
        aside: i18nText(STRING.aside.textLength, { n: state.output.length }),
      }),
    ],
    markers,
    racks: [{ id: 'runs', title: RACKS.runs, meta: String(state.completedRuns.length), rows: runRows, empty: runRows.length ? [] : [STRING.notes.noRunsYet] }],
    facts: ratioFact(state.compressionRatio),
    notes: [],
    tree: null,
  };
}

const ROTATION_TONES: Readonly<Record<StringRotationRow['tone'], StringTone>> = {
  pending: 'idle',
  active: 'cyan',
  compare: 'pink',
  sorted: 'ink',
  output: 'ink',
};

export function bwtDisplay(state: BurrowsWheelerTraceState): StringDisplay {
  const n = state.source.length;
  const columns = state.lastColumn.length > 0;
  const sorted = state.rotations.filter((rotation) => rotation.tone === 'sorted' || rotation.tone === 'output').length;
  const rows: StringRow[] = [
    row('source', 'tape', charCells('s', state.source, 1, () => 'ink'), {
      caption: STRING.captions.input,
      aside: i18nText(STRING.aside.textLength, { n }),
    }),
  ];
  state.rotations.forEach((rotation, position) => {
    const base = ROTATION_TONES[rotation.tone];
    const toneAt = (index: number): StringTone => {
      if (columns && index === n - 1) return 'lime';
      if (columns && index === 0) return 'violet';
      return base;
    };
    const cells: StringCell[] = [
      cell(`${rotation.id}-lead`, 0, String(rotation.startIndex), 'dim', { lead: true }),
      ...Array.from(rotation.text, (glyph, index) => cell(`${rotation.id}-${index}`, index + 1, displayChar(glyph), toneAt(index))),
    ];
    rows.push(
      row(rotation.id, 'compact', cells, position === 0 ? { caption: STRING.captions.rotations, aside: i18nText(STRING.aside.sorted, { sorted, total: n }) } : {}),
    );
  });
  if (columns) {
    rows.push(
      row('last', 'tape', charCells('l', state.lastColumn, 1, () => 'lime', false), {
        caption: STRING.captions.lastColumn,
        captionTone: 'lime',
      }),
    );
  }
  const markers: StringMarker[] = [];
  const active = state.rotations.find((rotation) => rotation.tone === 'active');
  const compare = state.rotations.find((rotation) => rotation.tone === 'compare');
  if (active && compare) markers.push(band('swap', 'pink', compare.id, 1, n, null, active.id));
  const runRows: StringRackRow[] = state.runGroups.map((group) => ({
    id: group.id,
    lead: displayChar(group.char),
    body: null,
    value: String(group.count),
    tone: group.tone === 'output' ? 'done' : 'default',
    led: group.tone === 'output' ? 'lime' : 'slate',
  }));
  return {
    rows,
    markers,
    racks: [{ id: 'runs', title: RACKS.runs, meta: String(state.runGroups.length), rows: runRows, empty: [] }],
    facts: ratioFact(state.compressionRatio),
    notes: [],
    tree: null,
  };
}

const HEAP_LEDS: Readonly<Record<NonNullable<HuffmanHeapItem['role']>, LedColor>> = {
  left: 'pink',
  right: 'pink',
  new: 'cyan',
};

const NODE_X = 76;
const NODE_Y = 72;
const LEAF_X0 = 38;
const LEVEL_Y0 = 20;

export const TREE_PAD = 26;

export function fitSpacing(available: number, slots: number, min: number, max: number): number {
  if (slots <= 0) return max;
  return Math.max(min, Math.min(max, Math.floor(available / slots)));
}

export function huffmanTree(state: HuffmanTraceState, box: TreeBox): StringTree | null {
  if (state.phase === 'freq' || state.allNodes.length === 0) return null;
  const leaves = Math.max(1, ...state.allNodes.map((node) => Math.round((node.x - LEAF_X0) / NODE_X) + 1));
  const depth = Math.max(0, ...state.allNodes.map((node) => Math.round((node.y - LEVEL_Y0) / NODE_Y)));
  const dx = fitSpacing(box.width - TREE_PAD, leaves, 40, 76);
  const dy = fitSpacing(box.height - TREE_PAD * 2, depth, 44, 72);
  const place = (x: number, y: number) => ({
    x: TREE_PAD + ((x - LEAF_X0) / NODE_X) * dx + dx / 2 - TREE_PAD / 2,
    y: TREE_PAD + ((y - LEVEL_Y0) / NODE_Y) * dy,
  });
  const visible = new Set(state.visibleNodeIds);
  const roles = new Map(state.heapItems.map((item) => [item.id, item.role] as const));
  const coded = state.phase === 'codes';
  const positions = new Map(state.allNodes.map((node) => [node.id, place(node.x, node.y)] as const));
  const nodes: StringTreeNode[] = state.allNodes
    .filter((node) => visible.has(node.id))
    .map((node) => {
      const role = roles.get(node.id) ?? null;
      const point = positions.get(node.id)!;
      const tone: LedColor = role ? HEAP_LEDS[role] : node.char !== null ? (coded ? 'lime' : 'slate') : node.tone === 'root' ? 'lime' : 'violet';
      return {
        id: node.id,
        x: point.x,
        y: point.y,
        label: node.char !== null ? displayChar(node.char) : String(node.freq),
        value: node.char !== null ? String(node.freq) : null,
        tone,
        current: role === 'new',
      };
    });
  const visibleEdges = new Set(state.visibleEdgeIds);
  const edges: StringTreeEdge[] = state.allEdges
    .filter((edge) => visibleEdges.has(`${edge.fromId}|${edge.toId}`))
    .map((edge) => {
      const from = positions.get(edge.fromId)!;
      const to = positions.get(edge.toId)!;
      const fresh = roles.get(edge.fromId) === 'new';
      return {
        id: `${edge.fromId}|${edge.toId}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        tone: fresh ? 'cyan' : coded ? 'lime' : 'plain',
        label: edge.label,
        curved: false,
      };
    });
  return {
    caption: STRING.captions.huffmanTree,
    width: TREE_PAD + leaves * dx,
    height: TREE_PAD * 2 + depth * dy + 16,
    nodes,
    edges,
  };
}

export function huffmanDisplay(state: HuffmanTraceState, box: TreeBox): StringDisplay {
  const revealed = state.charFreqs.filter((entry) => entry.isActive);
  const current = state.phase === 'freq' ? (revealed.at(-1)?.char ?? null) : null;
  const coded = state.phase === 'codes';
  const symbols = state.charFreqs.map((entry) => entry.char).join('');
  const symbolTone = (index: number): StringTone => {
    const entry = state.charFreqs[index];
    if (!entry) return 'idle';
    if (entry.char === current) return 'cyan';
    if (coded) return 'lime';
    return entry.isActive || state.phase !== 'freq' ? 'ink' : 'idle';
  };
  const rows: StringRow[] = [];
  if (state.phase === 'freq') {
    rows.push(
      row('source', 'tape', charCells('s', state.source, 0, (index) => (state.source[index] === current ? 'cyan' : 'ink')), {
        caption: STRING.captions.input,
        aside: i18nText(STRING.aside.textLength, { n: state.source.length }),
      }),
    );
  }
  rows.push(
    row('symbols', state.phase === 'freq' ? 'tape' : 'compact', Array.from(symbols, (glyph, index) => cell(`y${index}`, index, displayChar(glyph), symbolTone(index))), {
      caption: STRING.captions.symbols,
      aside: i18nText(STRING.aside.symbolCount, { n: state.charFreqs.length }),
    }),
    row(
      'freq',
      'values',
      valueCells(
        'f',
        state.charFreqs.map((entry) => (entry.isActive || state.phase !== 'freq' ? entry.freq : null)),
        0,
        (index) => (state.charFreqs[index]?.char === current ? 'cyan' : 'amber'),
        (index) => state.charFreqs[index]?.char === current,
      ),
      { caption: STRING.captions.frequencies, captionTone: 'amber' },
    ),
  );
  const heapRows: StringRackRow[] = [...state.heapItems]
    .sort((a, b) => a.freq - b.freq)
    .map((item) => ({
      id: item.id,
      lead: item.char !== null ? displayChar(item.char) : STRING.nodes.internal,
      body: null,
      value: String(item.freq),
      tone: item.role === 'new' ? 'now' : item.role ? 'head' : 'default',
      led: item.role ? HEAP_LEDS[item.role] : 'slate',
    }));
  const codeRows: StringRackRow[] = state.codeTable.map((entry) => ({
    id: entry.char,
    lead: displayChar(entry.char),
    body: entry.code,
    value: String(entry.freq),
    tone: 'done',
    led: 'lime',
  }));
  const racks: StringRack[] = coded
    ? [{ id: 'codes', title: RACKS.codes, meta: String(codeRows.length), rows: codeRows, empty: [] }]
    : [
        { id: 'heap', title: RACKS.heap, meta: String(heapRows.length), rows: heapRows, empty: heapRows.length ? [] : [STRING.notes.heapPending] },
        { id: 'codes', title: RACKS.codes, meta: null, rows: [], empty: [STRING.notes.codesPending] },
      ];
  const facts: StringFact[] = [];
  if (coded) {
    facts.push({ id: 'bits', label: RACKS.bits, value: `${state.totalCompressedBits}/${state.totalOriginalBits}`, tone: 'lime' });
  }
  return { rows, markers: [], racks, facts, notes: [], tree: huffmanTree(state, box) };
}
