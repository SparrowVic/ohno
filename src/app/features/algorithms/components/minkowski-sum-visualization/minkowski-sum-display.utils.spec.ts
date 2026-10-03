import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { minkowskiSumGenerator } from '../../algorithms/minkowski-sum';
import { MinkowskiSumStepState, isMinkowskiSumState } from '../../models/geometry';
import { planeBounds } from '../geo-canvas/plane-display.utils';
import { labelAnchor, minkowskiExtent, minkowskiReadout, minkowskiSumView, vectorValue } from './minkowski-sum-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const SCENARIO = {
  obstacle: [
    { x: 30, y: 30 },
    { x: 60, y: 30 },
    { x: 60, y: 55 },
    { x: 30, y: 55 },
  ],
  robot: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 8 },
  ],
};

function states(): MinkowskiSumStepState[] {
  return [...minkowskiSumGenerator(SCENARIO)].map((step) => step.geometry).filter(isMinkowskiSumState);
}

describe('minkowski-sum-display.utils', () => {
  it('keeps the same plane bounds on every step', () => {
    const bounds = states().map((state) => JSON.stringify(planeBounds(minkowskiExtent(state))));
    expect(new Set(bounds).size).toBe(1);
  });

  it('grows a lime path with one current vertex while merging', () => {
    const merge = states().filter((state) => state.phase === 'merge');
    const view = minkowskiSumView(merge[1]!, BOX);
    expect(view.path).not.toBeNull();
    expect(view.vertices.filter((vertex) => vertex.current)).toHaveLength(1);
    expect(minkowskiReadout(merge[1]!).value).toBe(`${merge[1]!.mergedEdgeCount}/${merge[1]!.totalEdges}`);
  });

  it('closes the sum as a strong lime polygon', () => {
    const last = states().at(-1)!;
    const view = minkowskiSumView(last, BOX);
    expect(view.shapes.find((shape) => shape.id === 'result')).toMatchObject({ tone: 'lime', strong: true });
    expect(view.vertices).toEqual([]);
    expect(minkowskiReadout(last).verdict).toBe(GEO.verdict.sumClosed);
  });

  it('anchors shape labels on the topmost vertex', () => {
    expect(labelAnchor([{ x: 0, y: 0 }, { x: 4, y: 9 }, { x: 2, y: 9 }])).toEqual({ x: 2, y: 9 });
  });

  it('prints edge vectors with a typographic minus', () => {
    expect(vectorValue({ id: 'a', label: 'A1', dx: -5, dy: 8, tone: 'shape-a' })).toBe('−5, 8');
  });
});
