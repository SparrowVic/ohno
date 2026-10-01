import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
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
import { SortStep } from '../../models/sort-step';
import { TreeTraversalTraceState } from '../../models/tree';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
  pulseSvgElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  TreeEdgeTone,
  TreeNodeTone,
  TreeSegment,
  treeBounds,
  treeCapScale,
  treeEdgeTone,
  treeFitScale,
  treeGaps,
  treeGlyphMetrics,
  treeIsFrontier,
  treeNodeTone,
  treeNodeValueText,
  treeOutputCells,
  treePendingRows,
  treeSegment,
  treeShowsTag,
  treeViewBoxAttr,
} from './tree-display.utils';

const BASE_PADDING = { x: 40, top: 36, bottom: 44 };
const MAX_PX_PER_UNIT = 1.6;
const HALO_GAP_PX = 6;
const EDGE_GAP_PX = 1.5;
const TAG_GAP_PX = 12;
const TAG_FONT_PX = 10;
const EDGE_PAD_PX = 14;
const TAG_PAD_PX = 26;

interface TreeGlyphs {
  readonly ring: number;
  readonly halo: number;
  readonly valueSize: number;
  readonly valueDot: boolean;
  readonly tagSize: number;
  readonly tagOffset: number;
  readonly showTags: boolean;
}

interface DisplayNode {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly valueDot: boolean;
  readonly tag: boolean;
  readonly x: number;
  readonly y: number;
  readonly tone: TreeNodeTone;
  readonly current: boolean;
  readonly frontier: boolean;
}

interface DisplayEdge extends TreeSegment {
  readonly id: string;
  readonly tone: TreeEdgeTone;
}

@Component({
  selector: 'app-tree-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './tree-visualization.html',
  styleUrl: './tree-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeVisualization implements VisualizationRenderer {
  protected readonly I18N = I18N_KEY.features.algorithms.display.tree;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;
  protected readonly REGISTERS = I18N_KEY.features.algorithms.display.registers;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');
  private readonly svgSize = signal({ width: 0, height: 0 });
  private previous: TreeTraversalTraceState | null = null;

  protected readonly state = computed<TreeTraversalTraceState | null>(() => this.step()?.tree ?? null);
  protected readonly levelOrder = computed(() => this.state()?.order === 'level-order');
  protected readonly modeLabel = computed(() => this.state()?.modeLabel ?? '');

  private readonly gaps = computed(() => treeGaps(this.state()?.nodes ?? []));

  private readonly pxPerUnit = computed(() => {
    const { width, height } = this.svgSize();
    const box = treeBounds(this.state()?.nodes ?? [], BASE_PADDING);
    return Math.min(MAX_PX_PER_UNIT, treeFitScale(box, width, height));
  });

  private readonly metrics = computed(() => treeGlyphMetrics(this.gaps(), this.pxPerUnit()));

  protected readonly glyphs = computed<TreeGlyphs>(() => {
    const unit = 1 / this.pxPerUnit();
    const { ringPx, valuePx, valueDot, showTags } = this.metrics();
    return {
      ring: ringPx * unit,
      halo: (ringPx + HALO_GAP_PX) * unit,
      valueSize: valuePx * unit,
      valueDot,
      tagSize: TAG_FONT_PX * unit,
      tagOffset: (ringPx + TAG_GAP_PX) * unit,
      showTags,
    };
  });

  protected readonly viewBox = computed(() => {
    const unit = 1 / this.pxPerUnit();
    const { ringPx, showTags } = this.metrics();
    const { width, height } = this.svgSize();
    const box = treeBounds(this.state()?.nodes ?? [], {
      x: (ringPx + EDGE_PAD_PX) * unit,
      top: (ringPx + EDGE_PAD_PX) * unit,
      bottom: (ringPx + (showTags ? TAG_PAD_PX : EDGE_PAD_PX)) * unit,
    });
    return treeViewBoxAttr(treeCapScale(box, width, height, MAX_PX_PER_UNIT));
  });

  protected readonly nodes = computed<readonly DisplayNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    return state.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      value: treeNodeValueText(node),
      valueDot: node.value !== null && this.glyphs().valueDot,
      tag: treeShowsTag(node),
      x: node.x,
      y: node.y,
      tone: treeNodeTone(node.status),
      current: node.id === state.currentNodeId,
      frontier: treeIsFrontier(node.status),
    }));
  });

  protected readonly edges = computed<readonly DisplayEdge[]>(() => {
    const state = this.state();
    if (!state) return [];
    const byId = new Map(state.nodes.map((node) => [node.id, node]));
    const inset = this.glyphs().ring + EDGE_GAP_PX / this.pxPerUnit();
    const levelOrder = this.levelOrder();
    return state.edges.flatMap((edge) => {
      const from = byId.get(edge.fromId);
      const to = byId.get(edge.toId);
      if (!from || !to) return [];
      return [{ id: edge.id, tone: treeEdgeTone(edge, levelOrder, to.status), ...treeSegment(from, to, inset) }];
    });
  });

  protected readonly pendingRows = computed(() => treePendingRows(this.state()));
  protected readonly outputCells = computed(() => treeOutputCells(this.state()));

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

    afterRenderEffect(() => {
      const step = this.step();
      if (step) this.render(step);
    });

    destroyRef.onDestroy(() => this.destroy());
  }

  initialize(_: readonly number[]): void {
    this.previous = null;
  }

  render(step: SortStep): void {
    const current = step.tree ?? null;
    const previous = this.previous;
    this.previous = current;
    if (!current || !previous) return;
    this.animateStep(previous, current);
  }

  destroy(): void {
    this.previous = null;
  }

  private animateStep(previous: TreeTraversalTraceState, current: TreeTraversalTraceState): void {
    const motion = createMotionProfile(this.speed());
    const host = this.hostRef.nativeElement;
    const currentId = current.currentNodeId;
    if (currentId && currentId !== previous.currentNodeId) {
      const ring = host.querySelector<SVGCircleElement>(`[data-node="${currentId}"] .node__ring`);
      if (ring) {
        pulseSvgElement(ring, {
          duration: motion.compareMs,
          scale: 1.08,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 8px rgb(var(--cyan-rgb) / 0.6))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    if (current.output.length > previous.output.length) {
      const cell = host.querySelector<HTMLElement>('.tree__cell:last-child');
      if (cell) {
        pulseElement(cell, {
          duration: motion.settleMs,
          scale: 1.08,
          filter: ['none', 'none', 'none'],
        });
      }
    }
  }
}
