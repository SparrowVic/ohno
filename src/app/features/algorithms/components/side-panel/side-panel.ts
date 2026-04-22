import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { AlgorithmItem } from '../../models/algorithm';
import { CodeLine, CodeRegion, CodeVariantMap, LogEntry } from '../../models/detail';
import { DpTraceState } from '../../models/dp';
import { DsuTraceState } from '../../models/dsu';
import {
  ClosestPairStepState,
  ConvexHullStepState,
  DelaunayTriangulationStepState,
  GeometryStepState,
  HalfPlaneIntersectionStepState,
  LineIntersectionStepState,
  MinkowskiSumStepState,
  SweepLineStepState,
  VoronoiDiagramStepState,
  isClosestPairState,
  isConvexHullState,
  isDelaunayTriangulationState,
  isHalfPlaneIntersectionState,
  isLineIntersectionState,
  isMinkowskiSumState,
  isSweepLineState,
  isVoronoiDiagramState,
} from '../../models/geometry';
import { GraphStepState } from '../../models/graph';
import { GridTraceState } from '../../models/grid';
import { MatrixTraceState } from '../../models/matrix';
import { NetworkTraceState } from '../../models/network';
import { SearchTraceState } from '../../models/search';
import { SortTraceState } from '../../models/sort-trace';
import { StringTraceState } from '../../models/string';
import { TreeTraversalTraceState } from '../../models/tree';
import { NumberLabTraceState } from '../../models/number-lab';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { SieveGridTraceState } from '../../models/sieve-grid';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { ClosestPairTracePanel } from '../closest-pair-trace-panel/closest-pair-trace-panel';
import { CodePanel } from '../code-panel/code-panel';
import { DelaunayTracePanel } from '../delaunay-trace-panel/delaunay-trace-panel';
import { DpTracePanel } from '../dp-trace-panel/dp-trace-panel';
import { DsuTracePanel } from '../dsu-trace-panel/dsu-trace-panel';
import { GeometryTracePanel } from '../geometry-trace-panel/geometry-trace-panel';
import { GraphTracePanel } from '../graph-trace-panel/graph-trace-panel';
import { GridTracePanel } from '../grid-trace-panel/grid-trace-panel';
import { HalfPlaneTracePanel } from '../half-plane-trace-panel/half-plane-trace-panel';
import { InfoPanel } from '../info-panel/info-panel';
import { LineIntersectionTracePanel } from '../line-intersection-trace-panel/line-intersection-trace-panel';
import { LogPanel } from '../log-panel/log-panel';
import { MatrixTracePanel } from '../matrix-trace-panel/matrix-trace-panel';
import { MinkowskiSumTracePanel } from '../minkowski-sum-trace-panel/minkowski-sum-trace-panel';
import { NetworkTracePanel } from '../network-trace-panel/network-trace-panel';
import { SearchTracePanel } from '../search-trace-panel/search-trace-panel';
import { SortTracePanel } from '../sort-trace-panel/sort-trace-panel';
import { StringTracePanel } from '../string-trace-panel/string-trace-panel';
import { SweepLineTracePanel } from '../sweep-line-trace-panel/sweep-line-trace-panel';
import { TreeTracePanel } from '../tree-trace-panel/tree-trace-panel';
import { NumberLabTracePanel } from '../number-lab-trace-panel/number-lab-trace-panel';
import { PointerLabTracePanel } from '../pointer-lab-trace-panel/pointer-lab-trace-panel';
import { SieveGridTracePanel } from '../sieve-grid-trace-panel/sieve-grid-trace-panel';
import { CallStackLabTracePanel } from '../call-stack-lab-trace-panel/call-stack-lab-trace-panel';
import { VoronoiTracePanel } from '../voronoi-trace-panel/voronoi-trace-panel';

type SideTabId = 'trace' | 'code' | 'info' | 'log';

interface SideTab {
  readonly id: SideTabId;
  readonly labelKey: I18nKey;
}

const BASE_SIDE_TAB_IDS: readonly SideTabId[] = ['code', 'info', 'log'];

const LS_KEY = 'ohno:side-panel-width';
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 260;
const MAX_WIDTH = 680;

@Component({
  selector: 'app-side-panel',
  imports: [
    ClosestPairTracePanel,
    CodePanel,
    DelaunayTracePanel,
    DpTracePanel,
    DsuTracePanel,
    GeometryTracePanel,
    GraphTracePanel,
    GridTracePanel,
    HalfPlaneTracePanel,
    InfoPanel,
    LineIntersectionTracePanel,
    LogPanel,
    MatrixTracePanel,
    MinkowskiSumTracePanel,
    NetworkTracePanel,
    SearchTracePanel,
    SortTracePanel,
    StringTracePanel,
    SweepLineTracePanel,
    TranslocoPipe,
    TreeTracePanel,
    NumberLabTracePanel,
    PointerLabTracePanel,
    SieveGridTracePanel,
    CallStackLabTracePanel,
    NgTemplateOutlet,
    VoronoiTracePanel,
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePanel implements OnInit, OnDestroy {
  protected readonly I18N_KEY = I18N_KEY;
  readonly algorithm = input.required<AlgorithmItem>();
  readonly codeLines = input.required<readonly CodeLine[]>();
  readonly codeRegions = input<readonly CodeRegion[]>([]);
  readonly codeVariants = input<CodeVariantMap>({});
  readonly activeLineNumber = input<number | null>(null);
  readonly logEntries = input.required<readonly LogEntry[]>();
  readonly traceState = input<GraphStepState | null>(null);
  readonly dpState = input<DpTraceState | null>(null);
  readonly dsuState = input<DsuTraceState | null>(null);
  readonly gridState = input<GridTraceState | null>(null);
  readonly matrixState = input<MatrixTraceState | null>(null);
  readonly networkState = input<NetworkTraceState | null>(null);
  readonly searchState = input<SearchTraceState | null>(null);
  readonly sortState = input<SortTraceState | null>(null);
  readonly stringState = input<StringTraceState | null>(null);
  readonly treeState = input<TreeTraversalTraceState | null>(null);
  readonly numberLabState = input<NumberLabTraceState | null>(null);
  readonly pointerLabState = input<PointerLabTraceState | null>(null);
  readonly sieveGridState = input<SieveGridTraceState | null>(null);
  readonly callStackLabState = input<CallStackLabTraceState | null>(null);
  readonly geometryState = input<GeometryStepState | null>(null);
  readonly graphFocusTargetLabel = input<string | null>(null);
  readonly graphFocusPathLabel = input<string | null>(null);
  readonly graphFocusModeLabel = input<string | null>(null);
  readonly graphFocusHint = input<string | null>(null);

  readonly tabs = computed<readonly SideTab[]>(() => {
    const ids =
      this.traceState() ||
      this.dpState() ||
      this.dsuState() ||
      this.gridState() ||
      this.matrixState() ||
      this.networkState() ||
      this.searchState() ||
      this.sortState() ||
      this.geometryState() ||
      this.stringState() ||
      this.treeState() ||
      this.numberLabState() ||
      this.pointerLabState() ||
      this.sieveGridState() ||
      this.callStackLabState()
        ? (['trace', ...BASE_SIDE_TAB_IDS] as const)
        : BASE_SIDE_TAB_IDS;

    return ids.map((id) => ({
      id,
      labelKey: this.getTabLabelKey(id),
    }));
  });
  readonly logEntryCount = computed(() => this.logEntries().length);
  readonly convexHullGeometryState = computed<ConvexHullStepState | null>(() => {
    const state = this.geometryState();
    return isConvexHullState(state) ? state : null;
  });
  readonly closestPairGeometryState = computed<ClosestPairStepState | null>(() => {
    const state = this.geometryState();
    return isClosestPairState(state) ? state : null;
  });
  readonly lineIntersectionGeometryState = computed<LineIntersectionStepState | null>(() => {
    const state = this.geometryState();
    return isLineIntersectionState(state) ? state : null;
  });
  readonly halfPlaneGeometryState = computed<HalfPlaneIntersectionStepState | null>(() => {
    const state = this.geometryState();
    return isHalfPlaneIntersectionState(state) ? state : null;
  });
  readonly minkowskiGeometryState = computed<MinkowskiSumStepState | null>(() => {
    const state = this.geometryState();
    return isMinkowskiSumState(state) ? state : null;
  });
  readonly sweepLineGeometryState = computed<SweepLineStepState | null>(() => {
    const state = this.geometryState();
    return isSweepLineState(state) ? state : null;
  });
  readonly voronoiGeometryState = computed<VoronoiDiagramStepState | null>(() => {
    const state = this.geometryState();
    return isVoronoiDiagramState(state) ? state : null;
  });
  readonly delaunayGeometryState = computed<DelaunayTriangulationStepState | null>(() => {
    const state = this.geometryState();
    return isDelaunayTriangulationState(state) ? state : null;
  });

  private readonly activeTabState = signal<SideTabId>('code');
  readonly activeTab = this.activeTabState.asReadonly();
  readonly activeTabIndex = computed(() => {
    const current = this.activeTab();
    const idx = this.tabs().findIndex((tab) => tab.id === current);
    return idx < 0 ? 0 : idx;
  });

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);

  private dragging = false;
  private dragStartX = 0;
  private dragStartWidth = 0;
  private readonly boundMove = (event: MouseEvent) => this.onMouseMove(event);
  private readonly boundUp = () => this.onMouseUp();

  constructor() {
    effect(() => {
      const hasTrace =
        this.traceState() !== null ||
        this.dpState() !== null ||
        this.dsuState() !== null ||
        this.gridState() !== null ||
        this.matrixState() !== null ||
        this.networkState() !== null ||
        this.searchState() !== null ||
        this.sortState() !== null ||
        this.stringState() !== null ||
        this.geometryState() !== null;

      if (!hasTrace && this.activeTabState() === 'trace') {
        this.activeTabState.set('code');
      }
    });
  }

  ngOnInit(): void {
    const saved = this.doc.defaultView?.localStorage.getItem(LS_KEY);
    const width = saved ? Number(saved) : DEFAULT_WIDTH;
    this.applyWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)));
  }

  ngOnDestroy(): void {
    this.doc.removeEventListener('mousemove', this.boundMove);
    this.doc.removeEventListener('mouseup', this.boundUp);
  }

  selectTab(id: SideTabId): void {
    this.activeTabState.set(id);
  }

  onHandleMousedown(event: MouseEvent): void {
    event.preventDefault();
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartWidth = this.hostEl.getBoundingClientRect().width;
    this.doc.body.style.userSelect = 'none';
    this.doc.body.style.cursor = 'col-resize';
    this.doc.addEventListener('mousemove', this.boundMove);
    this.doc.addEventListener('mouseup', this.boundUp);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    const delta = this.dragStartX - event.clientX;
    const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, this.dragStartWidth + delta));
    this.applyWidth(width);
  }

  private onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.doc.body.style.userSelect = '';
    this.doc.body.style.cursor = '';
    this.doc.removeEventListener('mousemove', this.boundMove);
    this.doc.removeEventListener('mouseup', this.boundUp);
    const width = Math.round(this.hostEl.getBoundingClientRect().width);
    this.doc.defaultView?.localStorage.setItem(LS_KEY, String(width));
  }

  private applyWidth(width: number): void {
    this.hostEl.style.width = `${width}px`;
  }

  private getTabLabelKey(id: SideTabId): I18nKey {
    switch (id) {
      case 'trace':
        return I18N_KEY.features.algorithms.sidePanel.tabs.trace;
      case 'code':
        return I18N_KEY.features.algorithms.sidePanel.tabs.code;
      case 'info':
        return I18N_KEY.features.algorithms.sidePanel.tabs.info;
      case 'log':
        return I18N_KEY.features.algorithms.sidePanel.tabs.log;
    }
  }
}
