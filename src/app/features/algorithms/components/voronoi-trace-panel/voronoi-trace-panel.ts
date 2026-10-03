import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { VoronoiDiagramStepState } from '../../models/geometry';
import { formatCoordPair, geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const VORONOI_KEYS = I18N_KEY.features.algorithms.tracePanels.voronoi;

@Component({
  selector: 'app-voronoi-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './voronoi-trace-panel.html',
  styleUrl: './voronoi-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiTracePanel {
  protected readonly keys = VORONOI_KEYS;

  readonly state = input<VoronoiDiagramStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return [
      { id: 'cell', label: VORONOI_KEYS.cellLabel, value: geo.currentCellLabel, kind: 'mono', tone: 'cyan' },
      { id: 'closed', label: VORONOI_KEYS.closedCellsLabel, value: geo.closedCells, tone: 'lime' },
      {
        id: 'sweep',
        label: VORONOI_KEYS.sweepYLabel,
        value: geo.sweepY !== null ? geo.sweepY.toFixed(1) : toTraceValue(VORONOI_KEYS.doneLabel),
      },
    ];
  });

  protected readonly siteFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    const site = geo?.points.find((point) => point.id === geo.activeSiteId) ?? null;
    return [
      {
        id: 'site',
        label: `P${site?.id ?? '—'}`,
        value: formatCoordPair(site?.x, site?.y),
        kind: 'mono',
        tone: site ? 'violet' : null,
      },
    ];
  });

  protected readonly eventChips = computed<readonly TraceChip[]>(() => geometryEventChips(this.state()?.events ?? []));
}
