import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { halfPlaneIntersectionGenerator } from '../../algorithms/half-plane-intersection';
import { HalfPlaneIntersectionStepState, isHalfPlaneIntersectionState } from '../../models/geometry';
import { labelBox, overlapArea } from '../geo-canvas/plane-display.utils';
import { clipLineToBounds, halfPlaneReadout, halfPlaneView } from './half-plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const CONSTRAINTS = [
  { start: { x: 10, y: 20 }, end: { x: 90, y: 20 } },
  { start: { x: 80, y: 10 }, end: { x: 80, y: 90 } },
  { start: { x: 90, y: 80 }, end: { x: 10, y: 80 } },
  { start: { x: 20, y: 90 }, end: { x: 20, y: 10 } },
];

function states(): HalfPlaneIntersectionStepState[] {
  return [...halfPlaneIntersectionGenerator({ constraints: CONSTRAINTS })]
    .map((step) => step.geometry)
    .filter(isHalfPlaneIntersectionState);
}

describe('half-plane-display.utils', () => {
  it('clips an infinite boundary to the plane bounds', () => {
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100, step: 10 };
    const clipped = clipLineToBounds({ x: 10, y: 50 }, { x: 20, y: 50 }, bounds)!;
    expect(clipped[0].x).toBeCloseTo(0);
    expect(clipped[1].x).toBeCloseTo(100);
    expect(clipLineToBounds({ x: 1, y: 1 }, { x: 1, y: 1 }, bounds)).toBeNull();
    expect(clipLineToBounds({ x: 0, y: 200 }, { x: 10, y: 200 }, bounds)).toBeNull();
  });

  it('ends with a lime result region and an area readout', () => {
    const last = states().at(-1)!;
    const view = halfPlaneView(last, BOX);
    expect(view.regions.some((region) => region.tone === 'lime' && region.strong)).toBe(true);
    expect(halfPlaneReadout(last).verdict).toBe(GEO.verdict.regionDone);
    expect(view.readout.value).not.toBe('—');
  });

  it('highlights the active constraint in cyan', () => {
    const state = states().find((entry) => entry.constraints.some((constraint) => constraint.tone === 'active'))!;
    const view = halfPlaneView(state, BOX);
    expect(view.constraints.filter((constraint) => constraint.tone === 'cyan')).toHaveLength(1);
    expect(view.constraintRows.filter((row) => row.current)).toHaveLength(1);
  });

  it('reports an empty region in red', () => {
    const empty = { ...states().at(-1)!, status: 'empty' as const };
    expect(halfPlaneReadout(empty)).toMatchObject({ value: '0', tone: 'red', led: 'red' });
  });

  it('never stacks two vertex ids on each other', () => {
    for (const state of states()) {
      const boxes = halfPlaneView(state, BOX).vertices.map((vertex) => labelBox(vertex.x, vertex.y, vertex.label, vertex.labelOffset));
      boxes.forEach((box, index) => boxes.slice(index + 1).forEach((other) => expect(overlapArea(box, other)).toBe(0)));
    }
  });
});
