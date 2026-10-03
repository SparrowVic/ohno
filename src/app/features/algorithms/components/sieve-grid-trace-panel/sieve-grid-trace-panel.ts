import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { SieveGridTraceState, SieveStatChip } from '../../models/sieve-grid';

const SIEVE_KEYS = I18N_KEY.features.algorithms.tracePanels.sieveGrid;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const STAT_TONES: Readonly<Record<SieveStatChip['tone'], TraceTone>> = {
  info: 'cyan',
  accent: 'violet',
  success: 'lime',
  warning: 'amber',
  danger: 'red',
};

@Component({
  selector: 'app-sieve-grid-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './sieve-grid-trace-panel.html',
  styleUrl: './sieve-grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SieveGridTracePanel {
  protected readonly keys = SIEVE_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<SieveGridTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const sieve = this.state();
    if (!sieve) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(sieve.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(sieve.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: SIEVE_KEYS.iterationLabel, value: sieve.iteration },
    ];
    if (sieve.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(sieve.resultLabel), kind: 'mono', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: SIEVE_KEYS.decisionLabel, value: toTraceValue(sieve.decisionLabel), kind: 'text', wide: true });
    return facts;
  });

  protected readonly pivotFacts = computed<readonly TraceFact[]>(() => {
    const sieve = this.state();
    if (!sieve) return [];
    return [
      { id: 'prime', label: 'p', value: sieve.activePrime, tone: 'violet' },
      { id: 'bound', label: '√n', value: sieve.bound },
      ...sieve.stats.map((stat, index) => ({
        id: `stat-${index}`,
        label: stat.label,
        value: toTraceValue(stat.value),
        tone: STAT_TONES[stat.tone],
      })),
    ];
  });

  protected readonly primeChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.state === 'prime' || cell.state === 'current-prime')
      .map((cell) => ({ id: cell.value, label: cell.value, tone: 'lime', active: cell.state === 'current-prime' })),
  );
}
