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

import { DpCell, DpPresetOption, DpTraceState } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion';

@Component({
  selector: 'app-dp-visualization',
  imports: [],
  templateUrl: './dp-visualization.html',
  styleUrl: './dp-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly DpPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<DpTraceState | null>(() => this.step()?.dp ?? null);
  readonly activeLabel = computed(() => this.state()?.activeLabel ?? '—');
  readonly pathLabel = computed(() => this.state()?.pathLabel ?? '—');

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

  selectPreset(id: string): void {
    if (id === this.presetId()) return;
    this.presetChange.emit(id);
  }

  rowCells(row: number): readonly DpCell[] {
    return this.state()?.cells.filter((cell) => cell.row === row).sort((left, right) => left.col - right.col) ?? [];
  }

  gridCols(): string {
    return `repeat(${(this.state()?.colHeaders.length ?? 0) + 1}, minmax(0, 1fr))`;
  }

  cellClass(cell: DpCell): string {
    return `dp-cell dp-cell--${cell.status}`;
  }

  headerClass(status: string): string {
    return `dp-head dp-head--${status}`;
  }

  insightClass(tone: string): string {
    return `insight-card insight-card--${tone}`;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.dp;
    const previous = previousStep?.dp ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());
    const previousStatuses = new Map(previous?.cells.map((cell) => [cell.id, cell.status]) ?? []);

    for (const cell of current.cells) {
      const prior = previousStatuses.get(cell.id);
      if (!prior || prior === cell.status) continue;
      if (!['active', 'improved', 'chosen', 'backtrack', 'match'].includes(cell.status)) continue;
      const el = this.findCell(cell.id);
      if (!el) continue;
      pulseElement(el, {
        duration: cell.status === 'active' ? motion.compareMs : motion.settleMs,
        scale: cell.status === 'backtrack' ? 1.04 : 1.03,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          glowForStatus(cell.status),
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findCell(id: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-cell-id="${id}"]`);
  }
}

function glowForStatus(status: DpCell['status']): string {
  switch (status) {
    case 'active':
      return 'drop-shadow(0 0 10px rgba(240,180,41,0.18))';
    case 'match':
      return 'drop-shadow(0 0 10px rgba(56,189,248,0.18))';
    case 'backtrack':
      return 'drop-shadow(0 0 10px rgba(255,222,89,0.18))';
    default:
      return 'drop-shadow(0 0 10px rgba(62,207,142,0.18))';
  }
}
