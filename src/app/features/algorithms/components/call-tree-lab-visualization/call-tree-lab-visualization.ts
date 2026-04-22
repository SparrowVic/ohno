import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { CallTreeLabTraceState, CallTreeNode } from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import {
  computeTreeBounds,
  layoutTree,
  TreeLayoutBounds,
  TreeLayoutNode,
} from '../../utils/tree-layout/tree-layout';
import { CallTreeLabPresetOption } from '../../utils/call-tree-lab-scenarios/call-tree-lab-scenarios';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

export interface PositionedTreeNode extends CallTreeNode {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

export interface TreeEdgeGeom {
  readonly id: string;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly path: string;
  readonly label: string | null;
  readonly labelX: number;
  readonly labelY: number;
  readonly isOnPath: boolean;
}

/**
 * Shared canvas for algorithms that build an explicit decision tree —
 * Backtracking (N-Queens), Minimax α/β, MCTS. The layout is:
 *
 *   - Optional **sidecar board** pinned above the tree (only when the
 *     algorithm sets `sidecar` on the trace state).
 *   - **Tree canvas**: SVG layer for the curved edges + active-path
 *     ribbon, HTML layer for node cards (titles, stats, badges). Cards
 *     are absolutely positioned using logical coordinates from the
 *     shared tree-layout util, then scaled to pixels.
 *   - **Stats strip** — algorithm-level counters (nodes explored,
 *     solutions found, pruned branches…).
 */
@Component({
  selector: 'app-call-tree-lab-visualization',
  imports: [VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './call-tree-lab-visualization.html',
  styleUrl: './call-tree-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallTreeLabVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly CallTreeLabPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  readonly state = computed<CallTreeLabTraceState | null>(
    () => this.step()?.callTreeLab ?? null,
  );

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'descend':
        return 'compare';
      case 'prune':
        return 'swap';
      case 'solve':
        return 'sorted';
      case 'return':
        return 'settle';
      case 'complete':
        return 'complete';
      default:
        return 'default';
    }
  });

  /** Layout the tree in logical coordinates then scale into pixels.
   *  We keep logical positions (for CSS absolute placement) + the SVG
   *  viewBox (for edges). */
  readonly layout = computed<{
    readonly nodes: readonly PositionedTreeNode[];
    readonly edges: readonly TreeEdgeGeom[];
    readonly bounds: TreeLayoutBounds;
  }>(() => {
    const state = this.state();
    if (!state || state.nodes.length === 0) {
      return {
        nodes: [],
        edges: [],
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
      };
    }
    const seeds = state.nodes.map((n) => ({
      id: n.id,
      label: n.title,
      value: null,
      parentId: n.parentId,
    }));
    const laidOut = layoutTree(seeds);
    const bounds = computeTreeBounds(laidOut);
    const byId = new Map<string, TreeLayoutNode>(laidOut.map((l) => [l.id, l]));
    const activeSet = new Set(state.activePath);

    const positioned: PositionedTreeNode[] = state.nodes.map((node) => {
      const laid = byId.get(node.id);
      return {
        ...node,
        x: laid?.x ?? 0,
        y: laid?.y ?? 0,
        depth: laid?.depth ?? 0,
      };
    });

    const edges: TreeEdgeGeom[] = positioned
      .filter((n) => n.parentId !== null)
      .map((n) => {
        const parent = byId.get(n.parentId as string);
        const fromX = parent?.x ?? n.x;
        const fromY = parent?.y ?? n.y;
        const toX = n.x;
        const toY = n.y;
        const midY = (fromY + toY) / 2;
        const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        return {
          id: `${n.parentId}->${n.id}`,
          fromX,
          fromY,
          toX,
          toY,
          path,
          label: n.edgeLabel,
          labelX: (fromX + toX) / 2,
          labelY: midY,
          isOnPath: activeSet.has(n.id) && activeSet.has(n.parentId as string),
        };
      });

    return { nodes: positioned, edges, bounds };
  });

  readonly viewBox = computed(() => {
    const b = this.layout().bounds;
    return `${b.minX} ${b.minY} ${b.width || 1} ${b.height || 1}`;
  });

  readonly nodeWidthPx = 148;
  readonly nodeHeightPx = 78;

  /** Map the logical bounds to pixel width/height so absolute node
   *  cards can be placed. We scale so the tree fills a natural width
   *  up to ~1200px. */
  readonly layerScale = computed<number>(() => {
    const width = this.layout().bounds.width;
    if (width === 0) return 1;
    // Logical units are already sensibly spaced (see tree-layout
    // HORIZONTAL_GAP), so 1 logical unit ≈ 1 px works out of the box.
    return 1;
  });

  /** Pixel bounds the container needs to allocate. */
  readonly pixelWidth = computed(() => {
    const { bounds } = this.layout();
    return Math.max(320, bounds.width + this.nodeWidthPx * 0.8);
  });
  readonly pixelHeight = computed(() => {
    const { bounds } = this.layout();
    return Math.max(200, bounds.height + this.nodeHeightPx);
  });

  /** Active path node id set for quick membership checks. */
  readonly activeSet = computed(() => new Set(this.state()?.activePath ?? []));

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }

  nodeLeftPx(node: PositionedTreeNode): number {
    const { bounds } = this.layout();
    return node.x - bounds.minX - this.nodeWidthPx / 2;
  }

  nodeTopPx(node: PositionedTreeNode): number {
    const { bounds } = this.layout();
    return node.y - bounds.minY - this.nodeHeightPx / 2;
  }

  isOnPath(nodeId: string): boolean {
    return this.activeSet().has(nodeId);
  }
}
