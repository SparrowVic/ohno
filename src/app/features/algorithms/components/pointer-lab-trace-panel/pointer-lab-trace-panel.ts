import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { MathText } from '../../../../shared/components/math-text/math-text';

@Component({
  selector: 'app-pointer-lab-trace-panel',
  imports: [I18nTextPipe, MathText, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './pointer-lab-trace-panel.html',
  styleUrl: './pointer-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointerLabTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<PointerLabTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);

  protected stringify(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }
}
