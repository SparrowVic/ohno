import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
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
  layoutDsuCircle,
  layoutDsuForest,
  unionFindEdgeStatusFromChild,
} from '../../utils/dsu-graph-layout/dsu-graph-layout';

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
  imports: [I18nTextPipe, TranslocoPipe],
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

  edgeMarker(edge: DsuGraphRenderedEdge): string | null {
    if (!edge.directed) return null;
    if (edge.status === 'active') return 'url(#dsuArrowActive)';
    if (edge.status === 'accepted') return 'url(#dsuArrowAccepted)';
    return 'url(#dsuArrowParent)';
  }
}
