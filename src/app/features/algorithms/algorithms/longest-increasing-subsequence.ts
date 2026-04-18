import { DpCellConfig, DpHeaderConfig, createDpStep } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { LisScenario } from '../utils/dp-scenarios/dp-scenarios';

export function* longestIncreasingSubsequenceGenerator(scenario: LisScenario): Generator<SortStep> {
  const values = scenario.values;
  const count = values.length;
  const lengths = Array.from({ length: count }, () => 1);
  const prev = Array.from({ length: count }, () => null as number | null);
  const chosenIndices = new Set<number>();

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    description: 'Initialize every position with subsequence length 1, because each value is a valid LIS by itself.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize singleton lengths',
    phase: 'init',
  });

  for (let index = 0; index < count; index++) {
    for (let candidate = 0; candidate < index; candidate++) {
      const canExtend = values[candidate]! < values[index]!;
      const candidateLength = canExtend ? lengths[candidate]! + 1 : lengths[index]!;

      yield createStep({
        scenario,
        lengths,
        prev,
        chosenIndices,
        activeIndex: index,
        candidateIndex: candidate,
        description: canExtend
          ? `Value ${values[candidate]} can extend into ${values[index]}, so compare LIS length ${lengths[candidate]} + 1.`
          : `Value ${values[candidate]} cannot extend into ${values[index]} because the sequence would stop increasing.`,
        activeCodeLine: 5,
        phaseLabel: 'Inspect predecessor',
        phase: 'compare',
        computation: {
          label: `${values[candidate]} -> ${values[index]}`,
          expression: canExtend ? `${lengths[candidate]} + 1` : `${values[candidate]} >= ${values[index]}`,
          result: canExtend ? String(candidateLength) : 'blocked',
          decision: canExtend && candidateLength > lengths[index]! ? 'new best predecessor' : canExtend ? 'keep previous best' : 'skip candidate',
        },
      });

      if (canExtend && candidateLength > lengths[index]!) {
        lengths[index] = candidateLength;
        prev[index] = candidate;

        yield createStep({
          scenario,
          lengths,
          prev,
          chosenIndices,
          activeIndex: index,
          candidateIndex: candidate,
          activeStatus: 'improved',
          description: `Update LIS ending at index ${index + 1} to length ${candidateLength} via predecessor index ${candidate + 1}.`,
          activeCodeLine: 6,
          phaseLabel: 'Commit better predecessor',
          phase: 'settle-node',
          computation: {
            label: `len[${index + 1}]`,
            expression: `prev = ${candidate + 1}`,
            result: String(candidateLength),
            decision: `route now flows through ${values[candidate]}`,
          },
        });
      }
    }

    yield createStep({
      scenario,
      lengths,
      prev,
      chosenIndices,
      activeIndex: index,
      activeStatus: 'chosen',
      description: `Finalize the best LIS that ends exactly at index ${index + 1}.`,
      activeCodeLine: 8,
      phaseLabel: 'Lock index result',
      phase: 'settle-node',
      computation: {
        label: `finish ${values[index]}`,
        expression: `len = ${lengths[index]}`,
        result: prev[index] === null ? 'start' : `prev ${values[prev[index]!]} `,
        decision: prev[index] === null ? 'single-value subsequence' : 'best predecessor kept',
      },
    });
  }

  let bestIndex = 0;
  for (let index = 1; index < count; index++) {
    if (lengths[index]! > lengths[bestIndex]!) bestIndex = index;
  }

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    activeIndex: bestIndex,
    activeStatus: 'improved',
    description: `Pick index ${bestIndex + 1} as the LIS endpoint because it has the strongest length.`,
    activeCodeLine: 10,
    phaseLabel: 'Choose best endpoint',
    phase: 'compare',
    computation: {
      label: 'Best endpoint',
      expression: lengths.map((value, index) => `i${index + 1}:${value}`).join(' · '),
      result: `i${bestIndex + 1}`,
      decision: `length ${lengths[bestIndex]}`,
    },
  });

  let cursor: number | null = bestIndex;
  while (cursor !== null) {
    chosenIndices.add(cursor);

    yield createStep({
      scenario,
      lengths,
      prev,
      chosenIndices,
      activeIndex: cursor,
      activeStatus: 'backtrack',
      description: `Trace LIS backwards through index ${cursor + 1}.`,
      activeCodeLine: 11,
      phaseLabel: 'Backtrack LIS path',
      phase: 'relax',
      computation: {
        label: `Trace ${values[cursor]}`,
        expression: prev[cursor] === null ? 'start of chain' : `prev = ${values[prev[cursor]!]} `,
        result: lisLabel(scenario, chosenIndices),
        decision: prev[cursor] === null ? 'sequence origin reached' : 'jump to predecessor',
      },
    });

    cursor = prev[cursor];
  }

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    description: `Recovered one longest increasing subsequence with length ${lengths[bestIndex]!}.`,
    activeCodeLine: 12,
    phaseLabel: 'LIS ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: LisScenario;
  readonly lengths: readonly number[];
  readonly prev: readonly (number | null)[];
  readonly chosenIndices: ReadonlySet<number>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndex?: number;
  readonly activeStatus?: 'active' | 'improved' | 'chosen' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const colHeaders: DpHeaderConfig[] = args.scenario.values.map((value, index) => ({
    id: `col-${index}`,
    label: `${index + 1}`,
    status: (args.activeIndex === index ? 'active' : args.candidateIndex === index ? 'accent' : 'idle') as DpHeaderConfig['status'],
    metaLabel: `${value}`,
  }));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-values', label: 'value', status: 'source', metaLabel: 'input' },
    { id: 'row-len', label: 'len', status: 'accent', metaLabel: 'best' },
    { id: 'row-prev', label: 'prev', status: 'target', metaLabel: 'link' },
  ];

  const cells: DpCellConfig[] = [];
  for (let index = 0; index < args.scenario.values.length; index++) {
    const isChosen = args.chosenIndices.has(index);
    const isActive = args.activeIndex === index;
    const isCandidate = args.candidateIndex === index;

    const valueTags: DpTraceTag[] = [];
    if (isCandidate) valueTags.push('take');
    if (isChosen) valueTags.push('path');
    if (isActive) valueTags.push('active');

    const lenTags: DpTraceTag[] = ['best'];
    if (isCandidate) lenTags.push('take');
    if (isChosen) lenTags.push('path');
    if (isActive) lenTags.push('active');

    const prevTags: DpTraceTag[] = [];
    if (args.prev[index] !== null) prevTags.push('skip');
    if (isChosen) prevTags.push('path');
    if (isActive) prevTags.push('active');

    cells.push({
      row: 0,
      col: index,
      rowLabel: 'value',
      colLabel: `${index + 1}`,
      valueLabel: String(args.scenario.values[index]!),
      metaLabel: isChosen ? 'LIS' : null,
      status: isChosen ? 'backtrack' : isCandidate ? 'candidate' : 'base',
      tags: valueTags,
    });

    cells.push({
      row: 1,
      col: index,
      rowLabel: 'len',
      colLabel: `${index + 1}`,
      valueLabel: String(args.lengths[index]!),
      metaLabel: `i${index + 1}`,
      status: isChosen
        ? 'backtrack'
        : isActive
          ? (args.activeStatus ?? 'active')
          : isCandidate
            ? 'candidate'
            : 'chosen',
      tags: lenTags,
    });

    cells.push({
      row: 2,
      col: index,
      rowLabel: 'prev',
      colLabel: `${index + 1}`,
      valueLabel: args.prev[index] === null ? '—' : String(args.prev[index]! + 1),
      metaLabel: args.prev[index] === null ? 'start' : `${args.scenario.values[args.prev[index]!]}`,
      status: isChosen ? 'backtrack' : isActive ? 'active' : args.prev[index] === null ? 'base' : 'idle',
      tags: prevTags,
    });
  }

  const bestLength = Math.max(...args.lengths);
  const insights: DpInsight[] = [
    { label: 'Values', value: String(args.scenario.values.length), tone: 'accent' },
    { label: 'Best length', value: String(bestLength), tone: 'success' },
    { label: 'Chosen route', value: String(args.chosenIndices.size), tone: 'warning' },
    { label: 'Peak value', value: String(Math.max(...args.scenario.values)), tone: 'info' },
    { label: 'Strip', value: '3 × n', tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-increasing-subsequence',
    modeLabel: 'Longest Increasing Subsequence',
    phaseLabel: args.phaseLabel,
    resultLabel: `len = ${bestLength}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `3 × ${args.scenario.values.length}`,
    activeLabel: args.activeIndex === undefined ? null : `idx ${args.activeIndex + 1} = ${args.scenario.values[args.activeIndex]!}`,
    pathLabel: lisLabel(args.scenario, args.chosenIndices),
    primaryItemsLabel: 'Input values',
    primaryItems: args.scenario.values.map((value, index) => `${index + 1}:${value}`),
    secondaryItemsLabel: 'Current lengths',
    secondaryItems: args.lengths.map((value, index) => `i${index + 1}=${value}`),
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

function lisLabel(scenario: LisScenario, chosenIndices: ReadonlySet<number>): string {
  const ordered = Array.from(chosenIndices).sort((left, right) => left - right).map((index) => scenario.values[index]!);
  return ordered.length > 0 ? `LIS: ${ordered.join(' → ')}` : 'LIS: pending';
}
