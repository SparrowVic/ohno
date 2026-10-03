import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { delaunayTriangulationGenerator } from '../../algorithms/delaunay-triangulation';
import { DelaunayTriangulationStepState, isDelaunayTriangulationState } from '../../models/geometry';
import { delaunayMeshIds, delaunayReadout, delaunayView } from './delaunay-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const POINTS = [
  { x: 20, y: 20 },
  { x: 80, y: 22 },
  { x: 50, y: 50 },
  { x: 25, y: 78 },
  { x: 78, y: 80 },
];

function states(): DelaunayTriangulationStepState[] {
  return [...delaunayTriangulationGenerator({ points: POINTS })]
    .map((step) => step.geometry)
    .filter(isDelaunayTriangulationState);
}

describe('delaunay-display.utils', () => {
  it('shows the tested triangle with its circumcircle and radius chip', () => {
    const state = states().find((entry) => entry.phase === 'circumcircle')!;
    const view = delaunayView(state, BOX);
    expect(view.triangles.filter((triangle) => triangle.current)).toHaveLength(1);
    expect(view.circles).toHaveLength(1);
    expect(view.circles[0]!.chip).toMatch(/^r = /);
    expect(view.points.filter((point) => point.tone === 'cyan')).toHaveLength(3);
    expect(delaunayReadout(state).verdict).toBe(GEO.verdict.circleEmpty);
  });

  it('collects mesh vertices from committed triangles only', () => {
    const state = states().find((entry) => entry.phase === 'commit')!;
    expect(delaunayMeshIds(state).size).toBeGreaterThanOrEqual(3);
  });

  it('finishes with the full mesh and no circle', () => {
    const last = states().at(-1)!;
    const view = delaunayView(last, BOX);
    expect(view.circles).toEqual([]);
    expect(view.edges.length).toBeGreaterThanOrEqual(last.triangleCount + 2);
    expect(delaunayReadout(last)).toMatchObject({ tone: 'lime', led: 'lime' });
  });
});
