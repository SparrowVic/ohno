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
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { SearchTraceState } from '../../models/search';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

@Component({
  selector: 'app-search-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './search-visualization.html',
  styleUrl: './search-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<SearchTraceState | null>(() => this.step()?.search ?? null);

  /** Mode tag for the header — identifies the search family
   *  ("Binary search", "Linear scan"…). Stays fixed across steps. */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence. `decision` is richest; `statusLabel` covers
   *  quiet steps where nothing interesting happened yet. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decision ?? state.statusLabel ?? '';
  });

  /** Tone from row statuses:
   *    - found    → sorted (lime, locked in)
   *    - probe    → swap   (pink, acting now)
   *    - bound    → compare (cyan, attending)
   *    - idle     → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';
    const rows = state.rows;
    if (rows.some((row) => row.status === 'found')) return 'sorted';
    if (rows.some((row) => row.status === 'probe')) return 'swap';
    if (rows.some((row) => row.status === 'bound' || row.status === 'window')) {
      return 'compare';
    }
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

  searchState(): SearchTraceState | null {
    return this.state();
  }

  cellClass(index: number): string {
    const row = this.state()?.rows[index];
    return row ? `cell cell--${row.status}` : 'cell';
  }

  isInsideWindow(index: number): boolean {
    const state = this.state();
    if (!state || state.low === null || state.high === null) return false;
    return index >= state.low && index <= state.high;
  }

  boundLabelKey(index: number): I18nKey | null {
    const state = this.state();
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
  }

  private findCell(index: number): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-index="${index}"]`);
  }
}
