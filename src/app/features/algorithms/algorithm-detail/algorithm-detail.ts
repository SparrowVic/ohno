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
import { bfsGenerator } from '../algorithms/bfs';
import { binarySearchGenerator } from '../algorithms/binary-search';
import { binarySearchVariantsGenerator } from '../algorithms/binary-search-variants';
import { bucketSortGenerator } from '../algorithms/bucket-sort';
import { bubbleSortGenerator } from '../algorithms/bubble-sort';
import { countingSortGenerator } from '../algorithms/counting-sort';
import { cycleDetectionGenerator } from '../algorithms/cycle-detection';
import { dijkstraGenerator } from '../algorithms/dijkstra';
import { dfsGenerator } from '../algorithms/dfs';
import { heapSortGenerator } from '../algorithms/heap-sort';
import { insertionSortGenerator } from '../algorithms/insertion-sort';
import { linearSearchGenerator } from '../algorithms/linear-search';
import { mergeSortGenerator } from '../algorithms/merge-sort';
import { quickSortGenerator } from '../algorithms/quick-sort';
import { radixSortGenerator } from '../algorithms/radix-sort';
import { selectionSortGenerator } from '../algorithms/selection-sort';
import { shellSortGenerator } from '../algorithms/shell-sort';
import { timSortGenerator } from '../algorithms/tim-sort';
import { topologicalSortKahnGenerator } from '../algorithms/topological-sort-kahn';
import { BFS_CODE } from '../data/bfs-code';
import { BINARY_SEARCH_CODE } from '../data/binary-search-code';
import { BINARY_SEARCH_VARIANTS_CODE } from '../data/binary-search-variants-code';
import { BUCKET_SORT_CODE } from '../data/bucket-sort-code';
import { BUBBLE_SORT_CODE } from '../data/bubble-sort-code';
import { COUNTING_SORT_CODE } from '../data/counting-sort-code';
import { CYCLE_DETECTION_CODE } from '../data/cycle-detection-code';
import { DFS_CODE } from '../data/dfs-code';
import { DIJKSTRA_CODE } from '../data/dijkstra-code';
import { HEAP_SORT_CODE } from '../data/heap-sort-code';
import { INSERTION_SORT_CODE } from '../data/insertion-sort-code';
import { LINEAR_SEARCH_CODE } from '../data/linear-search-code';
import { MERGE_SORT_CODE } from '../data/merge-sort-code';
import { QUICK_SORT_CODE } from '../data/quick-sort-code';
import { RADIX_SORT_CODE } from '../data/radix-sort-code';
import { SELECTION_SORT_CODE } from '../data/selection-sort-code';
import { SHELL_SORT_CODE } from '../data/shell-sort-code';
import { TIM_SORT_CODE } from '../data/tim-sort-code';
import { TOPOLOGICAL_SORT_KAHN_CODE } from '../data/topological-sort-kahn-code';
import { WeightedGraphData } from '../models/graph';
import { SearchTraceState } from '../models/search';
import { AlgorithmItem } from '../models/algorithm';
import { CodeLine, LegendItem, LogEntry } from '../models/detail';
import { SortStep } from '../models/sort-step';
import { VisualizationOption } from '../models/visualization-option';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine';
import {
  generateCycleDetectionGraph,
  generateDagGraph,
  generateDijkstraGraph,
  generateTraversalGraph,
} from '../utils/dijkstra-graph';
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

const DIJKSTRA_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Frontier queue', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Settled shortest path', color: '#3ecf8e' },
  { label: 'Active edge relaxation', color: '#5eead4' },
];

const BFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Queue frontier', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Visited layer tree', color: '#3ecf8e' },
  { label: 'Inspected edge', color: '#5eead4' },
];

const DFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Stack frontier', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Visited depth tree', color: '#3ecf8e' },
  { label: 'Inspected edge', color: '#5eead4' },
];

const TOPOLOGICAL_SORT_KAHN_LEGEND: readonly LegendItem[] = [
  { label: 'Seed node', color: '#38bdf8' },
  { label: 'Zero in-degree queue', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Ordered node', color: '#3ecf8e' },
  { label: 'Directed dependency', color: '#5eead4' },
];

const CYCLE_DETECTION_LEGEND: readonly LegendItem[] = [
  { label: 'Entry node', color: '#38bdf8' },
  { label: 'Recursion stack', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Closed node', color: '#3ecf8e' },
  { label: 'Cycle edge', color: '#5eead4' },
];

const SEARCH_LEGEND: readonly LegendItem[] = [
  { label: 'Candidate window', color: '#7c6ef0' },
  { label: 'Probe', color: '#f0b429' },
  { label: 'Visited', color: '#38bdf8' },
  { label: 'Eliminated', color: 'var(--text-secondary)', opacity: 0.55 },
  { label: 'Found', color: '#3ecf8e' },
];

const BUBBLE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
  { value: 'gradient', label: 'Color Gradient' },
  { value: 'dot', label: 'Dot Plot' },
  { value: 'radial', label: 'Radial Circle' },
  { value: 'sound', label: 'Sound Bars' },
];

const SORT_BAR_BLOCK_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
];

const RADIX_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'radix', label: 'Bucket Flow' },
  { value: 'radix-strip', label: 'Digit Strip' },
  { value: 'radix-matrix', label: 'Digit Matrix' },
];

const SEARCH_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'search', label: 'Signal Sweep' },
];

const DIJKSTRA_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Path Network' },
];

const BFS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Layer Wave' },
];

const DFS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Depth Chase' },
];

const TOPOLOGICAL_SORT_KAHN_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'DAG Flow' },
];

const CYCLE_DETECTION_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Back Edge Hunt' },
];

const BUBBLE_SIZE_OPTIONS: readonly number[] = [16, 32, 64];
const COUNTING_SIZE_OPTIONS: readonly number[] = [12, 24, 36];
const RADIX_SIZE_OPTIONS: readonly number[] = [12, 18, 24];
const DIJKSTRA_SIZE_OPTIONS: readonly number[] = [6, 8, 10];

interface RandomRange {
  readonly min: number;
  readonly max: number;
}

interface BaseAlgorithmViewConfig {
  readonly codeLines: readonly CodeLine[];
  readonly variantOptions: readonly VisualizationOption[];
  readonly defaultVariant: VisualizationVariant;
  readonly sizeOptions: readonly number[];
  readonly defaultSize: number;
  readonly legendItems: (variant: VisualizationVariant) => readonly LegendItem[];
  readonly sizeUnit: string;
  readonly randomizeLabel: string;
}

interface ArrayAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'array';
  readonly randomRange: RandomRange;
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
}

interface GraphAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'graph';
  readonly createGraph: (size: number) => WeightedGraphData;
  readonly generator: (graph: WeightedGraphData) => Generator<SortStep>;
}

interface SearchScenario {
  readonly array: readonly number[];
  readonly target: number;
}

interface SearchAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'search';
  readonly createScenario: (size: number) => SearchScenario;
  readonly generator: (scenario: SearchScenario) => Generator<SortStep>;
}

type AlgorithmViewConfig = ArrayAlgorithmViewConfig | GraphAlgorithmViewConfig | SearchAlgorithmViewConfig;

const BUBBLE_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
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
  sizeUnit: 'elements',
  randomizeLabel: 'Randomize',
};

const RADIX_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
  codeLines: RADIX_SORT_CODE,
  variantOptions: RADIX_VARIANT_OPTIONS,
  defaultVariant: 'radix',
  sizeOptions: RADIX_SIZE_OPTIONS,
  defaultSize: 18,
  randomRange: { min: 10, max: 999 },
  generator: radixSortGenerator,
  legendItems: () => RADIX_LEGEND,
  sizeUnit: 'elements',
  randomizeLabel: 'Randomize',
};

function createSortViewConfig(args: {
  readonly codeLines: readonly CodeLine[];
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
  readonly randomRange: RandomRange;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'array',
    codeLines: args.codeLines,
    variantOptions: SORT_BAR_BLOCK_VARIANT_OPTIONS,
    defaultVariant: 'bar',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 16,
    randomRange: args.randomRange,
    generator: args.generator,
    legendItems: (variant) => (variant === 'block' ? BLOCK_LEGEND : BAR_LEGEND),
    sizeUnit: 'elements',
    randomizeLabel: 'Randomize',
  };
}

const SELECTION_VIEW_CONFIG = createSortViewConfig({
  codeLines: SELECTION_SORT_CODE,
  generator: selectionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const INSERTION_VIEW_CONFIG = createSortViewConfig({
  codeLines: INSERTION_SORT_CODE,
  generator: insertionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const COUNTING_VIEW_CONFIG = createSortViewConfig({
  codeLines: COUNTING_SORT_CODE,
  generator: countingSortGenerator,
  randomRange: { min: 1, max: 24 },
  sizeOptions: COUNTING_SIZE_OPTIONS,
  defaultSize: 24,
});

const MERGE_VIEW_CONFIG = createSortViewConfig({
  codeLines: MERGE_SORT_CODE,
  generator: mergeSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const QUICK_VIEW_CONFIG = createSortViewConfig({
  codeLines: QUICK_SORT_CODE,
  generator: quickSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const HEAP_VIEW_CONFIG = createSortViewConfig({
  codeLines: HEAP_SORT_CODE,
  generator: heapSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

function createSearchViewConfig(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number) => SearchScenario;
  readonly generator: (scenario: SearchScenario) => Generator<SortStep>;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'search',
    codeLines: args.codeLines,
    variantOptions: SEARCH_VARIANT_OPTIONS,
    defaultVariant: 'search',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 16,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => SEARCH_LEGEND,
    sizeUnit: 'items',
    randomizeLabel: 'New challenge',
  };
}

const BUCKET_VIEW_CONFIG = createSortViewConfig({
  codeLines: BUCKET_SORT_CODE,
  generator: bucketSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const SHELL_VIEW_CONFIG = createSortViewConfig({
  codeLines: SHELL_SORT_CODE,
  generator: shellSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const TIM_VIEW_CONFIG = createSortViewConfig({
  codeLines: TIM_SORT_CODE,
  generator: timSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const LINEAR_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: LINEAR_SEARCH_CODE,
  createScenario: (size) => createLinearSearchScenario(size),
  generator: linearSearchGenerator,
  sizeOptions: [12, 20, 28],
  defaultSize: 20,
});

const BINARY_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_CODE,
  createScenario: (size) => createBinarySearchScenario(size),
  generator: binarySearchGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const BINARY_SEARCH_VARIANTS_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_VARIANTS_CODE,
  createScenario: (size) => createBinarySearchVariantsScenario(size),
  generator: binarySearchVariantsGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const DIJKSTRA_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DIJKSTRA_CODE,
  variantOptions: DIJKSTRA_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDijkstraGraph,
  generator: dijkstraGenerator,
  legendItems: () => DIJKSTRA_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const BFS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: BFS_CODE,
  variantOptions: BFS_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateTraversalGraph,
  generator: bfsGenerator,
  legendItems: () => BFS_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const DFS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DFS_CODE,
  variantOptions: DFS_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateTraversalGraph,
  generator: dfsGenerator,
  legendItems: () => DFS_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const TOPOLOGICAL_SORT_KAHN_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: TOPOLOGICAL_SORT_KAHN_CODE,
  variantOptions: TOPOLOGICAL_SORT_KAHN_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDagGraph,
  generator: topologicalSortKahnGenerator,
  legendItems: () => TOPOLOGICAL_SORT_KAHN_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New DAG',
};

const CYCLE_DETECTION_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: CYCLE_DETECTION_CODE,
  variantOptions: CYCLE_DETECTION_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateCycleDetectionGraph,
  generator: cycleDetectionGenerator,
  legendItems: () => CYCLE_DETECTION_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

@Component({
  selector: 'app-algorithm-detail',
  imports: [LegendBar, SidePanel, VisualizationCanvas, VisualizationToolbar],
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
    if (algorithm.id === 'radix-sort') {
      return RADIX_VIEW_CONFIG;
    }
    if (algorithm.id === 'selection-sort') {
      return SELECTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'insertion-sort') {
      return INSERTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'counting-sort') {
      return COUNTING_VIEW_CONFIG;
    }
    if (algorithm.id === 'merge-sort') {
      return MERGE_VIEW_CONFIG;
    }
    if (algorithm.id === 'quick-sort') {
      return QUICK_VIEW_CONFIG;
    }
    if (algorithm.id === 'heap-sort') {
      return HEAP_VIEW_CONFIG;
    }
    if (algorithm.id === 'bucket-sort') {
      return BUCKET_VIEW_CONFIG;
    }
    if (algorithm.id === 'shell-sort') {
      return SHELL_VIEW_CONFIG;
    }
    if (algorithm.id === 'tim-sort') {
      return TIM_VIEW_CONFIG;
    }
    if (algorithm.id === 'linear-search') {
      return LINEAR_SEARCH_VIEW_CONFIG;
    }
    if (algorithm.id === 'binary-search') {
      return BINARY_SEARCH_VIEW_CONFIG;
    }
    if (algorithm.id === 'binary-search-variants') {
      return BINARY_SEARCH_VARIANTS_VIEW_CONFIG;
    }
    if (algorithm.id === 'dijkstra') {
      return DIJKSTRA_VIEW_CONFIG;
    }
    if (algorithm.id === 'bfs') {
      return BFS_VIEW_CONFIG;
    }
    if (algorithm.id === 'dfs') {
      return DFS_VIEW_CONFIG;
    }
    if (algorithm.id === 'topological-sort-kahn') {
      return TOPOLOGICAL_SORT_KAHN_VIEW_CONFIG;
    }
    if (algorithm.id === 'cycle-detection') {
      return CYCLE_DETECTION_VIEW_CONFIG;
    }
    return BUBBLE_VIEW_CONFIG;
  });

  private readonly sizeSig = signal(16);
  private readonly variantSig = signal<VisualizationVariant>('bar');
  private readonly mutedSig = signal(true);
  private readonly arraySig = signal<readonly number[]>(this.generateArray(16, { min: 1, max: 99 }));
  private readonly graphSig = signal<WeightedGraphData | null>(null);
  private readonly currentSnapshot = signal<SortStep | null>(null);
  private readonly logEntriesSig = signal<readonly LogEntry[]>([]);
  private lastLoggedStep = -1;

  readonly size = this.sizeSig.asReadonly();
  readonly variant = this.variantSig.asReadonly();
  readonly muted = this.mutedSig.asReadonly();
  readonly array = this.arraySig.asReadonly();
  readonly graph = this.graphSig.asReadonly();
  readonly currentStep = this.engine.currentStep;
  readonly totalSteps = this.engine.totalSteps;
  readonly isPlaying = this.engine.isPlaying;
  readonly speed = this.engine.speed;
  readonly step = this.currentSnapshot.asReadonly();
  readonly logEntries = this.logEntriesSig.asReadonly();
  readonly sizeOptions = computed(() => this.config()?.sizeOptions ?? []);
  readonly variantOptions = computed(() => this.config()?.variantOptions ?? []);
  readonly sizeUnit = computed(() => this.config()?.sizeUnit ?? 'elements');
  readonly randomizeLabel = computed(() => this.config()?.randomizeLabel ?? 'Randomize');
  readonly graphTrace = computed(() => this.currentSnapshot()?.graph ?? null);
  readonly searchTrace = computed<SearchTraceState | null>(() => this.currentSnapshot()?.search ?? null);

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
          this.graphSig.set(null);
          this.engine.reset();
          return;
        }

        this.sizeSig.set(config.defaultSize);
        this.variantSig.set(config.defaultVariant);
        this.mutedSig.set(true);

        if (config.kind === 'graph') {
          const nextGraph = config.createGraph(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(nextGraph);
          this.loadGraphEngine(nextGraph, config.generator);
          return;
        }

        if (config.kind === 'search') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set(scenario.array);
          this.graphSig.set(null);
          this.loadSearchEngine(scenario, config.generator);
          return;
        }

        const nextArray = this.generateArray(config.defaultSize, config.randomRange);
        this.arraySig.set(nextArray);
        this.graphSig.set(null);
        this.loadArrayEngine(nextArray, config.generator);
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

    if (config.kind === 'graph') {
      const nextGraph = config.createGraph(value);
      this.graphSig.set(nextGraph);
      this.arraySig.set([]);
      this.loadGraphEngine(nextGraph, config.generator);
      return;
    }

    if (config.kind === 'search') {
      const scenario = config.createScenario(value);
      this.arraySig.set(scenario.array);
      this.graphSig.set(null);
      this.loadSearchEngine(scenario, config.generator);
      return;
    }

    const nextArray = this.generateArray(value, config.randomRange);
    this.arraySig.set(nextArray);
    this.graphSig.set(null);
    this.loadArrayEngine(nextArray, config.generator);
  }

  onRandomize(): void {
    const config = this.config();
    if (!config) return;

    if (config.kind === 'graph') {
      const nextGraph = config.createGraph(this.sizeSig());
      this.graphSig.set(nextGraph);
      this.arraySig.set([]);
      this.loadGraphEngine(nextGraph, config.generator);
      return;
    }

    if (config.kind === 'search') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set(scenario.array);
      this.graphSig.set(null);
      this.loadSearchEngine(scenario, config.generator);
      return;
    }

    const nextArray = this.generateArray(this.sizeSig(), config.randomRange);
    this.arraySig.set(nextArray);
    this.graphSig.set(null);
    this.loadArrayEngine(nextArray, config.generator);
  }

  onVariantChange(value: VisualizationVariant): void {
    const config = this.config();
    if (!config) return;
    const allowed = config.variantOptions.some((option) => option.value === value);
    if (!allowed || value === this.variantSig()) return;

    this.variantSig.set(value);
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.engine.reset();
  }

  onMuteToggle(): void {
    this.mutedSig.update((muted) => !muted);
  }

  private loadArrayEngine(
    array: readonly number[],
    generator: (values: readonly number[]) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(array));
  }

  private loadGraphEngine(
    graph: WeightedGraphData,
    generator: (graph: WeightedGraphData) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(graph));
  }

  private loadSearchEngine(
    scenario: SearchScenario,
    generator: (scenario: SearchScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadEngine(generator: Generator<SortStep>): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.currentSnapshot.set(null);
    this.engine.load(generator, (step, index) => {
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
    const result: number[] = [];
    for (let index = 0; index < size; index++) {
      const span = range.max - range.min + 1;
      result.push(Math.floor(Math.random() * span) + range.min);
    }
    return result;
  }
}

function createLinearSearchScenario(size: number): SearchScenario {
  const array = Array.from({ length: size }, () => Math.floor(Math.random() * 89) + 10);
  const shouldHit = Math.random() < 0.78;
  if (shouldHit && array.length > 0) {
    return {
      array,
      target: array[Math.floor(Math.random() * array.length)] ?? 0,
    };
  }

  let target = Math.floor(Math.random() * 89) + 10;
  while (array.includes(target)) {
    target = Math.floor(Math.random() * 89) + 10;
  }
  return { array, target };
}

function createBinarySearchScenario(size: number): SearchScenario {
  const set = new Set<number>();
  while (set.size < size) {
    set.add(Math.floor(Math.random() * 90) + 10);
  }
  const array = [...set].sort((left, right) => left - right);
  const shouldHit = Math.random() < 0.76;

  if (shouldHit && array.length > 0) {
    return {
      array,
      target: array[Math.floor(Math.random() * array.length)] ?? 0,
    };
  }

  let target = (array[0] ?? 10) - 1;
  while (array.includes(target)) {
    target++;
  }
  return { array, target };
}

function createBinarySearchVariantsScenario(size: number): SearchScenario {
  const baseValues: number[] = [];
  let current = Math.floor(Math.random() * 6) + 8;
  while (baseValues.length < Math.max(6, Math.ceil(size / 2))) {
    current += Math.floor(Math.random() * 4) + 1;
    baseValues.push(current);
  }

  const array: number[] = [];
  for (const value of baseValues) {
    array.push(value);
    if (array.length >= size) break;
    if (Math.random() < 0.58 && array.length < size) array.push(value);
    if (Math.random() < 0.22 && array.length < size) array.push(value);
    if (array.length >= size) break;
  }

  while (array.length < size) {
    array.push(baseValues[Math.floor(Math.random() * baseValues.length)] ?? current);
  }

  array.sort((left, right) => left - right);

  const counts = new Map<number, number>();
  for (const value of array) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const duplicatedValues = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);

  const targetPool = duplicatedValues.length > 0 ? duplicatedValues : array;
  return {
    array,
    target: targetPool[Math.floor(Math.random() * targetPool.length)] ?? array[0] ?? 0,
  };
}
