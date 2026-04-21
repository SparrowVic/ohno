import { describe, expect, it } from 'vitest';

import { SortStep } from '../../models/sort-step';
import { deriveSortTrace } from './derive-sort-trace';

function makeStep(partial: Partial<SortStep> = {}): SortStep {
  return {
    array: [3, 1, 4, 1, 5],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 5,
    activeCodeLine: 1,
    description: 'step',
    ...partial,
  };
}

describe('deriveSortTrace', () => {
  it('returns null when there is no step yet', () => {
    expect(deriveSortTrace(null)).toBeNull();
  });

  it('tags rows by compare / swap / sorted and copies array values', () => {
    const trace = deriveSortTrace(
      makeStep({
        array: [10, 20, 30, 40],
        comparing: [1, 2],
        sorted: [3],
      }),
    );

    expect(trace).not.toBeNull();
    const rows = trace!.rows;
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ index: 0, value: 10, status: 'unsorted', tags: [] });
    expect(rows[1]).toMatchObject({ index: 1, value: 20, status: 'comparing', tags: ['compare'] });
    expect(rows[2]).toMatchObject({ index: 2, value: 30, status: 'comparing', tags: ['compare'] });
    expect(rows[3]).toMatchObject({ index: 3, value: 40, status: 'sorted', tags: ['sorted'] });
  });

  it('prioritises swap over sorted when an index is mid-swap', () => {
    const trace = deriveSortTrace(
      makeStep({
        array: [1, 2, 3],
        swapping: [0, 2],
        sorted: [0, 2],
      }),
    )!;

    expect(trace.rows[0].status).toBe('swapping');
    expect(trace.rows[0].tags).toEqual(['swap']);
    expect(trace.rows[2].status).toBe('swapping');
  });

  it('infers phase from compare/swap/sorted when `phase` is absent', () => {
    expect(deriveSortTrace(makeStep({ comparing: [0, 1] }))!.phase).toBe('compare');
    expect(deriveSortTrace(makeStep({ swapping: [0, 1] }))!.phase).toBe('swap');
    expect(deriveSortTrace(makeStep({ array: [1, 2], sorted: [0, 1] }))!.phase).toBe('complete');
    expect(deriveSortTrace(makeStep())!.phase).toBe('idle');
  });

  it('uses an explicit `phase` when provided', () => {
    expect(deriveSortTrace(makeStep({ phase: 'distribute' }))!.phase).toBe('distribute');
    expect(deriveSortTrace(makeStep({ phase: 'distribute' }))!.phaseTone).toBe('distribute');
  });

  it('maps compare/swap pairs into indices + values', () => {
    const trace = deriveSortTrace(
      makeStep({ array: [7, 8, 9], comparing: [0, 2], swapping: [1, 2] }),
    )!;
    expect(trace.comparing).toEqual({ indexA: 0, valueA: 7, indexB: 2, valueB: 9 });
    expect(trace.swapping).toEqual({ indexA: 1, valueA: 8, indexB: 2, valueB: 9 });
  });

  it('surfaces radix digit pass and bucket distribution when present', () => {
    const trace = deriveSortTrace(
      makeStep({
        digitIndex: 1,
        maxDigits: 3,
        activeBucket: 4,
        buckets: [
          { bucket: 0, items: [{ id: 'a', value: 10 }] },
          { bucket: 4, items: [{ id: 'b', value: 14 }, { id: 'c', value: 24 }] },
        ],
      }),
    )!;

    expect(trace.digit).toEqual({ index: 1, max: 3 });
    expect(trace.buckets).toEqual([
      { bucket: 0, count: 1, active: false },
      { bucket: 4, count: 2, active: true },
    ]);
  });

  it('counts sorted vs unsorted from the sort step', () => {
    const trace = deriveSortTrace(makeStep({ array: [1, 2, 3, 4], sorted: [2, 3] }))!;
    expect(trace.sortedCount).toBe(2);
    expect(trace.unsortedCount).toBe(2);
  });
});
