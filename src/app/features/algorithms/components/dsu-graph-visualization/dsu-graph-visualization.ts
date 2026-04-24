import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  DsuMode,
  DsuNodeStatus,
  DsuTraceState,
} from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import {
  DsuGraphPosition,
  DsuGraphRenderedEdge,
  buildDsuRenderedEdge,
  computeDsuGraphViewBox,
  layoutDsuCircle,
  layoutDsuForest,
  unionFindEdgeStatusFromChild,
} from '../../utils/helpers/dsu-graph-layout/dsu-graph-layout';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

interface RenderedNode {
  readonly id: string;
  readonly label: string;
  readonly status: DsuNodeStatus;
  readonly isRoot: boolean;
  readonly rank: number;
  readonly size: number;
  readonly x: number;
  readonly y: number;
}

interface ArrowMarker {
  readonly id: string;
  readonly fill: string;
}

const ARROW_MARKERS: readonly ArrowMarker[] = [
  { id: 'dsuArrowParent', fill: 'rgb(var(--chrome-accent-alt-rgb) / 0.7)' },
  { id: 'dsuArrowActive', fill: 'rgb(var(--chrome-accent-warm-rgb) / 0.85)' },
  { id: 'dsuArrowAccepted', fill: 'rgb(var(--accent-rgb) / 0.85)' },
];

const I18N = I18N_KEY.features.algorithms.visualizations.dsuGraph;

@Component({
  selector: 'app-dsu-graph-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './dsu-graph-visualization.html',
  styleUrl: './dsu-graph-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuGraphVisualization {
  protected readonly I18N = I18N;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);
  readonly mode = computed<DsuMode>(() => this.state()?.mode ?? 'union-find');
  readonly modeLabel = computed(() => this.state()?.modeLabel ?? '—');
  readonly statusLabel = computed(() => this.state()?.statusLabel ?? '—');
  readonly componentCount = computed(() => this.state()?.componentCount ?? 0);
  readonly resultLabel = computed(() => this.state()?.resultLabel ?? '—');
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly decision = computed(() => this.state()?.decision ?? '—');

  readonly arrowMarkers = ARROW_MARKERS;

  readonly nodePositions = computed<ReadonlyMap<string, DsuGraphPosition>>(() => {
    const state = this.state();
    if (!state) return new Map();
    return state.mode === 'union-find'
      ? layoutDsuForest(state.nodes, state.groups)
      : layoutDsuCircle(state.nodes);
  });

  /** Tight-fit SVG viewBox — recomputed each step so forests of any
   *  depth and rings of any count stay fully visible without nodes
   *  getting clipped off the top, bottom or sides of the canvas. */
  readonly viewBox = computed(() => computeDsuGraphViewBox(this.nodePositions()));

  readonly renderedNodes = computed<readonly RenderedNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.nodePositions();
    return state.nodes.map((node) => {
      const pos = positions.get(node.id) ?? { x: 0, y: 0 };
      return {
        id: node.id,
        label: node.label,
        status: node.status,
        isRoot: node.parentId === node.id,
        rank: node.rank,
        size: node.size,
        x: pos.x,
        y: pos.y,
      };
    });
  });

  readonly renderedEdges = computed<readonly DsuGraphRenderedEdge[]>(() => {
    const state = this.state();
    if (!state) return [];
    const positions = this.nodePositions();

    if (state.mode === 'union-find') {
      return state.nodes
        .filter((node) => node.parentId !== node.id)
        .map((node) =>
          buildDsuRenderedEdge({
            id: `uf-${node.id}`,
            fromId: node.id,
            toId: node.parentId,
            from: positions.get(node.id),
            to: positions.get(node.parentId),
            weight: null,
            status: unionFindEdgeStatusFromChild(node.status),
            directed: true,
          }),
        )
        .filter((edge): edge is DsuGraphRenderedEdge => edge !== null);
    }

    return state.edges
      .map((edge) =>
        buildDsuRenderedEdge({
          id: edge.id,
          fromId: edge.fromId,
          toId: edge.toId,
          from: positions.get(edge.fromId),
          to: positions.get(edge.toId),
          weight: edge.weight,
          status: edge.status,
          directed: false,
        }),
      )
      .filter((edge): edge is DsuGraphRenderedEdge => edge !== null);
  });

  /** Mode tag — "UNION-FIND" or "KRUSKAL" — passes straight through
   *  the header's i18n-text pipe (modeLabel is already a translated
   *  TranslatableText from the trace generator). */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence for the header. Priority:
   *    1. `decision`    — richest per-step fact ("Union(3,7) accepted").
   *    2. `activeLabel` — pair under consideration.
   *    3. `statusLabel` — generic state. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decision ?? state.activePairLabel ?? state.statusLabel ?? '';
  });

  /** Tone from structural flags — same convention as graph-viz:
   *    - accepted edge / merged-or-compressed node → sorted (lime, locked in)
   *    - active edge / active-or-query node        → swap   (pink, acting now)
   *    - rejected edge                              → compare (cyan, attending)
   *    - idle                                       → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';

    const edges = this.renderedEdges();
    if (edges.some((edge) => edge.status === 'accepted')) return 'sorted';
    if (edges.some((edge) => edge.status === 'active')) return 'swap';

    const nodes = this.renderedNodes();
    if (nodes.some((node) => node.status === 'merged' || node.status === 'compressed')) {
      return 'sorted';
    }
    if (nodes.some((node) => node.status === 'active' || node.status === 'query')) {
      return 'compare';
    }

    if (edges.some((edge) => edge.status === 'rejected')) return 'compare';
    return 'default';
  });

  edgeMarker(edge: DsuGraphRenderedEdge): string | null {
    if (!edge.directed) return null;
    if (edge.status === 'active') return 'url(#dsuArrowActive)';
    if (edge.status === 'accepted') return 'url(#dsuArrowAccepted)';
    return 'url(#dsuArrowParent)';
  }
}
