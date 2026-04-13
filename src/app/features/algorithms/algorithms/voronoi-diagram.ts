import * as d3 from 'd3';

import {
  GeometryEventChip,
  GeometryPoint,
  GeometryPolygonRegion,
  PointStatus,
  VoronoiDiagramStepState,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface VoronoiDiagramScenario {
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

interface SiteRuntime {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly cell: readonly { readonly x: number; readonly y: number }[];
}

function normalizePolygon(polygon: readonly [number, number][]): readonly { readonly x: number; readonly y: number }[] {
  const result = polygon.map(([x, y]) => ({
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  }));
  const first = result[0];
  const last = result[result.length - 1];
  if (first && last && Math.abs(first.x - last.x) < 1e-6 && Math.abs(first.y - last.y) < 1e-6) {
    return result.slice(0, -1);
  }
  return result;
}

function buildEvents(sites: readonly SiteRuntime[], currentIndex: number): readonly GeometryEventChip[] {
  return sites.map((site, index) => ({
    id: `site-${site.id}`,
    label: `P${site.id}`,
    x: site.x,
    kind: 'start',
    tone: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'queued',
  }));
}

function buildPoints(sites: readonly SiteRuntime[], activeSiteId: number | null): readonly GeometryPoint[] {
  return sites.map((site) => ({
    id: site.id,
    x: site.x,
    y: site.y,
    status: (site.id === activeSiteId ? 'compare' : 'default') as PointStatus,
    sortIndex: null,
  }));
}

function makeStep(
  sites: readonly SiteRuntime[],
  settledSiteIds: ReadonlySet<number>,
  activeSiteId: number | null,
  currentIndex: number,
  sweepY: number | null,
  description: string,
  activeCodeLine: number,
  phase: string,
  currentCellLabel: string,
): SortStep {
  const cells: GeometryPolygonRegion[] = sites
    .filter((site) => settledSiteIds.has(site.id))
    .map((site) => ({
      id: `cell-${site.id}`,
      label: `Cell P${site.id}`,
      vertices: site.cell,
      tone: site.id === activeSiteId ? 'cell-active' : 'cell',
    }));

  const geometry: VoronoiDiagramStepState = {
    mode: 'voronoi-diagram',
    phase,
    points: buildPoints(sites, activeSiteId),
    cells,
    sweepY,
    events: buildEvents(sites, currentIndex),
    activeSiteId,
    closedCells: settledSiteIds.size,
    currentCellLabel,
  };

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 0,
    activeCodeLine,
    description,
    phase: 'idle',
    geometry,
  };
}

export function* voronoiDiagramGenerator(
  scenario: VoronoiDiagramScenario,
): Generator<SortStep> {
  const points = scenario.points.map((point) => [point.x, point.y] as [number, number]);
  const delaunay = d3.Delaunay.from(points);
  const voronoi = delaunay.voronoi([4, 4, 96, 96]);

  const sites: SiteRuntime[] = scenario.points
    .map((point, index) => {
      const polygon = voronoi.cellPolygon(index);
      return {
        id: index,
        x: point.x,
        y: point.y,
        cell: normalizePolygon(polygon ?? []),
      };
    })
    .sort((left, right) => right.y - left.y);

  yield makeStep(
    sites,
    new Set<number>(),
    null,
    -1,
    100,
    'Scatter the seed points and prepare the descending sweep line.',
    1,
    'init',
    'seed field',
  );

  const settled = new Set<number>();
  for (let index = 0; index < sites.length; index++) {
    const site = sites[index]!;

    yield makeStep(
      sites,
      settled,
      site.id,
      index,
      site.y,
      `Sweep reaches P${site.id}; its Voronoi influence front becomes active.`,
      3,
      'site',
      `site P${site.id}`,
    );

    settled.add(site.id);
    yield makeStep(
      sites,
      settled,
      site.id,
      index + 1,
      site.y,
      `Cell P${site.id} crystallizes from the bisector constraints around the site.`,
      4,
      'cell',
      `cell P${site.id}`,
    );
  }

  yield makeStep(
    sites,
    new Set(sites.map((site) => site.id)),
    null,
    sites.length,
    0,
    `Voronoi diagram complete: ${sites.length} cells partition the plane.`,
    5,
    'complete',
    'all cells',
  );
}
