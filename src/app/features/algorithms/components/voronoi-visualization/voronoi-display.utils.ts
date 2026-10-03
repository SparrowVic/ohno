import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { VoronoiDiagramStepState } from '../../models/geometry';
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
  planePoints,
  project,
  projectY,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const VORONOI_FRAME = [
  { x: 4, y: 4 },
  { x: 96, y: 96 },
];

export interface VoronoiCellView {
  readonly id: string;
  readonly points: string;
  readonly active: boolean;
}

export interface VoronoiSiteView {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly tone: GeoTone;
  readonly current: boolean;
}

export interface VoronoiSweepView {
  readonly y: number;
  readonly x1: number;
  readonly x2: number;
  readonly label: TranslatableText;
}

export interface VoronoiView {
  readonly grid: PlaneGrid;
  readonly cells: readonly VoronoiCellView[];
  readonly sites: readonly VoronoiSiteView[];
  readonly sweep: VoronoiSweepView | null;
  readonly eventRows: readonly GeoRackRow[];
  readonly eventMeta: string;
  readonly readout: GeoReadoutView;
}

export function voronoiSettledIds(state: VoronoiDiagramStepState): ReadonlySet<number> {
  return new Set(state.cells.map((cell) => Number(cell.id.replace('cell-', ''))));
}

export function voronoiReadout(state: VoronoiDiagramStepState): GeoReadoutView {
  const total = state.points.length;
  const base = {
    title: GEO.closedCells,
    caption: state.sweepY === null || state.phase === 'complete' ? null : i18nText(GEO.sweepY, { value: formatNumber(state.sweepY) }),
    value: `${state.closedCells}/${total}`,
    tone: (state.closedCells > 0 ? 'lime' : 'dim') as GeoTone,
  };
  const site = state.activeSiteId;
  if (state.phase === 'complete') return { ...base, verdict: i18nText(GEO.verdict.diagramDone, { count: total }), led: 'lime' };
  if (state.phase === 'site' && site !== null) return { ...base, verdict: i18nText(GEO.verdict.siteReached, { site: `P${site}` }), led: 'cyan' };
  if (state.phase === 'cell' && site !== null) return { ...base, verdict: i18nText(GEO.verdict.cellClosed, { site: `P${site}` }), led: 'lime' };
  return { ...base, verdict: GEO.verdict.waiting, led: null };
}

export function voronoiView(state: VoronoiDiagramStepState, box: PlaneBox): VoronoiView {
  const frame = planeFrame(planeBounds([...state.points, ...VORONOI_FRAME]), box);
  const settled = voronoiSettledIds(state);
  const byId = new Map(state.points.map((point) => [point.id, point]));
  const live = state.sweepY !== null && state.phase !== 'complete';
  return {
    grid: planeGrid(frame),
    cells: state.cells
      .filter((cell) => cell.vertices.length >= 3)
      .map((cell) => ({ id: cell.id, points: planePoints(frame, cell.vertices), active: cell.tone === 'cell-active' })),
    sites: state.points.map((point) => {
      const pixel = project(frame, point);
      const active = point.id === state.activeSiteId;
      return { id: point.id, x: pixel.x, y: pixel.y, tone: active ? 'cyan' : settled.has(point.id) ? 'lime' : 'slate', current: active };
    }),
    sweep: live
      ? {
          y: Math.min(frame.top + frame.plotHeight, Math.max(frame.top, projectY(frame, state.sweepY ?? 0))),
          x1: frame.left,
          x2: frame.left + frame.plotWidth,
          label: i18nText(GEO.sweepY, { value: formatNumber(state.sweepY ?? 0) }),
        }
      : null,
    eventRows: eventRows(
      state.events,
      (event) => event.label,
      (event) => {
        const point = byId.get(Number(event.id.replace('site-', '')));
        return point ? formatNumber(point.y) : null;
      },
    ),
    eventMeta: eventProgress(state.events),
    readout: voronoiReadout(state),
  };
}
