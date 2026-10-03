import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { floydWarshallGenerator } from '../../algorithms/floyd-warshall/floyd-warshall';
import { hungarianAlgorithmGenerator } from '../../algorithms/hungarian-algorithm';
import { MatrixTraceState } from '../../models/matrix';
import { SortStep } from '../../models/sort-step';
import {
  createFloydWarshallScenario,
  createHungarianScenario,
  HungarianScenario,
} from '../../utils/scenarios/matrix/matrix-scenarios';
import {
  matrixBands,
  matrixCandidateIds,
  matrixCellViews,
  matrixColHeaderViews,
  matrixCornerKey,
  matrixDensity,
  matrixFocus,
  matrixMinimumIds,
  matrixNote,
  matrixPivotIndex,
  matrixRackMeta,
  matrixRackRows,
  matrixRackSpec,
  matrixRowHeaderViews,
  matrixSentenceText,
  parseRackPair,
} from './matrix-display.utils';

const MATRIX = I18N_KEY.features.algorithms.display.matrix;

const COVER_SCENARIO: HungarianScenario = {
  kind: 'hungarian',
  rowLabels: ['Ava', 'Ben', 'Cara', 'Dean'],
  colLabels: ['UI', 'API', 'DB', 'QA'],
  costs: [
    [82, 83, 69, 92],
    [77, 37, 49, 92],
    [11, 69, 5, 86],
    [8, 9, 98, 23],
  ],
};

function collect(generator: Generator<SortStep>): SortStep[] {
  return [...generator];
}

function matrixOf(step: SortStep | undefined): MatrixTraceState {
  if (!step?.matrix) throw new Error('step without matrix state');
  return step.matrix;
}

const floydSteps = collect(floydWarshallGenerator(createFloydWarshallScenario(5)));
const hungarianSteps = collect(hungarianAlgorithmGenerator(createHungarianScenario(4)));
const coverSteps = collect(hungarianAlgorithmGenerator(COVER_SCENARIO));

function findFloyd(predicate: (state: MatrixTraceState) => boolean): MatrixTraceState {
  const step = floydSteps.find((entry) => entry.matrix && predicate(entry.matrix));
  return matrixOf(step);
}

function findCover(label: string): MatrixTraceState {
  return matrixOf(coverSteps.find((entry) => entry.matrix?.computation?.label === label));
}

describe('matrixRackSpec', () => {
  it('maps generator rack labels to keys and kinds', () => {
    expect(matrixRackSpec('Pivot node')).toEqual({
      title: i18nText(MATRIX.racks.pivotNode),
      kind: 'pivot',
    });
    expect(matrixRackSpec('Current matches')).toEqual({
      title: i18nText(MATRIX.racks.currentMatches),
      kind: 'done',
    });
    expect(matrixRackSpec('Covered columns').kind).toBe('covered');
    expect(matrixRackSpec('Why it works').kind).toBe('sentence');
    expect(matrixRackSpec('Nodes').title).toEqual(
      i18nText(I18N_KEY.features.algorithms.display.racks.nodes),
    );
  });

  it('falls back to the raw label as a plain list', () => {
    expect(matrixRackSpec('Mystery')).toEqual({ title: 'Mystery', kind: 'list' });
    expect(matrixRackSpec(null)).toEqual({ title: '', kind: 'list' });
  });

  it('covers every label the two generators emit', () => {
    const labels = new Set(
      [...floydSteps, ...hungarianSteps, ...coverSteps].flatMap((step) => [
        step.matrix?.focusItemsLabel ?? '',
        step.matrix?.secondaryItemsLabel ?? '',
      ]),
    );
    for (const label of labels) {
      expect(typeof matrixRackSpec(label).title, label).toBe('object');
    }
  });
});

describe('matrixSentenceText', () => {
  it('translates known sentences and ignores the rest', () => {
    expect(matrixSentenceText('no change this pivot')).toEqual(i18nText(MATRIX.sentences.noChange));
    expect(matrixSentenceText('A→B 3')).toBeNull();
  });
});

describe('parseRackPair', () => {
  it('reads the three pair shapes the generators use', () => {
    expect(parseRackPair('B→E=15')).toEqual({ from: 'B', to: 'E', value: '15' });
    expect(parseRackPair('Ava→API (2)')).toEqual({ from: 'Ava', to: 'API', value: '2' });
    expect(parseRackPair('A→B 3')).toEqual({ from: 'A', to: 'B', value: '3' });
    expect(parseRackPair('Ava→UI')).toEqual({ from: 'Ava', to: 'UI', value: null });
    expect(parseRackPair('Ava')).toBeNull();
  });
});

describe('matrixRackRows', () => {
  it('builds lime rows for pairs and violet rows for the pivot', () => {
    const done = matrixRackRows(['B→E=15'], 'done');
    expect(done[0]).toMatchObject({
      lead: 'B → E',
      value: '15',
      tone: 'done',
      led: 'lime',
      pivot: false,
    });
    const pivot = matrixRackRows(['A'], 'pivot');
    expect(pivot[0]).toMatchObject({
      lead: 'A',
      value: null,
      tone: 'head',
      led: 'violet',
      pivot: true,
    });
  });

  it('renders sentences without an LED and dims the quiet ones', () => {
    const rows = matrixRackRows(
      ['no change this pivot', 'Rebuild zero matching on the adjusted matrix'],
      'done',
    );
    expect(rows[0]).toMatchObject({
      tone: 'dim',
      led: null,
      sentence: i18nText(MATRIX.sentences.noChange),
    });
    expect(rows[1]?.sentence).toEqual(i18nText(MATRIX.sentences.rebuildMatching));
  });
});

describe('matrixRackMeta', () => {
  it('shows n/size for assignment pairs and a count for lists', () => {
    expect(matrixRackMeta('done', ['Ava→API (2)', 'Ben→UI (6)'], 4)).toBe('2/4');
    expect(matrixRackMeta('list', ['A', 'B', 'C'], 3)).toBe('3');
    expect(matrixRackMeta('done', ['B→E=15'], 5)).toBeNull();
    expect(matrixRackMeta('sentence', ['x'], 5)).toBeNull();
    expect(matrixRackMeta('list', [], 5)).toBeNull();
  });
});

describe('Floyd–Warshall cells', () => {
  const compare = findFloyd(
    (state) =>
      state.cells.some((cell) => cell.status === 'active') &&
      state.activeRowLabel === 'B' &&
      state.activeColLabel === 'E',
  );

  it('finds the pivot and the focus cell', () => {
    expect(matrixPivotIndex(compare)).toBe(0);
    expect(matrixFocus(compare)).toEqual({ row: 1, col: 4 });
  });

  it('marks (i,k) and (k,j) as pink candidates with leg tags', () => {
    const candidates = matrixCandidateIds(compare);
    expect([...candidates.entries()]).toEqual([
      ['1:0', 'B→A'],
      ['0:4', 'A→E'],
    ]);
    const views = matrixCellViews(compare);
    expect(views.find((cell) => cell.row === 1 && cell.col === 0)).toMatchObject({
      tone: 'pink',
      tag: 'B→A',
    });
    expect(views.find((cell) => cell.row === 1 && cell.col === 4)).toMatchObject({
      tone: 'cyan',
      mark: '?',
      current: true,
    });
  });

  it('paints the pivot diagonal violet, other diagonals dim and ∞ in mono', () => {
    const views = matrixCellViews(compare);
    expect(views.find((cell) => cell.row === 0 && cell.col === 0)?.tone).toBe('violet');
    expect(views.find((cell) => cell.row === 2 && cell.col === 2)?.tone).toBe('dim');
    const infinite = views.find((cell) => cell.value === '∞' && cell.tone === 'dim');
    expect(infinite?.font).toBe('mono');
  });

  it('tags an improved cell with its old value', () => {
    const improved = findFloyd((state) => state.cells.some((cell) => cell.status === 'improved'));
    const cell = matrixCellViews(improved).find((entry) => entry.tone === 'lime');
    expect(cell?.tag).toEqual(i18nText(MATRIX.oldValue, { value: '∞' }));
    expect(cell?.current).toBe(true);
  });

  it('settles every finite off-diagonal value at completion', () => {
    const last = matrixOf(floydSteps.at(-1));
    const views = matrixCellViews(last, true);
    expect(views.filter((cell) => cell.settled)).toHaveLength(20);
    expect(matrixCellViews(last).some((cell) => cell.settled)).toBe(false);
  });

  it('draws violet pivot bands and flags the pivot headers', () => {
    expect(matrixBands(compare).map((band) => `${band.axis}:${band.index}:${band.tone}`)).toEqual([
      'row:0:violet',
      'col:0:violet',
    ]);
    expect(matrixRowHeaderViews(compare)[0]?.pivot).toBe(true);
    expect(matrixRowHeaderViews(compare)[1]?.tone).toBe('cyan');
    expect(matrixColHeaderViews(compare)[4]?.tone).toBe('cyan');
  });

  it('explains the relaxation test without English prose', () => {
    const note = matrixNote(compare);
    expect(note?.title).toEqual(i18nText(MATRIX.notes.titles.relaxation));
    expect(note?.formula).toBe('min(∞, 8 + 7) = 15');
    expect(note?.verdict).toEqual(i18nText(MATRIX.notes.verdicts.shorter, { pivot: 'A' }));
  });
});

describe('Hungarian cells', () => {
  it('marks the row minimum cyan while a row is being reduced', () => {
    const state = matrixOf(hungarianSteps[1]);
    const minimums = matrixMinimumIds(state);
    expect([...minimums]).toEqual(['r0c1']);
    expect(matrixCellViews(state).find((cell) => cell.id === 'r0c1')).toMatchObject({
      tone: 'cyan',
      tag: 'min',
    });
    expect(matrixBands(state)).toEqual([
      { id: 'row-active-0', axis: 'row', index: 0, tone: 'cyan' },
    ]);
  });

  it('tags the reduced row pink with the subtracted amount', () => {
    const state = matrixOf(hungarianSteps[2]);
    const row = matrixCellViews(state).filter((cell) => cell.row === 0);
    expect(row.every((cell) => cell.tone === 'pink' && cell.tag === '−2')).toBe(true);
    expect(matrixNote(state)?.formula).toEqual(
      i18nText(MATRIX.notes.formulas.subtractRow, { label: 'Ava', value: '2' }),
    );
  });

  it('rings the assignment cells and names the job under each worker', () => {
    const last = matrixOf(hungarianSteps.at(-1));
    const rings = matrixCellViews(last).filter((cell) => cell.ring);
    expect(rings).toHaveLength(4);
    expect(rings.every((cell) => cell.tone === 'lime' && cell.zero)).toBe(true);
    expect(matrixRowHeaderViews(last)[0]).toMatchObject({ sub: '→ API', tone: 'lime' });
    expect(matrixColHeaderViews(last)[1]?.tone).toBe('lime');
  });

  it('draws amber bands for covered lines and explains the cover', () => {
    const cover = findCover('Minimum cover');
    expect(matrixBands(cover).every((band) => band.tone === 'amber')).toBe(true);
    expect(matrixBands(cover).length).toBe(3);
    expect(matrixNote(cover)?.formula).toEqual(
      i18nText(MATRIX.notes.formulas.cover, { rows: '2', cols: '1', total: '3' }),
    );
  });

  it('marks the smallest uncovered value and the shifted cells', () => {
    const smallest = findCover('Smallest uncovered');
    expect([...matrixMinimumIds(smallest)]).toEqual(['r2c0']);
    const adjusted = findCover('Adjustment');
    const views = matrixCellViews(adjusted);
    expect(views.filter((cell) => cell.tag === '+6')).toHaveLength(2);
    expect(views.some((cell) => cell.tag === '−6')).toBe(true);
    expect(matrixNote(adjusted)?.formula).toEqual(
      i18nText(MATRIX.notes.formulas.adjustment, { value: '6' }),
    );
  });

  it('keeps Hungarian zeros flagged and has no candidates', () => {
    const state = matrixOf(hungarianSteps[0]);
    expect(matrixCandidateIds(state).size).toBe(0);
    expect(matrixPivotIndex(state)).toBe(-1);
    expect(matrixCornerKey(state)).toBe(MATRIX.corner.cost);
  });
});

describe('matrixDensity', () => {
  it('tightens the grid as the matrix grows', () => {
    expect(matrixDensity(4)).toBe('regular');
    expect(matrixDensity(6)).toBe('compact');
    expect(matrixDensity(9)).toBe('dense');
  });
});
