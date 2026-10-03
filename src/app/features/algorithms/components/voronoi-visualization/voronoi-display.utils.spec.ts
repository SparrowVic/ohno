import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { voronoiDiagramGenerator } from '../../algorithms/voronoi-diagram';
import { VoronoiDiagramStepState, isVoronoiDiagramState } from '../../models/geometry';
import { voronoiReadout, voronoiSettledIds, voronoiView } from './voronoi-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const POINTS = [
  { x: 20, y: 80 },
  { x: 70, y: 70 },
  { x: 40, y: 45 },
  { x: 80, y: 25 },
  { x: 15, y: 20 },
];

function states(): VoronoiDiagramStepState[] {
  return [...voronoiDiagramGenerator({ points: POINTS })].map((step) => step.geometry).filter(isVoronoiDiagramState);
}

describe('voronoi-display.utils', () => {
  it('lights the active site cyan with the only drop shadow', () => {
    const state = states().find((entry) => entry.phase === 'site')!;
    const view = voronoiView(state, BOX);
    expect(view.sites.filter((site) => site.current)).toHaveLength(1);
    expect(view.sites.find((site) => site.current)!.tone).toBe('cyan');
    expect(view.sweep).not.toBeNull();
    expect(voronoiReadout(state).verdict).toMatchObject({ key: GEO.verdict.siteReached });
  });

  it('counts settled cells from their ids', () => {
    const state = states().find((entry) => entry.phase === 'cell')!;
    expect(voronoiSettledIds(state).size).toBe(state.closedCells);
  });

  it('closes every cell at the end', () => {
    const last = states().at(-1)!;
    const view = voronoiView(last, BOX);
    expect(view.cells).toHaveLength(POINTS.length);
    expect(view.sweep).toBeNull();
    expect(view.readout.value).toBe(`${POINTS.length}/${POINTS.length}`);
  });
});
