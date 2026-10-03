import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { GeometryRect, SweepLineStepState } from '../../models/geometry';
import { sweepEventText } from '../geo-canvas/geometry-labels.utils';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  PlaneBox,
  PlaneGrid,
  eventProgress,
  eventRows,
  formatNumber,
  planeBounds,
  planeFrame,
  planeGrid,
  project,
  projectX,
  projectY,
  rackRow,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface SweepRectView {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tone: GeoTone;
  readonly strong: boolean;
  readonly dashed: boolean;
}

export interface SweepSpanView {
  readonly id: string;
  readonly y1: number;
  readonly y2: number;
}

export interface SweepCursorView {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly label: TranslatableText;
}

export interface SweepLineView {
  readonly grid: PlaneGrid;
  readonly covered: { readonly x: number; readonly y: number; readonly width: number; readonly height: number } | null;
  readonly rects: readonly SweepRectView[];
  readonly sweep: SweepCursorView | null;
  readonly spans: readonly SweepSpanView[];
  readonly eventRows: readonly GeoRackRow[];
  readonly eventMeta: string;
  readonly spanRows: readonly GeoRackRow[];
  readonly readout: GeoReadoutView;
}

const RECT_LOOK: Readonly<Record<GeometryRect['tone'], Pick<SweepRectView, 'tone' | 'strong' | 'dashed'>>> = {
  pending: { tone: 'slate', strong: false, dashed: true },
  active: { tone: 'cyan', strong: false, dashed: false },
  focus: { tone: 'pink', strong: true, dashed: false },
  done: { tone: 'lime', strong: false, dashed: false },
};

export function sweepEventRect(label: string): string | null {
  const match = label.match(/^(?:Enter|Leave) (R\d+)$/);
  return match ? match[1]! : null;
}

export function sweepReadout(state: SweepLineStepState): GeoReadoutView {
  const base = {
    title: GEO.coveredArea,
    caption: state.sweepX === null || state.phase === 'complete' ? null : i18nText(GEO.sweepX, { value: formatNumber(state.sweepX) }),
    value: formatNumber(state.coveredArea),
    tone: (state.coveredArea > 0 ? 'lime' : 'dim') as GeoTone,
  };
  const rect = sweepEventRect(state.currentEventLabel);
  if (state.phase === 'complete') return { ...base, verdict: GEO.verdict.areaDone, led: 'lime' };
  if (rect && state.currentEventLabel.startsWith('Enter')) return { ...base, verdict: i18nText(GEO.verdict.rectEnter, { rect }), led: 'cyan' };
  if (rect) return { ...base, verdict: i18nText(GEO.verdict.rectLeave, { rect }), led: 'pink' };
  return { ...base, verdict: GEO.verdict.waiting, led: null };
}

export function sweepSpanRows(state: SweepLineStepState): readonly GeoRackRow[] {
  return state.spans.map((span) =>
    rackRow({
      id: span.id,
      lead: `${formatNumber(span.y0)}–${formatNumber(span.y1)}`,
      value: formatNumber(span.y1 - span.y0),
      accent: 'lime',
    }),
  );
}

export function sweepLineView(state: SweepLineStepState, box: PlaneBox): SweepLineView {
  const coords = state.rectangles.flatMap((rect) => [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
  ]);
  const frame = planeFrame(planeBounds(coords), box);
  const right = frame.left + frame.plotWidth;
  const bottom = frame.top + frame.plotHeight;
  const sweepX = state.sweepX === null ? null : Math.min(right, Math.max(frame.left, projectX(frame, state.sweepX)));
  const live = sweepX !== null && state.phase !== 'complete';
  return {
    grid: planeGrid(frame),
    covered: sweepX === null ? null : { x: frame.left, y: frame.top, width: Math.max(0, sweepX - frame.left), height: frame.plotHeight },
    rects: state.rectangles.map((rect) => {
      const corner = project(frame, { x: rect.x, y: rect.y + rect.height });
      return {
        id: rect.id,
        label: rect.label ?? rect.id,
        x: corner.x,
        y: corner.y,
        width: Math.round(rect.width * frame.scale * 100) / 100,
        height: Math.round(rect.height * frame.scale * 100) / 100,
        ...RECT_LOOK[rect.tone],
      };
    }),
    sweep: live
      ? { x: sweepX, y1: frame.top, y2: bottom, label: i18nText(GEO.sweepX, { value: formatNumber(state.sweepX ?? 0) }) }
      : null,
    spans: live ? state.spans.map((span) => ({ id: span.id, y1: projectY(frame, span.y1), y2: projectY(frame, span.y0) })) : [],
    eventRows: eventRows(state.events, (event) => sweepEventText(event.label), (event) => formatNumber(event.x)),
    eventMeta: eventProgress(state.events),
    spanRows: sweepSpanRows(state),
    readout: sweepReadout(state),
  };
}
