import { GridTraceCell, GridTraceState } from '../models/grid';
import { SortStep } from '../models/sort-step';
import { cellId, FloodFillScenario, labelForCell, neighbors } from '../utils/grid-scenarios';

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
    description: `Start flood fill at ${labelForCell(scenario.startRow, scenario.startCol)} and look for color ${scenario.sourceColor}.`,
    activeCodeLine: 2,
    phase: 'init',
    statusLabel: 'Ready to spread',
    decision: `Replace region color ${scenario.sourceColor} with ${scenario.fillColor}.`,
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
      description: `Inspect ${labelForCell(row, col)} at wave depth ${depth}.`,
      activeCodeLine: 5,
      phase: 'pick-node',
      statusLabel: 'Inspect current cell',
      decision: `Cell color is ${scenario.cells[row]?.[col] ?? '?'}.`,
    });

    if ((scenario.cells[row]?.[col] ?? null) !== scenario.sourceColor || filled.has(currentId)) {
      yield createFloodFillStep({
        scenario,
        filled,
        frontier,
        visited,
        order,
        activeId: currentId,
        description: `${labelForCell(row, col)} does not belong to the fill region, so stop spreading through it.`,
        activeCodeLine: 6,
        phase: 'skip-relax',
        statusLabel: 'Blocked cell',
        decision: 'Keep original color and skip expansion.',
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
      description: `Fill ${labelForCell(row, col)} and expand to its four neighbors.`,
      activeCodeLine: 7,
      phase: 'relax',
      statusLabel: 'Region expands',
      decision: `Painted with color ${scenario.fillColor}.`,
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
        description: `Queue ${labelForCell(nextRow, nextCol)} as the next matching cell in the wave.`,
        activeCodeLine: 8,
        phase: 'inspect-edge',
        statusLabel: 'Queue matching neighbor',
        decision: `Same source color ${scenario.sourceColor}, so it joins the frontier.`,
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
    description: `Flood fill complete. Painted ${filled.size} cell(s) from the selected region.`,
    activeCodeLine: 10,
    phase: 'graph-complete',
    statusLabel: 'Region complete',
    decision: `Final painted region size: ${filled.size}.`,
  });
}

function createFloodFillStep(args: {
  readonly scenario: FloodFillScenario;
  readonly filled: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visited: ReadonlySet<string>;
  readonly order: readonly string[];
  readonly activeId: string | null;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly statusLabel: string;
  readonly decision: string;
}): SortStep {
  const state: GridTraceState = {
    mode: 'flood-fill',
    modeLabel: 'Flood Fill',
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
    targetLabel: `fill ${args.scenario.fillColor}`,
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
