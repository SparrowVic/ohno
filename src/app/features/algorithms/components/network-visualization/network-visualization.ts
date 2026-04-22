import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { NetworkEdgeSnapshot, NetworkNodeSnapshot, NetworkTraceState } from '../../models/network';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseSvgElement,
} from '../../utils/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

/** Node radius — kept in sync with the `r` attribute on `.node__body`.
 *  Edges trim their endpoints by this amount so arrow tips land on
 *  the node border instead of getting swallowed by its fill. */
const NETWORK_NODE_RADIUS = 22;
/** Extra breathing room between the arrow tip and the node border. */
const NETWORK_ARROW_TIP_INSET = 2;

interface ArrowMarker {
  readonly id: string;
  readonly fill: string;
}

/** Palette of marker-end arrow heads. One per edge state so the user
 *  can tell at a glance whether an edge is quiet, under consideration,
 *  augmenting flow, or locked in as a matched / flow-carrying edge.
 *  Matches graph-viz's marker recipe (9x9 in `userSpaceOnUse` units,
 *  path `M0 0L9 4.5L0 9Z`). */
const NETWORK_ARROW_MARKERS: readonly ArrowMarker[] = [
  { id: 'networkArrowDefault', fill: 'rgba(255, 255, 255, 0.52)' },
  { id: 'networkArrowActive', fill: 'rgb(var(--viz-warning-rgb) / 0.9)' },
  { id: 'networkArrowAugment', fill: 'rgb(var(--viz-success-rgb) / 0.9)' },
  { id: 'networkArrowFlow', fill: 'rgb(var(--viz-route-rgb) / 0.9)' },
];

/** Rendered edge — pre-computes trimmed endpoints + midpoint so the
 *  template doesn't have to do any geometry on a hot path. */
interface RenderedNetworkEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly status: NetworkEdgeSnapshot['status'];
  readonly directed: boolean;
  readonly primaryText: string;
  readonly secondaryText: string | null;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly midX: number;
  readonly midY: number;
}

@Component({
  selector: 'app-network-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './network-visualization.html',
  styleUrl: './network-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<SVGSVGElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<NetworkTraceState | null>(() => this.step()?.network ?? null);
  readonly nodes = computed(() => this.state()?.nodes ?? []);
  readonly arrowMarkers = NETWORK_ARROW_MARKERS;

  /** Enriched edges — raw endpoints trimmed back by the node radius
   *  so the marker arrow tip meets the border cleanly, and a midpoint
   *  for the capacity/flow label chip. Same recipe as graph-viz's
   *  `edges` computed; keeps arrow heads from disappearing into the
   *  node fill. */
  readonly edges = computed<readonly RenderedNetworkEdge[]>(() => {
    const nodes = this.state()?.nodes ?? [];
    const raw = this.state()?.edges ?? [];
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    return raw.map((edge) => {
      const from = byId.get(edge.fromId);
      const to = byId.get(edge.toId);
      const fromX = from?.x ?? 0;
      const fromY = from?.y ?? 0;
      const toX = to?.x ?? 0;
      const toY = to?.y ?? 0;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.hypot(dx, dy) || 1;
      const trim = Math.min(NETWORK_NODE_RADIUS + NETWORK_ARROW_TIP_INSET, dist / 2 - 0.5);
      const ux = dx / dist;
      const uy = dy / dist;
      return {
        id: edge.id,
        fromId: edge.fromId,
        toId: edge.toId,
        status: edge.status,
        directed: edge.directed,
        primaryText: edge.primaryText,
        secondaryText: edge.secondaryText ?? null,
        x1: fromX + ux * trim,
        y1: fromY + uy * trim,
        x2: toX - ux * trim,
        y2: toY - uy * trim,
        midX: (fromX + toX) / 2,
        midY: (fromY + toY) / 2,
      };
    });
  });

  /** Pick the marker-end URL for a given edge state. Mirrors graph-viz's
   *  `edgeMarker` — undirected edges get no marker at all. */
  edgeMarker(edge: RenderedNetworkEdge): string | null {
    if (!edge.directed) return null;
    if (edge.status === 'augment') return 'url(#networkArrowAugment)';
    if (edge.status === 'active') return 'url(#networkArrowActive)';
    if (edge.status === 'matched' || edge.status === 'flow') return 'url(#networkArrowFlow)';
    return 'url(#networkArrowDefault)';
  }

  /** SVG viewBox with a minimum floor matching graph-viz's default
   *  (960 × 620). Fixed-viewport families keep node chrome at the
   *  same on-screen size across algorithms: if the layout fits the
   *  floor the content is centered inside it, and only graphs that
   *  actually overflow get a larger viewport. Without this, a small
   *  8-node flow network would scale its r=22 circles up to look
   *  almost twice the size of a Dijkstra node in the same panel. */
  readonly viewBox = computed(() => {
    const nodes = this.nodes();
    if (nodes.length === 0) return '0 0 960 620';

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of nodes) {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }

    const pad = 68;
    const contentWidth = maxX - minX + pad * 2;
    const contentHeight = maxY - minY + pad * 2;
    const width = Math.max(contentWidth, 960);
    const height = Math.max(contentHeight, 620);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return `${cx - width / 2} ${cy - height / 2} ${width} ${height}`;
  });

  private readonly modeLabel = computed(
    () =>
      this.state()?.modeLabel ??
      this.translate(I18N_KEY.features.algorithms.visualizations.network.modeFallback),
  );
  private readonly statusLabel = computed(
    () =>
      this.state()?.statusLabel ??
      this.translate(I18N_KEY.features.algorithms.visualizations.network.statusFallback),
  );
  private readonly decisionLabel = computed(() => this.state()?.computation?.decision ?? null);
  private readonly routeLabel = computed(() => this.state()?.activeRouteLabel ?? null);

  /** Mode tag — the algorithm family ("Max-flow", "Matching", …). Stays
   *  fixed across steps, so it reads as the viz's identity badge. */
  readonly phaseLabel = computed<TranslatableText>(() => this.modeLabel());

  /** Action sentence for the header. Priority:
   *    1. `computation.decision` — richest per-step fact.
   *    2. `activeRouteLabel`     — augmenting path under consideration.
   *    3. `statusLabel`          — generic state fallback. */
  readonly actionText = computed<TranslatableText>(() => {
    const decision = this.decisionLabel();
    if (decision) return decision;

    const route = this.routeLabel();
    if (route) return route;

    return this.statusLabel();
  });

  /** Tone derived from edge/node status flags — same convention as
   *  other viz headers:
   *    - augment / matched / flow → sorted (lime, locked in)
   *    - active                   → swap   (pink, acting now)
   *    - blocked                  → compare (cyan, attending)
   *    - current node             → compare
   *    - idle                     → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';

    const edges = state.edges;
    if (edges.some((edge) => edge.status === 'augment')) return 'sorted';
    if (edges.some((edge) => edge.status === 'matched' || edge.status === 'flow')) {
      return 'sorted';
    }
    if (edges.some((edge) => edge.status === 'active')) return 'swap';
    if (edges.some((edge) => edge.status === 'blocked')) return 'compare';

    const nodes = state.nodes;
    if (nodes.some((node) => node.status === 'current')) return 'compare';

    return 'default';
  });

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) {
        this.render(step);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) this.render(step);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(_: readonly number[]): void {
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previous = this.lastStep;
    this.lastStep = step;
    queueMicrotask(() => this.animateStepEffects(previous, step));
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  levelLabel(node: NetworkNodeSnapshot): string {
    if (this.state()?.mode === 'min-cost-max-flow') {
      return node.level === null ? 'C—' : `C${node.level}`;
    }
    return node.level === null ? 'L—' : `L${node.level}`;
  }

  linkLabel(node: NetworkNodeSnapshot): string {
    return node.linkLabel ?? '—';
  }

  node(nodeId: string): NetworkNodeSnapshot | undefined {
    return this.nodes().find((node) => node.id === nodeId);
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.network;
    const previous = previousStep?.network ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    const previousCurrent = previous?.nodes.find((node) => node.status === 'current')?.id ?? null;
    const nextCurrent = current.nodes.find((node) => node.status === 'current')?.id ?? null;
    if (nextCurrent && nextCurrent !== previousCurrent) {
      // Target the inner body circle — the wrapping `<g>` carries a
      // translate() transform that would be clobbered by the pulse
      // keyframes, snapping the node to (0,0) for the duration.
      const nodeEl = this.findSvgElement(`[data-node-id="${nextCurrent}"] .node__body`);
      if (nodeEl) {
        pulseSvgElement(nodeEl, {
          duration: motion.compareMs,
          scale: 1.08,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 8px rgba(240,180,41,0.14))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    const previousEdges = new Map(previous?.edges.map((edge) => [edge.id, edge.status]) ?? []);
    for (const edge of current.edges) {
      const prior = previousEdges.get(edge.id);
      if (!prior || prior === edge.status) continue;
      if (edge.status !== 'augment' && edge.status !== 'matched' && edge.status !== 'flow')
        continue;
      // Target the line directly — same reason as above: the group
      // has a translate'd edge-label child and pulsing the `<g>` would
      // dislocate both the line and its label chip.
      const edgeEl = this.findSvgElement(`[data-edge-id="${edge.id}"] .edge-line`);
      if (!edgeEl) continue;
      pulseSvgElement(edgeEl, {
        duration: motion.settleMs,
        scale: 1.015,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 8px rgba(62,207,142,0.14))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findSvgElement(selector: string): SVGElement | null {
    return this.containerRef().nativeElement.querySelector<SVGElement>(selector);
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
