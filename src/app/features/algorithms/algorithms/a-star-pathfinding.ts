import { GridTraceCell, GridTraceState } from '../models/grid';
import { SortStep } from '../models/sort-step';
import { AStarScenario, cellId, labelForCell, neighbors } from '../utils/grid-scenarios/grid-scenarios';

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
    description: `Initialize A* from ${labelForCell(scenario.startRow, scenario.startCol)} toward ${labelForCell(scenario.goalRow, scenario.goalCol)}.`,
    activeCodeLine: 2,
    phase: 'init',
    statusLabel: 'Ready to explore',
    decision: 'g = 0, h = Manhattan distance, f = g + h.',
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
      description: `Pick ${labelForCell(row, col)} as the most promising frontier cell.`,
      activeCodeLine: 5,
      phase: 'pick-node',
      statusLabel: 'Pick lowest f-score',
      decision: `f = ${fScore.get(currentId) ?? '∞'}, g = ${gScore.get(currentId) ?? '∞'}.`,
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
        description: `Goal reached. Reconstruct the path from ${labelForCell(scenario.goalRow, scenario.goalCol)} back to the start.`,
        activeCodeLine: 12,
        phase: 'graph-complete',
        statusLabel: 'Path found',
        decision: `Shortest grid path length: ${Math.max(0, path.size - 1)} step(s).`,
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
        description: `Inspect ${labelForCell(nextRow, nextCol)} from ${labelForCell(row, col)}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        statusLabel: 'Inspect neighbor',
        decision: `tentative g=${tentativeG}, h=${nextH}, f=${nextF}.`,
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
          description: `Keep the better known route to ${labelForCell(nextRow, nextCol)}.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          statusLabel: 'Keep current route',
          decision: `Known g=${knownG} is still better.`,
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
        description: `Update ${labelForCell(nextRow, nextCol)} with a better route through ${labelForCell(row, col)}.`,
        activeCodeLine: 9,
        phase: 'relax',
        statusLabel: 'Update frontier route',
        decision: `Set g=${tentativeG}, h=${nextH}, f=${nextF}.`,
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
    description: 'A* finished without reaching the goal. The frontier has been exhausted.',
    activeCodeLine: 13,
    phase: 'graph-complete',
    statusLabel: 'No path found',
    decision: 'All reachable cells were explored before reaching the goal.',
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
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly statusLabel: string;
  readonly decision: string;
}): SortStep {
  const state: GridTraceState = {
    mode: 'a-star',
    modeLabel: 'A* Pathfinding',
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
