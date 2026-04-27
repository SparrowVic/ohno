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
import { faArrowLeftLong } from '@fortawesome/pro-solid-svg-icons';

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
import { AppButton } from '../../../shared/components/button/button';
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
import { deriveSortTrace } from '../utils/helpers/derive-sort-trace/derive-sort-trace';
import { SortStep } from '../models/sort-step';
import { StringPresetOption, StringTraceState } from '../models/string';
import { TreePresetOption, TreeTraversalTraceState } from '../models/tree';
import { NumberLabTraceState } from '../models/number-lab';
import { PointerLabTraceState } from '../models/pointer-lab';
import { SieveGridTraceState } from '../models/sieve-grid';
import { CallStackLabTraceState } from '../models/call-stack-lab';
import { CallTreeLabTraceState } from '../models/call-tree-lab';
import { ScratchpadLabTraceState } from '../models/scratchpad-lab';
import { Task, findTask } from '../models/task';
import { NumberLabPresetOption } from '../utils/scenarios/number-lab/number-lab-scenarios';
import { PointerLabPresetOption } from '../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { SieveGridPresetOption } from '../utils/scenarios/sieve-grid/sieve-grid-scenarios';
import { CallStackLabPresetOption } from '../utils/scenarios/call-stack-lab/call-stack-lab-scenarios';
import { CallTreeLabPresetOption } from '../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine/visualization-engine';

/** Family-agnostic predicate — true whenever the algorithm's config has
 *  migrated to the unified task model (non-empty `tasks` array). Lets
 *  the toolbar / dispatcher share one code path across number-lab,
 *  sieve-grid, pointer-lab, tree, dp, string, call-stack-lab,
 *  call-tree-lab without a giant switch. */
type ConfigWithTasks = AlgorithmViewConfig & {
  readonly tasks: readonly Task<Record<string, unknown>>[];
  readonly defaultTaskId?: string;
  readonly createScenario: (
    size: number,
    presetId: string,
    customValues?: Record<string, unknown>,
  ) => unknown;
};

function configHasTasks(config: AlgorithmViewConfig | null | undefined): config is ConfigWithTasks {
  if (!config) return false;
  const tasks = (config as { tasks?: readonly Task<unknown>[] }).tasks;
  return Array.isArray(tasks) && tasks.length > 0;
}

interface RebuildOptions {
  readonly dpPresetId?: string | null;
  readonly stringPresetId?: string | null;
  readonly treePresetId?: string | null;
  readonly numberLabPresetId?: string | null;
  readonly pointerLabPresetId?: string | null;
  readonly sieveGridPresetId?: string | null;
  readonly callStackLabPresetId?: string | null;
  readonly callTreeLabPresetId?: string | null;
  /** New unified task model — when the config exposes `tasks`, we use
   *  the task's id + values instead of the legacy preset-id to resolve
   *  the scenario. */
  readonly taskId?: string | null;
  readonly customValues?: unknown;
}

@Component({
  selector: 'app-algorithm-detail',
  imports: [
    AppButton,
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
  protected readonly icons = {
    browse: faArrowLeftLong,
  };
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
  private readonly numberLabPresetSig = signal<string | null>(null);
  private readonly pointerLabPresetSig = signal<string | null>(null);
  private readonly sieveGridPresetSig = signal<string | null>(null);
  private readonly callStackLabPresetSig = signal<string | null>(null);
  private readonly callTreeLabPresetSig = signal<string | null>(null);
  /** Active task identifier under the new unified task-picker model.
   *  Parallel to the legacy preset signals during migration. When the
   *  current algorithm has `tasks` defined, this is the source of
   *  truth; legacy preset signals fall silent. */
  private readonly activeTaskIdSig = signal<string | null>(null);
  /** User-provided values overriding the active task's defaults. Null
   *  means "use the task's defaultValues". Cleared whenever the
   *  active task changes. Type-erased here — the config's `tasks`
   *  entries carry the specific TValues shape. */
  private readonly customValuesSig = signal<unknown | null>(null);
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
  readonly numberLabPresetId = this.numberLabPresetSig.asReadonly();
  readonly pointerLabPresetId = this.pointerLabPresetSig.asReadonly();
  readonly sieveGridPresetId = this.sieveGridPresetSig.asReadonly();
  readonly callStackLabPresetId = this.callStackLabPresetSig.asReadonly();
  readonly callTreeLabPresetId = this.callTreeLabPresetSig.asReadonly();
  readonly activeTaskId = this.activeTaskIdSig.asReadonly();
  readonly customValues = this.customValuesSig.asReadonly();
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
    if (configHasTasks(config) && config.kind === 'tree') return [];
    return config?.kind === 'tree' ? config.presetOptions : [];
  });
  readonly numberLabPresetOptions = computed<readonly NumberLabPresetOption[]>(() => {
    const config = this.config();
    // Suppress the legacy per-viz preset picker when the algorithm has
    // migrated to the new toolbar-level task picker. Returning an empty
    // array hides the chip row inside the viz-header (its template
    // gates on `options().length > 0`).
    if (configHasTasks(config) && config.kind === 'number-lab') return [];
    return config?.kind === 'number-lab' ? config.presetOptions : [];
  });

  /** Unified task options for the toolbar picker. Null when the current
   *  algorithm hasn't migrated. `configHasTasks` is a family-agnostic
   *  type guard — any config kind that exposes a non-empty `tasks`
   *  array wires into the same toolbar UX. All realistic task shapes
   *  are record-like, so we widen to `Record<string, unknown>` rather
   *  than leaking `unknown` to downstream consumers. */
  readonly tasks = computed<readonly Task<Record<string, unknown>>[] | null>(() => {
    const config = this.config();
    if (!configHasTasks(config)) return null;
    return config.tasks as readonly Task<Record<string, unknown>>[];
  });
  readonly activeTask = computed<Task<Record<string, unknown>> | null>(() => {
    const list = this.tasks();
    const id = this.activeTaskIdSig();
    if (!list || !id) return null;
    return findTask(list, id);
  });

  /** Active task's localized name, passed to the side-panel so the
   *  Code tab can render a "Code for task: X" eyebrow. Null when the
   *  algorithm hasn't migrated to the task model. */
  readonly activeTaskNameForSidePanel = computed(() => this.activeTask()?.name ?? null);

  /** True when the active task explicitly opts out of a code snippet
   *  (`codeSnippetId: null`). The side-panel Code tab swaps in an
   *  editorial placeholder instead of the shiki-rendered variants. */
  readonly activeTaskCodeSnippetMissing = computed(() => {
    const task = this.activeTask();
    return task !== null && task.codeSnippetId === null;
  });

  /** Resolved values feeding the customize popover: user-provided
   *  custom overrides if set, otherwise the active task's defaults. */
  readonly currentTaskValues = computed<Record<string, unknown> | null>(() => {
    const custom = this.customValuesSig();
    if (custom !== null) return custom as Record<string, unknown>;
    const task = this.activeTask();
    return task ? (task.defaultValues as Record<string, unknown>) : null;
  });
  readonly pointerLabPresetOptions = computed<readonly PointerLabPresetOption[]>(() => {
    const config = this.config();
    if (configHasTasks(config) && config.kind === 'pointer-lab') return [];
    return config?.kind === 'pointer-lab' ? config.presetOptions : [];
  });
  readonly sieveGridPresetOptions = computed<readonly SieveGridPresetOption[]>(() => {
    const config = this.config();
    if (configHasTasks(config) && config.kind === 'sieve-grid') return [];
    return config?.kind === 'sieve-grid' ? config.presetOptions : [];
  });
  readonly callStackLabPresetOptions = computed<readonly CallStackLabPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'call-stack-lab' ? config.presetOptions : [];
  });
  readonly callTreeLabPresetOptions = computed<readonly CallTreeLabPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'call-tree-lab' ? config.presetOptions : [];
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
  readonly numberLabTrace = computed<NumberLabTraceState | null>(
    () => this.currentSnapshot()?.numberLab ?? null,
  );
  readonly sieveGridTrace = computed<SieveGridTraceState | null>(
    () => this.currentSnapshot()?.sieveGrid ?? null,
  );
  readonly callStackLabTrace = computed<CallStackLabTraceState | null>(
    () => this.currentSnapshot()?.callStackLab ?? null,
  );
  readonly callTreeLabTrace = computed<CallTreeLabTraceState | null>(
    () => this.currentSnapshot()?.callTreeLab ?? null,
  );
  readonly scratchpadLabTrace = computed<ScratchpadLabTraceState | null>(
    () => this.currentSnapshot()?.scratchpadLab ?? null,
  );
  readonly pointerLabTrace = computed<PointerLabTraceState | null>(
    () => this.currentSnapshot()?.pointerLab ?? null,
  );
  readonly geometryTrace = computed<GeometryStepState | null>(
    () => this.currentSnapshot()?.geometry ?? null,
  );

  readonly graphFocusKind = computed<'shortest-path' | 'bfs-route' | 'dfs-branch' | null>(() => {
    if (!this.graphTrace()) return null;

    switch (this.algorithm()?.id) {
      case 'dijkstra':
      case 'bellman-ford':
        return 'shortest-path';
      case 'bfs':
        return 'bfs-route';
      case 'dfs':
        return 'dfs-branch';
      default:
        return null;
    }
  });
  readonly graphRouteModeLabel = computed(() => {
    switch (this.graphFocusKind()) {
      case 'shortest-path':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.shortestPathLabel);
      case 'bfs-route':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.bfsRouteLabel);
      case 'dfs-branch':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.dfsBranchLabel);
      default:
        return null;
    }
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
    switch (this.graphFocusKind()) {
      case 'shortest-path':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.shortestPathHint);
      case 'bfs-route':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.bfsRouteHint);
      case 'dfs-branch':
        return this.translate(I18N_KEY.features.algorithms.detail.graphFocus.dfsBranchHint);
      default:
        return null;
    }
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
        this.numberLabPresetSig.set(config.kind === 'number-lab' ? config.defaultPresetId : null);
        this.pointerLabPresetSig.set(config.kind === 'pointer-lab' ? config.defaultPresetId : null);
        this.sieveGridPresetSig.set(config.kind === 'sieve-grid' ? config.defaultPresetId : null);
        this.callStackLabPresetSig.set(
          config.kind === 'call-stack-lab' ? config.defaultPresetId : null,
        );
        this.callTreeLabPresetSig.set(
          config.kind === 'call-tree-lab' ? config.defaultPresetId : null,
        );
        const taskSeedId = configHasTasks(config)
          ? (config.defaultTaskId ?? config.tasks[0]?.id ?? null)
          : null;
        this.activeTaskIdSig.set(taskSeedId);
        this.customValuesSig.set(null);

        this.rebuildVisualization(config, config.defaultSize, {
          dpPresetId: config.kind === 'dp' ? config.defaultPresetId : null,
          stringPresetId: config.kind === 'string' ? config.defaultPresetId : null,
          treePresetId: config.kind === 'tree' ? config.defaultPresetId : null,
          numberLabPresetId: config.kind === 'number-lab' ? config.defaultPresetId : null,
          pointerLabPresetId: config.kind === 'pointer-lab' ? config.defaultPresetId : null,
          sieveGridPresetId: config.kind === 'sieve-grid' ? config.defaultPresetId : null,
          callStackLabPresetId: config.kind === 'call-stack-lab' ? config.defaultPresetId : null,
          callTreeLabPresetId: config.kind === 'call-tree-lab' ? config.defaultPresetId : null,
          taskId: taskSeedId,
          customValues: null,
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

  onNumberLabPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'number-lab') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.numberLabPresetSig()
    )
      return;

    this.numberLabPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { numberLabPresetId: value });
  }

  /** Toolbar-level task picker changed. Works across any config kind
   *  that has migrated to the task model — number-lab, sieve-grid,
   *  pointer-lab, tree, etc. Clears custom values since they were
   *  scoped to the previous task. */
  onTaskChange(taskId: string): void {
    const config = this.config();
    if (!configHasTasks(config)) return;
    if (!config.tasks.some((task) => task.id === taskId)) return;
    if (taskId === this.activeTaskIdSig()) return;

    this.activeTaskIdSig.set(taskId);
    this.customValuesSig.set(null);
    this.rebuildVisualization(config, this.sizeSig(), { taskId, customValues: null });
  }

  /** Customize-values popover applied new values for the currently
   *  active task. Triggers a rerun with the overrides in place. */
  onCustomValuesChange(values: unknown): void {
    const config = this.config();
    if (!configHasTasks(config)) return;
    const taskId = this.activeTaskIdSig();
    if (!taskId) return;

    this.customValuesSig.set(values);
    this.rebuildVisualization(config, this.sizeSig(), { taskId, customValues: values });
  }

  onPointerLabPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'pointer-lab') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.pointerLabPresetSig()
    )
      return;

    this.pointerLabPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { pointerLabPresetId: value });
  }

  onSieveGridPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'sieve-grid') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.sieveGridPresetSig()
    )
      return;

    this.sieveGridPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { sieveGridPresetId: value });
  }

  onCallStackLabPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'call-stack-lab') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.callStackLabPresetSig()
    )
      return;

    this.callStackLabPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { callStackLabPresetId: value });
  }

  onCallTreeLabPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'call-tree-lab') return;
    if (
      !config.presetOptions.some((option) => option.id === value) ||
      value === this.callTreeLabPresetSig()
    )
      return;

    this.callTreeLabPresetSig.set(value);
    this.rebuildVisualization(config, this.sizeSig(), { callTreeLabPresetId: value });
  }

  private resetUnavailableState(): void {
    this.resetPlaybackState();
    this.graphSig.set(null);
    this.dpPresetSig.set(null);
    this.stringPresetSig.set(null);
    this.treePresetSig.set(null);
    this.numberLabPresetSig.set(null);
    this.pointerLabPresetSig.set(null);
    this.sieveGridPresetSig.set(null);
    this.callStackLabPresetSig.set(null);
    this.callTreeLabPresetSig.set(null);
    this.activeTaskIdSig.set(null);
    this.customValuesSig.set(null);
    this.engine.reset();
  }

  /** Shared task-path builder — used by every config kind that has a
   *  `tasks` array. The per-family `createScenario` handles producing
   *  the right scenario shape; this helper just resolves the task id +
   *  effective values and feeds them in. */
  private rebuildFromTask(config: ConfigWithTasks, size: number, options: RebuildOptions): void {
    const taskId =
      options.taskId ??
      this.activeTaskIdSig() ??
      config.defaultTaskId ??
      config.tasks[0]?.id ??
      null;
    const task = taskId ? findTask(config.tasks, taskId) : null;
    const customValues =
      options.customValues !== undefined ? options.customValues : this.customValuesSig();
    const effectiveValues = (customValues ?? task?.defaultValues ?? undefined) as
      | Record<string, unknown>
      | undefined;
    // For migrated algorithms task.id doubles as the preset id so
    // scenario-factory metadata stays consistent with the legacy
    // flow. Fallback to the first task id if nothing else is set.
    const resolvedPresetId =
      taskId ??
      (config as { defaultPresetId?: string }).defaultPresetId ??
      config.tasks[0]?.id ??
      '';
    const scenario = config.createScenario(size, resolvedPresetId, effectiveValues);
    this.arraySig.set([]);
    this.graphSig.set(null);
    this.loadScenario(scenario, config.generator as (scenario: unknown) => Generator<SortStep>);
  }

  private rebuildVisualization(
    config: AlgorithmViewConfig,
    size: number,
    options: RebuildOptions = {},
  ): void {
    this.sizeSig.set(size);
    this.graphFocusTargetIdSig.set(null);

    // Unified task path — if the algorithm's config has migrated to the
    // task model, resolve scenario from task.defaultValues (or user
    // custom overrides) and skip the legacy preset-id dispatch below.
    // Works across number-lab, sieve-grid, pointer-lab, tree, etc.
    if (configHasTasks(config)) {
      this.rebuildFromTask(config, size, options);
      return;
    }

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
      case 'number-lab': {
        // Legacy preset-only path — only reached when config hasn't
        // migrated to the task model (the task path is taken earlier).
        const presetId =
          options.numberLabPresetId ?? this.numberLabPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'pointer-lab': {
        const presetId =
          options.pointerLabPresetId ?? this.pointerLabPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'sieve-grid': {
        const presetId =
          options.sieveGridPresetId ?? this.sieveGridPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'call-stack-lab': {
        const presetId =
          options.callStackLabPresetId ?? this.callStackLabPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'call-tree-lab': {
        const presetId =
          options.callTreeLabPresetId ?? this.callTreeLabPresetSig() ?? config.defaultPresetId;
        const scenario = config.createScenario(size, presetId);
        this.arraySig.set([]);
        this.graphSig.set(null);
        this.loadScenario(scenario, config.generator);
        return;
      }
      case 'array': {
        const array = this.createRandomArray(size, config.randomRange);
        this.arraySig.set(array);
        this.graphSig.set(null);
        this.loadScenario(array, config.generator);
        return;
      }
      default: {
        this.arraySig.set([]);
        this.graphSig.set(null);
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
