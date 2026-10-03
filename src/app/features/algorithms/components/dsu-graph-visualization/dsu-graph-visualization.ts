import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DsuEdgeStatus, DsuMode, DsuTraceState } from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import { DsuGraphPosition, layoutDsuCircle, layoutDsuForest } from '../../utils/helpers/dsu-graph-layout/dsu-graph-layout';
import { dsuRevealScrollDelta } from '../dsu-visualization/dsu-display.utils';
import {
  DSU_EDGE_ARROW_TONES,
  DsuChipTone,
  DsuEdgeRow,
  DsuEdgeTone,
  DsuGraphFrame,
  DsuGraphGlyphs,
  DsuNodeTone,
  DsuOperationRow,
  DsuSetRow,
  dsuArrowMarkerId,
  dsuChipPoint,
  dsuCurrentNodeId,
  dsuEdgeRows,
  dsuGraphFrame,
  dsuGraphGlyphs,
  dsuGraphMinScreen,
  dsuGraphViewBoxAttr,
  dsuGroupsByNodeId,
  dsuIsRoot,
  dsuKruskalEdgeTone,
  dsuNodeTone,
  dsuOperationRows,
  dsuParentEdgeTone,
  dsuSetRows,
  dsuSpreadRing,
  dsuTrimSegment,
  dsuWeightChipTone,
  dsuWeightChipWidth,
} from './dsu-graph-visualization.utils';

interface DisplayNode {
  readonly id: string;
  readonly label: string;
  readonly tone: DsuNodeTone;
  readonly isRoot: boolean;
  readonly isCurrent: boolean;
  readonly isQuery: boolean;
  readonly rank: number;
  readonly size: number;
  readonly x: number;
  readonly y: number;
}

interface LinkDraft {
  readonly id: string;
  readonly from: DsuGraphPosition;
  readonly to: DsuGraphPosition;
  readonly tone: DsuEdgeTone;
  readonly weight: number | null;
  readonly status: DsuEdgeStatus | null;
  readonly directed: boolean;
}

interface DisplayEdge {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly tone: DsuEdgeTone;
  readonly marker: string | null;
}

interface WeightChip {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly weight: number;
  readonly tone: DsuChipTone;
  readonly status: DsuEdgeStatus;
}

interface ScreenSize {
  readonly width: number;
  readonly height: number;
}

const DISPLAY_KEYS = I18N_KEY.features.algorithms.display;
const RING_RADIUS = 232;
let nextInstanceId = 0;

@Component({
  selector: 'app-dsu-graph-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './dsu-graph-visualization.html',
  styleUrl: './dsu-graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuGraphVisualization {
  protected readonly keys = DISPLAY_KEYS;
  protected readonly arrowTones = DSU_EDGE_ARROW_TONES;
  private readonly markerPrefix = `dsu-graph-${nextInstanceId++}`;
  private readonly rack = viewChild<ElementRef<HTMLElement>>('rack');
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');
  private readonly graphScroll = viewChild<ElementRef<HTMLElement>>('graphScroll');
  private readonly screen = signal<ScreenSize>(
    { width: 0, height: 0 },
    { equal: (left, right) => left.width === right.width && left.height === right.height },
  );

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  protected readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);
  protected readonly mode = computed<DsuMode>(() => this.state()?.mode ?? 'union-find');

  private readonly positions = computed<ReadonlyMap<string, DsuGraphPosition>>(() => {
    const state = this.state();
    if (!state) return new Map();
    return state.mode === 'union-find'
      ? layoutDsuForest(state.nodes, dsuGroupsByNodeId(state.nodes, state.groups))
      : dsuSpreadRing(layoutDsuCircle(state.nodes), RING_RADIUS);
  });

  private readonly frame = computed<DsuGraphFrame>(() => {
    const { width, height } = this.screen();
    return dsuGraphFrame(this.positions().values(), width, height);
  });

  protected readonly minScreen = computed(() => dsuGraphMinScreen(this.positions().values()));
  protected readonly viewBox = computed(() => dsuGraphViewBoxAttr(this.frame()));
  protected readonly unit = computed(() => this.frame().unit);
  protected readonly glyphs = computed<DsuGraphGlyphs>(() => dsuGraphGlyphs(this.unit()));

  protected readonly nodes = computed<readonly DisplayNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.positions();
    const currentId = dsuCurrentNodeId(state.nodes);
    return state.nodes.map((node) => {
      const isRoot = dsuIsRoot(node);
      const position = positions.get(node.id) ?? { x: 0, y: 0 };
      return {
        id: node.id,
        label: node.label,
        tone: dsuNodeTone(node.status, isRoot),
        isRoot,
        isCurrent: node.id === currentId,
        isQuery: node.status === 'query',
        rank: node.rank,
        size: node.size,
        x: position.x,
        y: position.y,
      };
    });
  });

  private readonly links = computed<readonly LinkDraft[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.positions();
    if (state.mode === 'union-find') {
      return state.nodes
        .filter((node) => !dsuIsRoot(node))
        .flatMap((node) => {
          const from = positions.get(node.id);
          const to = positions.get(node.parentId);
          if (!from || !to) return [];
          return [
            { id: `uf-${node.id}`, from, to, tone: dsuParentEdgeTone(node.status), weight: null, status: null, directed: true },
          ];
        });
    }
    return state.edges.flatMap((trace) => {
      const from = positions.get(trace.fromId);
      const to = positions.get(trace.toId);
      if (!from || !to) return [];
      return [
        {
          id: trace.id,
          from,
          to,
          tone: dsuKruskalEdgeTone(trace.status),
          weight: trace.weight,
          status: trace.status,
          directed: false,
        },
      ];
    });
  });

  protected readonly edges = computed<readonly DisplayEdge[]>(() => {
    const inset = this.glyphs().edgeInset;
    return [...this.links()]
      .sort((left, right) => edgeLayer(left.tone) - edgeLayer(right.tone))
      .map((link) => ({
        id: link.id,
        ...dsuTrimSegment(link.from, link.to, inset),
        tone: link.tone,
        marker: link.directed ? `url(#${dsuArrowMarkerId(this.markerPrefix, link.tone)})` : null,
      }));
  });

  protected readonly chips = computed<readonly WeightChip[]>(() => {
    const { edgeInset } = this.glyphs();
    const unit = this.unit();
    return this.links().flatMap((link) =>
      link.weight === null || link.status === null
        ? []
        : [
            {
              id: link.id,
              ...dsuChipPoint(dsuTrimSegment(link.from, link.to, edgeInset)),
              width: dsuWeightChipWidth(link.weight) * unit,
              weight: link.weight,
              tone: dsuWeightChipTone(link.status),
              status: link.status,
            },
          ],
    );
  });

  protected readonly setRows = computed<readonly DsuSetRow[]>(() => dsuSetRows(this.state()?.groups ?? []));
  protected readonly edgeRows = computed<readonly DsuEdgeRow[]>(() =>
    this.mode() === 'kruskal' ? dsuEdgeRows(this.state()?.edges ?? []) : [],
  );
  protected readonly operationRows = computed<readonly DsuOperationRow[]>(() =>
    this.mode() === 'union-find' ? dsuOperationRows(this.state()?.edges ?? []) : [],
  );

  constructor() {
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(([entry]) => {
            if (!entry) return;
            this.screen.set({ width: entry.contentRect.width, height: entry.contentRect.height });
          });
    let observed: SVGSVGElement | null = null;
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    afterRenderEffect(() => {
      const element = this.svgRef()?.nativeElement ?? null;
      if (!observer || element === observed) return;
      observer.disconnect();
      observed = element;
      if (element) observer.observe(element);
    });

    afterRenderEffect(() => {
      this.minScreen();
      const scroller = this.graphScroll()?.nativeElement;
      if (!scroller) return;
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
      scroller.scrollTop = Math.max(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    });

    afterRenderEffect(() => {
      this.edgeRows();
      this.operationRows();
      const head = this.rack()?.nativeElement.querySelector<HTMLElement>('ohno-rack-row[data-tone="head"]');
      const list = head?.closest<HTMLElement>('.ohno-rack__rows');
      if (!head || !list) return;
      const delta = dsuRevealScrollDelta(list.getBoundingClientRect(), head.getBoundingClientRect());
      if (delta !== 0) list.scrollTop += delta;
    });
  }

  protected markerId(tone: DsuEdgeTone): string {
    return dsuArrowMarkerId(this.markerPrefix, tone);
  }
}

function edgeLayer(tone: DsuEdgeTone): number {
  if (tone === 'idle' || tone === 'red') return 0;
  if (tone === 'lime') return 1;
  return 2;
}
