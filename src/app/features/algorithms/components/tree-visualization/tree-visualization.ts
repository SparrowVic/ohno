import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import { TreePresetOption, TreeTraversalTraceState } from '../../models/tree';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
  pulseSvgElement,
} from '../../utils/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

@Component({
  selector: 'app-tree-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './tree-visualization.html',
  styleUrl: './tree-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly TreePresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<TreeTraversalTraceState | null>(() => this.step()?.tree ?? null);

  /** Algorithm tag — which traversal order. Stays stable across steps
   *  so the phase chip reads as the viz's identity ("Preorder",
   *  "Level-order"...). */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence. `decisionLabel` captures the rule that fires
   *  *now* (e.g. "emit current before descending") while `phaseLabel`
   *  from the generator names the specific operation (push / visit /
   *  backtrack). We show the decision because it explains WHY this
   *  step matters, not just what's happening. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  /** Tone follows the per-step phase:
   *    - visit       → swap   (acting now, emits to output)
   *    - push        → compare (attending new frame)
   *    - backtrack   → settle (yellow route — unwinding)
   *    - complete    → sorted (lime, traversal done)
   *    - everything else → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';
    if (state.visitedCount >= state.totalNodes && state.totalNodes > 0) return 'sorted';

    const node = state.currentNodeId
      ? state.nodes.find((n) => n.id === state.currentNodeId)
      : null;
    if (!node) return 'default';

    switch (node.status) {
      case 'current':
        return 'swap';
      case 'onStack':
      case 'queued':
        return 'compare';
      case 'backtrack':
        return 'settle';
      case 'visited':
        return 'sorted';
      default:
        return 'default';
    }
  });

  /** SVG viewBox with a minimum-size floor (960 × 620) matching the
   *  rest of the graph family. Small trees stay centered inside the
   *  reference canvas so node chrome renders at the same on-screen
   *  size as Dijkstra / Dinic / Union-Find; deep trees that overflow
   *  the floor still expand the viewport so nothing clips. */
  readonly viewBox = computed(() => {
    const state = this.state();
    if (!state || state.nodes.length === 0) return '0 0 960 620';
    const xs = state.nodes.map((n) => n.x);
    const ys = state.nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 52;
    const contentWidth = maxX - minX + pad * 2;
    const contentHeight = maxY - minY + pad * 2;
    const width = Math.max(contentWidth, 960);
    const height = Math.max(contentHeight, 620);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return `${cx - width / 2} ${cy - height / 2} ${width} ${height}`;
  });

  readonly nodePositions = computed(() => {
    const state = this.state();
    if (!state) return new Map<string, { x: number; y: number }>();
    const map = new Map<string, { x: number; y: number }>();
    for (const node of state.nodes) {
      map.set(node.id, { x: node.x, y: node.y });
    }
    return map;
  });

  /** Labels the user sees on the stack strip (top-down) and queue
   *  strip (front first). Strip is empty when the respective
   *  container is empty. */
  readonly stackItems = computed(() => this.resolveLabels(this.state()?.stack ?? []));
  readonly queueItems = computed(() => this.resolveLabels(this.state()?.queue ?? []));

  /** Which strip to render — stack for DFS, queue for BFS. Exposed as
   *  a computed so the template can render a single block and switch
   *  the heading. */
  readonly stripKind = computed<'stack' | 'queue' | 'none'>(() => {
    const state = this.state();
    if (!state) return 'none';
    if (state.order === 'level-order') return 'queue';
    return 'stack';
  });

  constructor() {
    effect(() => {
      this.array();
      if (!this.initialized) return;
      this.initialize(this.array());
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

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }

  edgePath(edge: { fromId: string; toId: string }): string | null {
    const from = this.nodePositions().get(edge.fromId);
    const to = this.nodePositions().get(edge.toId);
    if (!from || !to) return null;
    // Simple straight segment — the tree layout already places
    // children off-center so crossings don't happen for reasonable
    // fan-outs. A curve would read as "branch" but visually we prefer
    // crisp geometry that echoes the data structure.
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  private resolveLabels(ids: readonly string[]): readonly { id: string; label: string }[] {
    const state = this.state();
    if (!state) return [];
    const byId = new Map(state.nodes.map((n) => [n.id, n] as const));
    return ids.map((id) => ({ id, label: byId.get(id)?.label ?? id }));
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.tree;
    const previous = previousStep?.tree ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());
    const currentId = current.currentNodeId;
    if (currentId && currentId !== previous?.currentNodeId) {
      const nodeEl = this.containerRef().nativeElement.querySelector<SVGGElement>(
        `[data-tree-node="${currentId}"]`,
      );
      if (nodeEl) {
        pulseSvgElement(nodeEl, {
          duration: motion.compareMs,
          scale: 1.05,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 10px rgb(var(--chrome-accent-warm-rgb) / 0.5))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    const prevOutput = previous?.output ?? [];
    if (current.output.length > prevOutput.length) {
      const tapeEl = this.containerRef().nativeElement.querySelector<HTMLElement>(
        '.tree-output__chip:last-child',
      );
      if (tapeEl) {
        pulseElement(tapeEl, {
          duration: motion.settleMs,
          scale: 1.08,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 12px rgb(var(--accent-rgb) / 0.5))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }
  }
}
