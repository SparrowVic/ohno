import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { ConvexHullStepState, GeometryPoint } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { formatNumber, formatSigned } from '../geo-canvas/plane-display.utils';

const TRACE = I18N_KEY.features.algorithms.tracePanels.geometry;
const PHASES = I18N_KEY.features.algorithms.visualizations.convexHull.phases;

const PHASE_KEYS: Readonly<Record<string, string>> = {
  init: PHASES.init,
  pivot: PHASES.pivot,
  sort: PHASES.sort,
  'init-stack': PHASES.initStack,
  checking: PHASES.checking,
  pop: PHASES.pop,
  push: PHASES.push,
  complete: PHASES.complete,
};

@Component({
  selector: 'app-geometry-trace-panel',
  imports: [TranslocoPipe, MathText, SegmentedPanel, SegmentedPanelSection],
  templateUrl: './geometry-trace-panel.html',
  styleUrl: './geometry-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeometryTracePanel {
  protected readonly TRACE = TRACE;
  protected readonly COMMON = I18N_KEY.features.algorithms.tracePanels.common;

  readonly state = input<ConvexHullStepState | null>(null);
  readonly crossProductFormula =
    '\\operatorname{cross}\\left(A, B, C\\right) = \\left(B-A\\right) \\times \\left(C-A\\right)';

  readonly legendItems = [
    { tone: 'pivot', label: TRACE.legend.pivot },
    { tone: 'sorted', label: TRACE.legend.sorted },
    { tone: 'checking', label: TRACE.legend.checking },
    { tone: 'stack', label: TRACE.legend.stack },
    { tone: 'hull', label: TRACE.legend.hull },
    { tone: 'rejected', label: TRACE.legend.rejected },
  ] as const;

  readonly stackPoints = computed<readonly (GeometryPoint | undefined)[]>(() => {
    const s = this.state();
    if (!s) return [];
    return s.stackIds.map((id) => s.points.find((p) => p.id === id));
  });

  readonly turnPoints = computed(() => {
    const s = this.state();
    if (!s?.turnCheck) return null;
    const [a, b, c] = s.turnCheck;
    return {
      a: s.points.find((p) => p.id === a),
      b: s.points.find((p) => p.id === b),
      c: s.points.find((p) => p.id === c),
    };
  });

  readonly turnSlots = computed(() => {
    const turn = this.turnPoints();
    return [
      { key: 'A', role: TRACE.roles.secondFromTop, point: turn?.a, tone: 'A' as const },
      { key: 'B', role: TRACE.roles.stackTop, point: turn?.b, tone: 'B' as const },
      { key: 'C', role: TRACE.roles.candidate, point: turn?.c, tone: 'C' as const },
    ];
  });

  readonly turnVerdict = computed(() => {
    const cp = this.state()?.crossProduct;
    if (cp === null || cp === undefined) return null;
    if (cp > 0) return { text: TRACE.verdict.leftTurn, action: TRACE.actions.push, tone: 'good' as const };
    if (cp === 0) return { text: TRACE.verdict.collinear, action: TRACE.actions.pop, tone: 'bad' as const };
    return { text: TRACE.verdict.rightTurn, action: TRACE.actions.pop, tone: 'bad' as const };
  });

  readonly crossText = computed(() => {
    const cp = this.state()?.crossProduct;
    return cp === null || cp === undefined ? '—' : formatSigned(cp, 2);
  });

  readonly showTurnDetails = computed(() => {
    switch (this.state()?.phase ?? '') {
      case 'checking':
      case 'pop':
      case 'push':
      case 'complete':
        return true;
      default:
        return false;
    }
  });

  readonly pointCount = computed(() => this.state()?.points.length ?? 0);
  readonly hullCount = computed(() => this.state()?.stackIds.length ?? 0);
  readonly rejectedCount = computed(
    () => this.state()?.points.filter((p) => p.status === 'rejected').length ?? 0,
  );

  readonly phaseKey = computed(() => PHASE_KEYS[this.state()?.phase ?? ''] ?? null);

  fmt(val: number | undefined): string {
    return val !== undefined ? formatNumber(val) : '—';
  }
}
