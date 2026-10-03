import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import {
  GRAPH_EDGE_TONES,
  GraphDisplayTone,
  GraphEdgeTone,
  graphCompletionRows,
  graphEdgeTone,
  graphFrontierRows,
  graphGlyphScale,
  graphLabelText,
  graphNodeTone,
  graphRouteEdgeIds,
  graphRouteMode,
  graphRouteNodeIds,
  graphValueFont,
  GRAPH_NODE_RADIUS,
  GRAPH_VIEW_PADDING,
  graphValueText,
  graphViewBox,
  graphViewBoxAttr,
  trimSegment,
} from './graph-display.utils';

const HALO_RADIUS = 20;
const FOCUS_RADIUS = 24;
const VALUE_GAP = 6;
const VALUE_CAP_RATIO = 0.8;
const ARROW_GAP = 1.5;
const CHIP_HEIGHT = 16;
const CHIP_GLYPH_WIDTH = 6.2;
const CHIP_PADDING_X = 6;
const MARKER_SIZE = 8;
const VALUE_FONT_SIZE = 14;
const NO_PADDING = { x: 0, top: 0, bottom: 0 };

interface GraphGlyphs {
  readonly scale: number;
  readonly nodeRadius: number;
  readonly haloRadius: number;
  readonly focusRadius: number;
  readonly valueOffset: number;
  readonly chipHeight: number;
  readonly markerSize: number;
  readonly valueFontSize: number;
  readonly valueDot: boolean;
}

let nextGraphDisplayId = 0;

interface DisplayNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly tone: GraphDisplayTone;
  readonly value: string;
  readonly source: boolean;
  readonly current: boolean;
  readonly frontier: boolean;
  readonly onRoute: boolean;
  readonly dim: boolean;
  readonly focused: boolean;
}

interface DisplayEdge {
  readonly id: string;
  readonly weight: number;
  readonly tone: GraphEdgeTone;
  readonly marker: string | null;
  readonly dim: boolean;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
  readonly chipTone: 'pink' | 'slate';
  readonly chipWidth: number;
}

@Component({
  selector: 'app-graph-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './graph-visualization.html',
  styleUrl: './graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphVisualization {
  protected readonly I18N = I18N_KEY.features.algorithms.display.graph;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;
  protected readonly markerTones = GRAPH_EDGE_TONES;

  readonly graph = input<WeightedGraphData | null>(null);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly focusedNodeId = input<string | null>(null);
  readonly focusedNodeIdChange = output<string | null>();

  private readonly markerPrefix = `graph-arrow-${nextGraphDisplayId++}`;
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');
  private readonly svgSize = signal({ width: 0, height: 0 });

  protected readonly state = computed(() => this.step()?.graph ?? null);
  protected readonly routeMode = computed(() => graphRouteMode(this.state()));
  protected readonly interactive = computed(() => this.routeMode() !== null);
  protected readonly showWeights = computed(() => this.state()?.showEdgeWeights ?? false);

  private readonly focusTargetId = computed(() => {
    const target = this.focusedNodeId();
    const state = this.state();
    if (!target || !state || !this.routeMode()) return null;
    return state.nodes.some((node) => node.id === target) ? target : null;
  });

  private readonly routeNodeIds = computed<readonly string[]>(() => {
    const path = graphRouteNodeIds(this.state()?.nodes ?? [], this.focusTargetId());
    return path.length > 1 ? path : [];
  });

  private readonly routeEdgeIds = computed(() =>
    graphRouteEdgeIds(this.state()?.edges ?? [], this.routeNodeIds()),
  );

  protected readonly routeText = computed(() => {
    const ids = this.routeNodeIds();
    if (ids.length === 0) return null;
    const labels = new Map((this.state()?.nodes ?? []).map((node) => [node.id, node.label]));
    return ids.map((id) => labels.get(id) ?? id).join(' → ');
  });

  private readonly contentBox = computed(() => graphViewBox(this.state()?.nodes ?? [], NO_PADDING));

  private readonly glyphScale = computed(() => {
    const { width, height } = this.svgSize();
    return graphGlyphScale(this.contentBox(), width, height, GRAPH_VIEW_PADDING);
  });

  private readonly fittedViewBox = computed(() => {
    const scale = this.glyphScale();
    return graphViewBox(this.state()?.nodes ?? [], {
      x: GRAPH_VIEW_PADDING.x * scale,
      top: GRAPH_VIEW_PADDING.top * scale,
      bottom: GRAPH_VIEW_PADDING.bottom * scale,
    });
  });

  protected readonly glyphs = computed<GraphGlyphs>(() => {
    const { width, height } = this.svgSize();
    const scale = this.glyphScale();
    const valueFont = graphValueFont(this.fittedViewBox(), width, height, scale, VALUE_FONT_SIZE);
    return {
      scale,
      nodeRadius: GRAPH_NODE_RADIUS * scale,
      haloRadius: HALO_RADIUS * scale,
      focusRadius: FOCUS_RADIUS * scale,
      valueOffset: (GRAPH_NODE_RADIUS + VALUE_GAP) * scale + valueFont.size * VALUE_CAP_RATIO,
      chipHeight: CHIP_HEIGHT * scale,
      markerSize: MARKER_SIZE * scale,
      valueFontSize: valueFont.size,
      valueDot: valueFont.dot,
    };
  });

  protected readonly viewBox = computed(() => graphViewBoxAttr(this.fittedViewBox()));

  protected readonly nodes = computed<readonly DisplayNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    const route = new Set(this.routeNodeIds());
    const routeActive = route.size > 0;
    const focusId = this.focusTargetId();
    return state.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      tone: graphNodeTone(node, state.detailLabel),
      value: graphValueText(node.distance, state.metricLabel),
      source: node.isSource,
      current: node.isCurrent,
      frontier: node.isFrontier && !node.isCurrent && !node.isSettled,
      onRoute: route.has(node.id),
      dim: routeActive && !route.has(node.id),
      focused: node.id === focusId,
    }));
  });

  protected readonly edges = computed<readonly DisplayEdge[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = new Map(state.nodes.map((node) => [node.id, node]));
    const routeEdges = this.routeEdgeIds();
    const routeActive = routeEdges.size > 0;
    const { scale, nodeRadius, chipHeight } = this.glyphs();
    return state.edges.map((edge) => {
      const from = positions.get(edge.from) ?? { x: 0, y: 0 };
      const to = positions.get(edge.to) ?? { x: 0, y: 0 };
      const directed = edge.directed ?? false;
      const segment = trimSegment(from, to, nodeRadius + ARROW_GAP, nodeRadius + ARROW_GAP);
      const onRoute = routeEdges.has(edge.id);
      const tone = graphEdgeTone(edge, onRoute);
      const weightText = String(edge.weight);
      return {
        id: edge.id,
        weight: edge.weight,
        tone,
        marker: directed ? `url(#${this.markerId(tone)})` : null,
        dim: routeActive && !onRoute,
        ...segment,
        chipTone: edge.isActive ? 'pink' : 'slate',
        chipWidth: Math.max(chipHeight, (weightText.length * CHIP_GLYPH_WIDTH + CHIP_PADDING_X * 2) * scale),
      };
    });
  });

  protected readonly frontierTitle = computed(() => graphLabelText(this.state()?.frontierLabel));
  protected readonly metricText = computed(() => graphLabelText(this.state()?.metricLabel));
  protected readonly secondaryText = computed(() => graphLabelText(this.state()?.secondaryLabel));
  protected readonly completionTitle = computed(() => graphLabelText(this.state()?.completionLabel));
  protected readonly frontierRows = computed(() => graphFrontierRows(this.state()));
  protected readonly completionRows = computed(() => graphCompletionRows(this.state()));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const element = this.svgRef()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        this.svgSize.set({ width, height });
      });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected markerId(tone: GraphEdgeTone): string {
    return `${this.markerPrefix}-${tone}`;
  }

  protected toggleFocus(nodeId: string): void {
    if (!this.interactive()) return;
    this.focusedNodeIdChange.emit(this.focusTargetId() === nodeId ? null : nodeId);
  }

  protected onNodeKey(event: Event, nodeId: string): void {
    if (!this.interactive()) return;
    event.preventDefault();
    event.stopPropagation();
    this.toggleFocus(nodeId);
  }

  protected clearRoute(): void {
    const targetId = this.focusTargetId();
    if (targetId) {
      this.svgRef()
        ?.nativeElement.querySelector<SVGGElement>(`[data-node-id="${CSS.escape(targetId)}"]`)
        ?.focus();
    }
    this.focusedNodeIdChange.emit(null);
  }
}
