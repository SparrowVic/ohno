import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { NumberLabTraceState } from '../../models/number-lab';

const LAB_KEYS = I18N_KEY.features.algorithms.tracePanels.numberLab;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const REGISTER_COLUMNS: readonly TraceColumn[] = [
  { id: 'label', header: LAB_KEYS.registerColumn, kind: 'math' },
  { id: 'value', header: LAB_KEYS.valueColumn, kind: 'math', align: 'end' },
  { id: 'hint', header: LAB_KEYS.hintColumn, kind: 'math' },
];

@Component({
  selector: 'app-number-lab-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './number-lab-trace-panel.html',
  styleUrl: './number-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberLabTracePanel {
  protected readonly keys = LAB_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly registerColumns = REGISTER_COLUMNS;

  readonly state = input<NumberLabTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const lab = this.state();
    if (!lab) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(lab.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(lab.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: LAB_KEYS.iterationLabel, value: lab.iteration },
    ];
    if (lab.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(lab.resultLabel), kind: 'math', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: LAB_KEYS.decisionLabel, value: toTraceValue(lab.decisionLabel), kind: 'math', wide: true });
    return facts;
  });

  protected readonly registerRows = computed<readonly TraceRow[]>(() =>
    (this.state()?.registers ?? []).map((register) => ({
      id: register.id,
      tone: register.tone === 'active' ? 'cyan' : register.tone === 'settled' ? 'lime' : null,
      dim: register.tone === 'muted',
      cells: {
        label: toTraceValue(register.label),
        value: register.value,
        hint: toTraceValue(register.hint ?? null),
      },
    })),
  );

  protected readonly historyChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.history ?? []).map((entry) => ({
      id: entry.id,
      label: `${entry.label} → ${entry.value}`,
      kind: 'math',
      tone: entry.isCurrent ? 'cyan' : null,
      active: entry.isCurrent,
    })),
  );
}
