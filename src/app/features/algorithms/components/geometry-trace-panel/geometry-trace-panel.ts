import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { ConvexHullStepState, GeometryPoint } from '../../models/geometry';
import { formatNumber, formatSigned } from '../geo-canvas/plane-display.utils';

const TRACE = I18N_KEY.features.algorithms.tracePanels.geometry;
const COMMON = I18N_KEY.features.algorithms.tracePanels.common;
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

const TURN_PHASES = new Set(['checking', 'pop', 'push', 'complete']);

const TURN_COLUMNS: readonly TraceColumn[] = [
  { id: 'slot', header: TRACE.columns.vertex, kind: 'mono', width: '44px' },
  { id: 'point', header: TRACE.columns.point, kind: 'mono' },
  { id: 'role', header: TRACE.columns.role, kind: 'mono' },
  { id: 'coords', header: TRACE.columns.coords, kind: 'mono', align: 'end' },
];

const STACK_COLUMNS: readonly TraceColumn[] = [
  { id: 'point', header: TRACE.columns.point, kind: 'mono' },
  { id: 'coords', header: TRACE.columns.coords, kind: 'mono' },
  { id: 'tag', header: COMMON.statusLabel, kind: 'chips' },
];

const LEGEND_CHIPS: readonly TraceChip[] = [
  { id: 'pivot', label: toTraceValue(TRACE.legend.pivot), tone: 'violet' },
  { id: 'sorted', label: toTraceValue(TRACE.legend.sorted), tone: 'slate' },
  { id: 'checking', label: toTraceValue(TRACE.legend.checking), tone: 'cyan' },
  { id: 'stack', label: toTraceValue(TRACE.legend.stack), tone: 'amber' },
  { id: 'hull', label: toTraceValue(TRACE.legend.hull), tone: 'lime' },
  { id: 'rejected', label: toTraceValue(TRACE.legend.rejected), tone: 'pink' },
];

function coords(point: GeometryPoint | undefined): string {
  return point ? `(${formatNumber(point.x)}, ${formatNumber(point.y)})` : '—';
}

@Component({
  selector: 'app-geometry-trace-panel',
  imports: [MathText, OhnoEngraving, OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './geometry-trace-panel.html',
  styleUrl: './geometry-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeometryTracePanel {
  protected readonly TRACE = TRACE;
  protected readonly turnColumns = TURN_COLUMNS;
  protected readonly stackColumns = STACK_COLUMNS;
  protected readonly legendChips = LEGEND_CHIPS;
  protected readonly crossProductFormula =
    '\\operatorname{cross}\\left(A, B, C\\right) = \\left(B-A\\right) \\times \\left(C-A\\right)';

  readonly state = input<ConvexHullStepState | null>(null);

  protected readonly showTurnDetails = computed(() => TURN_PHASES.has(this.state()?.phase ?? ''));

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const phaseKey = PHASE_KEYS[geo.phase];
    return [
      { id: 'phase', label: COMMON.phaseLabel, value: phaseKey ? i18nText(phaseKey) : geo.phase || null, kind: 'mono' },
      { id: 'stack', label: TRACE.onStack, value: geo.stackIds.length, tone: 'amber' },
      { id: 'rejected', label: TRACE.rejected, value: geo.points.filter((point) => point.status === 'rejected').length, tone: 'pink' },
      { id: 'points', label: TRACE.totalPoints, value: geo.points.length },
    ];
  });

  protected readonly turnRows = computed<readonly TraceRow[]>(() => {
    const geo = this.state();
    const turn = geo?.turnCheck;
    const find = (id: number | undefined) => (id === undefined ? undefined : geo?.points.find((point) => point.id === id));
    const slots: readonly { key: string; role: string; point: GeometryPoint | undefined; tone: TraceTone }[] = [
      { key: 'A', role: TRACE.roles.secondFromTop, point: find(turn?.[0]), tone: 'amber' },
      { key: 'B', role: TRACE.roles.stackTop, point: find(turn?.[1]), tone: 'cyan' },
      { key: 'C', role: TRACE.roles.candidate, point: find(turn?.[2]), tone: 'pink' },
    ];
    return slots.map((slot) => ({
      id: slot.key,
      tone: slot.point ? slot.tone : null,
      dim: !slot.point,
      cells: {
        slot: slot.key,
        point: slot.point ? `P${slot.point.id}` : null,
        role: i18nText(slot.role),
        coords: coords(slot.point),
      },
    }));
  });

  protected readonly verdictFacts = computed<readonly TraceFact[]>(() => {
    const cp = this.state()?.crossProduct;
    const crossText = cp === null || cp === undefined ? '—' : formatSigned(cp, 2);
    const facts: TraceFact[] = [
      {
        id: 'cross',
        label: TRACE.crossCheck,
        value: i18nText(TRACE.crossValue, { value: crossText }),
        kind: 'mono',
        tone: cp === null || cp === undefined ? null : cp > 0 ? 'lime' : 'red',
      },
    ];
    if (cp === null || cp === undefined) {
      facts.push({ id: 'verdict', label: COMMON.decisionLabel, value: toTraceValue(TRACE.waiting), kind: 'text' });
      facts.push({ id: 'action', label: COMMON.statusLabel, value: toTraceValue(TRACE.standBy), kind: 'mono' });
      return facts;
    }
    const verdict = cp > 0 ? TRACE.verdict.leftTurn : cp === 0 ? TRACE.verdict.collinear : TRACE.verdict.rightTurn;
    const action = cp > 0 ? TRACE.actions.push : TRACE.actions.pop;
    facts.push(
      { id: 'verdict', label: COMMON.decisionLabel, value: toTraceValue(verdict), kind: 'mono' },
      { id: 'action', label: COMMON.statusLabel, value: toTraceValue(action), kind: 'mono', tone: cp > 0 ? 'lime' : 'pink' },
    );
    return facts;
  });

  protected readonly stackRows = computed<readonly TraceRow[]>(() => {
    const geo = this.state();
    if (!geo) return [];
    const points = geo.stackIds.map((id) => geo.points.find((point) => point.id === id));
    const lastIndex = points.length - 1;
    return points.map((point, index) => {
      const top = index === lastIndex;
      const base = index === 0 && points.length > 1;
      const tags: TraceChip[] = [];
      if (top) tags.push({ id: 'top', label: toTraceValue(TRACE.top), tone: 'cyan' });
      if (base) tags.push({ id: 'base', label: toTraceValue(TRACE.base), tone: 'violet' });
      return {
        id: `${index}-${point?.id ?? 'x'}`,
        tone: top ? 'cyan' : null,
        cells: { point: point ? `P${point.id}` : null, coords: coords(point), tag: tags },
      };
    });
  });
}
