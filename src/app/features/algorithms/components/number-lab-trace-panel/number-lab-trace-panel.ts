import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { NumberLabTraceState } from '../../models/number-lab';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-number-lab-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './number-lab-trace-panel.html',
  styleUrl: './number-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberLabTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<NumberLabTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);
}
