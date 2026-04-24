import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { SieveGridTraceState } from '../../models/sieve-grid';

@Component({
  selector: 'app-sieve-grid-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './sieve-grid-trace-panel.html',
  styleUrl: './sieve-grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SieveGridTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<SieveGridTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);

  /** Extract all discovered primes (in order) for the "primes found"
   *  list in the trace panel. */
  readonly primes = computed(() => {
    const cells = this.state()?.cells ?? [];
    return cells
      .filter((c) => c.state === 'prime' || c.state === 'current-prime')
      .map((c) => c.value);
  });
}
