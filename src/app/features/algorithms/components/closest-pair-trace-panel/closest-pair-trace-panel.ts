import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { ClosestPairStepState, GeometryPoint } from '../../models/geometry';

const PAIR_KEYS = I18N_KEY.features.algorithms.tracePanels.closestPair;
const GEOMETRY_KEYS = I18N_KEY.features.algorithms.tracePanels.geometry;

const PHASE_KEYS: Readonly<Record<string, I18nKey>> = {
  init: PAIR_KEYS.phases.init,
  sort: PAIR_KEYS.phases.sort,
  divide: PAIR_KEYS.phases.divide,
  base: PAIR_KEYS.phases.base,
  merge: PAIR_KEYS.phases.merge,
  strip: PAIR_KEYS.phases.strip,
  compare: PAIR_KEYS.phases.compare,
  'compare-strip': PAIR_KEYS.phases.compare,
  update: PAIR_KEYS.phases.update,
  complete: PAIR_KEYS.phases.complete,
};

const LEGEND_CHIPS: readonly TraceChip[] = [
  { id: 'left', label: toTraceValue(PAIR_KEYS.leftHalfLabel), tone: 'violet' },
  { id: 'right', label: toTraceValue(PAIR_KEYS.rightHalfLabel), tone: 'amber' },
  { id: 'strip', label: toTraceValue(PAIR_KEYS.stripCandidateLabel), tone: 'slate' },
  { id: 'current', label: toTraceValue(PAIR_KEYS.currentComparisonLabel), tone: 'cyan' },
  { id: 'best', label: toTraceValue(PAIR_KEYS.bestPairLabel), tone: 'lime' },
];

function formatDistance(value: number | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toFixed(2);
}

function formatCoord(point: GeometryPoint | undefined): string {
  return point ? `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})` : '(—, —)';
}

@Component({
  selector: 'app-closest-pair-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './closest-pair-trace-panel.html',
  styleUrl: './closest-pair-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosestPairTracePanel {
  protected readonly keys = PAIR_KEYS;
  protected readonly legendChips = LEGEND_CHIPS;

  readonly state = input<ClosestPairStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const phaseKey = PHASE_KEYS[geo.phase];
    return [
      { id: 'phase', label: PAIR_KEYS.phaseLabel, value: phaseKey ? toTraceValue(phaseKey) : geo.phase, kind: 'mono' },
      { id: 'best', label: PAIR_KEYS.bestLabel, value: formatDistance(geo.bestDistance), tone: 'lime' },
      { id: 'checks', label: PAIR_KEYS.checksLabel, value: geo.checkedPairs },
      { id: 'depth', label: PAIR_KEYS.depthLabel, value: geo.depth },
    ];
  });

  protected readonly regionFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return [
      { id: 'region', label: PAIR_KEYS.regionLabel, value: toTraceValue(geo.regionLabel), kind: 'mono' },
      {
        id: 'corridor',
        label: PAIR_KEYS.stripCorridorLabel,
        value: geo.stripWidth !== null ? `±${geo.stripWidth.toFixed(2)}` : toTraceValue(PAIR_KEYS.inactiveLabel),
        kind: 'mono',
      },
      { id: 'strip', label: PAIR_KEYS.stripPointsLabel, value: geo.points.filter((point) => point.status === 'strip').length },
      { id: 'split', label: PAIR_KEYS.splitXLabel, value: geo.midX !== null ? geo.midX.toFixed(1) : null },
    ];
  });

  protected readonly currentFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return this.pairFacts(
      geo.currentPair,
      geo.candidateDistance,
      'cyan',
      geo.currentPair ? PAIR_KEYS.activeComparisonLabel : PAIR_KEYS.waitingComparisonLabel,
    );
  });

  protected readonly bestFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return this.pairFacts(
      geo.bestPair,
      geo.bestDistance,
      'lime',
      geo.bestPair ? PAIR_KEYS.championPairLabel : PAIR_KEYS.noWinningPairLabel,
    );
  });

  protected readonly trailChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.trail ?? []).map((part, index) => ({ id: index, label: toTraceValue(part), tone: 'violet' })),
  );

  private pairFacts(
    pair: readonly [number, number] | null,
    distance: number | null | undefined,
    tone: TraceTone,
    note: I18nKey,
  ): readonly TraceFact[] {
    const points = this.state()?.points ?? [];
    const left = pair ? points.find((point) => point.id === pair[0]) : undefined;
    const right = pair ? points.find((point) => point.id === pair[1]) : undefined;
    return [
      { id: 'pair', label: PAIR_KEYS.pairLabel, value: `P${left?.id ?? '—'} · P${right?.id ?? '—'}`, kind: 'mono', tone: pair ? tone : null },
      { id: 'distance', label: PAIR_KEYS.distanceLabel, value: formatDistance(distance), tone: pair ? tone : null },
      { id: 'coords', label: GEOMETRY_KEYS.columns.coords, value: `${formatCoord(left)} ${formatCoord(right)}`, kind: 'mono', wide: true },
      { id: 'note', label: I18N_KEY.features.algorithms.tracePanels.common.statusLabel, value: toTraceValue(note), kind: 'text', wide: true },
    ];
  }
}
