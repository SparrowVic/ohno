import { DpCellConfig, DpHeaderConfig, createDpStep } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { ChtDpScenario } from '../utils/dp-scenarios/dp-scenarios';

interface HullLine {
  readonly index: number;
  readonly m: number;
  readonly b: number;
}

export function* dpConvexHullTrickGenerator(scenario: ChtDpScenario): Generator<SortStep> {
  const xValues = scenario.xValues;
  const count = xValues.length;
  const dp = Array.from({ length: count }, () => Number.POSITIVE_INFINITY);
  const bestLineIndex = Array.from({ length: count }, () => null as number | null);
  const queryValue = Array.from({ length: count }, () => null as number | null);
  const prev = Array.from({ length: count }, () => null as number | null);
  const chosen = new Set<number>();
  const hull: HullLine[] = [];

  dp[0] = 0;
  const firstLine = makeLine(0, xValues[0]!, dp[0]!);
  hull.push(firstLine);

  yield createStep({
    scenario,
    dp,
    bestLineIndex,
    queryValue,
    prev,
    hull,
    chosen,
    description: 'Start with the first point and insert its line into the lower hull for future queries.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize first hull line',
    phase: 'init',
  });

  for (let index = 1; index < count; index++) {
    const x = xValues[index]!;

    while (hull.length >= 2 && evaluate(hull[1]!, x) <= evaluate(hull[0]!, x)) {
      yield createStep({
        scenario,
        dp,
        bestLineIndex,
        queryValue,
        prev,
        hull,
        chosen,
        activeIndex: index,
        candidateIndex: hull[0]!.index,
        description: `At x = ${x}, the next hull line beats the current front line, so the old front becomes obsolete for all later queries.`,
        activeCodeLine: 5,
        phaseLabel: 'Advance query pointer',
        phase: 'compare',
        computation: {
          label: `query x = ${x}`,
          expression: `${lineLabel(hull[0]!)} => ${evaluate(hull[0]!, x)} vs ${lineLabel(hull[1]!)} => ${evaluate(hull[1]!, x)}`,
          result: lineLabel(hull[1]!),
          decision: 'pop front line from the active hull',
        },
      });
      hull.shift();
    }

    const bestLine = hull[0]!;
    const bestValue = evaluate(bestLine, x);
    queryValue[index] = bestValue;
    bestLineIndex[index] = bestLine.index;
    prev[index] = bestLine.index;
    dp[index] = x * x + scenario.transitionCost + bestValue;

    yield createStep({
      scenario,
      dp,
      bestLineIndex,
      queryValue,
      prev,
      hull,
      chosen,
      activeIndex: index,
      candidateIndex: bestLine.index,
      activeStatus: 'improved',
      description: `Query the front hull line at x = ${x} and combine it with the quadratic term to get dp[${index + 1}].`,
      activeCodeLine: 6,
      phaseLabel: 'Commit hull query result',
      phase: 'settle-node',
      computation: {
        label: `dp[${index + 1}]`,
        expression: `${x}² + ${scenario.transitionCost} + ${bestValue}`,
        result: String(dp[index]!),
        decision: `best predecessor line comes from point ${bestLine.index + 1}`,
      },
    });

    const nextLine = makeLine(index, x, dp[index]!);
    while (hull.length >= 2 && isBad(hull[hull.length - 2]!, hull[hull.length - 1]!, nextLine)) {
      yield createStep({
        scenario,
        dp,
        bestLineIndex,
        queryValue,
        prev,
        hull,
        chosen,
        activeIndex: index,
        candidateIndex: hull[hull.length - 1]!.index,
        description: `The newest line from point ${index + 1} makes the previous tail line irrelevant, so prune the hull.`,
        activeCodeLine: 7,
        phaseLabel: 'Prune dominated hull line',
        phase: 'compare',
        computation: {
          label: `prune with ${lineLabel(nextLine)}`,
          expression: `${lineLabel(hull[hull.length - 2]!)} · ${lineLabel(hull[hull.length - 1]!)} · ${lineLabel(nextLine)}`,
          result: lineLabel(hull[hull.length - 1]!),
          decision: 'middle line loses every future monotone query',
        },
      });
      hull.pop();
    }

    hull.push(nextLine);

    yield createStep({
      scenario,
      dp,
      bestLineIndex,
      queryValue,
      prev,
      hull,
      chosen,
      activeIndex: index,
      activeStatus: 'chosen',
      description: `Append the fresh line from point ${index + 1} to the hull for later x-queries.`,
      activeCodeLine: 8,
      phaseLabel: 'Insert new hull line',
      phase: 'settle-node',
      computation: {
        label: lineLabel(nextLine),
        expression: `m = ${nextLine.m}, b = ${nextLine.b}`,
        result: `hull size ${hull.length}`,
        decision: 'line is ready for future monotone queries',
      },
    });
  }

  let cursor: number | null = count - 1;
  while (cursor !== null) {
    chosen.add(cursor);
    yield createStep({
      scenario,
      dp,
      bestLineIndex,
      queryValue,
      prev,
      hull,
      chosen,
      activeIndex: cursor,
      activeStatus: 'backtrack',
      description: `Trace dp predecessor links backwards from point ${cursor + 1}.`,
      activeCodeLine: 9,
      phaseLabel: 'Backtrack chosen transitions',
      phase: 'relax',
      computation: {
        label: `trace ${cursor + 1}`,
        expression: prev[cursor] === null ? 'origin' : `prev = ${prev[cursor]! + 1}`,
        result: chtPathLabel(scenario, chosen),
        decision: prev[cursor] === null ? 'backtrack finished' : 'jump to predecessor point',
      },
    });
    cursor = prev[cursor];
  }

  yield createStep({
    scenario,
    dp,
    bestLineIndex,
    queryValue,
    prev,
    hull,
    chosen,
    description: `Finished the monotone convex hull trick pass.`,
    activeCodeLine: 10,
    phaseLabel: 'Hull DP ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: ChtDpScenario;
  readonly dp: readonly number[];
  readonly bestLineIndex: readonly (number | null)[];
  readonly queryValue: readonly (number | null)[];
  readonly prev: readonly (number | null)[];
  readonly hull: readonly HullLine[];
  readonly chosen: ReadonlySet<number>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndex?: number;
  readonly activeStatus?: 'active' | 'improved' | 'chosen' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const headers: DpHeaderConfig[] = args.scenario.xValues.map((x, index) => ({
    id: `col-${index}`,
    label: `p${index + 1}`,
    status: (args.activeIndex === index ? 'active' : args.candidateIndex === index ? 'accent' : 'idle') as DpHeaderConfig['status'],
    metaLabel: `x=${x}`,
  }));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-x', label: 'x', status: 'source', metaLabel: 'point' },
    { id: 'row-line', label: 'line', status: 'accent', metaLabel: 'best j' },
    { id: 'row-query', label: 'query', status: 'target', metaLabel: 'm·x+b' },
    { id: 'row-dp', label: 'dp', status: 'target', metaLabel: 'state' },
  ];

  const cells: DpCellConfig[] = [];
  for (let index = 0; index < args.scenario.xValues.length; index++) {
    const isChosen = args.chosen.has(index);
    const isActive = args.activeIndex === index;
    const isCandidate = args.candidateIndex === index;

    cells.push({
      row: 0,
      col: index,
      rowLabel: 'x',
      colLabel: `p${index + 1}`,
      valueLabel: String(args.scenario.xValues[index]!),
      metaLabel: isChosen ? 'path' : null,
      status: isChosen ? 'backtrack' : 'base',
      tags: [...(isChosen ? (['path'] as const) : []), ...(isActive ? (['active'] as const) : [])],
    });

    const lineTags: DpTraceTag[] = [];
    if (args.bestLineIndex[index] !== null) lineTags.push('take');
    if (isChosen) lineTags.push('path');
    if (isActive) lineTags.push('active');

    cells.push({
      row: 1,
      col: index,
      rowLabel: 'line',
      colLabel: `p${index + 1}`,
      valueLabel: args.bestLineIndex[index] === null ? '—' : `p${args.bestLineIndex[index]! + 1}`,
      metaLabel: args.bestLineIndex[index] === null ? null : `x=${args.scenario.xValues[args.bestLineIndex[index]!]}`,
      status: isChosen ? 'backtrack' : isActive ? (args.activeStatus ?? 'active') : isCandidate ? 'candidate' : args.bestLineIndex[index] === null ? 'idle' : 'chosen',
      tags: lineTags,
    });

    const queryTags: DpTraceTag[] = [];
    if (args.queryValue[index] !== null) queryTags.push('best');
    if (isChosen) queryTags.push('path');
    if (isActive) queryTags.push('active');

    cells.push({
      row: 2,
      col: index,
      rowLabel: 'query',
      colLabel: `p${index + 1}`,
      valueLabel: args.queryValue[index] === null ? '—' : String(args.queryValue[index]!),
      metaLabel: args.queryValue[index] === null ? null : 'min line',
      status: isChosen ? 'backtrack' : isActive ? (args.activeStatus ?? 'active') : args.queryValue[index] === null ? 'idle' : 'chosen',
      tags: queryTags,
    });

    const dpTags: DpTraceTag[] = [];
    if (Number.isFinite(args.dp[index]!)) dpTags.push('best');
    if (isChosen) dpTags.push('path');
    if (isActive) dpTags.push('active');

    cells.push({
      row: 3,
      col: index,
      rowLabel: 'dp',
      colLabel: `p${index + 1}`,
      valueLabel: Number.isFinite(args.dp[index]!) ? String(args.dp[index]!) : '∞',
      metaLabel: index === 0 ? 'seed' : null,
      status: isChosen ? 'backtrack' : isActive ? (args.activeStatus ?? 'active') : Number.isFinite(args.dp[index]!) ? 'improved' : 'idle',
      tags: dpTags,
    });
  }

  const insights: DpInsight[] = [
    { label: 'Points', value: String(args.scenario.xValues.length), tone: 'accent' },
    { label: 'Hull size', value: String(args.hull.length), tone: 'info' },
    { label: 'Last dp', value: Number.isFinite(args.dp[args.dp.length - 1]!) ? String(args.dp[args.dp.length - 1]!) : 'pending', tone: 'success' },
    { label: 'Transitions', value: String(args.chosen.size), tone: 'warning' },
    { label: 'Cost C', value: String(args.scenario.transitionCost), tone: 'info' },
  ];

  return createDpStep({
    mode: 'dp-convex-hull-trick',
    modeLabel: 'DP Convex Hull Trick',
    phaseLabel: args.phaseLabel,
    resultLabel: Number.isFinite(args.dp[args.dp.length - 1]!) ? `dp = ${args.dp[args.dp.length - 1]!}` : 'dp pending',
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `4 × ${args.scenario.xValues.length}`,
    activeLabel: args.activeIndex === undefined ? null : `point ${args.activeIndex + 1}`,
    pathLabel: chtPathLabel(args.scenario, args.chosen),
    primaryItemsLabel: 'Point x-values',
    primaryItems: args.scenario.xValues.map((x, index) => `p${index + 1}:${x}`),
    secondaryItemsLabel: 'Active hull lines',
    secondaryItems: args.hull.map((line) => lineLabel(line)),
    insights,
    rowHeaders,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function makeLine(index: number, x: number, dpValue: number): HullLine {
  return { index, m: -2 * x, b: dpValue + x * x };
}

function evaluate(line: HullLine, x: number): number {
  return line.m * x + line.b;
}

function isBad(left: HullLine, middle: HullLine, right: HullLine): boolean {
  const leftCross = (middle.b - left.b) / (left.m - middle.m);
  const rightCross = (right.b - left.b) / (left.m - right.m);
  return leftCross >= rightCross;
}

function lineLabel(line: HullLine): string {
  return `p${line.index + 1}: y=${line.m}x+${line.b}`;
}

function chtPathLabel(scenario: ChtDpScenario, chosen: ReadonlySet<number>): string {
  const points = Array.from(chosen).sort((left, right) => left - right).map((index) => `p${index + 1}@${scenario.xValues[index]!}`);
  return points.length > 0 ? `Path: ${points.join(' → ')}` : 'Path: pending';
}
