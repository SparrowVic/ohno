import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import {
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  HuffmanTreeNode,
  HuffmanEdge,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringPresetOption,
  StringTraceState,
  ZAlgorithmTraceState,
  isBurrowsWheelerState,
  isHuffmanState,
  isKmpState,
  isManacherState,
  isRabinKarpState,
  isRleState,
  isZAlgorithmState,
} from '../../models/string';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion';

interface ManacherArcVm {
  readonly id: string;
  readonly path: string;
  readonly tone: 'regular' | 'current' | 'best' | 'mirror';
  readonly label: string;
}

@Component({
  selector: 'app-string-visualization',
  imports: [],
  templateUrl: './string-visualization.html',
  styleUrl: './string-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  private readonly cellSizePx = 34;
  private readonly cellGapPx = 6;
  private readonly slotSizePx = this.cellSizePx + this.cellGapPx;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly StringPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<StringTraceState | null>(() => this.step()?.string ?? null);
  readonly kmpState = computed<KmpTraceState | null>(() => {
    const state = this.state();
    return isKmpState(state) ? state : null;
  });
  readonly rabinState = computed<RabinKarpTraceState | null>(() => {
    const state = this.state();
    return isRabinKarpState(state) ? state : null;
  });
  readonly zState = computed<ZAlgorithmTraceState | null>(() => {
    const state = this.state();
    return isZAlgorithmState(state) ? state : null;
  });
  readonly manacherState = computed<ManacherTraceState | null>(() => {
    const state = this.state();
    return isManacherState(state) ? state : null;
  });
  readonly bwtState = computed<BurrowsWheelerTraceState | null>(() => {
    const state = this.state();
    return isBurrowsWheelerState(state) ? state : null;
  });
  readonly rleState = computed<RleTraceState | null>(() => {
    const state = this.state();
    return isRleState(state) ? state : null;
  });
  readonly huffmanState = computed<HuffmanTraceState | null>(() => {
    const state = this.state();
    return isHuffmanState(state) ? state : null;
  });

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) {
        this.render(step);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) this.render(step);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(_: readonly number[]): void {
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previous = this.lastStep;
    this.lastStep = step;
    queueMicrotask(() => this.animateStepEffects(previous, step));
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  selectPreset(id: string): void {
    if (id === this.presetId()) return;
    this.presetChange.emit(id);
  }

  patternOffset(offset: number): number {
    return Math.max(offset, 0);
  }

  manacherTrackWidth(): number {
    return this.trackWidth(this.manacherState()?.transformed.length ?? 0);
  }

  kmpTextClass(index: number): string {
    const state = this.kmpState();
    if (!state) return 'str-cell';
    if (state.matches.some((start) => index >= start && index < start + state.pattern.length)) {
      return 'str-cell str-cell--found';
    }
    if (state.compareTextIndex === index && state.comparePatternIndex !== null) {
      const tone =
        state.text[index] === state.pattern[state.comparePatternIndex] ? 'match' : 'mismatch';
      return `str-cell str-cell--${tone}`;
    }
    if (state.textIndex === index) return 'str-cell str-cell--focus';
    return 'str-cell';
  }

  kmpPatternClass(index: number): string {
    const state = this.kmpState();
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

  failureClass(index: number): string {
    const state = this.kmpState();
    if (!state) return 'metric-cell';
    if (index > state.failureReadyIndex) return 'metric-cell metric-cell--ghost';
    if (state.fallbackTo !== null && state.failure[index] === state.fallbackTo) return 'metric-cell metric-cell--accent';
    if (state.comparePatternIndex === index) return 'metric-cell metric-cell--focus';
    return 'metric-cell';
  }

  rabinTextClass(index: number): string {
    const state = this.rabinState();
    if (!state) return 'str-cell';
    const insideWindow =
      index >= state.windowStart && index < state.windowStart + state.windowLength;
    if (state.matches.some((start) => index >= start && index < start + state.pattern.length)) {
      return 'str-cell str-cell--found';
    }
    if (!insideWindow) return 'str-cell';
    if (state.verificationIndex !== null && index === state.windowStart + state.verificationIndex) {
      return `str-cell str-cell--${state.collision ? 'mismatch' : 'match'}`;
    }
    return 'str-cell str-cell--window';
  }

  rabinPatternClass(index: number): string {
    const state = this.rabinState();
    if (!state) return 'str-cell';
    if (state.verificationIndex === index) {
      return `str-cell str-cell--${state.collision ? 'mismatch' : 'match'}`;
    }
    return 'str-cell str-cell--accent';
  }

  zCharClass(index: number): string {
    const state = this.zState();
    if (!state) return 'str-cell';
    if (index === state.activeIndex) return 'str-cell str-cell--focus';
    if (
      state.comparePrefixIndex === index ||
      state.compareMatchIndex === index
    ) {
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

  zBarClass(index: number): string {
    const state = this.zState();
    if (!state) return 'z-bar';
    if (state.matches.some((start) => index === start + state.patternLength + 1)) return 'z-bar z-bar--hit';
    if (index === state.activeIndex) return 'z-bar z-bar--active';
    if (state.boxLeft !== null && state.boxRight !== null && index >= state.boxLeft && index <= state.boxRight) {
      return 'z-bar z-bar--box';
    }
    return 'z-bar';
  }

  zBarHeight(value: number): string {
    const state = this.zState();
    const max = Math.max(...(state?.zValues ?? [1]), 1);
    const px = 10 + (value / max) * 104;
    return `${px}px`;
  }

  manacherCharClass(index: number): string {
    const state = this.manacherState();
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

  radiusClass(index: number): string {
    const state = this.manacherState();
    if (!state) return 'metric-cell';
    if (index === state.currentCenter) return 'metric-cell metric-cell--focus';
    if (index === state.longestCenter) return 'metric-cell metric-cell--found';
    return 'metric-cell';
  }

  manacherArcViewBox(): string {
    const state = this.manacherState();
    const width = this.trackWidth(state?.transformed.length ?? 0);
    return `0 0 ${Math.max(width, 160)} 128`;
  }

  manacherCenterX(index: number): number {
    return this.cellSizePx / 2 + index * this.slotSizePx;
  }

  manacherWindowX(leftBoundary: number): number {
    return leftBoundary * this.slotSizePx;
  }

  manacherWindowW(leftBoundary: number, rightBoundary: number): number {
    return (rightBoundary - leftBoundary) * this.slotSizePx + this.cellSizePx;
  }

  manacherArcs(): readonly ManacherArcVm[] {
    const state = this.manacherState();
    if (!state) return [];

    const arcs: ManacherArcVm[] = [];
    const centerOffset = this.cellSizePx / 2;
    const baseY = 108;

    for (let index = 0; index < state.radii.length; index++) {
      const radius = state.radii[index] ?? 0;
      if (radius <= 0) continue;

      const x = centerOffset + index * this.slotSizePx;
      const x1 = x - radius * this.slotSizePx;
      const x2 = x + radius * this.slotSizePx;
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

  bwtRowClass(row: StringRotationRowLike): string {
    return `bwt-row bwt-row--${row.tone}`;
  }

  bwtCellClass(row: StringRotationRowLike, index: number): string {
    let cls = 'bwt-cell';
    if (index === 0) cls += ' bwt-cell--first';
    if (index === row.text.length - 1) cls += ' bwt-cell--last';
    if (row.tone === 'output') cls += ' bwt-cell--output';
    return cls;
  }

  bwtRunClass(tone: 'input' | 'output'): string {
    return tone === 'output' ? 'run-chip run-chip--output' : 'run-chip';
  }

  rleCellClass(rle: RleTraceState, index: number): string {
    if (index < rle.groupStart) return 'str-cell str-cell--found';
    if (index === rle.scanIndex) return 'str-cell str-cell--focus';
    if (
      index >= rle.groupStart &&
      index < rle.groupStart + rle.groupCount &&
      index !== rle.scanIndex
    ) {
      return 'str-cell str-cell--window';
    }
    return 'str-cell';
  }

  huffmanVisibleNodes(huffman: HuffmanTraceState): readonly HuffmanTreeNode[] {
    const visibleIds = new Set(huffman.visibleNodeIds);
    return huffman.allNodes.filter((node) => visibleIds.has(node.id));
  }

  huffmanVisibleEdges(huffman: HuffmanTraceState): readonly HuffmanEdge[] {
    const visibleIds = new Set(huffman.visibleEdgeIds);
    return huffman.allEdges.filter((edge) =>
      visibleIds.has(`${edge.fromId}|${edge.toId}`),
    );
  }

  huffNodeById(huffman: HuffmanTraceState, id: string): HuffmanTreeNode | undefined {
    return huffman.allNodes.find((node) => node.id === id);
  }

  huffmanSvgWidth(huffman: HuffmanTraceState): number {
    const nodes = this.huffmanVisibleNodes(huffman);
    if (nodes.length === 0) return 200;
    return Math.max(...nodes.map((node) => node.x)) + 60;
  }

  huffmanSvgHeight(huffman: HuffmanTraceState): number {
    const nodes = this.huffmanVisibleNodes(huffman);
    if (nodes.length === 0) return 120;
    return Math.max(...nodes.map((node) => node.y)) + 80;
  }

  freqBarHeight(huffman: HuffmanTraceState, freq: number): string {
    const maxFreq = Math.max(...huffman.charFreqs.map((entry) => entry.freq), 1);
    return `${8 + (freq / maxFreq) * 72}px`;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.string;
    const previous = previousStep?.string ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    if (current.mode === 'kmp') {
      if (
        current.compareTextIndex !==
          (previous as KmpTraceState | null)?.compareTextIndex ||
        current.comparePatternIndex !==
          (previous as KmpTraceState | null)?.comparePatternIndex
      ) {
        const textCell = this.findBySelector(`[data-kmp-text="${current.compareTextIndex}"]`);
        const patternCell = this.findBySelector(`[data-kmp-pattern="${current.comparePatternIndex}"]`);
        if (textCell) pulseElement(textCell, { duration: motion.compareMs, scale: 1.02 });
        if (patternCell) pulseElement(patternCell, { duration: motion.compareMs, scale: 1.02 });
      }
      if ((previous as KmpTraceState | null)?.fallbackTo !== current.fallbackTo && current.fallbackTo !== null) {
        const rail = this.findBySelector('.string-jump');
        if (rail) pulseElement(rail, { duration: motion.swapMs, scale: 1.015 });
      }
      return;
    }

    if (current.mode === 'rabin-karp') {
      if ((previous as RabinKarpTraceState | null)?.windowStart !== current.windowStart) {
        const hashCard = this.findBySelector('.hash-card--window');
        if (hashCard) pulseElement(hashCard, { duration: motion.swapMs, scale: 1.02 });
      }
      if (current.collision && !(previous as RabinKarpTraceState | null)?.collision) {
        const card = this.findBySelector('.hash-card--alert');
        if (card) pulseElement(card, { duration: motion.settleMs, scale: 1.025 });
      }
      return;
    }

    if (current.mode === 'z-algorithm') {
      if ((previous as ZAlgorithmTraceState | null)?.activeIndex !== current.activeIndex && current.activeIndex !== null) {
        const bar = this.findBySelector(`[data-z-bar="${current.activeIndex}"]`);
        if (bar) pulseElement(bar, { duration: motion.compareMs, scale: 1.03 });
      }
      return;
    }

    if (current.mode === 'manacher') {
      if ((previous as ManacherTraceState | null)?.currentCenter !== current.currentCenter && current.currentCenter !== null) {
        const cell = this.findBySelector(`[data-manacher-char="${current.currentCenter}"]`);
        if (cell) pulseElement(cell, { duration: motion.compareMs, scale: 1.03 });
      }
      return;
    }

    if (current.mode === 'burrows-wheeler-transform') {
      const previousOutput = (previous as BurrowsWheelerTraceState | null)?.output ?? '';
      if (previousOutput !== current.output && current.output) {
        const card = this.findBySelector('.bwt-summary__value--output');
        if (card) pulseElement(card, { duration: motion.settleMs, scale: 1.025 });
      }
      if (
        (previous as BurrowsWheelerTraceState | null)?.activeRows.join('|') !== current.activeRows.join('|') &&
        current.activeRows.length > 0
      ) {
        const row = this.findBySelector(`[data-bwt-row="${current.activeRows[0]}"]`);
        if (row) pulseElement(row, { duration: motion.compareMs, scale: 1.01 });
      }
      return;
    }

    if (current.mode === 'rle') {
      if ((previous as RleTraceState | null)?.scanIndex !== current.scanIndex && current.scanIndex !== null) {
        const cells = this.containerRef()
          .nativeElement.querySelectorAll<HTMLElement>('.string-stage--rle .str-cell');
        const cell = cells.item(current.scanIndex);
        if (cell) pulseElement(cell, { duration: motion.compareMs, scale: 1.03 });
      }
      if ((previous as RleTraceState | null)?.completedRuns.length !== current.completedRuns.length) {
        const chip = this.findBySelector('.rle-chip--done:last-child');
        if (chip) pulseElement(chip, { duration: motion.settleMs, scale: 1.04 });
      }
      return;
    }

    if (current.mode === 'huffman') {
      if ((previous as HuffmanTraceState | null)?.visibleNodeIds.length !== current.visibleNodeIds.length) {
        const tree = this.findBySelector('.huff-tree-wrap');
        if (tree) pulseElement(tree, { duration: motion.settleMs, scale: 1.01 });
      }
      if ((previous as HuffmanTraceState | null)?.codeTable.length !== current.codeTable.length) {
        const row = this.findBySelector('.huff-code-row:last-child');
        if (row) pulseElement(row, { duration: motion.settleMs, scale: 1.03 });
      }
    }
  }

  private findBySelector(selector: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(selector);
  }

  private trackWidth(count: number): number {
    if (count <= 0) return 0;
    return count * this.slotSizePx - this.cellGapPx;
  }
}

type StringRotationRowLike = BurrowsWheelerTraceState['rotations'][number];
