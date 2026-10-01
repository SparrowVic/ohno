import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons';
import { map } from 'rxjs';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getAlgorithmFacetLabelKey } from '../../../core/i18n/catalog-labels';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY, I18nKey } from '../../../core/i18n/i18n-keys';
import { I18nTextParams, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  getVisualizationActionLabelKey,
  getVisualizationSizeUnitLabelKey,
  getVisualizationVariantLabelKey,
} from '../../../core/i18n/visualization-labels';
import { CommandPaletteService } from '../../../core/layout/command-palette/command-palette.service';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKey } from '../../../shared/instrument/key/key';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoScreen } from '../../../shared/instrument/screen/screen';
import {
  AlgorithmViewConfig,
  describeGraphPath,
  getAlgorithmViewConfig,
  humanizeLabel,
} from '../algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import { VisualizationCanvas } from '../components/visualization-canvas/visualization-canvas';
import { AlgorithmItem } from '../models/algorithm';
import { CodeVariantMap } from '../models/detail';
import { WeightedGraphData } from '../models/graph';
import { SortStep } from '../models/sort-step';
import { findTask, Task } from '../models/task';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine/visualization-engine';
import { deriveSortTrace } from '../utils/helpers/derive-sort-trace/derive-sort-trace';
import { InspectorTab, OhnoInspector } from './inspector/inspector';
import { LegendEntry, LegendHint, OhnoLegendRow } from './legend-row/legend-row';
import { OhnoLogPrinter } from './log-printer/log-printer';
import { EMPTY_TRACES, GraphFocusLabels, WorkbenchTraces } from './models/workbench-traces';
import { PlaybackController } from './playback-controller';
import { OhnoStageHead } from './stage-head/stage-head';
import { OhnoStageScreen } from './stage-screen/stage-screen';
import { OhnoTransportDeck } from './transport-deck/transport-deck';
import { TaskChoice } from './utils/deck.utils';
import { legendLabelKey, legendLedColor } from './utils/legend.utils';
import {
  configHasTasks,
  ConfigWithTasks,
  createRandomArray,
  presetOptionsOf,
  resolvePresetId,
  resolveTaskId,
} from './utils/scenario.utils';
import { markupSentence } from './utils/sentence-markup.utils';
import { FamilyReadoutLabels, familyStageReadout } from './utils/family-readout.utils';
import { FamilyTapeLabels, familyTapeOverrides } from './utils/family-tape.utils';
import { genericStageReadout, sortingStageReadout, StageReadout, StageReadoutLabels } from './utils/stage-readout.utils';
import { StepEventKind } from './utils/step-events.utils';
import { buildTapeRows, TapeFilter, TapeLabels } from './utils/tape-rows.utils';
import { resolveTranslatableText } from './utils/translate-text.utils';
import { keyTargetKind, resolveWorkbenchKey, WorkbenchKeyAction } from './utils/workbench-keys.utils';
import { OhnoWorkbenchTopbar } from './workbench-topbar/workbench-topbar';

type GraphFocusKind = 'shortest-path' | 'bfs-route' | 'dfs-branch';

const LIVE_THROTTLE_MS = 400;
const SPEED_STEP = 1;

const EVENT_KINDS: readonly StepEventKind[] = ['start', 'step', 'compare', 'swap', 'settle', 'pass', 'complete'];

@Component({
  selector: 'app-workbench',
  imports: [
    OhnoEngraving,
    OhnoInspector,
    OhnoKey,
    OhnoLegendRow,
    OhnoLogPrinter,
    OhnoPlate,
    OhnoScreen,
    OhnoStageHead,
    OhnoStageScreen,
    OhnoTransportDeck,
    OhnoWorkbenchTopbar,
    TranslocoPipe,
    VisualizationCanvas,
  ],
  templateUrl: './workbench.html',
  styleUrl: './workbench.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VisualizationEngine, PlaybackController],
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class Workbench {
  private readonly route = inject(ActivatedRoute);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly playback = inject(PlaybackController);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logPrinter = viewChild<OhnoLogPrinter, ElementRef<HTMLElement>>(OhnoLogPrinter, { read: ElementRef });

  private readonly idParam = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });
  private readonly sizeState = signal(16);
  private readonly variantState = signal<VisualizationVariant>('bar');
  private readonly presetIdState = signal<string | null>(null);
  private readonly taskIdState = signal<string | null>(null);
  private readonly customValuesState = signal<Record<string, unknown> | null>(null);
  private readonly arrayState = signal<readonly number[]>([]);
  private readonly graphState = signal<WeightedGraphData | null>(null);
  private readonly graphFocusTargetState = signal<string | null>(null);
  private readonly inspectorTabState = signal<InspectorTab>('code');
  private readonly logFilterState = signal<TapeFilter>('all');
  private readonly liveTextState = signal('');
  private liveTimer: ReturnType<typeof setTimeout> | null = null;
  private lastLiveAt = 0;

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { back: faChevronLeft };
  protected readonly moduleCount = this.registry.all().length;

  protected readonly algorithm = computed<AlgorithmItem | null>(() => {
    const id = this.idParam();
    return id ? (this.registry.getById(id) ?? null) : null;
  });
  protected readonly config = computed<AlgorithmViewConfig | null>(() => {
    const algorithm = this.algorithm();
    return algorithm?.implemented ? getAlgorithmViewConfig(algorithm.id) : null;
  });

  protected readonly size = this.sizeState.asReadonly();
  protected readonly variant = this.variantState.asReadonly();
  protected readonly presetId = this.presetIdState.asReadonly();
  protected readonly array = this.arrayState.asReadonly();
  protected readonly graph = this.graphState.asReadonly();
  protected readonly graphFocusTargetId = this.graphFocusTargetState.asReadonly();
  protected readonly inspectorTab = this.inspectorTabState.asReadonly();
  protected readonly logFilter = this.logFilterState.asReadonly();
  protected readonly liveText = this.liveTextState.asReadonly();

  protected readonly step = this.playback.step;
  protected readonly cursor = this.playback.cursor;
  protected readonly lastIndex = this.playback.lastIndex;
  protected readonly playing = this.playback.playing;
  protected readonly speed = this.playback.speed;
  protected readonly status = this.playback.status;
  protected readonly transportAction = this.playback.transportAction;

  protected readonly crumbs = computed(() => {
    const algorithm = this.algorithm();
    if (!algorithm) return [];
    return [
      this.translate(I18N_KEY.core.instrument.bank.algorithms),
      ...[algorithm.category, algorithm.subcategory].filter(Boolean).map((facet) => this.translateFacet(facet)),
    ];
  });
  protected readonly difficultyLabel = computed(() => {
    const algorithm = this.algorithm();
    return algorithm ? this.translate(getDifficultyLabelKey(algorithm.difficulty)) : '';
  });
  protected readonly views = computed(() =>
    (this.config()?.variantOptions ?? []).map((option) => ({
      ...option,
      label: this.translateMaybe(getVisualizationVariantLabelKey(option.label), option.label),
    })),
  );
  protected readonly sizeOptions = computed(() => this.config()?.sizeOptions ?? []);
  protected readonly sizeUnit = computed(() => {
    const unit = this.config()?.sizeUnit ?? 'elements';
    return this.translateMaybe(getVisualizationSizeUnitLabelKey(unit), unit);
  });
  protected readonly randomizeLabel = computed(() => {
    const label = this.config()?.randomizeLabel ?? 'Randomize';
    return this.translateMaybe(getVisualizationActionLabelKey(label), label);
  });
  protected readonly presetOptions = computed(() => presetOptionsOf(this.config()));

  private readonly taskList = computed<readonly Task<Record<string, unknown>>[]>(() => {
    const config = this.config();
    return configHasTasks(config) ? config.tasks : [];
  });
  protected readonly tasks = computed<readonly TaskChoice[]>(() =>
    this.taskList().map((task) => ({ id: task.id, label: this.translateText(task.name) })),
  );
  protected readonly taskId = this.taskIdState.asReadonly();
  private readonly activeTask = computed(() => {
    const id = this.taskIdState();
    return id ? findTask(this.taskList(), id) : null;
  });
  protected readonly customSchema = computed(() => this.activeTask()?.inputSchema ?? null);
  protected readonly customValues = computed<Record<string, unknown>>(
    () => this.customValuesState() ?? this.activeTask()?.defaultValues ?? {},
  );
  protected readonly customValidate = computed(() => this.activeTask()?.validate ?? null);
  protected readonly activeTaskName = computed<TranslatableText | null>(() => this.activeTask()?.name ?? null);
  protected readonly codeSnippetMissing = computed(() => {
    const task = this.activeTask();
    return task !== null && task.codeSnippetId === null;
  });

  private readonly readoutLabels = computed<StageReadoutLabels>(() => {
    const workbench = I18N_KEY.features.algorithms.workbench;
    const sortPhases = I18N_KEY.features.algorithms.tracePanels.sort.phases;
    return {
      meters: {
        passes: this.translate(workbench.meters.passes),
        comparisons: this.translate(workbench.meters.comparisons),
        swaps: this.translate(workbench.meters.swaps),
      },
      phases: {
        start: this.translate(workbench.phases.start),
        step: this.translate(workbench.phases.step),
        compare: this.translate(sortPhases.compare),
        swap: this.translate(sortPhases.swap),
        settle: this.translate(workbench.registers.settled),
        pass: this.translate(sortPhases.passComplete),
        complete: this.translate(workbench.phases.complete),
      },
      registers: {
        left: this.translate(workbench.registers.left),
        right: this.translate(workbench.registers.right),
        boundary: this.translate(workbench.registers.boundary),
        settled: this.translate(workbench.registers.settled),
      },
      gauge: this.translate(workbench.deck.gauge),
    };
  });
  private readonly familyLabels = computed<FamilyReadoutLabels>(() => {
    const display = I18N_KEY.features.algorithms.display;
    const workbench = I18N_KEY.features.algorithms.workbench;
    const translateGroup = <T extends string>(group: Readonly<Record<T, string>>): Readonly<Record<T, string>> =>
      Object.fromEntries(Object.entries(group).map(([id, key]) => [id, this.translate(key as string)])) as Readonly<Record<T, string>>;
    return {
      meters: translateGroup(display.meters),
      gauges: translateGroup(display.gauges),
      registers: translateGroup(display.registers),
      phases: {
        start: this.translate(workbench.phases.start),
        step: this.translate(workbench.phases.step),
        complete: this.translate(workbench.phases.complete),
      },
      translate: (text) => this.translateText(text),
    };
  });
  private readonly tapeLabels = computed<TapeLabels>(() => {
    const log = I18N_KEY.features.algorithms.workbench.log;
    const events = Object.fromEntries(
      EVENT_KINDS.map((kind) => [kind, this.translate(log.events[kind])]),
    ) as Record<StepEventKind, string>;
    return { events, passSeparator: (index) => this.translate(log.events.pass, { index }) };
  });
  private readonly isSorting = computed(() => this.config()?.kind === 'array');

  protected readonly readout = computed<StageReadout>(() => {
    const step = this.step();
    const labels = this.readoutLabels();
    if (step && this.isSorting()) {
      return sortingStageReadout(step, this.playback.events(), this.cursor(), labels);
    }
    const family =
      step &&
      familyStageReadout({
        step,
        index: this.cursor(),
        lastIndex: this.lastIndex(),
        variant: this.variantState(),
        labels: this.familyLabels(),
      });
    return family ?? genericStageReadout(this.cursor(), this.lastIndex(), labels);
  });
  protected readonly gauge = computed(() => this.readout().gauge);
  protected readonly gaugeLabel = computed(() => this.readout().gaugeLabel);
  protected readonly sentence = computed(() => {
    const step = this.step();
    return step ? this.translateText(step.description) : '';
  });
  protected readonly sentenceHtml = computed(() => markupSentence(this.sentence()));
  private readonly familyTapeLabels = computed<FamilyTapeLabels>(() => {
    const phases = I18N_KEY.features.algorithms.workbench.log.phases;
    return {
      pickNode: this.translate(phases.pickNode),
      inspectEdge: this.translate(phases.inspectEdge),
      relax: this.translate(phases.relax),
      skipRelax: this.translate(phases.skipRelax),
      settleNode: this.translate(phases.settleNode),
      complete: this.translate(phases.complete),
    };
  });
  private readonly tapeOverrides = computed(() =>
    this.isSorting() ? [] : familyTapeOverrides(this.playback.history(), this.familyTapeLabels()),
  );
  protected readonly tapeRows = computed(() =>
    buildTapeRows(
      this.playback.events(),
      this.playback.history(),
      this.cursor(),
      this.logFilterState(),
      this.tapeLabels(),
      (text) => this.translateText(text),
      this.tapeOverrides(),
    ),
  );

  protected readonly legendItems = computed<readonly LegendEntry[]>(() =>
    (this.config()?.legendItems(this.variantState()) ?? []).map((item) => {
      const key = legendLabelKey(item.label);
      return { label: key ? this.translate(key) : item.label, color: legendLedColor(item.color) };
    }),
  );
  protected readonly legendHints = computed<readonly LegendHint[]>(() => {
    const legend = I18N_KEY.features.algorithms.workbench.legend;
    return [
      { keys: ['[', ']'], label: this.translate(legend.hintTempo) },
      { keys: ['C'], label: this.translate(legend.hintCode) },
      { keys: ['L'], label: this.translate(legend.hintLog) },
    ];
  });

  protected readonly activeLineNumber = computed<number | null>(() =>
    this.cursor() === 0 ? null : (this.step()?.activeCodeLine ?? null),
  );
  protected readonly codeLines = computed(() => this.config()?.codeLines ?? []);
  protected readonly codeRegions = computed(() => this.config()?.codeRegions ?? []);
  protected readonly codeVariants = computed<CodeVariantMap>(() => {
    const config = this.config();
    if (!config) return {};
    if (config.codeVariants) return config.codeVariants;
    return {
      typescript: {
        language: 'typescript',
        lines: config.codeLines,
        regions: config.codeRegions ?? [],
        highlightMap: config.codeHighlightMap,
        source: config.codeLines.map((line) => line.tokens.map((token) => token.text).join('')).join('\n'),
      },
    };
  });

  private readonly graphFocusKind = computed<GraphFocusKind | null>(() => {
    if (!this.step()?.graph) return null;
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
  private readonly graphFocus = computed<GraphFocusLabels | null>(() => {
    const trace = this.step()?.graph;
    const kind = this.graphFocusKind();
    if (!trace || !kind) return null;
    const focus = I18N_KEY.features.algorithms.detail.graphFocus;
    const labelKey = kind === 'shortest-path' ? focus.shortestPathLabel : kind === 'bfs-route' ? focus.bfsRouteLabel : focus.dfsBranchLabel;
    const hintKey = kind === 'shortest-path' ? focus.shortestPathHint : kind === 'bfs-route' ? focus.bfsRouteHint : focus.dfsBranchHint;
    const targetId = this.resolvedGraphFocusTargetId();
    return {
      modeLabel: this.translate(labelKey),
      hint: this.translate(hintKey),
      targetLabel: targetId ? (trace.nodes.find((node) => node.id === targetId)?.label ?? null) : null,
      pathLabel: targetId ? describeGraphPath(trace, targetId) : null,
    };
  });
  protected readonly traces = computed<WorkbenchTraces>(() => {
    const step = this.step();
    if (!step) return EMPTY_TRACES;
    return {
      graph: step.graph ?? null,
      dp: step.dp ?? null,
      dsu: step.dsu ?? null,
      grid: step.grid ?? null,
      matrix: step.matrix ?? null,
      matrixGrid: step.matrixGrid ?? null,
      network: step.network ?? null,
      search: step.search ?? null,
      sort: this.isSorting() ? deriveSortTrace(step) : null,
      string: step.string ?? null,
      tree: step.tree ?? null,
      numberLab: step.numberLab ?? null,
      pointerLab: step.pointerLab ?? null,
      sieveGrid: step.sieveGrid ?? null,
      callStackLab: step.callStackLab ?? null,
      callTreeLab: step.callTreeLab ?? null,
      scratchpadLab: step.scratchpadLab ?? null,
      geometry: step.geometry ?? null,
      graphFocus: this.graphFocus(),
    };
  });

  constructor() {
    effect(() => {
      const config = this.config();
      const algorithm = this.algorithm();
      untracked(() => this.initialise(algorithm, config));
    });
    effect(() => {
      const sentence = this.sentence();
      untracked(() => this.announce(sentence));
    });
    this.destroyRef.onDestroy(() => this.clearLiveTimer());
  }

  protected onViewChange(value: VisualizationVariant): void {
    const config = this.config();
    if (!config || value === this.variantState()) return;
    if (!config.variantOptions.some((option) => option.value === value)) return;
    this.variantState.set(value);
    this.graphFocusTargetState.set(null);
    this.playback.reset();
  }

  protected onSizeChange(value: number): void {
    const config = this.config();
    if (config) this.rebuild(config, value);
  }

  protected onRandomize(): void {
    const config = this.config();
    if (config) this.rebuild(config, this.sizeState());
  }

  protected onTaskChange(taskId: string): void {
    const config = this.config();
    if (!configHasTasks(config) || taskId === this.taskIdState()) return;
    if (!config.tasks.some((task) => task.id === taskId)) return;
    this.taskIdState.set(taskId);
    this.customValuesState.set(null);
    this.rebuild(config, this.sizeState());
  }

  protected onCustomValuesChange(values: Record<string, unknown>): void {
    const config = this.config();
    if (!configHasTasks(config) || this.taskIdState() === null) return;
    this.customValuesState.set(values);
    this.rebuild(config, this.sizeState());
  }

  protected onPresetChange(value: string): void {
    const config = this.config();
    if (!config || value === this.presetIdState()) return;
    if (!presetOptionsOf(config).some((option) => option.id === value)) return;
    this.presetIdState.set(value);
    this.rebuild(config, this.sizeState());
  }

  protected onGraphFocusTargetChange(value: string | null): void {
    this.graphFocusTargetState.set(value);
  }

  protected onToggle(): void {
    this.playback.toggle();
  }

  protected onReset(): void {
    this.graphFocusTargetState.set(null);
    this.playback.reset();
  }

  protected onStepBack(): void {
    this.playback.stepBack();
  }

  protected onStepForward(): void {
    this.playback.stepForward();
  }

  protected onSeek(index: number): void {
    this.playback.seek(index);
  }

  protected onSpeedChange(value: number): void {
    this.playback.setSpeed(value);
  }

  protected onInspectorTab(tab: InspectorTab): void {
    this.inspectorTabState.set(tab);
  }

  protected onLogFilter(filter: TapeFilter): void {
    this.logFilterState.set(filter);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const action = resolveWorkbenchKey({
      key: event.key,
      modifier: event.ctrlKey || event.metaKey || event.altKey,
      target: keyTargetKind(event.target),
      paletteOpen: this.palette.open(),
    });
    if (!action || !this.config()) return;
    event.preventDefault();
    this.runKeyAction(action);
  }

  private runKeyAction(action: WorkbenchKeyAction): void {
    switch (action) {
      case 'toggle':
        this.onToggle();
        return;
      case 'stepBack':
        this.onStepBack();
        return;
      case 'stepForward':
        this.onStepForward();
        return;
      case 'reset':
        this.onReset();
        return;
      case 'tempoDown':
        this.playback.setSpeed(this.speed() - SPEED_STEP);
        return;
      case 'tempoUp':
        this.playback.setSpeed(this.speed() + SPEED_STEP);
        return;
      case 'tabCode':
        this.inspectorTabState.set('code');
        return;
      case 'tabInfo':
        this.inspectorTabState.set('info');
        return;
      case 'tabTrace':
        this.inspectorTabState.set('trace');
        return;
      case 'focusLog':
        this.logPrinter()?.nativeElement.focus();
        return;
    }
  }

  private initialise(algorithm: AlgorithmItem | null, config: AlgorithmViewConfig | null): void {
    this.graphFocusTargetState.set(null);
    this.customValuesState.set(null);
    this.logFilterState.set('all');
    if (!algorithm?.implemented || !config) {
      this.playback.unload();
      this.arrayState.set([]);
      this.graphState.set(null);
      this.presetIdState.set(null);
      this.taskIdState.set(null);
      return;
    }
    this.variantState.set(config.defaultVariant);
    this.presetIdState.set(resolvePresetId(config, null));
    this.taskIdState.set(configHasTasks(config) ? resolveTaskId(config, null) : null);
    this.rebuild(config, config.defaultSize);
  }

  private rebuild(config: AlgorithmViewConfig, size: number): void {
    const algorithm = this.algorithm();
    if (!algorithm) return;
    this.sizeState.set(size);
    this.graphFocusTargetState.set(null);

    if (configHasTasks(config)) {
      this.rebuildFromTask(config, size, algorithm.id);
      return;
    }

    switch (config.kind) {
      case 'graph': {
        const graph = config.createGraph(size);
        this.arrayState.set([]);
        this.graphState.set(graph);
        this.load(algorithm.id, config.generator(graph));
        return;
      }
      case 'search': {
        const scenario = config.createScenario(size);
        this.arrayState.set(scenario.array);
        this.graphState.set(null);
        this.load(algorithm.id, config.generator(scenario));
        return;
      }
      case 'grid':
      case 'matrix':
      case 'dsu':
      case 'network':
      case 'geometry': {
        this.arrayState.set([]);
        this.graphState.set(null);
        this.load(algorithm.id, config.generator(config.createScenario(size) as never));
        return;
      }
      case 'string':
      case 'dp':
      case 'tree':
      case 'number-lab':
      case 'pointer-lab':
      case 'sieve-grid':
      case 'call-stack-lab':
      case 'call-tree-lab': {
        const presetId = resolvePresetId(config, this.presetIdState()) ?? config.defaultPresetId;
        this.presetIdState.set(presetId);
        this.arrayState.set([]);
        this.graphState.set(null);
        this.load(algorithm.id, config.generator(config.createScenario(size, presetId) as never));
        return;
      }
      case 'array': {
        const array = createRandomArray(size, config.randomRange);
        this.arrayState.set(array);
        this.graphState.set(null);
        this.load(algorithm.id, config.generator(array));
        return;
      }
    }
  }

  private rebuildFromTask(config: ConfigWithTasks, size: number, algorithmId: string): void {
    const taskId = resolveTaskId(config, this.taskIdState());
    const task = taskId ? findTask(config.tasks, taskId) : null;
    const values = this.customValuesState() ?? task?.defaultValues;
    const presetId = taskId ?? (config as { defaultPresetId?: string }).defaultPresetId ?? '';
    const scenario = config.createScenario(size, presetId, values);
    this.arrayState.set([]);
    this.graphState.set(null);
    this.load(algorithmId, (config.generator as (scenario: unknown) => Generator<SortStep>)(scenario));
  }

  private load(algorithmId: string, generator: Generator<SortStep>): void {
    this.playback.load(algorithmId, generator);
  }

  private announce(text: string): void {
    if (!this.playing()) {
      this.clearLiveTimer();
      this.liveTextState.set(text);
      this.lastLiveAt = Date.now();
      return;
    }
    const wait = LIVE_THROTTLE_MS - (Date.now() - this.lastLiveAt);
    if (wait <= 0) {
      this.clearLiveTimer();
      this.liveTextState.set(text);
      this.lastLiveAt = Date.now();
      return;
    }
    this.clearLiveTimer();
    this.liveTimer = setTimeout(() => {
      this.liveTextState.set(text);
      this.lastLiveAt = Date.now();
      this.liveTimer = null;
    }, wait);
  }

  private clearLiveTimer(): void {
    if (this.liveTimer !== null) clearTimeout(this.liveTimer);
    this.liveTimer = null;
  }

  private resolvedGraphFocusTargetId(): string | null {
    const trace = this.step()?.graph;
    if (!trace) return null;

    const selected = this.graphFocusTargetState();
    if (selected && trace.nodes.some((node) => node.id === selected)) return selected;
    if (trace.currentNodeId) return trace.currentNodeId;

    const sourceId = trace.sourceId;
    const candidates = trace.nodes
      .filter((node) => node.id !== sourceId && node.distance !== null)
      .sort((left, right) => {
        const leftDistance = left.distance ?? Number.NEGATIVE_INFINITY;
        const rightDistance = right.distance ?? Number.NEGATIVE_INFINITY;
        if (leftDistance !== rightDistance) return rightDistance - leftDistance;
        return left.label.localeCompare(right.label);
      });

    return candidates[0]?.id ?? sourceId ?? null;
  }

  private translate(key: I18nKey | string, params?: I18nTextParams): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }

  private translateMaybe(key: I18nKey | null, fallback: string): string {
    return key ? this.translate(key) : fallback;
  }

  private translateText(text: TranslatableText): string {
    return resolveTranslatableText(text, (key, params) => this.translate(key, params));
  }

  private translateFacet(facet: string): string {
    return this.translateMaybe(getAlgorithmFacetLabelKey(facet), humanizeLabel(facet));
  }
}
