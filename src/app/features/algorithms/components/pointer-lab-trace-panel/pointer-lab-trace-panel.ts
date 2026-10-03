import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { PointerLabPointer, PointerLabTraceState } from '../../models/pointer-lab';

const POINTER_KEYS = I18N_KEY.features.algorithms.tracePanels.pointerLab;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const POINTER_TONES: Readonly<Record<PointerLabPointer['tone'], TraceTone>> = {
  accent: 'cyan',
  warm: 'pink',
  route: 'lime',
  hit: 'amber',
  muted: 'slate',
};

const STAT_TONES: Readonly<Record<PointerLabTraceState['stats'][number]['tone'], TraceTone>> = {
  info: 'cyan',
  accent: 'violet',
  warning: 'amber',
  success: 'lime',
  danger: 'red',
};

@Component({
  selector: 'app-pointer-lab-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './pointer-lab-trace-panel.html',
  styleUrl: './pointer-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointerLabTracePanel {
  protected readonly keys = POINTER_KEYS;

  readonly state = input<PointerLabTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const lab = this.state();
    if (!lab) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(lab.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(lab.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: I18N_KEY.features.algorithms.tracePanels.numberLab.iterationLabel, value: lab.iteration },
    ];
    if (lab.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(lab.resultLabel), kind: 'math', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: POINTER_KEYS.decisionLabel, value: toTraceValue(lab.decisionLabel), kind: 'math', wide: true });
    return facts;
  });

  protected readonly pointerChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.pointers ?? []).map((pointer) => ({
      id: pointer.id,
      label: `${pointer.label} = ${pointer.index}`,
      kind: 'math',
      tone: POINTER_TONES[pointer.tone],
    })),
  );

  protected readonly statFacts = computed<readonly TraceFact[]>(() =>
    (this.state()?.stats ?? []).map((stat, index) => ({
      id: `stat-${index}`,
      label: stat.label,
      value: toTraceValue(stat.value),
      kind: 'math',
      tone: STAT_TONES[stat.tone],
    })),
  );
}
