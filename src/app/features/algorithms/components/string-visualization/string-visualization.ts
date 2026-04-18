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
import { animateStringStepEffects } from './string-visualization.animations';
import {
  buildManacherArcs,
  bwtCellClass,
  bwtRowClass,
  bwtRunClass,
  failureClass,
  freqBarHeight as getFreqBarHeight,
  huffmanSvgHeight as getHuffmanSvgHeight,
  huffmanSvgWidth as getHuffmanSvgWidth,
  huffmanVisibleEdges as getHuffmanVisibleEdges,
  huffmanVisibleNodes as getHuffmanVisibleNodes,
  kmpPatternClass,
  kmpTextClass,
  manacherArcViewBox as getManacherArcViewBox,
  manacherCenterX,
  manacherCharClass,
  manacherTrackWidth as getManacherTrackWidth,
  manacherWindowW,
  manacherWindowX,
  patternOffset,
  rabinPatternClass,
  rabinTextClass,
  radiusClass,
  rleCellClass,
  zBarClass,
  zBarHeight,
  zCharClass,
} from './string-visualization.utils';

@Component({
  selector: 'app-string-visualization',
  imports: [],
  templateUrl: './string-visualization.html',
  styleUrl: './string-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
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

  protected readonly patternOffset = patternOffset;
  protected readonly kmpTextClass = (index: number) => kmpTextClass(this.kmpState(), index);
  protected readonly kmpPatternClass = (index: number) => kmpPatternClass(this.kmpState(), index);
  protected readonly failureClass = (index: number) => failureClass(this.kmpState(), index);
  protected readonly rabinTextClass = (index: number) => rabinTextClass(this.rabinState(), index);
  protected readonly rabinPatternClass = (index: number) => rabinPatternClass(this.rabinState(), index);
  protected readonly zCharClass = (index: number) => zCharClass(this.zState(), index);
  protected readonly zBarClass = (index: number) => zBarClass(this.zState(), index);
  protected readonly zBarHeight = (value: number) => zBarHeight(this.zState(), value);
  protected readonly manacherCharClass = (index: number) => manacherCharClass(this.manacherState(), index);
  protected readonly radiusClass = (index: number) => radiusClass(this.manacherState(), index);
  protected readonly manacherTrackWidth = computed(() => getManacherTrackWidth(this.manacherState()));
  protected readonly manacherArcViewBox = computed(() => getManacherArcViewBox(this.manacherState()));
  protected readonly manacherCenterX = manacherCenterX;
  protected readonly manacherWindowX = manacherWindowX;
  protected readonly manacherWindowW = manacherWindowW;
  protected readonly manacherArcs = computed(() => buildManacherArcs(this.manacherState()));
  protected readonly bwtRowClass = bwtRowClass;
  protected readonly bwtCellClass = bwtCellClass;
  protected readonly bwtRunClass = bwtRunClass;
  protected readonly rleCellClass = rleCellClass;
  protected readonly huffmanVisibleNodes = computed(() => {
    const huffman = this.huffmanState();
    return huffman ? getHuffmanVisibleNodes(huffman) : [];
  });
  protected readonly huffmanVisibleEdges = computed(() => {
    const huffman = this.huffmanState();
    return huffman ? getHuffmanVisibleEdges(huffman) : [];
  });
  protected readonly huffmanSvgWidth = computed(() => getHuffmanSvgWidth(this.huffmanVisibleNodes()));
  protected readonly huffmanSvgHeight = computed(() => getHuffmanSvgHeight(this.huffmanVisibleNodes()));
  protected readonly freqBarHeight = (freq: number) => getFreqBarHeight(this.huffmanState(), freq);
  private readonly huffmanNodeMap = computed(() => {
    return new Map(this.huffmanVisibleNodes().map((node) => [node.id, node] as const));
  });
  protected readonly huffNodeById = (id: string) => this.huffmanNodeMap().get(id);

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
    queueMicrotask(() =>
      animateStringStepEffects(this.containerRef().nativeElement, this.speed(), previous, step),
    );
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  selectPreset(id: string): void {
    if (id === this.presetId()) return;
    this.presetChange.emit(id);
  }
}
