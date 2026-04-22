import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-call-tree-lab-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './call-tree-lab-trace-panel.html',
  styleUrl: './call-tree-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallTreeLabTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<CallTreeLabTraceState | null>(null);

  readonly hasResult = computed(() => !!this.state()?.resultLabel);
  readonly activeNode = computed(() => {
    const state = this.state();
    if (!state) return null;
    const leafId = state.activePath.length > 0
      ? state.activePath[state.activePath.length - 1]
      : state.rootId;
    if (!leafId) return null;
    return state.nodes.find((n) => n.id === leafId) ?? null;
  });
}
