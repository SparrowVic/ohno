import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { closestPairOfPointsGenerator } from '../../algorithms/closest-pair-of-points';
import { ClosestPairStepState, isClosestPairState } from '../../models/geometry';
import { closestPairView, closestReadout, closestTrailRows } from './closest-pair-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const POINTS = [
  { x: 10, y: 20 },
  { x: 22, y: 64 },
  { x: 35, y: 40 },
  { x: 48, y: 12 },
  { x: 52, y: 80 },
  { x: 61, y: 44 },
  { x: 63, y: 47 },
  { x: 78, y: 70 },
  { x: 90, y: 30 },
];

function states(): ClosestPairStepState[] {
  return [...closestPairOfPointsGenerator({ points: POINTS })].map((step) => step.geometry).filter(isClosestPairState);
}

describe('closest-pair-display.utils', () => {
  it('finds the best pair and reports it on the last step', () => {
    const last = states().at(-1)!;
    const readout = closestReadout(last);
    expect(readout.caption).toBe('P5 · P6');
    expect(readout.tone).toBe('lime');
    expect(readout.verdict).toBe(GEO.verdict.closestFound);
  });

  it('draws candidate pairs dashed cyan with a distance chip', () => {
    const state = states().find((entry) => entry.pairLines.some((line) => line.tone === 'candidate'))!;
    const view = closestPairView(state, BOX);
    const candidate = view.pairs.find((pair) => pair.tone === 'cyan')!;
    expect(candidate.dashed).toBe(true);
    expect(candidate.chipWidth).toBeGreaterThan(0);
    expect(view.points.filter((point) => point.current)).toHaveLength(1);
  });

  it('ends the recursion rack with the region row', () => {
    const state = states().find((entry) => entry.trail.length > 2)!;
    const rows = closestTrailRows(state);
    expect(rows.at(-1)!.lead).toBe(GEO.closestPair.region);
    expect(rows.filter((row) => row.current)).toHaveLength(1);
  });

  it('keeps bands and dividers inside the plot', () => {
    for (const state of states()) {
      const view = closestPairView(state, BOX);
      for (const band of view.bands) expect(band.x + band.width).toBeLessThanOrEqual(BOX.width);
      for (const divider of view.dividers) expect(divider.x).toBeLessThanOrEqual(BOX.width);
    }
  });
});
