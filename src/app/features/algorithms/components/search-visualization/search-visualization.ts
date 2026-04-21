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
import { SearchTraceState } from '../../models/search';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
} from '../../utils/visualization-motion/visualization-motion';

@Component({
  selector: 'app-search-visualization',
  imports: [TranslocoPipe],
  templateUrl: './search-visualization.html',
  styleUrl: './search-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
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

  searchState(): SearchTraceState | null {
    return this.step()?.search ?? null;
  }

  cellClass(index: number): string {
    const row = this.searchState()?.rows[index];
    return row ? `cell cell--${row.status}` : 'cell';
  }

  isInsideWindow(index: number): boolean {
    const state = this.searchState();
    if (!state || state.low === null || state.high === null) return false;
    return index >= state.low && index <= state.high;
  }

  boundLabelKey(index: number): I18nKey | null {
    const state = this.searchState();
    if (!state) return null;
    if (state.leftBound === index && state.rightBound === index) {
      return I18N_KEY.features.algorithms.visualizations.search.boundLabels.firstLast;
    }
    if (state.leftBound === index) {
      return I18N_KEY.features.algorithms.visualizations.search.boundLabels.first;
    }
    if (state.rightBound === index) {
      return I18N_KEY.features.algorithms.visualizations.search.boundLabels.last;
    }
    return null;
  }

  hitRangeLabel(): string {
    const hits = this.searchState()?.resultIndices ?? [];
    if (hits.length === 0) {
      return this.translate(I18N_KEY.features.algorithms.visualizations.search.hitRange.none);
    }
    if (hits.length === 1) {
      return this.translate(I18N_KEY.features.algorithms.visualizations.search.hitRange.single, {
        index: hits[0],
      });
    }
    return this.translate(I18N_KEY.features.algorithms.visualizations.search.hitRange.multiple, {
      start: hits[0],
      end: hits[hits.length - 1],
    });
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.search;
    const previous = previousStep?.search ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    if (current.probeIndex !== previous?.probeIndex && current.probeIndex !== null) {
      const probe = this.findCell(current.probeIndex);
      if (probe) {
        pulseElement(probe, {
          duration: motion.compareMs,
          scale: 1.02,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 8px rgba(240,180,41,0.22))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    const freshHits = current.resultIndices.filter(
      (index) => !(previous?.resultIndices ?? []).includes(index),
    );
    for (const index of freshHits) {
      const cell = this.findCell(index);
      if (!cell) continue;
      pulseElement(cell, {
        duration: motion.settleMs,
        scale: 1.03,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 10px rgba(62,207,142,0.2))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }

    const freshEliminated = current.eliminated.filter(
      (index) => !(previous?.eliminated ?? []).includes(index),
    );
    for (const index of freshEliminated) {
      const cell = this.findCell(index);
      if (!cell) continue;
      pulseElement(cell, {
        duration: motion.completeStepMs * 6,
        scale: 0.99,
        opacity: [1, 0.78, 1],
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 6px rgba(148,163,184,0.12))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }

    if (current.decision && current.decision !== previous?.decision) {
      const chip = this.containerRef().nativeElement.querySelector(
        '.search-viz__decision',
      ) as HTMLElement | null;
      if (chip) {
        pulseElement(chip, {
          duration: motion.compareMs,
          scale: 1.015,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 8px rgba(124,110,240,0.16))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }
  }

  private findCell(index: number): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-index="${index}"]`);
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
