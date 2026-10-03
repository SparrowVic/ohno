import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { lineIntersectionGenerator } from '../../algorithms/line-intersection';
import { LineIntersectionStepState, isLineIntersectionState } from '../../models/geometry';
import { eventSegment, lineIntersectionView, lineOrderRows, lineReadout } from './line-intersection-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const BOX = { width: 640, height: 420 };
const SEGMENTS = [
  { x1: 10, y1: 10, x2: 80, y2: 70 },
  { x1: 15, y1: 70, x2: 85, y2: 15 },
  { x1: 30, y1: 40, x2: 95, y2: 45 },
];

function states(): LineIntersectionStepState[] {
  return [...lineIntersectionGenerator({ segments: SEGMENTS })].map((step) => step.geometry).filter(isLineIntersectionState);
}

describe('line-intersection-display.utils', () => {
  it('reads the segment from start and end event ids', () => {
    expect(eventSegment('start-2')).toBe('S2');
    expect(eventSegment('end-0')).toBe('S0');
    expect(eventSegment('x-1')).toBeNull();
  });

  it('reports a found crossing with its coordinates', () => {
    const state = states().find((entry) => entry.phase === 'intersection')!;
    const readout = lineReadout(state);
    expect(readout.led).toBe('lime');
    expect(readout.verdict).toMatchObject({ key: GEO.verdict.crossFound });
    const view = lineIntersectionView(state, BOX);
    expect(view.crossings.filter((crossing) => crossing.current)).toHaveLength(1);
    expect(view.sweep).not.toBeNull();
  });

  it('hides the sweep on the last step and counts every crossing', () => {
    const last = states().at(-1)!;
    const view = lineIntersectionView(last, BOX);
    expect(view.sweep).toBeNull();
    expect(view.readout.value).toBe(String(last.foundCount));
    expect(view.eventMeta).toBe(`${last.events.filter((event) => event.tone === 'done').length}/${last.events.length}`);
  });

  it('lists the active order top first', () => {
    const state = states().find((entry) => entry.activeOrder.length >= 2)!;
    const rows = lineOrderRows(state);
    expect(rows[0]!.lead).toBe(state.activeOrder.at(-1));
    expect(rows).toHaveLength(state.activeOrder.length);
  });
});
