import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { GridTraceCell, GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import { AStarScenario, cellId, labelForCell, neighbors } from '../../utils/grid-scenarios/grid-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.grid.aStarPathfinding.modeLabel'),
  statuses: {
    readyToExplore: t(
      'features.algorithms.runtime.grid.aStarPathfinding.statuses.readyToExplore',
    ),
    pickLowestF: t('features.algorithms.runtime.grid.aStarPathfinding.statuses.pickLowestF'),
    pathFound: t('features.algorithms.runtime.grid.aStarPathfinding.statuses.pathFound'),
    inspectNeighbor: t(
      'features.algorithms.runtime.grid.aStarPathfinding.statuses.inspectNeighbor',
    ),
    keepCurrentRoute: t(
      'features.algorithms.runtime.grid.aStarPathfinding.statuses.keepCurrentRoute',
    ),
    updateFrontierRoute: t(
      'features.algorithms.runtime.grid.aStarPathfinding.statuses.updateFrontierRoute',
    ),
    noPathFound: t('features.algorithms.runtime.grid.aStarPathfinding.statuses.noPathFound'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.grid.aStarPathfinding.descriptions.initialize'),
    pickFrontier: t(
      'features.algorithms.runtime.grid.aStarPathfinding.descriptions.pickFrontier',
    ),
    goalReached: t('features.algorithms.runtime.grid.aStarPathfinding.descriptions.goalReached'),
    inspectNeighbor: t(
      'features.algorithms.runtime.grid.aStarPathfinding.descriptions.inspectNeighbor',
    ),
    keepBetterRoute: t(
      'features.algorithms.runtime.grid.aStarPathfinding.descriptions.keepBetterRoute',
    ),
    updateRoute: t('features.algorithms.runtime.grid.aStarPathfinding.descriptions.updateRoute'),
    exhausted: t('features.algorithms.runtime.grid.aStarPathfinding.descriptions.exhausted'),
  },
  decisions: {
    initializeScores: t(
      'features.algorithms.runtime.grid.aStarPathfinding.decisions.initializeScores',
    ),
    frontierScores: t('features.algorithms.runtime.grid.aStarPathfinding.decisions.frontierScores'),
    shortestPathLength: t(
      'features.algorithms.runtime.grid.aStarPathfinding.decisions.shortestPathLength',
    ),
    tentativeScores: t(
      'features.algorithms.runtime.grid.aStarPathfinding.decisions.tentativeScores',
    ),
    knownRouteBetter: t(
      'features.algorithms.runtime.grid.aStarPathfinding.decisions.knownRouteBetter',
    ),
    setScores: t('features.algorithms.runtime.grid.aStarPathfinding.decisions.setScores'),
    exhaustedReachable: t(
      'features.algorithms.runtime.grid.aStarPathfinding.decisions.exhaustedReachable',
    ),
  },
} as const;

export function* aStarPathfindingGenerator(scenario: AStarScenario): Generator<SortStep> {
  const startId = cellId(scenario.startRow, scenario.startCol);
  const goalId = cellId(scenario.goalRow, scenario.goalCol);
  const open = new Set<string>([startId]);
  const closed = new Set<string>();
  const path = new Set<string>();
  const visitOrder: string[] = [];
  const gScore = new Map<string, number>([[startId, 0]]);
  const fScore = new Map<string, number>([[startId, heuristic(scenario.startRow, scenario.startCol, scenario.goalRow, scenario.goalCol)]]);
  const previous = new Map<string, string | null>([[startId, null]]);

  yield createAStarStep({
    scenario,
    open,
    closed,
    path,
    gScore,
    fScore,
    previous,
    visitOrder,
    activeId: startId,
    description: i18nText(I18N.descriptions.initialize, {
      start: labelForCell(scenario.startRow, scenario.startCol),
      goal: labelForCell(scenario.goalRow, scenario.goalCol),
    }),
    activeCodeLine: 2,
    phase: 'init',
    statusLabel: I18N.statuses.readyToExplore,
    decision: I18N.decisions.initializeScores,
  });

  while (open.size > 0) {
    const currentId = lowestF(open, fScore);
    if (!currentId) break;
    const [row, col] = parseId(currentId);

    yield createAStarStep({
      scenario,
      open,
      closed,
      path,
      gScore,
      fScore,
      previous,
      visitOrder,
      activeId: currentId,
      description: i18nText(I18N.descriptions.pickFrontier, { cell: labelForCell(row, col) }),
      activeCodeLine: 5,
      phase: 'pick-node',
      statusLabel: I18N.statuses.pickLowestF,
      decision: i18nText(I18N.decisions.frontierScores, {
        f: fScore.get(currentId) ?? '∞',
        g: gScore.get(currentId) ?? '∞',
      }),
    });

    if (currentId === goalId) {
      for (const id of reconstructPath(goalId, previous)) {
        path.add(id);
      }

      yield createAStarStep({
        scenario,
        open,
        closed,
        path,
        gScore,
        fScore,
        previous,
        visitOrder,
        activeId: currentId,
        description: i18nText(I18N.descriptions.goalReached, {
          goal: labelForCell(scenario.goalRow, scenario.goalCol),
        }),
        activeCodeLine: 12,
        phase: 'graph-complete',
        statusLabel: I18N.statuses.pathFound,
        decision: i18nText(I18N.decisions.shortestPathLength, {
          count: Math.max(0, path.size - 1),
        }),
      });
      return;
    }

    open.delete(currentId);
    closed.add(currentId);
    visitOrder.push(labelForCell(row, col));

    for (const [nextRow, nextCol] of neighbors(row, col, scenario.size)) {
      const nextId = cellId(nextRow, nextCol);
      if (scenario.walls.has(nextId) || closed.has(nextId)) {
        continue;
      }

      const tentativeG = (gScore.get(currentId) ?? Number.POSITIVE_INFINITY) + 1;
      const knownG = gScore.get(nextId) ?? Number.POSITIVE_INFINITY;
      const nextH = heuristic(nextRow, nextCol, scenario.goalRow, scenario.goalCol);
      const nextF = tentativeG + nextH;

      yield createAStarStep({
        scenario,
        open,
        closed,
        path,
        gScore,
        fScore,
        previous,
        visitOrder,
        activeId: nextId,
        description: i18nText(I18N.descriptions.inspectNeighbor, {
          cell: labelForCell(nextRow, nextCol),
          from: labelForCell(row, col),
        }),
        activeCodeLine: 7,
        phase: 'inspect-edge',
        statusLabel: I18N.statuses.inspectNeighbor,
        decision: i18nText(I18N.decisions.tentativeScores, {
          g: tentativeG,
          h: nextH,
          f: nextF,
        }),
      });

      if (tentativeG >= knownG && open.has(nextId)) {
        yield createAStarStep({
          scenario,
          open,
          closed,
          path,
          gScore,
          fScore,
          previous,
          visitOrder,
          activeId: nextId,
          description: i18nText(I18N.descriptions.keepBetterRoute, {
            cell: labelForCell(nextRow, nextCol),
          }),
          activeCodeLine: 8,
          phase: 'skip-relax',
          statusLabel: I18N.statuses.keepCurrentRoute,
          decision: i18nText(I18N.decisions.knownRouteBetter, { g: knownG }),
        });
        continue;
      }

      previous.set(nextId, currentId);
      gScore.set(nextId, tentativeG);
      fScore.set(nextId, nextF);
      open.add(nextId);

      yield createAStarStep({
        scenario,
        open,
        closed,
        path,
        gScore,
        fScore,
        previous,
        visitOrder,
        activeId: nextId,
        description: i18nText(I18N.descriptions.updateRoute, {
          cell: labelForCell(nextRow, nextCol),
          from: labelForCell(row, col),
        }),
        activeCodeLine: 9,
        phase: 'relax',
        statusLabel: I18N.statuses.updateFrontierRoute,
        decision: i18nText(I18N.decisions.setScores, {
          g: tentativeG,
          h: nextH,
          f: nextF,
        }),
      });
    }
  }

  yield createAStarStep({
    scenario,
    open,
    closed,
    path,
    gScore,
    fScore,
    previous,
    visitOrder,
    activeId: null,
    description: I18N.descriptions.exhausted,
    activeCodeLine: 13,
    phase: 'graph-complete',
    statusLabel: I18N.statuses.noPathFound,
    decision: I18N.decisions.exhaustedReachable,
  });
}

function createAStarStep(args: {
  readonly scenario: AStarScenario;
  readonly open: ReadonlySet<string>;
  readonly closed: ReadonlySet<string>;
  readonly path: ReadonlySet<string>;
  readonly gScore: ReadonlyMap<string, number>;
  readonly fScore: ReadonlyMap<string, number>;
  readonly previous: ReadonlyMap<string, string | null>;
  readonly visitOrder: readonly string[];
  readonly activeId: string | null;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText;
}): SortStep {
  const state: GridTraceState = {
    mode: 'a-star',
    modeLabel: I18N.modeLabel,
    statusLabel: args.statusLabel,
    decision: args.decision,
    rows: args.scenario.size,
    cols: args.scenario.size,
    sourceCellId: cellId(args.scenario.startRow, args.scenario.startCol),
    targetCellId: cellId(args.scenario.goalRow, args.scenario.goalCol),
    activeCellId: args.activeId,
    frontierCount: args.open.size,
    visitedCount: args.closed.size,
    resultCount: args.path.size,
    sourceLabel: labelForCell(args.scenario.startRow, args.scenario.startCol),
    targetLabel: labelForCell(args.scenario.goalRow, args.scenario.goalCol),
    visitOrder: [...args.visitOrder],
    cells: buildAStarCells(args.scenario, args.open, args.closed, args.path, args.gScore, args.fScore, args.activeId),
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

function buildAStarCells(
  scenario: AStarScenario,
  open: ReadonlySet<string>,
  closed: ReadonlySet<string>,
  path: ReadonlySet<string>,
  gScore: ReadonlyMap<string, number>,
  fScore: ReadonlyMap<string, number>,
  activeId: string | null,
): GridTraceCell[] {
  const cells: GridTraceCell[] = [];
  const startId = cellId(scenario.startRow, scenario.startCol);
  const goalId = cellId(scenario.goalRow, scenario.goalCol);

  for (let row = 0; row < scenario.size; row++) {
    for (let col = 0; col < scenario.size; col++) {
      const id = cellId(row, col);
      let status: GridTraceCell['status'] = 'idle';
      let tags: GridTraceCell['tags'] = [];
      let valueLabel = '';
      let metaLabel: string | null = null;

      if (scenario.walls.has(id)) {
        status = 'wall';
        tags = ['wall'];
        valueLabel = '';
      } else if (path.has(id)) {
        status = 'path';
        tags = ['path'];
      } else if (closed.has(id)) {
        status = 'closed';
        tags = ['closed'];
      } else if (open.has(id)) {
        status = 'frontier';
        tags = ['frontier', 'candidate'];
      }

      if (id === activeId) {
        status = 'current';
        tags = ['current'];
      }

      if (id === startId) {
        status = 'source';
        tags = ['seed'];
        valueLabel = 'S';
      } else if (id === goalId) {
        status = path.has(id) ? 'path' : 'goal';
        tags = path.has(id) ? ['goal', 'path'] : ['goal'];
        valueLabel = 'G';
      } else if (!scenario.walls.has(id)) {
        const g = gScore.get(id);
        const f = fScore.get(id);
        valueLabel = f === undefined ? '·' : String(f);
        metaLabel = g === undefined || f === undefined ? labelForCell(row, col) : `g${g} · f${f}`;
      }

      cells.push({
        id,
        row,
        col,
        status,
        tags,
        valueLabel,
        metaLabel,
        tone: null,
      });
    }
  }

  return cells;
}

function heuristic(row: number, col: number, goalRow: number, goalCol: number): number {
  return Math.abs(goalRow - row) + Math.abs(goalCol - col);
}

function lowestF(open: ReadonlySet<string>, fScore: ReadonlyMap<string, number>): string | null {
  return [...open].sort((left, right) => {
    const leftScore = fScore.get(left) ?? Number.POSITIVE_INFINITY;
    const rightScore = fScore.get(right) ?? Number.POSITIVE_INFINITY;
    if (leftScore !== rightScore) return leftScore - rightScore;
    return left.localeCompare(right);
  })[0] ?? null;
}

function reconstructPath(goalId: string, previous: ReadonlyMap<string, string | null>): readonly string[] {
  const path: string[] = [];
  let current: string | null = goalId;
  let hops = 0;
  while (current && hops < previous.size + 1) {
    path.unshift(current);
    current = previous.get(current) ?? null;
    hops++;
  }
  return path;
}

function parseId(id: string): readonly [number, number] {
  const [row, col] = id.split(':').map(Number);
  return [row ?? 0, col ?? 0];
}
