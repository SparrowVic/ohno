import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SieveGridTraceState } from '../../models/sieve-grid';
import { SortStep } from '../../models/sort-step';
import { SieveGridPresetOption } from '../../utils/sieve-grid-scenarios/sieve-grid-scenarios';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

/**
 * Shared canvas for grid-based number-theory algorithms. Draws a
 * responsive number grid — each integer in its own cell with a status
 * tint that tracks "unchecked / prime / composite / current pivot /
 * being marked". A header strip shows the active prime p, the loop
 * bound √n, and a live primes-found count.
 *
 * Designed to be reused later for Linear Sieve and Smallest-Prime-
 * Factor precompute in Stage 4.
 */
@Component({
  selector: 'app-sieve-grid-visualization',
  imports: [I18nTextPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './sieve-grid-visualization.html',
  styleUrl: './sieve-grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SieveGridVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly SieveGridPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  readonly state = computed<SieveGridTraceState | null>(() => this.step()?.sieveGrid ?? null);

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'pick':
        return 'compare';
      case 'mark':
        return 'swap';
      case 'settle':
        return 'settle';
      case 'complete':
        return 'complete';
      default:
        return 'default';
    }
  });

  /** Derive the column count from the last cell value so we get a
   *  square-ish grid: ~sqrt(n), clamped to 6..14 so it stays readable
   *  without overflowing on narrow screens. */
  readonly columnCount = computed<number>(() => {
    const cells = this.state()?.cells ?? [];
    if (cells.length === 0) return 8;
    const target = Math.round(Math.sqrt(cells.length));
    return Math.max(6, Math.min(14, target));
  });

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }
}
