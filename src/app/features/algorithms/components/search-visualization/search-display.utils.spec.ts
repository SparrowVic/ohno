import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { binarySearchGenerator } from '../../algorithms/binary-search/binary-search';
import { binarySearchVariantsGenerator } from '../../algorithms/binary-search-variants/binary-search-variants';
import { linearSearchGenerator } from '../../algorithms/linear-search/linear-search';
import { SearchTraceState } from '../../models/search';
import { SortStep } from '../../models/sort-step';
import { TapeLayout } from '../../utils/helpers/tape-layout/tape-layout.utils';
import {
  placeSearchCursors,
  placeSearchSpan,
  searchCandidate,
  searchHitSpan,
  searchProbeLabel,
  searchTapeView,
} from './search-display.utils';

const R = I18N_KEY.features.algorithms.display.registers;
const SORTED = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];

function states(steps: Generator<SortStep>): SearchTraceState[] {
  return [...steps].map((step) => step.search).filter((state): state is SearchTraceState => !!state);
}

describe('searchTapeView on binary search', () => {
  const trace = states(binarySearchGenerator({ array: SORTED, target: 23 }));

  it('opens with the whole tape live under one cyan range', () => {
    const view = searchTapeView(trace[0]!);
    expect(view.range).toEqual({ from: 0, to: 9, tone: 'cyan' });
    expect(view.cells.every((cell) => cell.tone === 'live')).toBe(true);
    expect(view.cursors.map((cursor) => cursor.id)).toEqual(['lo', 'hi']);
    expect(view.probe).toBeNull();
    expect(view.focus).toBe(0);
  });

  it('marks the probe pink with a mid cursor on top', () => {
    const view = searchTapeView(trace[1]!);
    expect(view.probe).toEqual({ from: 4, to: 4, tone: 'pink' });
    expect(view.cells[4]?.tone).toBe('pink');
    expect(view.cells[4]?.focus).toBe(true);
    const probe = view.cursors.find((cursor) => cursor.id === 'probe');
    expect(probe).toMatchObject({ index: 4, tone: 'pink', side: 'top', labels: [R.mid] });
    expect(view.noteTone).toBe('pink');
  });

  it('dims the discarded half after the window moves', () => {
    const view = searchTapeView(trace[2]!);
    expect(view.cells.slice(0, 5).every((cell) => cell.tone === 'dim')).toBe(true);
    expect(view.range).toEqual({ from: 5, to: 9, tone: 'cyan' });
  });

  it('turns the hit lime and drops the range at the end', () => {
    const view = searchTapeView(trace[trace.length - 1]!);
    expect(view.hit).toEqual({ from: 5, to: 5, tone: 'lime' });
    expect(view.range).toBeNull();
    expect(view.probe).toBeNull();
    expect(view.cells[5]?.tone).toBe('lime');
    expect(view.cursors).toEqual([expect.objectContaining({ id: 'probe', tone: 'lime' })]);
    expect(view.noteTone).toBe('lime');
  });

  it('merges lo and hi into one cursor when the range is a single cell', () => {
    const missing = states(binarySearchGenerator({ array: [1, 3], target: 3 }));
    const single = missing.find((state) => state.low !== null && state.low === state.high && state.probeIndex === null);
    expect(single).toBeDefined();
    const view = searchTapeView(single!);
    expect(view.cursors).toEqual([expect.objectContaining({ id: 'lohi', labels: [R.lo, R.hi] })]);
  });

  it('reads an empty range in red when the target is missing', () => {
    const missing = states(binarySearchGenerator({ array: SORTED, target: 4 }));
    const view = searchTapeView(missing[missing.length - 1]!);
    expect(view.range).toBeNull();
    expect(view.noteTone).toBe('red');
    expect(view.cells.every((cell) => cell.tone === 'dim')).toBe(true);
  });
});

describe('search labels', () => {
  it('names the linear probe i and the binary probe mid', () => {
    const linear = states(linearSearchGenerator({ array: [4, 9, 1], target: 1 }));
    expect(searchProbeLabel(linear[1]!)).toBe(R.i);
    const binary = states(binarySearchGenerator({ array: SORTED, target: 23 }));
    expect(searchProbeLabel(binary[1]!)).toBe(R.mid);
  });

  it('marks bound candidates for the variants search', () => {
    const variants = states(binarySearchVariantsGenerator({ array: [1, 4, 4, 4, 9], target: 4 }));
    const withFirst = variants.find((state) => state.leftBound !== null && state.probeIndex !== state.leftBound);
    expect(withFirst).toBeDefined();
    const view = searchTapeView(withFirst!);
    const index = withFirst!.leftBound!;
    expect(view.cells[index]?.candidate).toBe('first');
    expect(searchCandidate({ ...withFirst!, rightBound: index }, index)).toBe('both');
  });
});

describe('searchHitSpan', () => {
  it('spans contiguous hits only', () => {
    expect(searchHitSpan([4, 2, 3])).toEqual({ from: 2, to: 4, tone: 'lime' });
    expect(searchHitSpan([1, 4])).toBeNull();
    expect(searchHitSpan([])).toBeNull();
  });
});

describe('placement', () => {
  const layout: TapeLayout = { cell: 40, font: 18, pitch: 44, scrolls: false };

  it('places spans and cursors in tape pixels', () => {
    expect(placeSearchSpan({ from: 1, to: 2, tone: 'cyan' }, layout, 5)).toEqual({
      from: 1,
      to: 2,
      tone: 'cyan',
      left: 39,
      width: 94,
    });
    expect(placeSearchSpan(null, layout, 5)).toBeNull();
    const [cursor] = placeSearchCursors(
      [{ id: 'probe', index: 2, tone: 'pink', side: 'top', labels: [R.mid] }],
      layout,
    );
    expect(cursor?.x).toBe(108);
  });
});
