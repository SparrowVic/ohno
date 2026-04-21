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

import { MatrixCell, MatrixTraceState } from '../../models/matrix';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion/visualization-motion';

@Component({
  selector: 'app-matrix-visualization',
  imports: [],
  templateUrl: './matrix-visualization.html',
  styleUrl: './matrix-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<MatrixTraceState | null>(() => this.step()?.matrix ?? null);
  readonly modeLabel = computed(() => this.state()?.modeLabel ?? 'Matrix');
  readonly phaseLabel = computed(() => this.state()?.phaseLabel ?? 'Initialize');
  readonly resultLabel = computed(() => this.state()?.resultLabel ?? '—');
  readonly activeLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    const parts = [state.activeRowLabel, state.activeColLabel].filter((part) => part);
    return parts.length > 0 ? parts.join(' × ') : state.pivotLabel ?? '—';
  });
  readonly pivotLabel = computed(() => this.state()?.pivotLabel ?? '—');
  readonly focusItems = computed(() => this.state()?.focusItems ?? []);
  readonly secondaryItems = computed(() => this.state()?.secondaryItems ?? []);

  /** Indices of rows/columns whose header carries the `covered`
   *  status. We surface these so the template can render overlay
   *  bars that visibly cross the matrix — Hungarian's "covering
   *  lines" abstraction becomes something you can actually see
   *  cutting through the cells, not just a tint on the header. */
  readonly coveredRowIndices = computed<readonly number[]>(() => {
    return (this.state()?.rowHeaders ?? [])
      .map((header, index) => (header.status === 'covered' ? index : -1))
      .filter((index) => index >= 0);
  });
  readonly coveredColIndices = computed<readonly number[]>(() => {
    return (this.state()?.colHeaders ?? [])
      .map((header, index) => (header.status === 'covered' ? index : -1))
      .filter((index) => index >= 0);
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

  rowCells(row: number): readonly MatrixCell[] {
    return this.state()?.cells.filter((cell) => cell.row === row).sort((left, right) => left.col - right.col) ?? [];
  }

  gridCols(): string {
    return `repeat(${(this.state()?.colHeaders.length ?? 0) + 1}, minmax(0, 1fr))`;
  }

  cellClass(cell: MatrixCell): string {
    return `matrix-cell matrix-cell--${cell.status}`;
  }

  headerClass(status: string): string {
    return `matrix-head matrix-head--${status}`;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.matrix;
    const previous = previousStep?.matrix ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());
    const previousStatuses = new Map(previous?.cells.map((cell) => [cell.id, cell.status]) ?? []);

    for (const cell of current.cells) {
      const prior = previousStatuses.get(cell.id);
      if (!prior || prior === cell.status) continue;
      if (!['active', 'improved', 'assignment', 'adjusted'].includes(cell.status)) continue;
      const el = this.findCell(cell.id);
      if (!el) continue;
      // Glow colour follows the cell state's new palette: pink for
      // "acting now" (active), lime for anything that just improved /
      // got assigned. Matches the resting CSS colours so the pulse
      // reads as the same state coming in, not a conflicting flash.
      const glowColor =
        cell.status === 'active'
          ? 'rgb(var(--chrome-accent-warm-rgb) / 0.5)'
          : 'rgb(var(--accent-rgb) / 0.4)';
      pulseElement(el, {
        duration: cell.status === 'active' ? motion.compareMs : motion.settleMs,
        scale: 1.04,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          `drop-shadow(0 0 12px ${glowColor})`,
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findCell(id: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-cell-id="${id}"]`);
  }
}
