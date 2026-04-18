import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { TravelingSalesmanScenario } from '../utils/dp-scenarios/dp-scenarios';

export function* travelingSalesmanDpGenerator(scenario: TravelingSalesmanScenario): Generator<SortStep> {
  const cityCount = scenario.labels.length;
  const start = scenario.startIndex;
  const fullMask = (1 << cityCount) - 1;
  const validMasks = Array.from({ length: fullMask + 1 }, (_, mask) => mask).filter((mask) => (mask & (1 << start)) !== 0);
  const rowIndexByMask = new Map(validMasks.map((mask, index) => [mask, index]));
  const cost = validMasks.map(() => Array.from({ length: cityCount }, () => Number.POSITIVE_INFINITY));
  const parent = validMasks.map(() => Array.from({ length: cityCount }, () => null as number | null));
  const backtrackCells = new Set<string>();

  const startRow = rowIndexByMask.get(1 << start)!;
  cost[startRow]![start] = 0;

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    description: `Seed the DP with only the start city ${scenario.labels[start]} visited and cost 0.`,
    activeCodeLine: 2,
    phaseLabel: 'Initialize start subset',
    phase: 'init',
  });

  for (const mask of validMasks) {
    const row = rowIndexByMask.get(mask)!;
    for (let end = 0; end < cityCount; end++) {
      if ((mask & (1 << end)) === 0) continue;
      if (!Number.isFinite(cost[row]![end]!)) continue;

      for (let next = 0; next < cityCount; next++) {
        if ((mask & (1 << next)) !== 0) continue;
        const nextMask = mask | (1 << next);
        const nextRow = rowIndexByMask.get(nextMask)!;
        const edgeCost = scenario.distances[end]![next]!;
        const candidate = cost[row]![end]! + edgeCost;

        yield createStep({
          scenario,
          validMasks,
          cost,
          parent,
          backtrackCells,
          activeCell: [nextRow, next],
          candidateCells: [[row, end]],
          description: `Extend subset ${maskLabel(mask, cityCount)} from ${scenario.labels[end]} to ${scenario.labels[next]}.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect subset extension',
          phase: 'compare',
          computation: {
            label: `${maskLabel(mask, cityCount)} -> ${scenario.labels[next]}`,
            expression: `${cost[row]![end]!} + ${edgeCost}`,
            result: String(candidate),
            decision: candidate < cost[nextRow]![next]! ? 'new cheaper route into expanded subset' : 'existing state stays better',
          },
        });

        if (candidate < cost[nextRow]![next]!) {
          cost[nextRow]![next] = candidate;
          parent[nextRow]![next] = end;

          yield createStep({
            scenario,
            validMasks,
            cost,
            parent,
            backtrackCells,
            activeCell: [nextRow, next],
            candidateCells: [[row, end]],
            activeStatus: 'improved',
            description: `Commit improved DP state for subset ${maskLabel(nextMask, cityCount)} ending at ${scenario.labels[next]}.`,
            activeCodeLine: 6,
            phaseLabel: 'Commit expanded subset',
            phase: 'settle-node',
            computation: {
              label: `dp[${maskLabel(nextMask, cityCount)}][${scenario.labels[next]}]`,
              expression: `from ${scenario.labels[end]}`,
              result: String(candidate),
              decision: `parent = ${scenario.labels[end]}`,
            },
          });
        }
      }
    }
  }

  const fullRow = rowIndexByMask.get(fullMask)!;
  let bestTour = Number.POSITIVE_INFINITY;
  let bestEnd = start;

  for (let end = 0; end < cityCount; end++) {
    if (end === start || !Number.isFinite(cost[fullRow]![end]!)) continue;
    const candidate = cost[fullRow]![end]! + scenario.distances[end]![start]!;

    yield createStep({
      scenario,
      validMasks,
      cost,
      parent,
      backtrackCells,
      activeCell: [fullRow, end],
      candidateCells: [[fullRow, end]],
      description: `Close the tour by returning from ${scenario.labels[end]} back to ${scenario.labels[start]}.`,
      activeCodeLine: 8,
      phaseLabel: 'Inspect cycle closure',
      phase: 'compare',
      computation: {
        label: `close via ${scenario.labels[end]}`,
        expression: `${cost[fullRow]![end]!} + ${scenario.distances[end]![start]!}`,
        result: String(candidate),
        decision: candidate < bestTour ? 'new best Hamiltonian cycle' : 'keep earlier closure',
      },
    });

    if (candidate < bestTour) {
      bestTour = candidate;
      bestEnd = end;
    }
  }

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    activeCell: [fullRow, bestEnd],
    activeStatus: 'improved',
    description: `Best closure returns through ${scenario.labels[bestEnd]} with total tour cost ${bestTour}.`,
    activeCodeLine: 9,
    phaseLabel: 'Pick best closing city',
    phase: 'settle-node',
    computation: {
      label: 'Best tour end city',
      expression: scenario.labels.map((label, end) =>
        end === start || !Number.isFinite(cost[fullRow]![end]!)
          ? `${label}: —`
          : `${label}: ${cost[fullRow]![end]! + scenario.distances[end]![start]!}`,
      ).join(' · '),
      result: scenario.labels[bestEnd]!,
      decision: `tour closes cheapest via ${scenario.labels[bestEnd]}`,
    },
  });

  const reverseTrace: number[] = [];
  let cursorMask = fullMask;
  let cursorCity = bestEnd;
  while (cursorCity !== start) {
    const row = rowIndexByMask.get(cursorMask)!;
    backtrackCells.add(dpCellId(row, cursorCity));
    reverseTrace.push(cursorCity);

    yield createStep({
      scenario,
      validMasks,
      cost,
      parent,
      backtrackCells,
      activeCell: [row, cursorCity],
      activeStatus: 'backtrack',
      reverseTrace,
      description: `Trace parent pointer from ${scenario.labels[cursorCity]} toward the start city.`,
      activeCodeLine: 10,
      phaseLabel: 'Backtrack Hamiltonian route',
      phase: 'relax',
      computation: {
        label: `Trace ${scenario.labels[cursorCity]}`,
        expression: parent[row]![cursorCity] === null ? 'start' : `prev = ${scenario.labels[parent[row]![cursorCity]!]}`,
        result: reverseRouteLabel(scenario, reverseTrace),
        decision: parent[row]![cursorCity] === null ? 'done' : 'jump to saved predecessor',
      },
    });

    const previous = parent[row]![cursorCity];
    cursorMask &= ~(1 << cursorCity);
    cursorCity = previous ?? start;
  }

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    reverseTrace,
    description: `Recovered one optimal tour with Held-Karp subset DP.`,
    activeCodeLine: 11,
    phaseLabel: 'Tour ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: TravelingSalesmanScenario;
  readonly validMasks: readonly number[];
  readonly cost: readonly (readonly number[])[];
  readonly parent: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
  readonly reverseTrace?: readonly number[];
}): SortStep {
  const cityCount = args.scenario.labels.length;
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const rowHeaders: DpHeaderConfig[] = args.validMasks.map((mask) => ({
    id: `row-${mask}`,
    label: maskLabel(mask, cityCount),
    status: (args.activeCell && args.validMasks[args.activeCell[0]] === mask ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: memberLabel(mask, args.scenario.labels),
  }));
  const colHeaders: DpHeaderConfig[] = args.scenario.labels.map((label, index) => ({
    id: `col-${index}`,
    label,
    status: (args.activeCell?.[1] === index ? 'active' : index === args.scenario.startIndex ? 'source' : 'target') as DpHeaderConfig['status'],
    metaLabel: index === args.scenario.startIndex ? 'start' : 'end',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.validMasks.length; row++) {
    const mask = args.validMasks[row]!;
    for (let col = 0; col < cityCount; col++) {
      const id = dpCellId(row, col);
      const cityInMask = (mask & (1 << col)) !== 0;
      const value = args.cost[row]![col]!;
      const reachable = Number.isFinite(value);
      const isBacktrack = args.backtrackCells.has(id);
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === args.scenario.startIndex) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (isBacktrack) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.parent[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: maskLabel(mask, cityCount),
        colLabel: args.scenario.labels[col]!,
        valueLabel: !cityInMask ? '—' : reachable ? String(value) : '∞',
        metaLabel: !cityInMask
          ? null
          : args.parent[row]![col] === null
            ? col === args.scenario.startIndex && mask === (1 << args.scenario.startIndex)
              ? 'start'
              : null
            : `from ${args.scenario.labels[args.parent[row]![col]!]}`,
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === args.scenario.startIndex
                ? 'base'
                : cityInMask && reachable
                  ? 'chosen'
                  : 'idle',
        tags,
      });
    }
  }

  const fullRow = args.validMasks.length - 1;
  const bestKnown = Math.min(...args.cost[fullRow]!.filter((value) => Number.isFinite(value)));
  const reverseTrace = args.reverseTrace ?? [];
  const insights: DpInsight[] = [
    { label: 'Cities', value: String(cityCount), tone: 'accent' },
    { label: 'Subset rows', value: String(args.validMasks.length), tone: 'info' },
    { label: 'Best open route', value: Number.isFinite(bestKnown) ? String(bestKnown) : 'pending', tone: 'success' },
    { label: 'Trace depth', value: String(reverseTrace.length), tone: 'warning' },
    { label: 'Start', value: args.scenario.labels[args.scenario.startIndex]!, tone: 'info' },
  ];

  return createDpStep({
    mode: 'traveling-salesman-dp',
    modeLabel: 'Traveling Salesman DP',
    phaseLabel: args.phaseLabel,
    resultLabel: tspResultLabel(args.scenario, args.cost, args.validMasks),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.validMasks.length} × ${cityCount}`,
    activeLabel: args.activeCell ? `${maskLabel(args.validMasks[args.activeCell[0]]!, cityCount)} -> ${args.scenario.labels[args.activeCell[1]]}` : null,
    pathLabel: finalTourLabel(args.scenario, reverseTrace),
    primaryItemsLabel: 'Cities',
    primaryItems: args.scenario.labels.map((label, index) => `${label}${index === args.scenario.startIndex ? ' (start)' : ''}`),
    secondaryItemsLabel: 'Distance lens',
    secondaryItems: args.activeCell
      ? args.scenario.distances[args.activeCell[1]]!.map((value, index) => `${args.scenario.labels[args.activeCell![1]]}→${args.scenario.labels[index]}=${value}`)
      : args.scenario.labels.map((label, index) => `${label} row`),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function maskLabel(mask: number, cityCount: number): string {
  return mask.toString(2).padStart(cityCount, '0');
}

function memberLabel(mask: number, labels: readonly string[]): string {
  return labels.filter((_, index) => (mask & (1 << index)) !== 0).join(' · ');
}

function reverseRouteLabel(scenario: TravelingSalesmanScenario, reverseTrace: readonly number[]): string {
  if (reverseTrace.length === 0) return `Trace: ${scenario.labels[scenario.startIndex]}`;
  return `Trace: ${reverseTrace.map((index) => scenario.labels[index]!).join(' ← ')} ← ${scenario.labels[scenario.startIndex]}`;
}

function finalTourLabel(scenario: TravelingSalesmanScenario, reverseTrace: readonly number[]): string {
  if (reverseTrace.length === 0) return `Tour: ${scenario.labels[scenario.startIndex]} → ...`;
  const ordered = [...reverseTrace].reverse();
  return `Tour: ${[scenario.labels[scenario.startIndex]!, ...ordered.map((index) => scenario.labels[index]!), scenario.labels[scenario.startIndex]!].join(' → ')}`;
}

function tspResultLabel(
  scenario: TravelingSalesmanScenario,
  cost: readonly (readonly number[])[],
  validMasks: readonly number[],
): string {
  const fullRow = validMasks.length - 1;
  let best = Number.POSITIVE_INFINITY;
  for (let end = 0; end < scenario.labels.length; end++) {
    if (end === scenario.startIndex || !Number.isFinite(cost[fullRow]![end]!)) continue;
    best = Math.min(best, cost[fullRow]![end]! + scenario.distances[end]![scenario.startIndex]!);
  }
  return Number.isFinite(best) ? `tour = ${best}` : 'tour pending';
}
