import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { BitmaskDpScenario } from '../utils/dp-scenarios';

export function* dpWithBitmaskGenerator(scenario: BitmaskDpScenario): Generator<SortStep> {
  const workerCount = scenario.workers.length;
  const allMasks = 1 << scenario.jobs.length;
  const dp = Array.from({ length: workerCount + 1 }, () => Array.from({ length: allMasks }, () => Number.POSITIVE_INFINITY));
  const parentJob = Array.from({ length: workerCount + 1 }, () => Array.from({ length: allMasks }, () => null as number | null));
  const backtrackCells = new Set<string>();
  const assignment = new Map<number, number>();

  dp[0]![0] = 0;

  yield createStep({
    scenario,
    dp,
    parentJob,
    backtrackCells,
    assignment,
    description: 'Seed the empty mask with zero cost before assigning any worker to any job.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize empty subset',
    phase: 'init',
  });

  for (let worker = 1; worker <= workerCount; worker++) {
    for (let mask = 0; mask < allMasks; mask++) {
      if (popcount(mask) !== worker) continue;

      let bestCost = Number.POSITIVE_INFINITY;
      let bestJob: number | null = null;

      for (let job = 0; job < scenario.jobs.length; job++) {
        if ((mask & (1 << job)) === 0) continue;
        const previousMask = mask ^ (1 << job);
        const previousCost = dp[worker - 1]![previousMask]!;
        if (!Number.isFinite(previousCost)) continue;
        const candidate = previousCost + scenario.costs[worker - 1]![job]!;

        yield createStep({
          scenario,
          dp,
          parentJob,
          backtrackCells,
          assignment,
          activeCell: [worker, mask],
          candidateCells: [[worker - 1, previousMask]],
          description: `Assign ${scenario.workers[worker - 1]} to ${scenario.jobs[job]} and extend mask ${maskLabel(previousMask, scenario.jobs.length)}.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect job assignment',
          phase: 'compare',
          computation: {
            label: `${scenario.workers[worker - 1]} -> ${scenario.jobs[job]}`,
            expression: `${previousCost} + ${scenario.costs[worker - 1]![job]!}`,
            result: String(candidate),
            decision: candidate < bestCost ? 'new cheaper assignment for this mask' : 'keep previous best job',
          },
        });

        if (candidate < bestCost) {
          bestCost = candidate;
          bestJob = job;
        }
      }

      dp[worker]![mask] = bestCost;
      parentJob[worker]![mask] = bestJob;

      yield createStep({
        scenario,
        dp,
        parentJob,
        backtrackCells,
        assignment,
        activeCell: [worker, mask],
        activeStatus: Number.isFinite(bestCost) ? 'improved' : 'blocked',
        description: `Commit the cheapest way to assign the first ${worker} worker(s) using job mask ${maskLabel(mask, scenario.jobs.length)}.`,
        activeCodeLine: 6,
        phaseLabel: 'Commit subset assignment',
        phase: 'settle-node',
        computation: {
          label: `dp[${worker}][${maskLabel(mask, scenario.jobs.length)}]`,
          expression: bestJob === null ? 'unreachable' : `job = ${scenario.jobs[bestJob]!}`,
          result: Number.isFinite(bestCost) ? String(bestCost) : '∞',
          decision: bestJob === null ? 'mask has no valid parent state' : `store parent job ${scenario.jobs[bestJob]!}`,
        },
      });
    }
  }

  let worker = workerCount;
  let mask = allMasks - 1;
  while (worker > 0 && mask >= 0) {
    const job = parentJob[worker]![mask];
    if (job === null) break;
    assignment.set(worker - 1, job);
    backtrackCells.add(dpCellId(worker, mask));

    yield createStep({
      scenario,
      dp,
      parentJob,
      backtrackCells,
      assignment,
      activeCell: [worker, mask],
      activeStatus: 'backtrack',
      description: `Backtrack ${scenario.workers[worker - 1]} to job ${scenario.jobs[job]}.`,
      activeCodeLine: 8,
      phaseLabel: 'Recover assignment',
      phase: 'relax',
      computation: {
        label: `${scenario.workers[worker - 1]} = ${scenario.jobs[job]}`,
        expression: `mask ${maskLabel(mask, scenario.jobs.length)}`,
        result: assignmentLabel(scenario, assignment),
        decision: `remove ${scenario.jobs[job]} from the used-job mask`,
      },
    });

    mask ^= 1 << job;
    worker -= 1;
  }

  yield createStep({
    scenario,
    dp,
    parentJob,
    backtrackCells,
    assignment,
    description: `Recovered one minimum-cost assignment using subset DP.`,
    activeCodeLine: 9,
    phaseLabel: 'Assignment ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: BitmaskDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly parentJob: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly assignment: ReadonlyMap<number, number>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'blocked' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.scenario.workers.length + 1 }, (_, worker) => ({
    id: `row-${worker}`,
    label: worker === 0 ? '0' : args.scenario.workers[worker - 1]!,
    status: (args.activeCell?.[0] === worker ? 'active' : worker === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: worker === 0 ? 'base' : `${worker} assigned`,
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: 1 << args.scenario.jobs.length }, (_, mask) => ({
    id: `col-${mask}`,
    label: maskLabel(mask, args.scenario.jobs.length),
    status: (args.activeCell?.[1] === mask ? 'active' : mask === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: jobMembers(mask, args.scenario.jobs),
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const value = args.dp[row]![col]!;
      const reachable = Number.isFinite(value);
      const pop = popcount(col);
      const valid = pop === row;
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === 0) tags.push('base');
      if (!valid) tags.push('blocked');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.parentJob[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '0' : args.scenario.workers[row - 1]!,
        colLabel: maskLabel(col, args.scenario.jobs.length),
        valueLabel: !valid ? '—' : reachable ? String(value) : '∞',
        metaLabel: !valid
          ? null
          : args.parentJob[row]![col] === null
            ? row === 0 && col === 0
              ? 'start'
              : null
            : args.scenario.jobs[args.parentJob[row]![col]!]!,
        status: args.backtrackCells.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === 0
                ? 'base'
                : valid && reachable
                  ? 'chosen'
                  : !valid
                    ? 'blocked'
                    : 'idle',
        tags,
      });
    }
  }

  const finalMask = (1 << args.scenario.jobs.length) - 1;
  const finalCost = args.dp[args.scenario.workers.length]![finalMask]!;
  const insights: DpInsight[] = [
    { label: 'Workers', value: String(args.scenario.workers.length), tone: 'accent' },
    { label: 'Masks', value: String(1 << args.scenario.jobs.length), tone: 'info' },
    { label: 'Best cost', value: Number.isFinite(finalCost) ? String(finalCost) : 'pending', tone: 'success' },
    { label: 'Chosen jobs', value: String(args.assignment.size), tone: 'warning' },
    { label: 'Jobs', value: args.scenario.jobs.join(' · '), tone: 'info' },
  ];

  return createDpStep({
    mode: 'dp-with-bitmask',
    modeLabel: 'DP with Bitmask',
    phaseLabel: args.phaseLabel,
    resultLabel: Number.isFinite(finalCost) ? `cost = ${finalCost}` : 'cost pending',
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel: args.activeCell
      ? `${rowHeaders[args.activeCell[0]]!.label} × ${maskLabel(args.activeCell[1], args.scenario.jobs.length)}`
      : null,
    pathLabel: assignmentLabel(args.scenario, args.assignment),
    primaryItemsLabel: 'Workers',
    primaryItems: args.scenario.workers.map((worker) => worker),
    secondaryItemsLabel: 'Jobs',
    secondaryItems: args.scenario.jobs.map((job) => job),
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

function popcount(value: number): number {
  let count = 0;
  let current = value;
  while (current > 0) {
    current &= current - 1;
    count += 1;
  }
  return count;
}

function maskLabel(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0');
}

function jobMembers(mask: number, jobs: readonly string[]): string {
  const members = jobs.filter((_, index) => (mask & (1 << index)) !== 0);
  return members.length > 0 ? members.join(' · ') : 'none';
}

function assignmentLabel(scenario: BitmaskDpScenario, assignment: ReadonlyMap<number, number>): string {
  const parts = Array.from(assignment.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([worker, job]) => `${scenario.workers[worker]!}→${scenario.jobs[job]!}`);
  return parts.length > 0 ? `Assign: ${parts.join(' · ')}` : 'Assign: pending';
}
