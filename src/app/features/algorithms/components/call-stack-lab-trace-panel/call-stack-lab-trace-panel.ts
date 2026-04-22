import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-call-stack-lab-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './call-stack-lab-trace-panel.html',
  styleUrl: './call-stack-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallStackLabTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<CallStackLabTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);
  readonly activeFrame = computed(() => {
    const frames = this.state()?.frames ?? [];
    return frames.length > 0 ? frames[frames.length - 1] : null;
  });
}
