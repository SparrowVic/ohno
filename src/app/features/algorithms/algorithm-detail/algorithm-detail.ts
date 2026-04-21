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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getAlgorithmFacetLabelKey } from '../../../core/i18n/catalog-labels';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY, I18nKey } from '../../../core/i18n/i18n-keys';
import {
  getVisualizationActionLabelKey,
  getVisualizationSizeUnitLabelKey,
  getVisualizationVariantLabelKey,
} from '../../../core/i18n/visualization-labels';
import { LegendBar } from '../components/legend-bar/legend-bar';
import { SidePanel } from '../components/side-panel/side-panel';
import { VisualizationCanvas } from '../components/visualization-canvas/visualization-canvas';
import { VisualizationToolbar } from '../components/visualization-toolbar/visualization-toolbar';
import {
  AlgorithmViewConfig,
  describeGraphPath,
  getAlgorithmViewConfig,
  humanizeLabel,
  RandomRange,
} from './algorithm-detail-config/algorithm-detail-config';
import { AlgorithmItem } from '../models/algorithm';
import { CodeVariantMap, LogEntry } from '../models/detail';
import { DpPresetOption, DpTraceState } from '../models/dp';
import { DsuTraceState } from '../models/dsu';
import { GeometryStepState } from '../models/geometry';
import { GraphStepState, WeightedGraphData } from '../models/graph';
import { GridTraceState } from '../models/grid';
import { MatrixTraceState } from '../models/matrix';
import { NetworkTraceState } from '../models/network';
import { SearchTraceState } from '../models/search';
import { SortTraceState } from '../models/sort-trace';
import { deriveSortTrace } from '../utils/derive-sort-trace/derive-sort-trace';
import { SortStep } from '../models/sort-step';
import { StringPresetOption, StringTraceState } from '../models/string';
import { TreePresetOption, TreeTraversalTraceState } from '../models/tree';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine/visualization-engine';

interface RebuildOptions {
  readonly dpPresetId?: string | null;
  readonly stringPresetId?: string | null;
  readonly treePresetId?: string | null;
}

@Component({
  selector: 'app-algorithm-detail',
  imports: [
    LegendBar,
    SidePanel,
    VisualizationCanvas,
    VisualizationToolbar,
    RouterLink,
    TranslocoPipe,
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
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  private readonly idParam = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });

  private readonly sizeSig = signal(16);
  private readonly variantSig = signal<VisualizationVariant>('bar');
  private readonly arraySig = signal<readonly number[]>(
    this.createRandomArray(16, { min: 1, max: 99 }),
  );
  private readonly graphSig = signal<WeightedGraphData | null>(null);
  private readonly dpPresetSig = signal<string | null>(null);
  private readonly stringPresetSig = signal<string | null>(null);
  private readonly treePresetSig = signal<string | null>(null);
  private readonly currentSnapshot = signal<SortStep | null>(null);
  private readonly logEntriesSig = signal<readonly LogEntry[]>([]);
  private readonly graphFocusTargetIdSig = signal<string | null>(null);
  private lastLoggedStep = -1;

  readonly algorithm = computed<AlgorithmItem | undefined>(() => {
    const id = this.idParam();
    return id ? this.registry.getById(id) : undefined;
  });

  readonly config = computed<AlgorithmViewConfig | null>(() => {
    const algorithm = this.algorithm();
    return algorithm?.implemented ? getAlgorithmViewConfig(algorithm.id) : null;
  });

  readonly difficultyLabelKey = computed(() => {
    const algorithm = this.algorithm();
    return algorithm ? getDifficultyLabelKey(algorithm.difficulty) : null;
  });
  readonly breadcrumbs = computed(() => {
    const algorithm = this.algorithm();
    if (!algorithm) return [];

    return [algorithm.category, algorithm.subcategory]
      .filter(Boolean)
      .map((facet) => this.translateFacet(facet));
  });

  readonly size = this.sizeSig.asReadonly();
  readonly variant = this.variantSig.asReadonly();
  readonly array = this.arraySig.asReadonly();
  readonly graph = this.graphSig.asReadonly();
  readonly dpPresetId = this.dpPresetSig.asReadonly();
  readonly stringPresetId = this.stringPresetSig.asReadonly();
  readonly treePresetId = this.treePresetSig.asReadonly();
  readonly graphFocusTargetId = this.graphFocusTargetIdSig.asReadonly();
  readonly currentStep = this.engine.currentStep;
  readonly totalSteps = this.engine.totalSteps;
  readonly isPlaying = this.engine.isPlaying;
  readonly speed = this.engine.speed;
  readonly step = this.currentSnapshot.asReadonly();
  readonly logEntries = this.logEntriesSig.asReadonly();

  readonly sizeOptions = computed(() => this.config()?.sizeOptions ?? []);
  readonly variantOptions = computed(() => this.config()?.variantOptions ?? []);
  readonly dpPresetOptions = computed<readonly DpPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'dp' ? config.presetOptions : [];
  });
  readonly stringPresetOptions = computed<readonly StringPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'string' ? config.presetOptions : [];
  });
  readonly treePresetOptions = computed<readonly TreePresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'tree' ? config.presetOptions : [];
  });
  readonly sizeUnitLabel = computed(() => {
    const unit = this.config()?.sizeUnit ?? 'elements';
    return this.translateMaybe(getVisualizationSizeUnitLabelKey(unit), unit);
  });
  readonly randomizeLabel = computed(() => {
    const label = this.config()?.randomizeLabel ?? 'Randomize';
    return this.translateMaybe(getVisualizationActionLabelKey(label), label);
  });
  readonly translatedVariantOptions = computed(() =>
    this.variantOptions().map((option) => ({
      ...option,
      label: this.translateMaybe(getVisualizationVariantLabelKey(option.label), option.label),
    })),
  );
  readonly currentVariantLabel = computed(() => {
    const active = this.variantSig();
    return (
      this.translatedVariantOptions().find((option) => option.value === active)?.label ??
      humanizeLabel(active)
    );
  });

  readonly graphTrace = computed(() => this.currentSnapshot()?.graph ?? null);
  readonly dpTrace = computed<DpTraceState | null>(() => this.currentSnapshot()?.dp ?? null);
  readonly dsuTrace = computed<DsuTraceState | null>(() => this.currentSnapshot()?.dsu ?? null);
  readonly gridTrace = computed<GridTraceState | null>(() => this.currentSnapshot()?.grid ?? null);
  readonly matrixTrace = computed<MatrixTraceState | null>(
    () => this.currentSnapshot()?.matrix ?? null,
  );
  readonly networkTrace = computed<NetworkTraceState | null>(
    () => this.currentSnapshot()?.network ?? null,
  );
  readonly searchTrace = computed<SearchTraceState | null>(
    () => this.currentSnapshot()?.search ?? null,
  );
  readonly sortTrace = computed<SortTraceState | null>(() => {
    const snapshot = this.currentSnapshot();
    const config = this.config();
    // Derive only for array-kind configs (the sorting family) so graph /
    // grid / geometry / etc. algos don't double up on trace panels.
    if (!snapshot || !config || config.kind !== 'array') return null;
    return deriveSortTrace(snapshot);
  });
  readonly stringTrace = computed<StringTraceState | null>(
    () => this.currentSnapshot()?.string ?? null,
  );
  readonly treeTrace = computed<TreeTraversalTraceState | null>(
    () => this.currentSnapshot()?.tree ?? null,
  );
  readonly geometryTrace = computed<GeometryStepState | null>(
    () => this.currentSnapshot()?.geometry ?? null,
  );

  readonly graphRouteModeLabel = computed(() => {
    const trace = this.graphTrace();
    if (!trace) return null;
    if (trace.metricLabel === 'Distance') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.shortestPathLabel);
    }
    if (trace.metricLabel === 'Level') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.bfsRouteLabel);
    }
    if (trace.metricLabel === 'Depth' && trace.detailLabel === 'Depth path') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.dfsBranchLabel);
    }
    return null;
  });
  readonly graphFocusTargetLabel = computed(() => {
    const trace = this.graphTrace();
    const targetId = this.resolvedGraphFocusTargetId();
    if (!trace || !targetId || !this.graphRouteModeLabel()) return null;
    return trace.nodes.find((node) => node.id === targetId)?.label ?? null;
  });
  readonly graphFocusPathLabel = computed(() => {
    const trace = this.graphTrace();
    const targetId = this.resolvedGraphFocusTargetId();
    if (!trace || !targetId || !this.graphRouteModeLabel()) return null;
    return describeGraphPath(trace, targetId);
  });
  readonly graphFocusHint = computed(() => {
    const trace = this.graphTrace();
    if (!trace || !this.graphRouteModeLabel()) return null;
    if (trace.metricLabel === 'Distance') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.shortestPathHint);
    }
    if (trace.metricLabel === 'Level') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.bfsRouteHint);
    }
    if (trace.metricLabel === 'Depth' && trace.detailLabel === 'Depth path') {
      return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.dfsBranchHint);
    }
    return null;
  });

  readonly activeLineNumber = computed<number | null>(() => {
    // Don't preselect a code line before the user has stepped — the
    // engine emits an initial snapshot at step 0 which would otherwise
    // leave a line highlighted as if it were already executing.
    if (this.currentStep() === 0) {
      return null;
    }
    return this.currentSnapshot()?.activeCodeLine ?? null;
  });
  readonly legendItems = computed(() => this.config()?.legendItems(this.variantSig()) ?? []);
  readonly codeLines = computed(() => this.config()?.codeLines ?? []);
  readonly codeRegions = computed(() => this.config()?.codeRegions ?? []);
  readonly codeVariants = computed<CodeVariantMap>(() => {
    const config = this.config();
    if (!config) {
      return {};
    }

    if (config.codeVariants) {
      return config.codeVariants;
    }

    return {
      typescript: {
        language: 'typescript',
        lines: config.codeLines,
        regions: config.codeRegions ?? [],
        highlightMap: config.codeHighlightMap,
        source: config.codeLines
          .map((line) => line.tokens.map((token) => token.text).join(''))
          .join('\n'),
      },
    };
  });

  constructor() {
    effect(() => {
      const config = this.config();
      const algorithm = this.algorithm();

      untracked(() => {
        if (!algorithm?.implemented || !config) {
          this.resetUnavailableState();
          return;
        }

        this.variantSig.set(config.defaultVariant);
        this.dpPresetSig.set(config.kind === 'dp' ? config.defaultPresetId : null);
        this.stringPresetSig.set(config.kind === 'string' ? config.defaultPresetId : null);
        this.treePresetSig.set(config.kind === 'tree' ? config.defaultPresetId : null);

        this.rebuildVisualization(config, config.defaultSize, {
          dpPresetId: config.kind === 'dp' ? config.defaultPresetId : null,
          stringPresetId: config.kind === 'string' ? config.defaultPresetId : null,
          treePresetId: config.kind === 'tree' ? config.defaultPresetId : null,
        });
      });
    });
  }

  back(): void {
    void this.router.navigate(['/algorithms'], {
      queryParams: this.route.snapshot.queryParams,
    });
  }

  onReset(): void {
    this.resetPlaybackState();
    this.engine.reset();
  }

  onStepBack(): void {
    this.engine.stepBack();
  }

  onPlayToggle(): void {
    if (this.engine.state() === 'running') {
      this.engine.pause();
      return;
    }

    this.engine.play();
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
    this.rebuildVisualization(config, value);
  }

  onRandomize(): void {
    const config = this.config();
    if (!config) return;
    this.rebuildVisualization(config, this.sizeSig());
  }

  onVariantChange(value: VisualizationVariant): void {
    const config = this.config();
    if (!config) return;
    if (
      !config.variantOptions.some((option) => option.value === value) ||
      value === this.variantSig()
    )
      return;

    this.variantSig.set(value);
    this.resetPlaybackState();
    this.engine.reset();
  }

  onGraphFocusTargetChange(value: string | null): void {
    this.graphFocusTargetIdSig.set(value);
  }

  onDpPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'dp') return;
    if (!config.presetOptions.some((option) => option.id === value) || value === this.dpPresetSig())
      return;

    this.dpPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { dpPresetId: value });
  }

  onStringPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'string') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.stringPresetSig()
    )
      return;

    this.stringPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { stringPresetId: value });
  }

  onTreePresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'tree') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.treePresetSig()
    )
      return;

    this.treePresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { treePresetId: value });
  }

  private resetUnavailableState(): void {
    this.resetPlaybackState();
    this.graphSig.set(null);
    this.dpPresetSig.set(null);
    this.stringPresetSig.set(null);
    this.treePresetSig.set(null);
    this.engine.reset();
  }

  private rebuildVisualization(
    config: AlgorithmViewConfig,
    size: number,
    options: RebuildOptions = {},
  ): void {
    this.sizeSig.set(size);
    this.graphFocusTargetIdSig.set(null);

    switch (config.kind) {
      case 'graph': {
        const graph = config.createGraph(size);
        this.arraySig.set([]);
        this.graphSig.set(graph);
        this.loadScenario(graph, config.generator);
        return;
      }
      case 'search': {
        const scenario = config.createScenario(size);
        this.arraySig.set(scenario.array);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'string': {
        const presetId = options.stringPresetId ?? this.stringPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'grid':
      case 'matrix':
      case 'dsu':
      case 'network':
      case 'geometry': {
        const scenario = config.createScenario(size);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'dp': {
        const presetId = options.dpPresetId ?? this.dpPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'tree': {
        const presetId = options.treePresetId ?? this.treePresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      default: {
        const array = this.createRandomArray(size, config.randomRange);
        this.arraySig.set(array);
        this.graphSig.set(null);
        this.loadScenario(array, config.generator);
      }
    }
  }

  private resetPlaybackState(): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.currentSnapshot.set(null);
    this.graphFocusTargetIdSig.set(null);
  }

  private loadScenario<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.resetPlaybackState();
    this.engine.load(generator(scenario), (step, index) => {
      this.currentSnapshot.set(step);
      this.appendLog(step, index);
    });
  }

  private appendLog(step: SortStep, index: number): void {
    if (index <= this.lastLoggedStep) {
      return;
    }

    this.lastLoggedStep = index;
    const entries = this.logEntriesSig();
    this.logEntriesSig.set([
      ...entries,
      {
        step: index,
        description: step.description,
        timestamp: Date.now() + entries.length,
      },
    ]);
  }

  private createRandomArray(size: number, range: RandomRange): readonly number[] {
    const span = range.max - range.min + 1;
    return Array.from({ length: size }, () => Math.floor(Math.random() * span) + range.min);
  }

  private resolvedGraphFocusTargetId(): string | null {
    const trace = this.graphTrace();
    if (!trace) return null;

    const selected = this.graphFocusTargetIdSig();
    if (selected && trace.nodes.some((node) => node.id === selected)) {
      return selected;
    }

    if (trace.currentNodeId) {
      return trace.currentNodeId;
    }

    const sourceId = trace.sourceId;
    const candidates = trace.nodes
      .filter((node) => node.id !== sourceId && node.distance !== null)
      .sort((left, right) => {
        const leftDistance = left.distance ?? Number.NEGATIVE_INFINITY;
        const rightDistance = right.distance ?? Number.NEGATIVE_INFINITY;
        if (leftDistance !== rightDistance) {
          return rightDistance - leftDistance;
        }

        return left.label.localeCompare(right.label);
      });

    return candidates[0]?.id ?? sourceId ?? null;
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }

  private translateMaybe(
    key: I18nKey | null,
    fallback: string,
    params?: Record<string, string | number>,
  ): string {
    return key ? this.translate(key, params) : fallback;
  }

  private translateFacet(facet: string): string {
    return this.translateMaybe(getAlgorithmFacetLabelKey(facet), humanizeLabel(facet));
  }
}
