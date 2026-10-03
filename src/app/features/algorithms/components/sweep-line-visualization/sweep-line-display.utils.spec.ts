import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { sweepLineGenerator } from '../../algorithms/sweep-line';
import { SweepLineStepState, isSweepLineState } from '../../models/geometry';
import { labelBox, overlapArea } from '../geo-canvas/plane-display.utils';
import { placeRectLabels, sweepEventRect, sweepLineView, sweepReadout, sweepSpanRows } from './sweep-line-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const RECTS = [
  { x: 10, y: 10, width: 30, height: 30 },
  { x: 25, y: 25, width: 30, height: 40 },
  { x: 70, y: 15, width: 20, height: 20 },
];

function states(): SweepLineStepState[] {
  return [...sweepLineGenerator({ rectangles: RECTS })].map((step) => step.geometry).filter(isSweepLineState);
}

describe('sweep-line-display.utils', () => {
  it('reads the rectangle from the event label', () => {
    expect(sweepEventRect('Enter R2')).toBe('R2');
    expect(sweepEventRect('boot')).toBeNull();
  });

  it('marks the event rectangle pink and draws the spans on the sweep', () => {
    const state = states().find((entry) => entry.phase === 'event' && entry.spans.length > 0)!;
    const view = sweepLineView(state, BOX);
    expect(view.rects.filter((rect) => rect.tone === 'pink')).toHaveLength(1);
    expect(view.sweep).not.toBeNull();
    expect(view.spans).toHaveLength(state.spans.length);
    expect(sweepSpanRows(state)).toHaveLength(state.spans.length);
    expect(sweepReadout(state).verdict).toMatchObject({ key: GEO.verdict.rectEnter });
  });

  it('reports the union area at the end without a sweep cursor', () => {
    const last = states().at(-1)!;
    const view = sweepLineView(last, BOX);
    expect(view.sweep).toBeNull();
    expect(view.readout.value).toBe('2275');
    expect(view.readout.verdict).toBe(GEO.verdict.areaDone);
  });

  it('moves a rectangle label out from under the sweep and its spans', () => {
    const rect = { x: 100, y: 50, width: 80, height: 60, label: 'R6' };
    const sweep = { x: 100, y: 0, width: 12, height: 300 };
    const [offset] = placeRectLabels([rect], [sweep], null);
    expect(overlapArea(labelBox(rect.x, rect.y, rect.label, offset!), sweep)).toBe(0);
  });

  it('keeps every live rectangle label clear of the sweep line', () => {
    for (const state of states()) {
      const view = sweepLineView(state, BOX);
      if (!view.sweep) continue;
      const lane = { x: view.sweep.x - 4, y: view.sweep.y1, width: 8, height: view.sweep.y2 - view.sweep.y1 };
      for (const rect of view.rects) {
        const box = labelBox(rect.labelX, rect.labelY, rect.label, { dx: 0, dy: 0, anchor: rect.labelAnchor });
        expect(overlapArea(box, lane), rect.id).toBe(0);
      }
    }
  });
});
