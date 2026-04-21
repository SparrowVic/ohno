import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
} from '../../utils/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

@Component({
  selector: 'app-grid-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './grid-visualization.html',
  styleUrl: './grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<GridTraceState | null>(() => this.step()?.grid ?? null);

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decision ?? state.statusLabel ?? '';
  });

  /** Tone derived from cell statuses:
   *    - path  → sorted (lime, route locked in)
   *    - current → swap (pink, acting now)
   *    - frontier → compare (cyan, attending)
   *    - filled → sorted (the flood-fill variant's "done")
   *    - idle → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';
    const cells = state.cells;
    if (cells.some((cell) => cell.status === 'path')) return 'sorted';
    if (cells.some((cell) => cell.status === 'current')) return 'swap';
    if (cells.some((cell) => cell.status === 'filled')) return 'sorted';
    if (cells.some((cell) => cell.status === 'frontier')) return 'compare';
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

  gridState(): GridTraceState | null {
    return this.state();
  }

  boardColumns(): string {
    const cols = this.state()?.cols ?? 1;
    return `repeat(${cols}, minmax(0, 1fr))`;
  }

  cellClass(status: string): string {
    return `grid-cell grid-cell--${status}`;
  }

  cellCoreLabel(cell: GridTraceState['cells'][number]): string {
    if (cell.valueLabel.length <= 3) return cell.valueLabel;
    return cell.valueLabel.slice(0, 3);
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.grid;
    const previous = previousStep?.grid ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    if (current.activeCellId && current.activeCellId !== previous?.activeCellId) {
      const cell = this.findCell(current.activeCellId);
      if (cell) {
        pulseElement(cell, {
          duration: motion.compareMs,
          scale: 1.06,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 12px rgb(var(--chrome-accent-warm-rgb) / 0.5))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    const previousFrontier = new Set(
      previous?.cells.filter((cell) => cell.status === 'frontier').map((cell) => cell.id) ?? [],
    );
    const freshFrontier = current.cells.filter(
      (cell) => cell.status === 'frontier' && !previousFrontier.has(cell.id),
    );
    for (const cellData of freshFrontier) {
      const cell = this.findCell(cellData.id);
      if (!cell) continue;
      pulseElement(cell, {
        duration: motion.compareMs,
        scale: 1.03,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 10px rgb(var(--chrome-accent-rgb) / 0.4))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }

    const previousResults = new Set(
      previous?.cells
        .filter((cell) => cell.status === 'filled' || cell.status === 'path')
        .map((cell) => cell.id) ?? [],
    );
    const freshResults = current.cells.filter(
      (cell) =>
        (cell.status === 'filled' || cell.status === 'path') && !previousResults.has(cell.id),
    );
    for (const cellData of freshResults) {
      const cell = this.findCell(cellData.id);
      if (!cell) continue;
      pulseElement(cell, {
        duration: motion.settleMs,
        scale: 1.04,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 14px rgb(var(--accent-rgb) / 0.4))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findCell(id: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-cell-id="${id}"]`);
  }
}
