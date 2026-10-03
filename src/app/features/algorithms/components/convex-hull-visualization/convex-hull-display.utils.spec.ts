import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { convexHullGenerator } from '../../algorithms/convex-hull';
import { ConvexHullStepState, isConvexHullState } from '../../models/geometry';
import { convexHullView, hullCandidateId, hullReadout, hullRejectedIds, hullStackRows } from './convex-hull-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const POINTS = [
  { x: 50, y: 8 },
  { x: 88, y: 18 },
  { x: 92, y: 52 },
  { x: 76, y: 62 },
  { x: 56, y: 70 },
  { x: 30, y: 60 },
  { x: 12, y: 30 },
  { x: 40, y: 34 },
  { x: 60, y: 40 },
];

function states(): ConvexHullStepState[] {
  return [...convexHullGenerator({ points: POINTS })].map((step) => step.geometry).filter(isConvexHullState);
}

describe('convex-hull-display.utils', () => {
  it('shows the check triple, a lime stack path and a single current point while checking', () => {
    const state = states().find((entry) => entry.phase === 'checking' && entry.turnCheck !== null)!;
    const view = convexHullView(state, BOX);
    expect(view.checkPath).not.toBeNull();
    expect(view.points.filter((point) => point.current)).toHaveLength(1);
    expect(view.points.find((point) => point.current)!.id).toBe(hullCandidateId(state));
    expect(view.points.find((point) => point.current)!.tone).toBe('cyan');
    expect(view.stackRows[0]!.lead).toBe(I18N_KEY.features.algorithms.display.racks.candidate);
  });

  it('gives the readout a signed cross product and a verdict', () => {
    const checking = states().filter((entry) => entry.crossProduct !== null);
    const left = checking.find((entry) => (entry.crossProduct ?? 0) > 0)!;
    expect(hullReadout(left).value.startsWith('+')).toBe(true);
    expect(hullReadout(left).verdict).toBe(GEO.verdict.keep);
    const right = checking.find((entry) => (entry.crossProduct ?? 0) < 0);
    if (right) expect(hullReadout(right).verdict).toBe(GEO.verdict.popRight);
  });

  it('closes the hull polygon on the last step and marks interior points rejected', () => {
    const last = states().at(-1)!;
    const view = convexHullView(last, BOX);
    expect(last.phase).toBe('complete');
    expect(view.hullPolygon).not.toBeNull();
    expect(view.stackPath).toBeNull();
    expect(hullRejectedIds(last).has(7)).toBe(true);
    expect(view.points.find((point) => point.id === 7)!.rejected).toBe(true);
    expect(hullReadout(last).verdict).toBe(GEO.verdict.hullClosed);
  });

  it('lists the stack top first with the pivot at the bottom', () => {
    const state = states().find((entry) => entry.stackIds.length >= 3 && entry.turnCheck === null)!;
    const rows = hullStackRows(state);
    expect(rows.at(-1)!.accent).toBe('violet');
    expect(rows[0]!.value).toBe(String(state.stackIds.at(-1)));
  });

  it('keeps every point inside the box', () => {
    for (const state of states()) {
      for (const point of convexHullView(state, BOX).points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(BOX.width);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(BOX.height);
      }
    }
  });
});
