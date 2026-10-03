import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { ScratchpadLabTraceState, ScratchpadLine, ScratchpadMarginTone } from '../../models/scratchpad-lab';

const PAD_KEYS = I18N_KEY.features.algorithms.tracePanels.scratchpadLab;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const MARGIN_TONES: Readonly<Record<ScratchpadMarginTone, TraceTone>> = {
  invariant: 'violet',
  hint: 'amber',
  warning: 'red',
  success: 'lime',
};

const HISTORY_COLUMNS: readonly TraceColumn[] = [
  { id: 'marker', header: PAD_KEYS.markerColumn, kind: 'math', width: '56px' },
  { id: 'content', header: PAD_KEYS.lineColumn, kind: 'math' },
];

function lineTone(line: ScratchpadLine): TraceTone | null {
  if (line.state === 'current') return 'cyan';
  if (line.kind === 'decision') return 'pink';
  if (line.kind === 'result') return 'lime';
  return null;
}

@Component({
  selector: 'app-scratchpad-lab-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './scratchpad-lab-trace-panel.html',
  styleUrl: './scratchpad-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadLabTracePanel {
  protected readonly keys = PAD_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly historyColumns = HISTORY_COLUMNS;

  readonly state = input<ScratchpadLabTraceState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const pad = this.state();
    if (!pad) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(pad.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(pad.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: PAD_KEYS.iterationLabel, value: pad.iteration },
    ];
    if (pad.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(pad.resultLabel), kind: 'math', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: PAD_KEYS.decisionLabel, value: toTraceValue(pad.decisionLabel), kind: 'math', wide: true });
    return facts;
  });

  protected readonly currentFacts = computed<readonly TraceFact[]>(() => {
    const lines = this.state()?.lines ?? [];
    const line = lines[lines.length - 1];
    if (!line) return [];
    const facts: TraceFact[] = [
      {
        id: 'line',
        label: line.marker ?? PAD_KEYS.currentLineLabel,
        value: toTraceValue(line.content),
        kind: 'math',
        wide: true,
        tone: 'cyan',
      },
    ];
    if (line.annotation) {
      facts.push({ id: 'annotation', label: COMMON_KEYS.watchLabel, value: toTraceValue(line.annotation), kind: 'math', wide: true });
    }
    return facts;
  });

  protected readonly marginChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.margins ?? []).map((margin) => ({
      id: margin.id,
      label: toTraceValue(margin.text),
      kind: 'math',
      tone: MARGIN_TONES[margin.tone],
    })),
  );

  protected readonly historyRows = computed<readonly TraceRow[]>(() =>
    (this.state()?.lines ?? [])
      .filter((line) => line.kind !== 'divider')
      .map((line) => ({
        id: line.id,
        tone: lineTone(line),
        cells: { marker: line.marker, content: toTraceValue(line.content) },
      })),
  );
}
