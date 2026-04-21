import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { GridTraceCell, GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import { cellId, FloodFillScenario, labelForCell, neighbors } from '../../utils/grid-scenarios/grid-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.grid.floodFill.modeLabel'),
  statuses: {
    readyToSpread: t('features.algorithms.runtime.grid.floodFill.statuses.readyToSpread'),
    inspectCurrentCell: t(
      'features.algorithms.runtime.grid.floodFill.statuses.inspectCurrentCell',
    ),
    blockedCell: t('features.algorithms.runtime.grid.floodFill.statuses.blockedCell'),
    regionExpands: t('features.algorithms.runtime.grid.floodFill.statuses.regionExpands'),
    queueMatchingNeighbor: t(
      'features.algorithms.runtime.grid.floodFill.statuses.queueMatchingNeighbor',
    ),
    regionComplete: t('features.algorithms.runtime.grid.floodFill.statuses.regionComplete'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.grid.floodFill.descriptions.start'),
    inspect: t('features.algorithms.runtime.grid.floodFill.descriptions.inspect'),
    blocked: t('features.algorithms.runtime.grid.floodFill.descriptions.blocked'),
    fill: t('features.algorithms.runtime.grid.floodFill.descriptions.fill'),
    queueNeighbor: t('features.algorithms.runtime.grid.floodFill.descriptions.queueNeighbor'),
    complete: t('features.algorithms.runtime.grid.floodFill.descriptions.complete'),
  },
  decisions: {
    replaceColors: t('features.algorithms.runtime.grid.floodFill.decisions.replaceColors'),
    cellColor: t('features.algorithms.runtime.grid.floodFill.decisions.cellColor'),
    keepOriginalColor: t(
      'features.algorithms.runtime.grid.floodFill.decisions.keepOriginalColor',
    ),
    paintedColor: t('features.algorithms.runtime.grid.floodFill.decisions.paintedColor'),
    sameSourceColor: t('features.algorithms.runtime.grid.floodFill.decisions.sameSourceColor'),
    finalRegionSize: t('features.algorithms.runtime.grid.floodFill.decisions.finalRegionSize'),
  },
  labels: {
    fillColor: t('features.algorithms.runtime.grid.floodFill.labels.fillColor'),
  },
} as const;

export function* floodFillGenerator(scenario: FloodFillScenario): Generator<SortStep> {
  const filled = new Set<string>();
  const frontier = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];
  const queue: [number, number, number][] = [[scenario.startRow, scenario.startCol, 0]];
  const seedId = cellId(scenario.startRow, scenario.startCol);
  frontier.add(seedId);

  yield createFloodFillStep({
    scenario,
    filled,
    frontier,
    visited,
    order,
    activeId: seedId,
    description: i18nText(I18N.descriptions.start, {
      cell: labelForCell(scenario.startRow, scenario.startCol),
      sourceColor: scenario.sourceColor,
    }),
    activeCodeLine: 2,
    phase: 'init',
    statusLabel: I18N.statuses.readyToSpread,
    decision: i18nText(I18N.decisions.replaceColors, {
      sourceColor: scenario.sourceColor,
      fillColor: scenario.fillColor,
    }),
  });

  while (queue.length > 0) {
    const [row, col, depth] = queue.shift()!;
    const currentId = cellId(row, col);
    frontier.delete(currentId);
    visited.add(currentId);

    yield createFloodFillStep({
      scenario,
      filled,
      frontier,
      visited,
      order,
      activeId: currentId,
      description: i18nText(I18N.descriptions.inspect, {
        cell: labelForCell(row, col),
        depth,
      }),
      activeCodeLine: 5,
      phase: 'pick-node',
      statusLabel: I18N.statuses.inspectCurrentCell,
      decision: i18nText(I18N.decisions.cellColor, {
        color: scenario.cells[row]?.[col] ?? '?',
      }),
    });

    if ((scenario.cells[row]?.[col] ?? null) !== scenario.sourceColor || filled.has(currentId)) {
      yield createFloodFillStep({
        scenario,
        filled,
        frontier,
        visited,
        order,
        activeId: currentId,
        description: i18nText(I18N.descriptions.blocked, {
          cell: labelForCell(row, col),
        }),
        activeCodeLine: 6,
        phase: 'skip-relax',
        statusLabel: I18N.statuses.blockedCell,
        decision: I18N.decisions.keepOriginalColor,
      });
      continue;
    }

    filled.add(currentId);
    order.push(labelForCell(row, col));

    yield createFloodFillStep({
      scenario,
      filled,
      frontier,
      visited,
      order,
      activeId: currentId,
      description: i18nText(I18N.descriptions.fill, {
        cell: labelForCell(row, col),
      }),
      activeCodeLine: 7,
      phase: 'relax',
      statusLabel: I18N.statuses.regionExpands,
      decision: i18nText(I18N.decisions.paintedColor, { fillColor: scenario.fillColor }),
    });

    for (const [nextRow, nextCol] of neighbors(row, col, scenario.size)) {
      const nextId = cellId(nextRow, nextCol);
      if (visited.has(nextId) || frontier.has(nextId) || filled.has(nextId)) {
        continue;
      }
      if ((scenario.cells[nextRow]?.[nextCol] ?? null) !== scenario.sourceColor) {
        visited.add(nextId);
        continue;
      }
      frontier.add(nextId);
      queue.push([nextRow, nextCol, depth + 1]);

      yield createFloodFillStep({
        scenario,
        filled,
        frontier,
        visited,
        order,
        activeId: nextId,
        description: i18nText(I18N.descriptions.queueNeighbor, {
          cell: labelForCell(nextRow, nextCol),
        }),
        activeCodeLine: 8,
        phase: 'inspect-edge',
        statusLabel: I18N.statuses.queueMatchingNeighbor,
        decision: i18nText(I18N.decisions.sameSourceColor, { sourceColor: scenario.sourceColor }),
      });
    }
  }

  yield createFloodFillStep({
    scenario,
    filled,
    frontier,
    visited,
    order,
    activeId: null,
    description: i18nText(I18N.descriptions.complete, { count: filled.size }),
    activeCodeLine: 10,
    phase: 'graph-complete',
    statusLabel: I18N.statuses.regionComplete,
    decision: i18nText(I18N.decisions.finalRegionSize, { count: filled.size }),
  });
}

function createFloodFillStep(args: {
  readonly scenario: FloodFillScenario;
  readonly filled: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visited: ReadonlySet<string>;
  readonly order: readonly string[];
  readonly activeId: string | null;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText;
}): SortStep {
  const state: GridTraceState = {
    mode: 'flood-fill',
    modeLabel: I18N.modeLabel,
    statusLabel: args.statusLabel,
    decision: args.decision,
    rows: args.scenario.size,
    cols: args.scenario.size,
    sourceCellId: cellId(args.scenario.startRow, args.scenario.startCol),
    targetCellId: null,
    activeCellId: args.activeId,
    frontierCount: args.frontier.size,
    visitedCount: args.visited.size,
    resultCount: args.filled.size,
    sourceLabel: labelForCell(args.scenario.startRow, args.scenario.startCol),
    targetLabel: i18nText(I18N.labels.fillColor, { color: args.scenario.fillColor }),
    visitOrder: [...args.order],
    cells: buildFloodCells(args.scenario, args.filled, args.frontier, args.visited, args.activeId),
  };

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    grid: state,
  };
}

function buildFloodCells(
  scenario: FloodFillScenario,
  filled: ReadonlySet<string>,
  frontier: ReadonlySet<string>,
  visited: ReadonlySet<string>,
  activeId: string | null,
): GridTraceCell[] {
  const cells: GridTraceCell[] = [];
  const sourceId = cellId(scenario.startRow, scenario.startCol);

  for (let row = 0; row < scenario.size; row++) {
    for (let col = 0; col < scenario.size; col++) {
      const id = cellId(row, col);
      const baseValue = scenario.cells[row]?.[col] ?? 0;
      let status: GridTraceCell['status'] = 'idle';
      let tags: GridTraceCell['tags'] = [];

      if (visited.has(id) && baseValue !== scenario.sourceColor && !filled.has(id) && !frontier.has(id)) {
        status = 'blocked';
        tags = ['blocked'];
      }

      if (filled.has(id)) {
        status = 'filled';
        tags = ['filled'];
      } else if (frontier.has(id)) {
        status = 'frontier';
        tags = ['frontier', 'candidate'];
      }

      if (id === activeId) {
        status = 'current';
        tags = ['current'];
      }

      if (id === sourceId) {
        status = filled.has(id) ? 'filled' : status === 'current' ? 'current' : 'source';
        tags = filled.has(id) ? ['seed', 'filled'] : status === 'current' ? ['seed', 'current'] : ['seed'];
      }

      cells.push({
        id,
        row,
        col,
        status,
        tags,
        valueLabel: filled.has(id) ? String(scenario.fillColor) : String(baseValue),
        metaLabel: labelForCell(row, col),
        tone: `color-${filled.has(id) ? scenario.fillColor : baseValue}`,
      });
    }
  }

  return cells;
}
