import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { StringTraceState } from '../../models/string';
import {
  StringTraceSection,
  stringCalculationFacts,
  stringDetailSections,
  stringInsightFacts,
  stringSummaryFacts,
} from './string-trace-panel.utils';

const STRING_KEYS = I18N_KEY.features.algorithms.tracePanels.string;

const LEGEND_CHIPS: readonly TraceChip[] = [
  { id: 'focus', label: toTraceValue(STRING_KEYS.legendItems.currentFocus), tone: 'cyan' },
  { id: 'structure', label: toTraceValue(STRING_KEYS.legendItems.reusableStructure), tone: 'amber' },
  { id: 'result', label: toTraceValue(STRING_KEYS.legendItems.confirmedResult), tone: 'lime' },
];

@Component({
  selector: 'app-string-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './string-trace-panel.html',
  styleUrl: './string-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringTracePanel {
  protected readonly keys = STRING_KEYS;
  protected readonly legendChips = LEGEND_CHIPS;

  readonly state = input.required<StringTraceState | null>();

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    return state ? stringSummaryFacts(state) : [];
  });

  protected readonly calculationFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    return state ? stringCalculationFacts(state) : [];
  });

  protected readonly insightFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    return state ? stringInsightFacts(state) : [];
  });

  protected readonly sections = computed<readonly StringTraceSection[]>(() => stringDetailSections(this.state()));
}
