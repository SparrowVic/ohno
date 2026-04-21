import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
} from '../../utils/visualization-motion/visualization-motion';

@Component({
  selector: 'app-grid-visualization',
  imports: [TranslocoPipe],
  templateUrl: './grid-visualization.html',
  styleUrl: './grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

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
    return this.step()?.grid ?? null;
  }

  boardColumns(): string {
    const cols = this.gridState()?.cols ?? 1;
    return `repeat(${cols}, minmax(0, 1fr))`;
  }

  cellClass(status: string): string {
    return `grid-cell grid-cell--${status}`;
  }

  sourceSubtitleKey(): I18nKey {
    const state = this.gridState();
    if (!state || state.mode !== 'flood-fill') {
      return I18N_KEY.features.algorithms.visualizations.grid.sourceSubtitles.start;
    }
    return I18N_KEY.features.algorithms.visualizations.grid.sourceSubtitles.seed;
  }

  resultLabel(): string {
    const state = this.gridState();
    if (!state)
      return this.translate(I18N_KEY.features.algorithms.tracePanels.common.emptyValueLabel);
    return state.mode === 'flood-fill'
      ? this.translate(I18N_KEY.features.algorithms.visualizations.grid.resultFilledLabel, {
          count: state.resultCount,
        })
      : this.translate(I18N_KEY.features.algorithms.visualizations.grid.resultPathLabel, {
          count: state.resultCount,
        });
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

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
