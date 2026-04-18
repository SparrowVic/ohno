import {
  BurrowsWheelerTraceState,
  HuffmanEdge,
  HuffmanTraceState,
  HuffmanTreeNode,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  ZAlgorithmTraceState,
} from '../../models/string';

export interface ManacherArcVm {
  readonly id: string;
  readonly path: string;
  readonly tone: 'regular' | 'current' | 'best' | 'mirror';
  readonly label: string;
}

const CELL_SIZE_PX = 34;
const CELL_GAP_PX = 6;
const SLOT_SIZE_PX = CELL_SIZE_PX + CELL_GAP_PX;

export function patternOffset(offset: number): number {
  return Math.max(offset, 0);
}

export function kmpTextClass(state: KmpTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  if (state.matches.some((start) => index >= start && index < start + state.pattern.length)) {
    return 'str-cell str-cell--found';
  }
  if (state.compareTextIndex === index && state.comparePatternIndex !== null) {
    const tone = state.text[index] === state.pattern[state.comparePatternIndex] ? 'match' : 'mismatch';
    return `str-cell str-cell--${tone}`;
  }
  if (state.textIndex === index) return 'str-cell str-cell--focus';
  return 'str-cell';
}

export function kmpPatternClass(state: KmpTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  if (state.comparePatternIndex === index) {
    const tone =
      state.compareTextIndex !== null &&
      state.stage === 'scan' &&
      state.text[state.compareTextIndex] !== state.pattern[index]
        ? 'mismatch'
        : 'match';
    return `str-cell str-cell--${tone}`;
  }
  if (state.patternIndex === index) return 'str-cell str-cell--focus';
  if (state.stage === 'failure' && index <= state.failureReadyIndex) return 'str-cell str-cell--accent';
  return 'str-cell';
}

export function failureClass(state: KmpTraceState | null, index: number): string {
  if (!state) return 'metric-cell';
  if (index > state.failureReadyIndex) return 'metric-cell metric-cell--ghost';
  if (state.fallbackTo !== null && state.failure[index] === state.fallbackTo) return 'metric-cell metric-cell--accent';
  if (state.comparePatternIndex === index) return 'metric-cell metric-cell--focus';
  return 'metric-cell';
}

export function rabinTextClass(state: RabinKarpTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  const insideWindow = index >= state.windowStart && index < state.windowStart + state.windowLength;
  if (state.matches.some((start) => index >= start && index < start + state.pattern.length)) {
    return 'str-cell str-cell--found';
  }
  if (!insideWindow) return 'str-cell';
  if (state.verificationIndex !== null && index === state.windowStart + state.verificationIndex) {
    return `str-cell str-cell--${state.collision ? 'mismatch' : 'match'}`;
  }
  return 'str-cell str-cell--window';
}

export function rabinPatternClass(state: RabinKarpTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  if (state.verificationIndex === index) {
    return `str-cell str-cell--${state.collision ? 'mismatch' : 'match'}`;
  }
  return 'str-cell str-cell--accent';
}

export function zCharClass(state: ZAlgorithmTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  if (index === state.activeIndex) return 'str-cell str-cell--focus';
  if (state.comparePrefixIndex === index || state.compareMatchIndex === index) {
    return 'str-cell str-cell--match';
  }
  if (state.boxLeft !== null && state.boxRight !== null && index >= state.boxLeft && index <= state.boxRight) {
    return 'str-cell str-cell--window';
  }
  if (index < state.patternLength) return 'str-cell str-cell--accent';
  if (index === state.patternLength) return 'str-cell str-cell--ghost';
  if (state.matches.some((start) => index === start + state.patternLength + 1)) {
    return 'str-cell str-cell--found';
  }
  return 'str-cell';
}

export function zBarClass(state: ZAlgorithmTraceState | null, index: number): string {
  if (!state) return 'z-bar';
  if (state.matches.some((start) => index === start + state.patternLength + 1)) return 'z-bar z-bar--hit';
  if (index === state.activeIndex) return 'z-bar z-bar--active';
  if (state.boxLeft !== null && state.boxRight !== null && index >= state.boxLeft && index <= state.boxRight) {
    return 'z-bar z-bar--box';
  }
  return 'z-bar';
}

export function zBarHeight(state: ZAlgorithmTraceState | null, value: number): string {
  const max = Math.max(...(state?.zValues ?? [1]), 1);
  return `${10 + (value / max) * 104}px`;
}

export function manacherCharClass(state: ManacherTraceState | null, index: number): string {
  if (!state) return 'str-cell';
  if (index === state.currentCenter) return 'str-cell str-cell--focus';
  if (index === state.mirrorIndex) return 'str-cell str-cell--accent';
  if (index === state.compareLeft || index === state.compareRight) return 'str-cell str-cell--match';
  if (index === state.longestCenter) return 'str-cell str-cell--found';
  if (
    state.leftBoundary !== null &&
    state.rightBoundary !== null &&
    index >= state.leftBoundary &&
    index <= state.rightBoundary
  ) {
    return 'str-cell str-cell--window';
  }
  return 'str-cell';
}

export function radiusClass(state: ManacherTraceState | null, index: number): string {
  if (!state) return 'metric-cell';
  if (index === state.currentCenter) return 'metric-cell metric-cell--focus';
  if (index === state.longestCenter) return 'metric-cell metric-cell--found';
  return 'metric-cell';
}

export function manacherTrackWidth(state: ManacherTraceState | null): number {
  return trackWidth(state?.transformed.length ?? 0);
}

export function manacherArcViewBox(state: ManacherTraceState | null): string {
  const width = trackWidth(state?.transformed.length ?? 0);
  return `0 0 ${Math.max(width, 160)} 128`;
}

export function manacherCenterX(index: number): number {
  return CELL_SIZE_PX / 2 + index * SLOT_SIZE_PX;
}

export function manacherWindowX(leftBoundary: number): number {
  return leftBoundary * SLOT_SIZE_PX;
}

export function manacherWindowW(leftBoundary: number, rightBoundary: number): number {
  return (rightBoundary - leftBoundary) * SLOT_SIZE_PX + CELL_SIZE_PX;
}

export function buildManacherArcs(state: ManacherTraceState | null): readonly ManacherArcVm[] {
  if (!state) return [];

  const arcs: ManacherArcVm[] = [];
  const centerOffset = CELL_SIZE_PX / 2;
  const baseY = 108;

  for (let index = 0; index < state.radii.length; index += 1) {
    const radius = state.radii[index] ?? 0;
    if (radius <= 0) continue;

    const x = centerOffset + index * SLOT_SIZE_PX;
    const x1 = x - radius * SLOT_SIZE_PX;
    const x2 = x + radius * SLOT_SIZE_PX;
    const arcHeight = Math.min(72, 14 + radius * 6);
    let tone: ManacherArcVm['tone'] = 'regular';
    if (index === state.longestCenter) tone = 'best';
    else if (index === state.currentCenter) tone = 'current';
    else if (index === state.mirrorIndex) tone = 'mirror';

    arcs.push({
      id: `arc-${index}`,
      path: `M ${x1} ${baseY} Q ${x} ${baseY - arcHeight} ${x2} ${baseY}`,
      tone,
      label: `radius ${radius}`,
    });
  }

  return arcs;
}

export function bwtRowClass(row: BurrowsWheelerTraceState['rotations'][number]): string {
  return `bwt-row bwt-row--${row.tone}`;
}

export function bwtCellClass(
  row: BurrowsWheelerTraceState['rotations'][number],
  index: number,
): string {
  let cls = 'bwt-cell';
  if (index === 0) cls += ' bwt-cell--first';
  if (index === row.text.length - 1) cls += ' bwt-cell--last';
  if (row.tone === 'output') cls += ' bwt-cell--output';
  return cls;
}

export function bwtRunClass(tone: 'input' | 'output'): string {
  return tone === 'output' ? 'run-chip run-chip--output' : 'run-chip';
}

export function rleCellClass(state: RleTraceState, index: number): string {
  if (index < state.groupStart) return 'str-cell str-cell--found';
  if (index === state.scanIndex) return 'str-cell str-cell--focus';
  if (index >= state.groupStart && index < state.groupStart + state.groupCount && index !== state.scanIndex) {
    return 'str-cell str-cell--window';
  }
  return 'str-cell';
}

export function huffmanVisibleNodes(huffman: HuffmanTraceState): readonly HuffmanTreeNode[] {
  const visibleIds = new Set(huffman.visibleNodeIds);
  return huffman.allNodes.filter((node) => visibleIds.has(node.id));
}

export function huffmanVisibleEdges(huffman: HuffmanTraceState): readonly HuffmanEdge[] {
  const visibleIds = new Set(huffman.visibleEdgeIds);
  return huffman.allEdges.filter((edge) => visibleIds.has(`${edge.fromId}|${edge.toId}`));
}

export function huffmanSvgWidth(nodes: readonly HuffmanTreeNode[]): number {
  if (nodes.length === 0) return 200;
  return Math.max(...nodes.map((node) => node.x)) + 60;
}

export function huffmanSvgHeight(nodes: readonly HuffmanTreeNode[]): number {
  if (nodes.length === 0) return 120;
  return Math.max(...nodes.map((node) => node.y)) + 80;
}

export function freqBarHeight(huffman: HuffmanTraceState | null, freq: number): string {
  const maxFreq = Math.max(...(huffman?.charFreqs.map((entry) => entry.freq) ?? [1]), 1);
  return `${8 + (freq / maxFreq) * 72}px`;
}

function trackWidth(count: number): number {
  if (count <= 0) return 0;
  return count * SLOT_SIZE_PX - CELL_GAP_PX;
}
