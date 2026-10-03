import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { CallStackLabTraceState } from '../../models/call-stack-lab';

const STACK_KEYS = I18N_KEY.features.algorithms.tracePanels.callStackLab;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

type LocalTone = CallStackLabTraceState['frames'][number]['locals'][number]['tone'];
type StatTone = CallStackLabTraceState['stats'][number]['tone'];

const LOCAL_TONES: Readonly<Record<LocalTone, TraceTone | null>> = {
  default: null,
  arg: 'violet',
  result: 'lime',
  active: 'cyan',
};

const STAT_TONES: Readonly<Record<StatTone, TraceTone>> = {
  info: 'cyan',
  accent: 'violet',
  success: 'lime',
  warning: 'amber',
  danger: 'red',
};

@Component({
  selector: 'app-call-stack-lab-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './call-stack-lab-trace-panel.html',
  styleUrl: './call-stack-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallStackLabTracePanel {
  protected readonly keys = STACK_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<CallStackLabTraceState | null>(null);

  protected readonly activeFrame = computed(() => {
    const frames = this.state()?.frames ?? [];
    return frames.length > 0 ? frames[frames.length - 1] : null;
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const stack = this.state();
    if (!stack) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(stack.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(stack.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: STACK_KEYS.iterationLabel, value: stack.iteration },
    ];
    if (stack.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(stack.resultLabel), kind: 'math', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: STACK_KEYS.decisionLabel, value: toTraceValue(stack.decisionLabel), kind: 'math', wide: true });
    return facts;
  });

  protected readonly frameFacts = computed<readonly TraceFact[]>(() => {
    const frame = this.activeFrame();
    if (!frame) return [];
    return [{ id: 'title', label: STACK_KEYS.activeLabel, value: frame.title, kind: 'math', wide: true, tone: 'cyan' }];
  });

  protected readonly localChips = computed<readonly TraceChip[]>(() =>
    (this.activeFrame()?.locals ?? []).map((local) => ({
      id: local.label,
      label: `${local.label} = ${local.value}`,
      kind: 'math',
      tone: LOCAL_TONES[local.tone],
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

  protected readonly returnChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.recentReturns ?? []).map((entry) => ({
      id: entry.id,
      label: `${entry.title} → ${entry.returnValue}`,
      kind: 'math',
      tone: 'lime',
    })),
  );
}
