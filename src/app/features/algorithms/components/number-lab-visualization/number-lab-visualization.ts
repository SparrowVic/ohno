import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { NumberLabTraceState } from '../../models/number-lab';
import { SortStep } from '../../models/sort-step';
import { NumberLabPresetOption } from '../../utils/number-lab-scenarios/number-lab-scenarios';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

/**
 * Shared canvas for small-math algorithms (Fibonacci, Factorial, GCD,
 * Extended Euclidean, …). Splits the stage into three regions:
 *
 *   - **Registers deck** — one chip per live named scalar, tone-tinted
 *     so the user can spot which value just moved.
 *   - **Formula card**  — the rule fired on the current step, broken
 *     into operand / operator parts so colours match the registers.
 *   - **History tape**  — a scrolling row of emitted values; the
 *     latest entry pulses briefly so the eye catches it.
 *
 * No SVG canvas is needed — these algorithms are pure arithmetic, so
 * the viz is a set of CSS chips + typography, not a geometric render.
 */
@Component({
  selector: 'app-number-lab-visualization',
  imports: [I18nTextPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './number-lab-visualization.html',
  styleUrl: './number-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberLabVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly NumberLabPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  readonly state = computed<NumberLabTraceState | null>(() => this.step()?.numberLab ?? null);

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  /** Tone follows the generator's explicit `tone` flag. Kept separate
   *  from the algorithm-specific phase string so all three families
   *  in the number-lab group can share the header recipe without each
   *  having to re-declare the mapping. */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'compare':  return 'compare';
      case 'update':   return 'swap';
      case 'emit':     return 'sorted';
      case 'settle':   return 'settle';
      case 'complete': return 'complete';
      default:         return 'default';
    }
  });

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }
}
