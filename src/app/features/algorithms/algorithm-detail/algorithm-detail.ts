import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { bubbleSortGenerator } from '../algorithms/bubble-sort';
import { radixSortGenerator } from '../algorithms/radix-sort';
import { BUBBLE_SORT_CODE } from '../data/bubble-sort-code';
import { RADIX_SORT_CODE } from '../data/radix-sort-code';
import { AlgorithmItem } from '../models/algorithm';
import { CodeLine, LegendItem, LogEntry } from '../models/detail';
import { SortStep } from '../models/sort-step';
import { VisualizationOption } from '../models/visualization-option';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine';
import { LegendBar } from '../components/legend-bar/legend-bar';
import { SidePanel } from '../components/side-panel/side-panel';
import { VisualizationCanvas } from '../components/visualization-canvas/visualization-canvas';
import { VisualizationToolbar } from '../components/visualization-toolbar/visualization-toolbar';

const BAR_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
];

const BLOCK_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
  { label: 'Boundary', color: 'var(--accent)' },
];

const SOUND_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
  { label: 'Audio on compare/swap', color: 'var(--text-secondary)', opacity: 0.6 },
];

const RADIX_LEGEND: readonly LegendItem[] = [
  { label: 'Input stream', color: '#7c6ef0', opacity: 0.55 },
  { label: 'Active digit', color: '#38bdf8' },
  { label: 'Bucket lane', color: '#f59e0b' },
  { label: 'Gathered output', color: '#34d399' },
];

const BUBBLE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
  { value: 'gradient', label: 'Color Gradient' },
  { value: 'dot', label: 'Dot Plot' },
  { value: 'radial', label: 'Radial Circle' },
  { value: 'sound', label: 'Sound Bars' },
];

const RADIX_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'radix', label: 'Bucket Flow' },
  { value: 'radix-strip', label: 'Digit Strip' },
  { value: 'radix-matrix', label: 'Digit Matrix' },
];

const BUBBLE_SIZE_OPTIONS: readonly number[] = [16, 32, 64];
const RADIX_SIZE_OPTIONS: readonly number[] = [12, 18, 24];

interface RandomRange {
  readonly min: number;
  readonly max: number;
}

interface AlgorithmViewConfig {
  readonly codeLines: readonly CodeLine[];
  readonly variantOptions: readonly VisualizationOption[];
  readonly defaultVariant: VisualizationVariant;
  readonly sizeOptions: readonly number[];
  readonly defaultSize: number;
  readonly randomRange: RandomRange;
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
  readonly legendItems: (variant: VisualizationVariant) => readonly LegendItem[];
}

const BUBBLE_VIEW_CONFIG: AlgorithmViewConfig = {
  codeLines: BUBBLE_SORT_CODE,
  variantOptions: BUBBLE_VARIANT_OPTIONS,
  defaultVariant: 'bar',
  sizeOptions: BUBBLE_SIZE_OPTIONS,
  defaultSize: 16,
  randomRange: { min: 1, max: 99 },
  generator: bubbleSortGenerator,
  legendItems: (variant) => {
    if (variant === 'block') return BLOCK_LEGEND;
    if (variant === 'sound') return SOUND_LEGEND;
    return BAR_LEGEND;
  },
};

const RADIX_VIEW_CONFIG: AlgorithmViewConfig = {
  codeLines: RADIX_SORT_CODE,
  variantOptions: RADIX_VARIANT_OPTIONS,
  defaultVariant: 'radix',
  sizeOptions: RADIX_SIZE_OPTIONS,
  defaultSize: 18,
  randomRange: { min: 10, max: 999 },
  generator: radixSortGenerator,
  legendItems: () => RADIX_LEGEND,
};

@Component({
  selector: 'app-algorithm-detail',
  imports: [
    LegendBar,
    SidePanel,
    VisualizationCanvas,
    VisualizationToolbar,
  ],
  templateUrl: './algorithm-detail.html',
  styleUrl: './algorithm-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VisualizationEngine],
})
export class AlgorithmDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly engine = inject(VisualizationEngine);
  private readonly language = inject(AppLanguageService);

  private readonly idParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  readonly algorithm = computed<AlgorithmItem | undefined>(() => {
    const id = this.idParam();
    return id ? this.registry.getById(id) : undefined;
  });

  readonly difficultyLabel = computed(() => {
    const algorithm = this.algorithm();
    if (!algorithm) return '';
    return getDifficultyLabel(algorithm.difficulty, this.language.activeLang());
  });
  readonly unavailableLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Visualization is not implemented yet.'
      : 'Ta wizualizacja nie jest jeszcze zaimplementowana.',
  );
  readonly config = computed<AlgorithmViewConfig | null>(() => {
    const algorithm = this.algorithm();
    if (!algorithm?.implemented) {
      return null;
    }
    if (algorithm?.id === 'radix-sort') {
      return RADIX_VIEW_CONFIG;
    }
    return BUBBLE_VIEW_CONFIG;
  });

  private readonly sizeSig = signal(16);
  private readonly variantSig = signal<VisualizationVariant>('bar');
  private readonly mutedSig = signal(true);
  private readonly arraySig = signal<readonly number[]>(this.generateArray(16, { min: 1, max: 99 }));
  private readonly currentSnapshot = signal<SortStep | null>(null);
  private readonly logEntriesSig = signal<readonly LogEntry[]>([]);
  private lastLoggedStep = -1;

  readonly size = this.sizeSig.asReadonly();
  readonly variant = this.variantSig.asReadonly();
  readonly muted = this.mutedSig.asReadonly();
  readonly array = this.arraySig.asReadonly();
  readonly currentStep = this.engine.currentStep;
  readonly totalSteps = this.engine.totalSteps;
  readonly isPlaying = this.engine.isPlaying;
  readonly speed = this.engine.speed;
  readonly step = this.currentSnapshot.asReadonly();
  readonly logEntries = this.logEntriesSig.asReadonly();
  readonly sizeOptions = computed(() => this.config()?.sizeOptions ?? []);
  readonly variantOptions = computed(() => this.config()?.variantOptions ?? []);

  readonly activeLineNumber = computed<number | null>(() => {
    const snap = this.currentSnapshot();
    return snap ? snap.activeCodeLine : null;
  });

  readonly legendItems = computed<readonly LegendItem[]>(() => {
    return this.config()?.legendItems(this.variantSig()) ?? [];
  });

  readonly codeLines = computed(() => this.config()?.codeLines ?? []);

  constructor() {
    effect(() => {
      const config = this.config();
      const algorithm = this.algorithm();
      untracked(() => {
        if (!algorithm?.implemented || !config) {
          this.logEntriesSig.set([]);
          this.lastLoggedStep = -1;
          this.currentSnapshot.set(null);
          this.engine.reset();
          return;
        }
        this.sizeSig.set(config.defaultSize);
        this.variantSig.set(config.defaultVariant);
        this.mutedSig.set(true);
        const next = this.generateArray(config.defaultSize, config.randomRange);
        this.arraySig.set(next);
        this.loadEngine(next, config.generator);
      });
    });
  }

  back(): void {
    this.router.navigate(['/algorithms']);
  }

  onReset(): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.engine.reset();
  }

  onStepBack(): void {
    this.engine.stepBack();
  }

  onPlayToggle(): void {
    if (this.engine.state() === 'running') {
      this.engine.pause();
    } else {
      this.engine.play();
    }
  }

  onStepForward(): void {
    this.engine.stepForward();
  }

  onSpeedChange(value: number): void {
    this.engine.setSpeed(value);
  }

  onSizeChange(value: number): void {
    const config = this.config();
    if (!config) return;
    this.sizeSig.set(value);
    const next = this.generateArray(value, config.randomRange);
    this.arraySig.set(next);
    this.loadEngine(next, config.generator);
  }

  onRandomize(): void {
    const config = this.config();
    if (!config) return;
    const next = this.generateArray(this.sizeSig(), config.randomRange);
    this.arraySig.set(next);
    this.loadEngine(next, config.generator);
  }

  onVariantChange(value: VisualizationVariant): void {
    const config = this.config();
    if (!config) return;
    const allowed = config.variantOptions.some((option) => option.value === value);
    if (!allowed) return;
    if (value === this.variantSig()) return;
    this.variantSig.set(value);
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.engine.reset();
  }

  onMuteToggle(): void {
    this.mutedSig.update((m) => !m);
  }

  private loadEngine(
    array: readonly number[],
    generator: (values: readonly number[]) => Generator<SortStep>,
  ): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.currentSnapshot.set(null);
    this.engine.load(generator(array), (step, index) => {
      this.currentSnapshot.set(step);
      this.appendLog(step, index);
    });
  }

  private appendLog(step: SortStep, index: number): void {
    if (index <= this.lastLoggedStep) return;
    this.lastLoggedStep = index;
    const entries = this.logEntriesSig();
    const next: LogEntry = {
      step: index,
      description: step.description,
      timestamp: Date.now() + entries.length,
    };
    this.logEntriesSig.set([...entries, next]);
  }

  private generateArray(size: number, range: RandomRange): readonly number[] {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      const span = range.max - range.min + 1;
      arr.push(Math.floor(Math.random() * span) + range.min);
    }
    return arr;
  }
}
