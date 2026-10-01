import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DsuEdgeStatus, DsuMode, DsuTraceState } from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import {
  DsuGraphPosition,
  DsuGraphRenderedEdge,
  buildDsuRenderedEdge,
  computeDsuGraphViewBox,
  layoutDsuCircle,
  layoutDsuForest,
} from '../../utils/helpers/dsu-graph-layout/dsu-graph-layout';
import {
  DSU_EDGE_ARROW_TONES,
  DsuChipTone,
  DsuEdgeRow,
  DsuEdgeTone,
  DsuNodeTone,
  DsuOperationRow,
  DsuSetRow,
  dsuArrowMarkerId,
  dsuChipPoint,
  dsuCurrentNodeId,
  dsuEdgeRows,
  dsuGroupsByNodeId,
  dsuIsRoot,
  dsuKruskalEdgeTone,
  dsuNodeTone,
  dsuOperationRows,
  dsuParentEdgeTone,
  dsuSetRows,
  dsuSpreadRing,
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

interface ViewBoxFrame {
  readonly value: string;
  readonly width: number;
  readonly height: number;
}

const DISPLAY_KEYS = I18N_KEY.features.algorithms.display;
const MIN_UNIT_SCALE = 0.5;
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
  private readonly graphScroll = viewChild<ElementRef<HTMLElement>>('graphScroll');

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

  protected readonly viewBox = computed<ViewBoxFrame>(() => {
    const value = computeDsuGraphViewBox(this.positions());
    const [, , width, height] = value.split(' ').map(Number);
    return { value, width: width ?? 0, height: height ?? 0 };
  });

  protected readonly minWidth = computed(() => Math.round(this.viewBox().width * MIN_UNIT_SCALE));
  protected readonly minHeight = computed(() => Math.round(this.viewBox().height * MIN_UNIT_SCALE));

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

  private readonly renderedEdges = computed<readonly { edge: DsuGraphRenderedEdge; tone: DsuEdgeTone; status: DsuEdgeStatus | null }[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.positions();
    if (state.mode === 'union-find') {
      return state.nodes
        .filter((node) => !dsuIsRoot(node))
        .flatMap((node) => {
          const edge = buildDsuRenderedEdge({
            id: `uf-${node.id}`,
            fromId: node.id,
            toId: node.parentId,
            from: positions.get(node.id),
            to: positions.get(node.parentId),
            weight: null,
            status: 'parent',
            directed: true,
          });
          return edge ? [{ edge, tone: dsuParentEdgeTone(node.status), status: null }] : [];
        });
    }
    return state.edges.flatMap((trace) => {
      const edge = buildDsuRenderedEdge({
        id: trace.id,
        fromId: trace.fromId,
        toId: trace.toId,
        from: positions.get(trace.fromId),
        to: positions.get(trace.toId),
        weight: trace.weight,
        status: trace.status,
        directed: false,
      });
      return edge ? [{ edge, tone: dsuKruskalEdgeTone(trace.status), status: trace.status }] : [];
    });
  });

  protected readonly edges = computed<readonly DisplayEdge[]>(() =>
    [...this.renderedEdges()]
      .sort((left, right) => edgeLayer(left.tone) - edgeLayer(right.tone))
      .map(({ edge, tone }) => ({
        id: edge.id,
        x1: edge.x1,
        y1: edge.y1,
        x2: edge.x2,
        y2: edge.y2,
        tone,
        marker: edge.directed ? `url(#${dsuArrowMarkerId(this.markerPrefix, tone)})` : null,
      })),
  );

  protected readonly chips = computed<readonly WeightChip[]>(() =>
    this.renderedEdges().flatMap(({ edge, status }) =>
      edge.weight === null || status === null
        ? []
        : [
            {
              id: edge.id,
              ...dsuChipPoint(edge),
              width: dsuWeightChipWidth(edge.weight),
              weight: edge.weight,
              tone: dsuWeightChipTone(status),
              status,
            },
          ],
    ),
  );

  protected readonly setRows = computed<readonly DsuSetRow[]>(() => dsuSetRows(this.state()?.groups ?? []));
  protected readonly edgeRows = computed<readonly DsuEdgeRow[]>(() =>
    this.mode() === 'kruskal' ? dsuEdgeRows(this.state()?.edges ?? []) : [],
  );
  protected readonly operationRows = computed<readonly DsuOperationRow[]>(() =>
    this.mode() === 'union-find' ? dsuOperationRows(this.state()?.edges ?? []) : [],
  );

  constructor() {
    afterRenderEffect(() => {
      this.viewBox();
      const scroller = this.graphScroll()?.nativeElement;
      if (!scroller) return;
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
      scroller.scrollTop = Math.max(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    });
    afterRenderEffect(() => {
      this.edgeRows();
      this.operationRows();
      const rack = this.rack()?.nativeElement;
      const head = rack?.querySelector<HTMLElement>('ohno-rack-row[data-tone="head"]');
      if (!rack || !head) return;
      const top = head.offsetTop;
      const bottom = top + head.offsetHeight;
      if (top < rack.scrollTop) rack.scrollTop = top - 8;
      else if (bottom > rack.scrollTop + rack.clientHeight) rack.scrollTop = bottom - rack.clientHeight + 8;
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
