import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { createDpStep, dpCellId, DpCellConfig, DpHeaderConfig } from '../../algorithms/dp-step';
import { knapsack01Generator } from '../../algorithms/knapsack-01/knapsack-01';
import { longestCommonSubsequenceGenerator } from '../../algorithms/longest-common-subsequence/longest-common-subsequence';
import { matrixChainMultiplicationGenerator } from '../../algorithms/matrix-chain-multiplication/matrix-chain-multiplication';
import { DpCell, DpHeader, DpTraceState } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import {
  createKnapsackScenario,
  createLcsScenario,
  createMatrixChainScenario,
} from '../../utils/scenarios/dp/dp-scenarios';
import {
  dpCandidateTag,
  dpCellCaption,
  dpColumnAxis,
  dpDisplayRows,
  dpFocusCell,
  dpHeaderTones,
  dpParseItem,
  dpPendingIds,
  dpPrimaryRackMeta,
  dpPrimaryRows,
  dpReadouts,
  dpSecondaryRows,
  dpTableMetrics,
  isDpNumber,
} from './dp-display.utils';

const DP = I18N_KEY.features.algorithms.display.dp;
const NOTES = I18N_KEY.features.algorithms.display.notes;

function header(status: DpHeader['status'], id = status): DpHeader {
  return { id, label: id, status, metaLabel: null };
}

function cell(row: number, col: number, patch: Partial<DpCell> = {}): DpCell {
  return {
    id: dpCellId(row, col),
    row,
    col,
    rowLabel: `r${row}`,
    colLabel: `c${col}`,
    valueLabel: '0',
    metaLabel: null,
    status: 'idle',
    tags: [],
    ...patch,
  };
}

function steps(generator: Generator<SortStep>): readonly SortStep[] {
  return [...generator];
}

function knapsackSteps(): readonly SortStep[] {
  return steps(knapsack01Generator(createKnapsackScenario(5, 'balanced-pack')));
}

function stateAt(list: readonly SortStep[], index: number): DpTraceState {
  const dp = list[index]?.dp;
  if (!dp) throw new Error(`missing dp state at ${index}`);
  return dp;
}

describe('dp display labels', () => {
  it('emits header words as keys from the knapsack generator', () => {
    const state = stateAt(knapsackSteps(), 0);
    expect(state.rowHeaders[0]!.label).toEqual(i18nText(DP.labels.zeroItems));
    expect(state.rowHeaders[0]!.metaLabel).toEqual(i18nText(I18N_KEY.features.algorithms.display.racks.base));
    expect(state.cells.find((entry) => entry.col === 3)?.colLabel).toEqual(
      i18nText('features.algorithms.runtime.dp.common.labels.capacity', { cap: 3 }),
    );
  });

  it('parses item strings into lead and value', () => {
    expect(dpParseItem('Compass w2/v6')).toEqual({ lead: 'Compass', value: 'w2 · v6' });
    expect(dpParseItem('1:A')).toEqual({ lead: '1', value: 'A' });
    expect(dpParseItem('p1: y=-2x+1')).toEqual({ lead: 'p1', value: 'y=-2x+1' });
    const key = i18nText('features.x.y', { value: 1 });
    expect(dpParseItem(key)).toEqual({ lead: key, value: null });
  });

  it('recognises numeric labels only', () => {
    expect(isDpNumber('13')).toBe(true);
    expect(isDpNumber('-5')).toBe(true);
    expect(isDpNumber('∞')).toBe(false);
    expect(isDpNumber('T')).toBe(false);
    expect(isDpNumber(i18nText('a.b'))).toBe(false);
  });

  it('shows identifier captions and drops status words', () => {
    expect(dpCellCaption('k3')).toBe('k3');
    expect(dpCellCaption('B2')).toBe('B2');
    expect(dpCellCaption(i18nText(DP.captions.last, { id: 4 }))).toEqual(i18nText(DP.captions.last, { id: 4 }));
    expect(dpCellCaption(i18nText(DP.captions.from, { city: 'C' }))).toEqual(i18nText(DP.captions.from, { city: 'C' }));
    expect(dpCellCaption(i18nText(DP.labels.take))).toBeNull();
    expect(dpCellCaption('diag')).toBeNull();
    expect(dpCellCaption(null)).toBeNull();
  });
});

describe('dp cell tags', () => {
  const focus = cell(3, 5, { status: 'active', tags: ['active'] });

  it('prefers the generator role tag', () => {
    expect(dpCandidateTag(cell(2, 2, { status: 'candidate', tags: ['take'] }), focus)).toEqual(i18nText(NOTES.take));
    expect(dpCandidateTag(cell(2, 5, { status: 'candidate', tags: ['skip'] }), focus)).toEqual(i18nText(NOTES.skip));
    expect(dpCandidateTag(cell(2, 5, { status: 'candidate', tags: ['split', 'best'] }), focus)).toEqual(
      i18nText(DP.tags.split),
    );
  });

  it('falls back to a direction arrow towards the focus cell', () => {
    expect(dpCandidateTag(cell(2, 5, { status: 'candidate', tags: ['best'] }), focus)).toBe('↑');
    expect(dpCandidateTag(cell(3, 4, { status: 'candidate' }), focus)).toBe('←');
    expect(dpCandidateTag(cell(2, 4, { status: 'candidate' }), focus)).toBe('↖');
    expect(dpCandidateTag(cell(4, 5, { status: 'candidate' }), focus)).toBe('↓');
    expect(dpCandidateTag(cell(2, 4, { status: 'candidate' }), null)).toBeNull();
  });
});

describe('dp header tones', () => {
  it('colours a lone source header and keeps idle headers quiet', () => {
    expect(dpHeaderTones([header('source', 'a'), header('idle', 'b'), header('active', 'c'), header('idle', 'd')])).toEqual([
      'violet',
      'idle',
      'cyan',
      'idle',
    ]);
  });

  it('treats a status shared by the whole axis as resting', () => {
    const tones = dpHeaderTones([
      header('accent', 'a'),
      header('accent', 'b'),
      header('active', 'c'),
      header('accent', 'd'),
    ]);
    expect(tones).toEqual(['idle', 'idle', 'cyan', 'idle']);
  });

  it('keeps packed accent rows pink while they are a minority', () => {
    expect(
      dpHeaderTones([header('source', 'a'), header('accent', 'b'), header('idle', 'c'), header('idle', 'd'), header('accent', 'e')]),
    ).toEqual(['violet', 'pink', 'idle', 'idle', 'pink']);
  });
});

describe('dp knapsack display', () => {
  const list = knapsackSteps();

  it('marks every non-base cell pending before the fill starts', () => {
    const state = stateAt(list, 0);
    const rows = dpDisplayRows(state, list[0]!.phase);
    expect(rows[0]!.every((item) => item.state === 'base')).toBe(true);
    expect(rows[1]![0]!.state).toBe('base');
    expect(rows[1]!.slice(1).every((item) => item.state === 'pending' && item.value === '·' && !item.dot)).toBe(true);
  });

  it('matches reference image 09 when Rope is compared at capacity 5', () => {
    const index = list.findIndex((step) => step.phase === 'compare' && step.dp?.cells.some((item) => item.id === dpCellId(3, 5) && item.status === 'active'));
    const state = stateAt(list, index);
    const rows = dpDisplayRows(state, list[index]!.phase);
    const active = rows[3]![5]!;
    expect(active).toMatchObject({ state: 'active', tone: 'cyan', mark: true, focus: true, value: '13', dot: true });
    expect(rows[2]![2]).toMatchObject({ state: 'candidate', tone: 'pink', tag: i18nText(NOTES.take), value: '6' });
    expect(rows[2]![5]).toMatchObject({ state: 'candidate', tag: i18nText(NOTES.skip), value: '9' });
    expect(rows[3]![4]).toMatchObject({ state: 'idle', value: '10', dot: true });
    expect(rows[3]![6]!.state).toBe('pending');
    expect(rows[4]!.slice(1).every((item) => item.state === 'pending')).toBe(true);

    const items = dpPrimaryRows(state);
    expect(items.map((row) => row.tone)).toEqual(['done', 'done', 'now', 'dim', 'dim']);
    expect(items.map((row) => row.led)).toEqual(['lime', 'lime', 'cyan', null, null]);
    expect(items[2]).toMatchObject({ lead: 'Rope', value: 'w3 · v7', valueDot: false });
    expect(dpPrimaryRackMeta(state.mode)).toBe(DP.weightValue);
    expect(dpColumnAxis(state)).toEqual({ caption: DP.capacityAxis, columnMeta: false });
  });

  it('finishes with the path lime, packed items done and nothing pending', () => {
    const last = list.length - 1;
    const state = stateAt(list, last);
    expect(dpPendingIds(state, list[last]!.phase).size).toBe(0);
    const rows = dpDisplayRows(state, list[last]!.phase);
    const path = rows.flat().filter((item) => item.state === 'path');
    expect(path.length).toBeGreaterThan(0);
    expect(path.every((item) => item.tone === 'lime' && item.strong)).toBe(true);
    const packed = state.rowHeaders.slice(1).map((row) => row.status === 'accent');
    expect(dpPrimaryRows(state).map((row) => row.tone === 'done')).toEqual(packed);
  });

  it('drops insights that repeat the table size', () => {
    const state = stateAt(list, 1);
    const readouts = dpReadouts(state);
    expect(readouts.some((readout) => readout.value === state.dimensionsLabel)).toBe(false);
    expect(readouts[0]).toMatchObject({ value: '7', dot: true, tone: 'pink' });
  });
});

describe('dp mapped and unmapped racks', () => {
  it('maps lcs strings onto rows and columns', () => {
    const list = steps(longestCommonSubsequenceGenerator(createLcsScenario(6, 'classic')));
    const index = list.findIndex(
      (step) => step.dp && dpFocusCell(step.dp) && step.dp.secondaryItems.length === step.dp.colHeaders.length - 1,
    );
    const state = stateAt(list, index);
    const focus = dpFocusCell(state)!;
    const primary = dpPrimaryRows(state);
    expect(primary[focus.row - 1]!.tone).toBe('now');
    expect(primary.slice(0, focus.row - 1).every((row) => row.tone === 'done')).toBe(true);
    const secondary = dpSecondaryRows(state);
    expect(secondary[focus.col - 1]!.tone).toBe('now');
    expect(secondary.filter((row) => row.tone === 'dim')).toHaveLength(0);
    expect(secondary[0]).toMatchObject({ lead: state.colHeaders[1]!.label, value: 'j1' });
  });

  it('leaves the lower triangle of interval tables empty', () => {
    const list = steps(matrixChainMultiplicationGenerator(createMatrixChainScenario(5, 'textbook')));
    const state = stateAt(list, 0);
    const rows = dpDisplayRows(state, list[0]!.phase);
    expect(rows[3]![1]!.state).toBe('void');
    expect(rows[1]![3]!.state).not.toBe('void');
    expect(dpPendingIds(state, 'init').size).toBe(0);
  });

  it('lists items as plain rows when they do not map to an axis', () => {
    const rows: DpHeaderConfig[] = [{ id: 'r0', label: 'x' }];
    const cols: DpHeaderConfig[] = [{ id: 'c0', label: 'p1' }];
    const cells: DpCellConfig[] = [{ row: 0, col: 0, rowLabel: 'x', colLabel: 'p1', valueLabel: '1' }];
    const step = createDpStep({
      mode: 'sos-dp',
      modeLabel: '',
      phaseLabel: '',
      resultLabel: '',
      presetLabel: '',
      presetDescription: '',
      dimensionsLabel: '1 × 1',
      activeLabel: null,
      pathLabel: '',
      primaryItemsLabel: '',
      primaryItems: ['000=2', '001=5'],
      secondaryItemsLabel: '',
      secondaryItems: [i18nText(DP.labels.bit, { n: 0 })],
      insights: [],
      rowHeaders: rows,
      colHeaders: cols,
      cells,
      activeCodeLine: 1,
      description: '',
      phase: 'init',
    });
    const state = step.dp!;
    expect(dpPrimaryRows(state)).toEqual([
      { id: 'primary-0', lead: '000', value: '2', valueDot: true, tone: 'default', led: null },
      { id: 'primary-1', lead: '001', value: '5', valueDot: true, tone: 'default', led: null },
    ]);
    expect(dpSecondaryRows(state)[0]!.lead).toEqual(i18nText(DP.labels.bit, { n: 0 }));
  });
});

describe('dp column axis', () => {
  it('lifts a shared column meta into the axis caption', () => {
    const state = {
      mode: 'coin-change',
      colHeaders: [
        { id: 'c0', label: '0', status: 'source', metaLabel: i18nText(I18N_KEY.features.algorithms.display.racks.base) },
        { id: 'c1', label: '1', status: 'idle', metaLabel: i18nText(DP.labels.amount) },
        { id: 'c2', label: '2', status: 'idle', metaLabel: i18nText(DP.labels.amount) },
      ],
    } as unknown as DpTraceState;
    expect(dpColumnAxis(state)).toEqual({ caption: i18nText(DP.labels.amount), columnMeta: false });
  });

  it('keeps per-column meta when it varies', () => {
    const state = {
      mode: 'longest-common-subsequence',
      colHeaders: [
        { id: 'c0', label: '∅', status: 'target', metaLabel: 'base' },
        { id: 'c1', label: 'A', status: 'target', metaLabel: 'j1' },
        { id: 'c2', label: 'B', status: 'target', metaLabel: 'j2' },
      ],
    } as unknown as DpTraceState;
    expect(dpColumnAxis(state)).toEqual({ caption: null, columnMeta: true });
  });
});

describe('dp table metrics', () => {
  const base = { width: 900, height: 480, cols: 8, rows: 6, maxValueLength: 2, rowHeadChars: 9, headerHeight: 46 };

  it('fits the knapsack table with large Doto values', () => {
    const metrics = dpTableMetrics(base);
    expect(metrics.cellWidth).toBeGreaterThanOrEqual(80);
    expect(metrics.dot).toBe(true);
    expect(metrics.valueSize).toBeGreaterThanOrEqual(18);
  });

  it('never shrinks cells below the minimum so wide tables scroll', () => {
    const metrics = dpTableMetrics({ ...base, width: 320, cols: 21 });
    expect(metrics.cellWidth).toBe(40);
  });

  it('switches long values to mono when Doto 14px would not fit', () => {
    const metrics = dpTableMetrics({ ...base, width: 320, cols: 6, maxValueLength: 5 });
    expect(metrics.dot).toBe(false);
    expect(metrics.valueSize).toBe(12);
  });

  it('keeps Doto at 14px or more whenever it is used', () => {
    for (const width of [300, 500, 800, 1200]) {
      for (const maxValueLength of [1, 2, 3, 4, 5]) {
        const metrics = dpTableMetrics({ ...base, width, maxValueLength });
        if (metrics.dot) expect(metrics.valueSize).toBeGreaterThanOrEqual(14);
      }
    }
  });

  it('falls back to a default viewport before the first measurement', () => {
    const metrics = dpTableMetrics({ ...base, width: 0, height: 0 });
    expect(metrics.cellWidth).toBeGreaterThan(40);
  });
});
