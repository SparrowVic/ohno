import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallTreeLabTraceState, CallTreeNode } from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import {
  computeTreeBounds,
  layoutTree,
  TreeLayoutBounds,
  TreeLayoutNode,
} from '../../utils/helpers/tree-layout/tree-layout';
import { CallTreeLabPresetOption } from '../../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
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
  imports: [I18nTextPipe, MathText, VizHeader, VizPanel, VizPresetPicker],
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

  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');

  readonly state = computed<CallTreeLabTraceState | null>(
    () => this.step()?.callTreeLab ?? null,
  );

  constructor() {
    effect(() => {
      const presetId = this.presetId();
      if (presetId === null) return;
      queueMicrotask(() => {
        const stage = this.stageRef()?.nativeElement;
        if (!stage) return;
        stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
        stage.scrollTop = 0;
      });
    });
  }

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

  readonly nodeWidthPx = 148;
  readonly nodeHeightPx = 78;

  /** Logical-to-pixel multiplier. Tree-layout's HORIZONTAL_GAP (62
   *  logical units) was sized for tiny SVG circles; HTML node cards
   *  are 148px wide, so we scale up positions so neighbouring cards
   *  get real breathing room. */
  private readonly LOGICAL_PIXEL_SCALE = 2.8;

  /** Logical padding added around bounds so nodes near the edge sit
   *  fully inside the canvas (the node card's half-width in logical
   *  units). Keeping SVG viewBox and HTML coords in exact lockstep
   *  avoids the preserveAspectRatio centering drift that made edges
   *  and cards disagree before. */
  private readonly extraLogicalPadX = computed(
    () => this.nodeWidthPx / 2 / this.LOGICAL_PIXEL_SCALE,
  );
  private readonly extraLogicalPadY = computed(
    () => this.nodeHeightPx / 2 / this.LOGICAL_PIXEL_SCALE,
  );

  readonly viewBox = computed(() => {
    const b = this.layout().bounds;
    const padX = this.extraLogicalPadX();
    const padY = this.extraLogicalPadY();
    const width = Math.max(b.width + 2 * padX, 1);
    const height = Math.max(b.height + 2 * padY, 1);
    return `${b.minX - padX} ${b.minY - padY} ${width} ${height}`;
  });

  /** Pixel bounds the container needs to allocate — aspect ratio
   *  matches viewBox so the SVG fills the canvas with 1 logical unit
   *  = LOGICAL_PIXEL_SCALE px consistently. */
  readonly pixelWidth = computed(() => {
    const { bounds } = this.layout();
    const padX = this.extraLogicalPadX();
    return Math.max(320, (bounds.width + 2 * padX) * this.LOGICAL_PIXEL_SCALE);
  });
  readonly pixelHeight = computed(() => {
    const { bounds } = this.layout();
    const padY = this.extraLogicalPadY();
    return Math.max(200, (bounds.height + 2 * padY) * this.LOGICAL_PIXEL_SCALE);
  });

  /** Active path node id set for quick membership checks. */
  readonly activeSet = computed(() => new Set(this.state()?.activePath ?? []));

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }

  nodeLeftPx(node: PositionedTreeNode): number {
    const { bounds } = this.layout();
    return (node.x - bounds.minX) * this.LOGICAL_PIXEL_SCALE;
  }

  nodeTopPx(node: PositionedTreeNode): number {
    const { bounds } = this.layout();
    return (node.y - bounds.minY) * this.LOGICAL_PIXEL_SCALE;
  }

  isOnPath(nodeId: string): boolean {
    return this.activeSet().has(nodeId);
  }

  /* ==== Drag-to-pan on the tree stage ============================
   *  The native scrollbars on `.ctlab__stage` handle trackpad/wheel
   *  panning, but mouse users benefit from a click-and-drag
   *  affordance. We attach pointer events via template bindings and
   *  scroll the stage's scrollTop/Left while a pointer is held down
   *  on empty canvas (i.e. not on a node card). */

  private panState: {
    readonly stage: HTMLElement;
    readonly startX: number;
    readonly startY: number;
    readonly startScrollLeft: number;
    readonly startScrollTop: number;
    readonly pointerId: number;
  } | null = null;

  onStagePointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.ctlab__node')) return;
    const stage = event.currentTarget as HTMLElement;
    this.panState = {
      stage,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: stage.scrollLeft,
      startScrollTop: stage.scrollTop,
      pointerId: event.pointerId,
    };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('ctlab__stage--grabbing');
  }

  onStagePointerMove(event: PointerEvent): void {
    const state = this.panState;
    if (!state || state.pointerId !== event.pointerId) return;
    state.stage.scrollLeft = state.startScrollLeft - (event.clientX - state.startX);
    state.stage.scrollTop = state.startScrollTop - (event.clientY - state.startY);
  }

  onStagePointerUp(event: PointerEvent): void {
    const state = this.panState;
    if (!state || state.pointerId !== event.pointerId) return;
    state.stage.releasePointerCapture(event.pointerId);
    state.stage.classList.remove('ctlab__stage--grabbing');
    this.panState = null;
  }
}
