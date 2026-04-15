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
  output,
  signal,
} from '@angular/core';

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
import { StringTraceState } from '../../models/string';
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
import { StringTracePanel } from '../string-trace-panel/string-trace-panel';
import { SweepLineTracePanel } from '../sweep-line-trace-panel/sweep-line-trace-panel';
import { VoronoiTracePanel } from '../voronoi-trace-panel/voronoi-trace-panel';

type SideTabId = 'trace' | 'code' | 'info' | 'log';
export type SideTabLayout = 'vertical' | 'horizontal';

interface SideTab {
  readonly id: SideTabId;
  readonly label: string;
  readonly description: string;
}

const BASE_SIDE_TABS: readonly SideTab[] = [
  { id: 'code', label: 'Code', description: 'Reference implementation with live line focus.' },
  { id: 'info', label: 'Info', description: 'Complexity, tags and problem profile.' },
  { id: 'log', label: 'Log', description: 'Chronological run feed for the current scenario.' },
];

const TRACE_TAB: SideTab = {
  id: 'trace',
  label: 'Trace',
  description: 'Current state, invariants and why this step matters.',
};

const LS_KEY = 'ohno:side-panel-width';
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 260;
const MAX_WIDTH = 680;

function humanizeKey(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

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
    StringTracePanel,
    SweepLineTracePanel,
    NgTemplateOutlet,
    VoronoiTracePanel,
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePanel implements OnInit, OnDestroy {
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
  readonly stringState = input<StringTraceState | null>(null);
  readonly geometryState = input<GeometryStepState | null>(null);
  readonly graphFocusTargetLabel = input<string | null>(null);
  readonly graphFocusPathLabel = input<string | null>(null);
  readonly graphFocusModeLabel = input<string | null>(null);
  readonly graphFocusHint = input<string | null>(null);
  readonly tabLayout = input<SideTabLayout>('vertical');

  readonly tabLayoutChange = output<SideTabLayout>();
  readonly collapseToggle = output<void>();

  readonly tabs = computed<readonly SideTab[]>(() =>
    this.traceState() ||
    this.dpState() ||
    this.dsuState() ||
    this.gridState() ||
    this.matrixState() ||
    this.networkState() ||
    this.searchState() ||
    this.geometryState() ||
    this.stringState()
      ? [TRACE_TAB, ...BASE_SIDE_TABS]
      : BASE_SIDE_TABS,
  );
  readonly activeTabMeta = computed<SideTab>(
    () => this.tabs().find((tab) => tab.id === this.activeTab()) ?? BASE_SIDE_TABS[0]!,
  );
  readonly categoryChip = computed(() => humanizeKey(this.algorithm().category));
  readonly subcategoryChip = computed(() => humanizeKey(this.algorithm().subcategory));
  readonly runLogCount = computed(
    () => `${this.logEntries().length} log item${this.logEntries().length === 1 ? '' : 's'}`,
  );
  readonly isVerticalLayout = computed(() => this.tabLayout() === 'vertical');
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
  private readonly expandedAccordionState = signal<readonly SideTabId[]>(['code']);
  readonly activeTab = this.activeTabState.asReadonly();

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
        this.stringState() !== null ||
        this.geometryState() !== null;

      if (!hasTrace && this.activeTabState() === 'trace') {
        this.activeTabState.set('code');
      }
    });

    effect(() => {
      const availableTabs = new Set(this.tabs().map((tab) => tab.id));
      const currentExpanded = this.expandedAccordionState();
      const nextExpanded = currentExpanded.filter((id) => availableTabs.has(id));
      const fallback = availableTabs.has(this.activeTabState())
        ? this.activeTabState()
        : this.tabs()[0]?.id;

      if (nextExpanded.length === 0 && fallback) {
        nextExpanded.push(fallback);
      }

      if (
        nextExpanded.length !== currentExpanded.length ||
        nextExpanded.some((id, index) => id !== currentExpanded[index])
      ) {
        this.expandedAccordionState.set(nextExpanded);
      }
    });

    effect(() => {
      if (!this.isVerticalLayout()) {
        return;
      }

      this.ensureAccordionSectionOpen(this.activeTabState());
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

    if (this.isVerticalLayout()) {
      this.ensureAccordionSectionOpen(id);
    }
  }

  toggleTabLayout(): void {
    this.tabLayoutChange.emit(this.isVerticalLayout() ? 'horizontal' : 'vertical');
  }

  toggleAccordionSection(id: SideTabId): void {
    this.activeTabState.set(id);

    const expanded = this.expandedAccordionState();

    if (expanded.includes(id)) {
      if (expanded.length === 1) {
        return;
      }

      this.expandedAccordionState.set(expanded.filter((entry) => entry !== id));
      return;
    }

    this.expandedAccordionState.set([...expanded, id]);
  }

  isAccordionSectionExpanded(id: SideTabId): boolean {
    return this.expandedAccordionState().includes(id);
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

  private ensureAccordionSectionOpen(id: SideTabId): void {
    if (this.expandedAccordionState().includes(id)) {
      return;
    }

    this.expandedAccordionState.set([...this.expandedAccordionState(), id]);
  }
}
