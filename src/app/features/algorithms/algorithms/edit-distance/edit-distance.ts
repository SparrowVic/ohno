import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { EditDistanceScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.editDistance.modeLabel'),
  phases: {
    initializeBorders: t('features.algorithms.runtime.dp.editDistance.phases.initializeBorders'),
    compareOperations: t('features.algorithms.runtime.dp.editDistance.phases.compareOperations'),
    commitDistance: t('features.algorithms.runtime.dp.editDistance.phases.commitDistance'),
    backtrackCarry: t('features.algorithms.runtime.dp.editDistance.phases.backtrackCarry'),
    backtrackReplace: t('features.algorithms.runtime.dp.editDistance.phases.backtrackReplace'),
    backtrackDelete: t('features.algorithms.runtime.dp.editDistance.phases.backtrackDelete'),
    backtrackInsert: t('features.algorithms.runtime.dp.editDistance.phases.backtrackInsert'),
    complete: t('features.algorithms.runtime.dp.editDistance.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.editDistance.descriptions.initialize'),
    compareOperations: t(
      'features.algorithms.runtime.dp.editDistance.descriptions.compareOperations',
    ),
    commitDistance: t('features.algorithms.runtime.dp.editDistance.descriptions.commitDistance'),
    backtrackCarry: t('features.algorithms.runtime.dp.editDistance.descriptions.backtrackCarry'),
    backtrackReplace: t(
      'features.algorithms.runtime.dp.editDistance.descriptions.backtrackReplace',
    ),
    backtrackDelete: t('features.algorithms.runtime.dp.editDistance.descriptions.backtrackDelete'),
    backtrackInsert: t('features.algorithms.runtime.dp.editDistance.descriptions.backtrackInsert'),
    complete: t('features.algorithms.runtime.dp.editDistance.descriptions.complete'),
  },
  insights: {
    sourceLabel: t('features.algorithms.runtime.dp.editDistance.insights.sourceLabel'),
    targetLabel: t('features.algorithms.runtime.dp.editDistance.insights.targetLabel'),
    distanceLabel: t('features.algorithms.runtime.dp.editDistance.insights.distanceLabel'),
    opsLabel: t('features.algorithms.runtime.dp.editDistance.insights.opsLabel'),
    gridLabel: t('features.algorithms.runtime.dp.editDistance.insights.gridLabel'),
  },
  labels: {
    resultDistance: t('features.algorithms.runtime.dp.editDistance.labels.resultDistance'),
    pathValue: t('features.algorithms.runtime.dp.editDistance.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.editDistance.labels.pathPending'),
    sourceWordLabel: t('features.algorithms.runtime.dp.editDistance.labels.sourceWordLabel'),
    targetOpsLabel: t('features.algorithms.runtime.dp.editDistance.labels.targetOpsLabel'),
    activeCell: t('features.algorithms.runtime.dp.editDistance.labels.activeCell'),
    compareReplace: t('features.algorithms.runtime.dp.editDistance.labels.compareReplace'),
    compareDelete: t('features.algorithms.runtime.dp.editDistance.labels.compareDelete'),
    compareInsert: t('features.algorithms.runtime.dp.editDistance.labels.compareInsert'),
    charPair: t('features.algorithms.runtime.dp.editDistance.labels.charPair'),
    dpCell: t('features.algorithms.runtime.dp.editDistance.labels.dpCell'),
    coords: t('features.algorithms.runtime.dp.editDistance.labels.coords'),
    keepOperation: t('features.algorithms.runtime.dp.editDistance.labels.keepOperation'),
    replaceOperation: t('features.algorithms.runtime.dp.editDistance.labels.replaceOperation'),
    deleteOperation: t('features.algorithms.runtime.dp.editDistance.labels.deleteOperation'),
    insertOperation: t('features.algorithms.runtime.dp.editDistance.labels.insertOperation'),
    noEditsValue: t('features.algorithms.runtime.dp.editDistance.labels.noEditsValue'),
    pendingOpsValue: t('features.algorithms.runtime.dp.editDistance.labels.pendingOpsValue'),
  },
  decisions: {
    carryDiagonalMatch: t(
      'features.algorithms.runtime.dp.editDistance.decisions.carryDiagonalMatch',
    ),
    chooseCheapestEdit: t(
      'features.algorithms.runtime.dp.editDistance.decisions.chooseCheapestEdit',
    ),
    freeDiagonalCarry: t('features.algorithms.runtime.dp.editDistance.decisions.freeDiagonalCarry'),
    minimumEditStored: t(
      'features.algorithms.runtime.dp.editDistance.decisions.minimumEditStored',
    ),
    carryMatch: t('features.algorithms.runtime.dp.editDistance.decisions.carryMatch'),
    replaceAndContinue: t(
      'features.algorithms.runtime.dp.editDistance.decisions.replaceAndContinue',
    ),
    moveUpward: t('features.algorithms.runtime.dp.editDistance.decisions.moveUpward'),
    moveLeft: t('features.algorithms.runtime.dp.editDistance.decisions.moveLeft'),
  },
} as const;

export function* editDistanceGenerator(scenario: EditDistanceScenario): Generator<SortStep> {
  const source = scenario.source.split('');
  const target = scenario.target.split('');
  const rows = source.length + 1;
  const cols = target.length + 1;
  const table = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  const backtrackCells = new Set<string>();
  const operations: string[] = [];

  for (let row = 0; row < rows; row++) {
    table[row]![0] = row;
  }
  for (let col = 0; col < cols; col++) {
    table[0]![col] = col;
  }

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    operations,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBorders,
    phase: 'init',
  });

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const leftChar = source[row - 1]!;
      const rightChar = target[col - 1]!;
      const replaceCost = table[row - 1]![col - 1]! + (leftChar === rightChar ? 0 : 1);
      const deleteCost = table[row - 1]![col]! + 1;
      const insertCost = table[row]![col - 1]! + 1;

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1], [row - 1, col], [row, col - 1]],
        secondaryItems: [
          i18nText(I18N.labels.compareReplace, { value: replaceCost }),
          i18nText(I18N.labels.compareDelete, { value: deleteCost }),
          i18nText(I18N.labels.compareInsert, { value: insertCost }),
        ],
        description: i18nText(I18N.descriptions.compareOperations, { leftChar, rightChar }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.compareOperations,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.charPair, { leftChar, rightChar }),
          expression: `min(diag ${replaceCost}, up ${deleteCost}, left ${insertCost})`,
          result: String(Math.min(replaceCost, deleteCost, insertCost)),
          decision:
            leftChar === rightChar
              ? I18N.decisions.carryDiagonalMatch
              : I18N.decisions.chooseCheapestEdit,
        },
      });

      table[row]![col] = Math.min(replaceCost, deleteCost, insertCost);
      const status = leftChar === rightChar ? 'match' : 'chosen';

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1], [row - 1, col], [row, col - 1]],
        activeCellStatus: status,
        description: i18nText(I18N.descriptions.commitDistance, {
          row,
          col,
          value: table[row]![col]!,
        }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitDistance,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCell, { row, col }),
          expression: `${replaceCost}, ${deleteCost}, ${insertCost}`,
          result: String(table[row]![col]!),
          decision:
            leftChar === rightChar
              ? I18N.decisions.freeDiagonalCarry
              : I18N.decisions.minimumEditStored,
        },
      });
    }
  }

  let row = source.length;
  let col = target.length;
  while (row > 0 || col > 0) {
    backtrackCells.add(dpCellId(row, col));

    const canUseDiagonal = row > 0 && col > 0;
    const diagonalCost = canUseDiagonal ? table[row - 1]![col - 1]! + (source[row - 1] === target[col - 1] ? 0 : 1) : Number.POSITIVE_INFINITY;
    const deleteCost = row > 0 ? table[row - 1]![col]! + 1 : Number.POSITIVE_INFINITY;
    const insertCost = col > 0 ? table[row]![col - 1]! + 1 : Number.POSITIVE_INFINITY;
    const current = table[row]![col]!;

    if (canUseDiagonal && current === diagonalCost) {
      const leftChar = source[row - 1]!;
      const rightChar = target[col - 1]!;
      const operation =
        leftChar === rightChar
          ? equalityToken(leftChar)
          : replacementToken(leftChar, rightChar);
      operations.unshift(operation);

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: editPathLabel(operations),
        description:
          leftChar === rightChar
            ? i18nText(I18N.descriptions.backtrackCarry, { char: leftChar })
            : i18nText(I18N.descriptions.backtrackReplace, {
                leftChar,
                rightChar,
              }),
        activeCodeLine: 11,
        phaseLabel:
          leftChar === rightChar ? I18N.phases.backtrackCarry : I18N.phases.backtrackReplace,
        phase: 'relax',
        computation: {
          label:
            leftChar === rightChar
              ? i18nText(I18N.labels.keepOperation, { char: leftChar })
              : i18nText(I18N.labels.replaceOperation, {
                  from: leftChar,
                  to: rightChar,
                }),
          expression: `diag = ${diagonalCost}`,
          result: i18nText(I18N.labels.coords, { row: row - 1, col: col - 1 }),
          decision:
            leftChar === rightChar ? I18N.decisions.carryMatch : I18N.decisions.replaceAndContinue,
        },
      });
      row -= 1;
      col -= 1;
      continue;
    }

    if (row > 0 && current === deleteCost) {
      operations.unshift(deletionToken(source[row - 1]!));
      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: editPathLabel(operations),
        description: i18nText(I18N.descriptions.backtrackDelete, {
          char: source[row - 1],
        }),
        activeCodeLine: 13,
        phaseLabel: I18N.phases.backtrackDelete,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.deleteOperation, { char: source[row - 1] }),
          expression: `up = ${deleteCost}`,
          result: i18nText(I18N.labels.coords, { row: row - 1, col }),
          decision: I18N.decisions.moveUpward,
        },
      });
      row -= 1;
      continue;
    }

    operations.unshift(insertionToken(target[col - 1]!));
    yield createStep({
      scenario,
      source,
      target,
      table,
      backtrackCells,
      operations,
      activeCell: [row, col],
      activeCellStatus: 'backtrack',
      pathLabel: editPathLabel(operations),
      description: i18nText(I18N.descriptions.backtrackInsert, { char: target[col - 1] }),
      activeCodeLine: 14,
      phaseLabel: I18N.phases.backtrackInsert,
      phase: 'skip-relax',
      computation: {
        label: i18nText(I18N.labels.insertOperation, { char: target[col - 1] }),
        expression: `left = ${insertCost}`,
        result: i18nText(I18N.labels.coords, { row, col: col - 1 }),
        decision: I18N.decisions.moveLeft,
      },
    });
    col -= 1;
  }

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    operations,
    pathLabel: editPathLabel(operations),
    description: i18nText(I18N.descriptions.complete, {
      distance: table[source.length]![target.length]!,
      operations: operationSummary(operations),
    }),
    activeCodeLine: 16,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: EditDistanceScenario;
  readonly source: readonly string[];
  readonly target: readonly string[];
  readonly table: readonly (readonly number[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly operations: readonly string[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'chosen' | 'match' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
  readonly pathLabel?: TranslatableText;
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-0', label: '∅', status: 'source', metaLabel: 'del base' },
    ...args.source.map((char, index) => ({
      id: `row-${index + 1}`,
      label: char,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : 'source') as DpHeaderConfig['status'],
      metaLabel: `i${index + 1}`,
    })),
  ];
  const colHeaders: DpHeaderConfig[] = [
    { id: 'col-0', label: '∅', status: 'target', metaLabel: 'ins base' },
    ...args.target.map((char, index) => ({
      id: `col-${index + 1}`,
      label: char,
      status: (args.activeCell?.[1] === index + 1 ? 'active' : 'target') as DpHeaderConfig['status'],
      metaLabel: `j${index + 1}`,
    })),
  ];

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const isBase = row === 0 || col === 0;
      const isBacktrack = args.backtrackCells.has(id);
      const isMatch = row > 0 && col > 0 && args.source[row - 1] === args.target[col - 1];
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (id === activeCellId) tags.push('active');
      if (isBacktrack) tags.push('path');
      if (isMatch) tags.push('match');

      const opHint = isBacktrack
        ? 'script'
        : isMatch
          ? 'keep'
          : null;

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '∅' : args.source[row - 1]!,
        colLabel: col === 0 ? '∅' : args.target[col - 1]!,
        valueLabel: String(args.table[row]![col]!),
        metaLabel: opHint,
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : isMatch
                  ? 'match'
                  : 'idle',
        tags,
      });
    }
  }

  const insights: DpInsight[] = [
    { label: I18N.insights.sourceLabel, value: args.scenario.source, tone: 'accent' },
    { label: I18N.insights.targetLabel, value: args.scenario.target, tone: 'info' },
    {
      label: I18N.insights.distanceLabel,
      value: String(args.table[args.source.length]![args.target.length]!),
      tone: 'success',
    },
    { label: I18N.insights.opsLabel, value: String(args.operations.length), tone: 'warning' },
    {
      label: I18N.insights.gridLabel,
      value: `${args.table.length} × ${args.table[0]!.length}`,
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'edit-distance',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultDistance, {
      value: args.table[args.source.length]![args.target.length]!,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeCell, labelParamsFor(args, args.activeCell[0], args.activeCell[1]))
        : null,
    pathLabel: args.pathLabel ?? editPathLabel(args.operations, true),
    primaryItemsLabel: I18N.labels.sourceWordLabel,
    primaryItems: args.source.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: I18N.labels.targetOpsLabel,
    secondaryItems:
      args.secondaryItems ??
      (args.operations.length > 0 ? args.operations : args.target.map((char, index) => `${index + 1}:${char}`)),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'full',
    computation: args.computation ?? null,
  });
}

function labelParamsFor(
  args: { source: readonly string[]; target: readonly string[] },
  row: number,
  col: number,
): { left: string; right: string } {
  const left = row === 0 ? '∅' : args.source[row - 1]!;
  const right = col === 0 ? '∅' : args.target[col - 1]!;
  return { left, right };
}

function equalityToken(char: string): string {
  return `${char}=${char}`;
}

function replacementToken(from: string, to: string): string {
  return `${from}→${to}`;
}

function deletionToken(char: string): string {
  return `-${char}`;
}

function insertionToken(char: string): string {
  return `+${char}`;
}

function operationSummary(operations: readonly string[]): string {
  return operations.length > 0 ? operations.join(', ') : '∅';
}

function editPathLabel(
  operations: readonly string[],
  preferPending = false,
): TranslatableText {
  if (operations.length === 0) {
    return preferPending ? I18N.labels.pathPending : i18nText(I18N.labels.pathValue, {
      operations: I18N.labels.noEditsValue,
    });
  }

  return i18nText(I18N.labels.pathValue, { operations: operations.join(' • ') });
}
