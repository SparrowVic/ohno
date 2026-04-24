import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { PointerLabPresetOption } from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

/**
 * Shared canvas for array / string algorithms that work with one or
 * two moving indices — Two Pointers, Sliding Window, Palindrome
 * Check, Reverse, Kadane. The stage lays out cells in a single row
 * with pointer markers floating above or below, an optional window
 * overlay, and a compact stats strip below.
 *
 * All geometry is CSS grid — no SVG — so the chrome matches the rest
 * of the app without a per-algorithm render pass.
 */
@Component({
  selector: 'app-pointer-lab-visualization',
  imports: [I18nTextPipe, MathText, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './pointer-lab-visualization.html',
  styleUrl: './pointer-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointerLabVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly PointerLabPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  readonly state = computed<PointerLabTraceState | null>(() => this.step()?.pointerLab ?? null);

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'compare':  return 'compare';
      case 'swap':     return 'swap';
      case 'settle':   return 'settle';
      case 'complete': return 'complete';
      default:         return 'default';
    }
  });

  /** Columns template for the cell row — one track per cell so CSS
   *  grid handles alignment; pointers position themselves via grid
   *  column index. Kept as a string to plug directly into inline
   *  style binding. */
  readonly gridColumns = computed(() => {
    const count = this.state()?.cells.length ?? 0;
    if (count === 0) return '1fr';
    return `repeat(${count}, minmax(42px, 1fr))`;
  });

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }
}
