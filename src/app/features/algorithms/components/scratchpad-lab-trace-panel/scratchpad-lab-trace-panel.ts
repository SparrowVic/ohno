import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

/**
 * Trace panel for scratchpad-lab algorithms. The chalkboard canvas
 * already gives the derivational story — the trace panel complements
 * with a *semantic* read-out: what is the current decision, which
 * invariants still hold, and a compact log of the derivation lines
 * emitted so far so the student can review without scrolling the
 * canvas back.
 */
@Component({
  selector: 'app-scratchpad-lab-trace-panel',
  imports: [I18nTextPipe, MathText, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './scratchpad-lab-trace-panel.html',
  styleUrl: './scratchpad-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadLabTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<ScratchpadLabTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);

  /** Show the last emitted line as the "focus" — mirror of what the
   *  canvas highlights as the current step. */
  readonly currentLine = computed(() => {
    const lines = this.state()?.lines ?? [];
    if (lines.length === 0) return null;
    return lines[lines.length - 1];
  });

  /** Only the derivation-bearing lines (skip dividers) — used for the
   *  compact "history" chip list in the panel. */
  readonly derivationLines = computed(() =>
    (this.state()?.lines ?? []).filter((line) => line.kind !== 'divider'),
  );
}
