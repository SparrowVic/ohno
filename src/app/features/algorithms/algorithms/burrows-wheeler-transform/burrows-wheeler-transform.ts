import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  BurrowsWheelerTraceState,
  StringRotationRow,
  StringRunGroup,
} from '../../models/string';
import { BurrowsWheelerScenario } from '../../utils/string-scenarios/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.burrowsWheelerTransform.modeLabel'),
  phases: {
    rotate: t('features.algorithms.runtime.string.burrowsWheelerTransform.phases.rotate'),
    sortRows: t('features.algorithms.runtime.string.burrowsWheelerTransform.phases.sortRows'),
    rowCommitted: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.phases.rowCommitted',
    ),
    collectColumns: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.phases.collectColumns',
    ),
    complete: t('features.algorithms.runtime.string.burrowsWheelerTransform.phases.complete'),
  },
  insights: {
    lengthLabel: t('features.algorithms.runtime.string.burrowsWheelerTransform.insights.lengthLabel'),
    firstColumnLabel: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.insights.firstColumnLabel',
    ),
    lastColumnLabel: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.insights.lastColumnLabel',
    ),
    runGainLabel: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.insights.runGainLabel',
    ),
    rowsValue: t('features.algorithms.runtime.string.burrowsWheelerTransform.insights.rowsValue'),
    noneValue: t('features.algorithms.runtime.string.burrowsWheelerTransform.insights.noneValue'),
    gainValue: t('features.algorithms.runtime.string.burrowsWheelerTransform.insights.gainValue'),
  },
  descriptions: {
    generateRotations: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.descriptions.generateRotations',
    ),
    compareRows: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.descriptions.compareRows',
    ),
    rowPlaced: t('features.algorithms.runtime.string.burrowsWheelerTransform.descriptions.rowPlaced'),
    collectLastColumn: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.descriptions.collectLastColumn',
    ),
    complete: t('features.algorithms.runtime.string.burrowsWheelerTransform.descriptions.complete'),
  },
  decisions: {
    differentStartingPoints: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.decisions.differentStartingPoints',
    ),
    lexicographicClusters: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.decisions.lexicographicClusters',
    ),
    upperMatrixSorted: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.decisions.upperMatrixSorted',
    ),
    lastColumnOutput: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.decisions.lastColumnOutput',
    ),
    transformPreparesCompression: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.decisions.transformPreparesCompression',
    ),
  },
  computation: {
    labels: {
      rotationMatrix: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.labels.rotationMatrix',
      ),
      rowCompare: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.labels.rowCompare',
      ),
      insertionPoint: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.labels.insertionPoint',
      ),
      bwtOutput: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.labels.bwtOutput',
      ),
      runComparison: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.labels.runComparison',
      ),
    },
    expressions: {
      rowPosition: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.expressions.rowPosition',
      ),
      bwtOutput: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.expressions.bwtOutput',
      ),
      runComparison: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.expressions.runComparison',
      ),
    },
    notes: {
      rotationMatrix: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.notes.rotationMatrix',
      ),
      rowCompare: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.notes.rowCompare',
      ),
      insertionPoint: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.notes.insertionPoint',
      ),
      bwtOutput: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.notes.bwtOutput',
      ),
      runComparison: t(
        'features.algorithms.runtime.string.burrowsWheelerTransform.computation.notes.runComparison',
      ),
    },
  },
  labels: {
    matrixUnsorted: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.labels.matrixUnsorted',
    ),
    rotationsCount: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.labels.rotationsCount',
    ),
    insertRow: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.insertRow'),
    sortedPrefix: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.labels.sortedPrefix',
    ),
    sortedPrefixCount: t(
      'features.algorithms.runtime.string.burrowsWheelerTransform.labels.sortedPrefixCount',
    ),
    rowsOrdered: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.rowsOrdered'),
    readColumns: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.readColumns'),
    bwtReady: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.bwtReady'),
    shiftUpward: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.shiftUpward'),
    densityValue: t('features.algorithms.runtime.string.burrowsWheelerTransform.labels.densityValue'),
  },
} as const;

interface RawRotationRow {
  readonly id: string;
  readonly startIndex: number;
  readonly text: string;
}

function createRotations(source: string): RawRotationRow[] {
  return Array.from({ length: source.length }, (_, index) => ({
    id: `rot-${index}`,
    startIndex: index,
    text: `${source.slice(index)}${source.slice(0, index)}`,
  }));
}

function decorateRows(
  rows: readonly RawRotationRow[],
  activeRows: readonly string[],
  sortedCount: number,
  outputActive = false,
): readonly StringRotationRow[] {
  return rows.map((row, index) => {
    let tone: StringRotationRow['tone'] = index < sortedCount ? 'sorted' : 'pending';
    if (activeRows[0] === row.id) tone = outputActive ? 'output' : 'active';
    else if (activeRows.includes(row.id)) tone = 'compare';
    return { ...row, tone };
  });
}

function buildRunGroups(source: string, tone: 'input' | 'output'): readonly StringRunGroup[] {
  if (!source) return [];
  const groups: StringRunGroup[] = [];
  let current = source[0]!;
  let count = 1;

  for (let index = 1; index < source.length; index++) {
    if (source[index] === current) {
      count++;
      continue;
    }
    groups.push({ id: `${tone}-${groups.length}`, char: current, count, tone });
    current = source[index]!;
    count = 1;
  }

  groups.push({ id: `${tone}-${groups.length}`, char: current, count, tone });
  return groups;
}

function makeState(args: {
  readonly scenario: BurrowsWheelerScenario;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly rows: readonly StringRotationRow[];
  readonly activeRows: readonly string[];
  readonly firstColumn: string;
  readonly lastColumn: string;
  readonly output: string;
  readonly runGroups: readonly StringRunGroup[];
  readonly compressionRatio: number | null;
  readonly computation: BurrowsWheelerTraceState['computation'];
}): BurrowsWheelerTraceState {
  return {
    mode: 'burrows-wheeler-transform',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.lengthLabel,
        value: i18nText(I18N.insights.rowsValue, { count: args.scenario.source.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.firstColumnLabel,
        value: args.firstColumn || I18N.insights.noneValue,
        tone: 'accent',
      },
      {
        label: I18N.insights.lastColumnLabel,
        value: args.lastColumn || I18N.insights.noneValue,
        tone: 'warning',
      },
      {
        label: I18N.insights.runGainLabel,
        value:
          args.compressionRatio === null
            ? I18N.insights.noneValue
            : i18nText(I18N.insights.gainValue, { ratio: args.compressionRatio.toFixed(2) }),
        tone: args.compressionRatio === null ? 'info' : 'success',
      },
    ],
    source: args.scenario.source,
    rotations: args.rows,
    activeRows: args.activeRows,
    firstColumn: args.firstColumn,
    lastColumn: args.lastColumn,
    output: args.output,
    runGroups: args.runGroups,
    compressionRatio: args.compressionRatio,
  };
}

export function* burrowsWheelerTransformGenerator(
  scenario: BurrowsWheelerScenario,
): Generator<SortStep> {
  let rows = createRotations(scenario.source);
  const inputRuns = buildRunGroups(scenario.source, 'input');

  yield createStringStep({
    activeCodeLine: 2,
    description: i18nText(I18N.descriptions.generateRotations, {
      count: rows.length,
      source: scenario.source,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.rotate,
      activeLabel: i18nText(I18N.labels.rotationsCount, { count: rows.length }),
      resultLabel: I18N.labels.matrixUnsorted,
      decisionLabel: I18N.decisions.differentStartingPoints,
      rows: decorateRows(rows, [], 0),
      activeRows: [],
      firstColumn: '',
      lastColumn: '',
      output: '',
      runGroups: inputRuns,
      compressionRatio: null,
      computation: {
        label: I18N.computation.labels.rotationMatrix,
        expression: 'rot[i] = s[i..] + s[..i)',
        result: i18nText(I18N.insights.rowsValue, { count: rows.length }),
        note: I18N.computation.notes.rotationMatrix,
      },
    }),
  });

  for (let index = 1; index < rows.length; index++) {
    const current = rows[index]!;
    let insertAt = index;

    while (insertAt > 0 && rows[insertAt - 1]!.text > current.text) {
      yield createStringStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.compareRows, {
          current: current.text,
          previous: rows[insertAt - 1]!.text,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          phaseLabel: I18N.phases.sortRows,
          activeLabel: i18nText(I18N.labels.insertRow, { index: index + 1 }),
          resultLabel: i18nText(I18N.labels.sortedPrefix, {
            current: index,
            total: rows.length,
          }),
          decisionLabel: I18N.decisions.lexicographicClusters,
          rows: decorateRows(rows, [current.id, rows[insertAt - 1]!.id], index),
          activeRows: [current.id, rows[insertAt - 1]!.id],
          firstColumn: '',
          lastColumn: '',
          output: '',
          runGroups: inputRuns,
          compressionRatio: null,
          computation: {
            label: I18N.computation.labels.rowCompare,
            expression: `"${current.text}" < "${rows[insertAt - 1]!.text}"`,
            result: I18N.labels.shiftUpward,
            note: I18N.computation.notes.rowCompare,
          },
        }),
      });

      rows = [...rows.slice(0, insertAt - 1), current, rows[insertAt - 1]!, ...rows.slice(insertAt + 1)];
      insertAt--;
    }

    yield createStringStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.rowPlaced, {
        row: current.text,
        position: insertAt,
      }),
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.rowCommitted,
        activeLabel: i18nText(I18N.labels.sortedPrefixCount, { count: index + 1 }),
        resultLabel: i18nText(I18N.labels.rowsOrdered, {
          current: index + 1,
          total: rows.length,
        }),
        decisionLabel: I18N.decisions.upperMatrixSorted,
        rows: decorateRows(rows, [current.id], index + 1),
        activeRows: [current.id],
        firstColumn: '',
        lastColumn: '',
        output: '',
        runGroups: inputRuns,
        compressionRatio: null,
        computation: {
          label: I18N.computation.labels.insertionPoint,
          expression: i18nText(I18N.computation.expressions.rowPosition, { position: insertAt }),
          result: String(insertAt),
          note: I18N.computation.notes.insertionPoint,
        },
      }),
    });
  }

  const firstColumn = rows.map((row) => row.text[0] ?? '').join('');
  const lastColumn = rows.map((row) => row.text.at(-1) ?? '').join('');
  const outputRuns = buildRunGroups(lastColumn, 'output');
  const compressionRatio =
    outputRuns.length === 0 ? null : inputRuns.length / outputRuns.length;

  yield createStringStep({
    activeCodeLine: 5,
    description: i18nText(I18N.descriptions.collectLastColumn, { lastColumn }),
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.collectColumns,
      activeLabel: I18N.labels.readColumns,
      resultLabel: lastColumn,
      decisionLabel: I18N.decisions.lastColumnOutput,
      rows: decorateRows(rows, rows.map((row) => row.id), rows.length, true),
      activeRows: rows.map((row) => row.id),
      firstColumn,
      lastColumn,
      output: lastColumn,
      runGroups: outputRuns,
      compressionRatio,
      computation: {
        label: I18N.computation.labels.bwtOutput,
        expression: I18N.computation.expressions.bwtOutput,
        result: lastColumn,
        note: I18N.computation.notes.bwtOutput,
      },
    }),
  });

  yield createStringStep({
    activeCodeLine: 6,
    description: i18nText(I18N.descriptions.complete, {
      lastColumn,
      outputRuns: outputRuns.length,
      inputRuns: inputRuns.length,
    }),
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.complete,
      activeLabel: I18N.labels.bwtReady,
      resultLabel: lastColumn,
      decisionLabel: I18N.decisions.transformPreparesCompression,
      rows: decorateRows(rows, [], rows.length, true),
      activeRows: [],
      firstColumn,
      lastColumn,
      output: lastColumn,
      runGroups: outputRuns,
      compressionRatio,
      computation: {
        label: I18N.computation.labels.runComparison,
        expression: i18nText(I18N.computation.expressions.runComparison, {
          inputRuns: inputRuns.length,
          outputRuns: outputRuns.length,
        }),
        result:
          compressionRatio === null
            ? null
            : i18nText(I18N.labels.densityValue, { ratio: compressionRatio.toFixed(2) }),
        note: I18N.computation.notes.runComparison,
      },
    }),
  });
}
