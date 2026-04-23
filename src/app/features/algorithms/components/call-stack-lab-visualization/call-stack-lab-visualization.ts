import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { SortStep } from '../../models/sort-step';
import { CallStackLabPresetOption } from '../../utils/call-stack-lab-scenarios/call-stack-lab-scenarios';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

/**
 * Shared canvas for recursion-driven algorithms — Call Stack demo,
 * Backtracking, Minimax, MCTS. Splits the stage into:
 *
 *   - **Stack column** — live frames stacked bottom-up; the top frame
 *     is "active" and pulses warm. Completed frames flash their
 *     return value briefly before popping.
 *   - **Return rail** — breadcrumb of the most recent pops with their
 *     return values, so the user can see the unwind trail.
 *   - **Stats strip** — total calls, max depth, current depth.
 *
 * No SVG — the stack is a vertical CSS flex column with entering /
 * exiting frames animated via keyframes.
 */
@Component({
  selector: 'app-call-stack-lab-visualization',
  imports: [I18nTextPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './call-stack-lab-visualization.html',
  styleUrl: './call-stack-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallStackLabVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly CallStackLabPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  readonly state = computed<CallStackLabTraceState | null>(
    () => this.step()?.callStackLab ?? null,
  );

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'descend':
        return 'compare';
      case 'combine':
        return 'swap';
      case 'return':
        return 'sorted';
      case 'complete':
        return 'complete';
      default:
        return 'default';
    }
  });

  /** Reverse the frames so the top-of-stack renders at the top
   *  visually while the generator's internal array keeps root at 0. */
  readonly framesTopDown = computed(() => [...(this.state()?.frames ?? [])].reverse());

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }
}
