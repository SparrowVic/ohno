import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { SosDpScenario } from '../utils/dp-scenarios';

export function* sosDpGenerator(scenario: SosDpScenario): Generator<SortStep> {
  const stages = scenario.bitCount + 1;
  const maskCount = 1 << scenario.bitCount;
  const table = Array.from({ length: stages }, (_, row) =>
    Array.from({ length: maskCount }, (_, mask) => (row === 0 ? scenario.baseValues[mask]! : 0)),
  );
  const traced = new Set<string>();
  const contributingMasks = new Set<number>();

  yield createStep({
    scenario,
    table,
    traced,
    contributingMasks,
    description: 'Start with the base function values on row 0 before any SOS bit transitions are applied.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize base subset row',
    phase: 'init',
  });

  for (let bit = 0; bit < scenario.bitCount; bit++) {
    for (let mask = 0; mask < maskCount; mask++) {
      table[bit + 1]![mask] = table[bit]![mask]!;

      if ((mask & (1 << bit)) === 0) {
        yield createStep({
          scenario,
          table,
          traced,
          contributingMasks,
          activeCell: [bit + 1, mask],
          candidateCells: [[bit, mask]],
          description: `Mask ${maskLabel(mask, scenario.bitCount)} does not contain bit ${bit}, so the next stage just carries its previous value.`,
          activeCodeLine: 5,
          phaseLabel: 'Carry untouched mask',
          phase: 'settle-node',
          computation: {
            label: `${maskLabel(mask, scenario.bitCount)} @ bit ${bit}`,
            expression: `dp[${bit}][${maskLabel(mask, scenario.bitCount)}]`,
            result: String(table[bit + 1]![mask]!),
            decision: 'bit absent, so no subset merge happens',
          },
        });
        continue;
      }

      const submask = mask ^ (1 << bit);
      const candidate = table[bit]![mask]! + table[bit]![submask]!;

      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [bit + 1, mask],
        candidateCells: [[bit, mask], [bit, submask]],
        description: `Bit ${bit} is set in mask ${maskLabel(mask, scenario.bitCount)}, so add the submask ${maskLabel(submask, scenario.bitCount)} contribution.`,
        activeCodeLine: 5,
        phaseLabel: 'Merge submask contribution',
        phase: 'compare',
        computation: {
          label: `${maskLabel(mask, scenario.bitCount)} via bit ${bit}`,
          expression: `${table[bit]![mask]!} + ${table[bit]![submask]!}`,
          result: String(candidate),
          decision: `aggregate all subsets differing only by bit ${bit}`,
        },
      });

      table[bit + 1]![mask] = candidate;

      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [bit + 1, mask],
        candidateCells: [[bit, mask], [bit, submask]],
        activeStatus: 'improved',
        description: `Commit the updated sum-over-subsets value for ${maskLabel(mask, scenario.bitCount)} after processing bit ${bit}.`,
        activeCodeLine: 6,
        phaseLabel: 'Commit SOS transition',
        phase: 'settle-node',
        computation: {
          label: `dp[${bit + 1}][${maskLabel(mask, scenario.bitCount)}]`,
          expression: `${table[bit]![mask]!} + ${table[bit]![submask]!}`,
          result: String(table[bit + 1]![mask]!),
          decision: 'stage accumulates every relevant submask',
        },
      });
    }
  }

  yield* traceContributors(scenario.bitCount, scenario.focusMask);

  yield createStep({
    scenario,
    table,
    traced,
    contributingMasks,
    description: `Recovered the base masks that contribute to focused mask ${maskLabel(scenario.focusMask, scenario.bitCount)}.`,
    activeCodeLine: 8,
    phaseLabel: 'Contributors ready',
    phase: 'complete',
  });

  function* traceContributors(stage: number, mask: number): Generator<SortStep> {
    traced.add(dpCellId(stage, mask));
    if (stage === 0) {
      contributingMasks.add(mask);
      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [stage, mask],
        activeStatus: 'backtrack',
        description: `Base mask ${maskLabel(mask, scenario.bitCount)} contributes directly to the focused SOS result.`,
        activeCodeLine: 7,
        phaseLabel: 'Trace base contributor',
        phase: 'relax',
        computation: {
          label: maskLabel(mask, scenario.bitCount),
          expression: `f[${maskLabel(mask, scenario.bitCount)}]`,
          result: contributorsLabel(scenario, contributingMasks),
          decision: 'record base submask contributor',
        },
      });
      return;
    }

    yield createStep({
      scenario,
      table,
      traced,
      contributingMasks,
      activeCell: [stage, mask],
      activeStatus: 'backtrack',
      description: `Trace the focused mask through SOS stage ${stage}.`,
      activeCodeLine: 7,
      phaseLabel: 'Trace SOS contributor path',
      phase: 'relax',
      computation: {
        label: `${maskLabel(mask, scenario.bitCount)} @ stage ${stage}`,
        expression: (mask & (1 << (stage - 1))) !== 0 ? 'came from mask and submask' : 'came only from the same mask',
        result: contributorsLabel(scenario, contributingMasks),
        decision: 'follow all contributing branches',
      },
    });

    yield* traceContributors(stage - 1, mask);
    if ((mask & (1 << (stage - 1))) !== 0) {
      yield* traceContributors(stage - 1, mask ^ (1 << (stage - 1)));
    }
  }
}

function createStep(args: {
  readonly scenario: SosDpScenario;
  readonly table: readonly (readonly number[])[];
  readonly traced: ReadonlySet<string>;
  readonly contributingMasks: ReadonlySet<number>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.table.length }, (_, stage) => ({
    id: `row-${stage}`,
    label: stage === 0 ? 'base' : `bit ${stage - 1}`,
    status: (args.activeCell?.[0] === stage ? 'active' : stage === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: stage === 0 ? 'f[mask]' : 'after merge',
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.table[0]!.length }, (_, mask) => ({
    id: `col-${mask}`,
    label: maskLabel(mask, args.scenario.bitCount),
    status: (args.activeCell?.[1] === mask ? 'active' : mask === args.scenario.focusMask ? 'target' : 'idle') as DpHeaderConfig['status'],
    metaLabel: mask === args.scenario.focusMask ? 'focus' : null,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const tags: DpTraceTag[] = [];
      if (row === 0) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.traced.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.contributingMasks.has(col)) tags.push('take');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? 'base' : `bit ${row - 1}`,
        colLabel: maskLabel(col, args.scenario.bitCount),
        valueLabel: String(args.table[row]![col]!),
        metaLabel: row === 0 && args.contributingMasks.has(col) ? 'src' : col === args.scenario.focusMask ? 'focus' : null,
        status: args.traced.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0
                ? 'base'
                : 'chosen',
        tags,
      });
    }
  }

  const result = args.table[args.scenario.bitCount]![args.scenario.focusMask]!;
  const insights: DpInsight[] = [
    { label: 'Bits', value: String(args.scenario.bitCount), tone: 'accent' },
    { label: 'Masks', value: String(args.table[0]!.length), tone: 'info' },
    { label: 'Focused sum', value: String(result), tone: 'success' },
    { label: 'Contributors', value: String(args.contributingMasks.size), tone: 'warning' },
    { label: 'Focus', value: maskLabel(args.scenario.focusMask, args.scenario.bitCount), tone: 'info' },
  ];

  return createDpStep({
    mode: 'sos-dp',
    modeLabel: 'SOS DP',
    phaseLabel: args.phaseLabel,
    resultLabel: `sum = ${result}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? `${rowHeaders[args.activeCell[0]]!.label} × ${maskLabel(args.activeCell[1], args.scenario.bitCount)}` : null,
    pathLabel: contributorsLabel(args.scenario, args.contributingMasks),
    primaryItemsLabel: 'Base values',
    primaryItems: args.scenario.baseValues.map((value, mask) => `${maskLabel(mask, args.scenario.bitCount)}=${value}`),
    secondaryItemsLabel: 'Active bits',
    secondaryItems: Array.from({ length: args.scenario.bitCount }, (_, bit) => `bit ${bit}`),
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

function maskLabel(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0');
}

function contributorsLabel(scenario: SosDpScenario, contributingMasks: ReadonlySet<number>): string {
  const masks = Array.from(contributingMasks).sort((left, right) => left - right).map((mask) => maskLabel(mask, scenario.bitCount));
  return masks.length > 0 ? `Submasks: ${masks.join(' · ')}` : 'Submasks: pending';
}
