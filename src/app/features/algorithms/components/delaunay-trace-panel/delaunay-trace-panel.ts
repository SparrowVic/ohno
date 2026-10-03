import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact } from '../../../../shared/instrument/trace/trace.types';
import { DelaunayTriangulationStepState } from '../../models/geometry';
import { triangleVerticesText } from '../geo-canvas/geometry-labels.utils';
import { formatCoordPair, geometryEventChips } from '../geo-canvas/geometry-trace.utils';

const DELAUNAY_KEYS = I18N_KEY.features.algorithms.tracePanels.delaunay;

@Component({
  selector: 'app-delaunay-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './delaunay-trace-panel.html',
  styleUrl: './delaunay-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayTracePanel {
  protected readonly keys = DELAUNAY_KEYS;

  readonly state = input<DelaunayTriangulationStepState | null>(null);

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    return [
      { id: 'triangle', label: DELAUNAY_KEYS.triangleLabel, value: triangleVerticesText(geo.activeTriangleLabel), kind: 'mono', tone: 'cyan' },
      { id: 'committed', label: DELAUNAY_KEYS.committedLabel, value: geo.triangleCount, tone: 'lime' },
    ];
  });

  protected readonly circleFacts = computed<readonly TraceFact[]>(() => {
    const circle = this.state()?.circles[0] ?? null;
    return [
      { id: 'center', label: DELAUNAY_KEYS.centerLabel, value: formatCoordPair(circle?.cx, circle?.cy), kind: 'mono', tone: circle ? 'amber' : null },
      { id: 'radius', label: DELAUNAY_KEYS.radiusLabel, value: circle ? circle.r.toFixed(1) : null },
    ];
  });

  protected readonly eventChips = computed<readonly TraceChip[]>(() =>
    geometryEventChips(this.state()?.events ?? [], (event) => triangleVerticesText(event.label)),
  );
}
