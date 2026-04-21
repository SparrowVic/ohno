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
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  AhoCorasickTraceState,
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  PalindromicTreeTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringPresetOption,
  StringTraceState,
  SuffixArrayConstructionTraceState,
  SuffixArrayLcpTraceState,
  ZAlgorithmTraceState,
  isAhoCorasickState,
  isBurrowsWheelerState,
  isHuffmanState,
  isKmpState,
  isManacherState,
  isPalindromicTreeState,
  isRabinKarpState,
  isRleState,
  isSuffixArrayConstructionState,
  isSuffixArrayLcpState,
  isZAlgorithmState,
} from '../../models/string';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';
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
} from './string-visualization.utils/string-visualization.utils';

@Component({
  selector: 'app-string-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './string-visualization.html',
  styleUrl: './string-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly I18N_KEY = I18N_KEY;
  protected readonly looksLikeI18nKey = looksLikeI18nKey;
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
  readonly ahoState = computed<AhoCorasickTraceState | null>(() => {
    const state = this.state();
    return isAhoCorasickState(state) ? state : null;
  });
  readonly suffixArrayState = computed<SuffixArrayConstructionTraceState | null>(() => {
    const state = this.state();
    return isSuffixArrayConstructionState(state) ? state : null;
  });
  readonly suffixLcpState = computed<SuffixArrayLcpTraceState | null>(() => {
    const state = this.state();
    return isSuffixArrayLcpState(state) ? state : null;
  });
  readonly palindromicTreeState = computed<PalindromicTreeTraceState | null>(() => {
    const state = this.state();
    return isPalindromicTreeState(state) ? state : null;
  });

  /** Algorithm tag — "KMP", "Rabin-Karp", "Z-Algorithm", …. Identity
   *  of the viz; stable across steps. */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence. Priority: decision > computation expression >
   *  phase label > active label. Picks the single richest per-step
   *  fact without crowding. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return (
      state.decisionLabel ??
      state.computation?.expression ??
      state.phaseLabel ??
      state.activeLabel ??
      ''
    );
  });

  /** Tone derived from mode-specific terminal flags. Most string
   *  algorithms have a "complete/done" phase; when we're there the
   *  rail goes lime. While a computation is in-flight we lean on
   *  cyan for attentiveness. */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';

    const kmp = this.kmpState();
    if (kmp) {
      if (kmp.stage === 'done') return 'sorted';
      if (kmp.matches.length > 0) return 'sorted';
    }

    const rabin = this.rabinState();
    if (rabin) {
      if (rabin.collision) return 'sorted';
      if (rabin.matches.length > 0) return 'sorted';
      if (rabin.verifying) return 'swap';
    }

    const rle = this.rleState();
    if (rle) {
      if (rle.phase === 'complete') return 'sorted';
      if (rle.phase === 'emit') return 'swap';
    }

    const huffman = this.huffmanState();
    if (huffman) {
      if (huffman.phase === 'codes') return 'sorted';
      if (huffman.phase === 'merge') return 'swap';
    }

    const aho = this.ahoState();
    if (aho) {
      if (aho.phase === 'complete') return 'sorted';
      if (aho.matches.length > 0) return 'sorted';
      if (aho.phase === 'scan') return 'compare';
    }

    const suffixArray = this.suffixArrayState();
    if (suffixArray) {
      if (suffixArray.phase === 'complete') return 'sorted';
      return 'compare';
    }

    const suffixLcp = this.suffixLcpState();
    if (suffixLcp) {
      if (suffixLcp.phase === 'complete') return 'sorted';
      return 'compare';
    }

    const palindromicTree = this.palindromicTreeState();
    if (palindromicTree) {
      if (palindromicTree.phase === 'complete') return 'sorted';
      return 'compare';
    }

    const manacher = this.manacherState();
    if (manacher && manacher.currentCenter !== null) return 'compare';

    if (state.computation) return 'compare';
    return 'default';
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
  protected readonly ahoTextClass = (index: number) => {
    const state = this.ahoState();
    if (!state) return 'str-cell';
    if (state.currentTextIndex === index) return 'str-cell str-cell--focus';
    if (state.matches.some((match) => index >= match.startIndex && index <= match.endIndex)) {
      return 'str-cell str-cell--found';
    }
    if (state.currentTextIndex !== null && index < state.currentTextIndex) {
      return 'str-cell str-cell--accent';
    }
    return 'str-cell';
  };
  protected readonly ahoPatternMatched = (pattern: string) =>
    this.ahoState()?.matches.some((match) => match.pattern === pattern) ?? false;
  protected readonly suffixSourceClass = (index: number) => {
    const suffixState = this.suffixArrayState();
    if (suffixState?.activeSuffixes.includes(index)) return 'str-cell str-cell--focus';
    const lcpState = this.suffixLcpState();
    if (lcpState?.activeSuffixes.includes(index)) return 'str-cell str-cell--focus';
    if (lcpState && lcpState.suffixArray.includes(index)) return 'str-cell str-cell--accent';
    if (suffixState && suffixState.suffixArray.includes(index)) return 'str-cell str-cell--accent';
    return 'str-cell';
  };
  protected readonly palSourceClass = (index: number) => {
    const state = this.palindromicTreeState();
    if (!state) return 'str-cell';
    if (state.processedIndex === index) return 'str-cell str-cell--focus';
    if (state.processedIndex >= index) return 'str-cell str-cell--accent';
    return 'str-cell str-cell--ghost';
  };

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
