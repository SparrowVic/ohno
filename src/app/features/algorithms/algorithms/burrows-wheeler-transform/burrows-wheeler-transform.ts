import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  BurrowsWheelerTraceState,
  StringRotationRow,
  StringRunGroup,
} from '../../models/string';
import { BurrowsWheelerScenario } from '../../utils/string-scenarios/string-scenarios';

interface RawRotationRow {
  readonly id: string;
  readonly startIndex: number;
  readonly text: string;
}

function createRotations(source: string): RawRotationRow[] {
  return Array.from({ length: source.length }, (_, index) => ({
    id: `rot-${index}`,
    startIndex: index,
    text: `${source.slice(index)}${source.slice(0, index)}`,
  }));
}

function decorateRows(
  rows: readonly RawRotationRow[],
  activeRows: readonly string[],
  sortedCount: number,
  outputActive = false,
): readonly StringRotationRow[] {
  return rows.map((row, index) => {
    let tone: StringRotationRow['tone'] = index < sortedCount ? 'sorted' : 'pending';
    if (activeRows[0] === row.id) tone = outputActive ? 'output' : 'active';
    else if (activeRows.includes(row.id)) tone = 'compare';
    return { ...row, tone };
  });
}

function buildRunGroups(source: string, tone: 'input' | 'output'): readonly StringRunGroup[] {
  if (!source) return [];
  const groups: StringRunGroup[] = [];
  let current = source[0]!;
  let count = 1;

  for (let index = 1; index < source.length; index++) {
    if (source[index] === current) {
      count++;
      continue;
    }
    groups.push({ id: `${tone}-${groups.length}`, char: current, count, tone });
    current = source[index]!;
    count = 1;
  }

  groups.push({ id: `${tone}-${groups.length}`, char: current, count, tone });
  return groups;
}

function makeState(args: {
  readonly scenario: BurrowsWheelerScenario;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
  readonly rows: readonly StringRotationRow[];
  readonly activeRows: readonly string[];
  readonly firstColumn: string;
  readonly lastColumn: string;
  readonly output: string;
  readonly runGroups: readonly StringRunGroup[];
  readonly compressionRatio: number | null;
  readonly computation: BurrowsWheelerTraceState['computation'];
}): BurrowsWheelerTraceState {
  return {
    mode: 'burrows-wheeler-transform',
    modeLabel: 'Rotation matrix',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Length', value: `${args.scenario.source.length} rows`, tone: 'info' },
      { label: 'F column', value: args.firstColumn || '—', tone: 'accent' },
      { label: 'L column', value: args.lastColumn || '—', tone: 'warning' },
      {
        label: 'Run gain',
        value: args.compressionRatio === null ? '—' : `${args.compressionRatio.toFixed(2)}x`,
        tone: args.compressionRatio === null ? 'info' : 'success',
      },
    ],
    source: args.scenario.source,
    rotations: args.rows,
    activeRows: args.activeRows,
    firstColumn: args.firstColumn,
    lastColumn: args.lastColumn,
    output: args.output,
    runGroups: args.runGroups,
    compressionRatio: args.compressionRatio,
  };
}

export function* burrowsWheelerTransformGenerator(
  scenario: BurrowsWheelerScenario,
): Generator<SortStep> {
  let rows = createRotations(scenario.source);
  const inputRuns = buildRunGroups(scenario.source, 'input');

  yield createStringStep({
    activeCodeLine: 2,
    description: `Generate all ${rows.length} cyclic rotations of "${scenario.source}".`,
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: 'Rotate',
      activeLabel: `${rows.length} rotations`,
      resultLabel: 'Matrix unsorted',
      decisionLabel: 'Every row is the same string viewed from a different starting point.',
      rows: decorateRows(rows, [], 0),
      activeRows: [],
      firstColumn: '',
      lastColumn: '',
      output: '',
      runGroups: inputRuns,
      compressionRatio: null,
      computation: {
        label: 'Rotation matrix',
        expression: 'rot[i] = s[i..] + s[..i)',
        result: `${rows.length} rows`,
        note: 'The BWT sorts cyclic rotations, not suffixes.',
      },
    }),
  });

  for (let index = 1; index < rows.length; index++) {
    const current = rows[index]!;
    let insertAt = index;

    while (insertAt > 0 && rows[insertAt - 1]!.text > current.text) {
      yield createStringStep({
        activeCodeLine: 3,
        description: `Compare "${current.text}" with "${rows[insertAt - 1]!.text}" to place the next rotation lexicographically.`,
        phase: 'compare',
        string: makeState({
          scenario,
          phaseLabel: 'Sort rows',
          activeLabel: `insert row ${index + 1}`,
          resultLabel: `sorted prefix ${index} / ${rows.length}`,
          decisionLabel: 'Lexicographic order is what makes the last column cluster similar characters together.',
          rows: decorateRows(rows, [current.id, rows[insertAt - 1]!.id], index),
          activeRows: [current.id, rows[insertAt - 1]!.id],
          firstColumn: '',
          lastColumn: '',
          output: '',
          runGroups: inputRuns,
          compressionRatio: null,
          computation: {
            label: 'Row compare',
            expression: `"${current.text}" < "${rows[insertAt - 1]!.text}"`,
            result: 'shift upward',
            note: 'We use insertion-sort-like steps here purely to make the matrix movement readable.',
          },
        }),
      });

      rows = [...rows.slice(0, insertAt - 1), current, rows[insertAt - 1]!, ...rows.slice(insertAt + 1)];
      insertAt--;
    }

    yield createStringStep({
      activeCodeLine: 3,
      description: `Row "${current.text}" is now placed at sorted position ${insertAt}.`,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Row committed',
        activeLabel: `sorted prefix ${index + 1}`,
        resultLabel: `${index + 1} / ${rows.length} rows ordered`,
        decisionLabel: 'The upper part of the matrix is already in final lexicographic order.',
        rows: decorateRows(rows, [current.id], index + 1),
        activeRows: [current.id],
        firstColumn: '',
        lastColumn: '',
        output: '',
        runGroups: inputRuns,
        compressionRatio: null,
        computation: {
          label: 'Insertion point',
          expression: `row → position ${insertAt}`,
          result: String(insertAt),
          note: 'One more rotation snaps into its final sorted slot.',
        },
      }),
    });
  }

  const firstColumn = rows.map((row) => row.text[0] ?? '').join('');
  const lastColumn = rows.map((row) => row.text.at(-1) ?? '').join('');
  const outputRuns = buildRunGroups(lastColumn, 'output');
  const compressionRatio =
    outputRuns.length === 0 ? null : inputRuns.length / outputRuns.length;

  yield createStringStep({
    activeCodeLine: 5,
    description: `Read the last column L = "${lastColumn}". Similar characters are now grouped much tighter than in the input.`,
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: 'Collect columns',
      activeLabel: 'Read F and L',
      resultLabel: lastColumn,
      decisionLabel: 'The last column is the Burrows-Wheeler output; the first column helps explain the sorted matrix structure.',
      rows: decorateRows(rows, rows.map((row) => row.id), rows.length, true),
      activeRows: rows.map((row) => row.id),
      firstColumn,
      lastColumn,
      output: lastColumn,
      runGroups: outputRuns,
      compressionRatio,
      computation: {
        label: 'BWT output',
        expression: 'L = last column of sorted rotations',
        result: lastColumn,
        note: 'This rearrangement is reversible, but far friendlier to downstream run-length style compression.',
      },
    }),
  });

  yield createStringStep({
    activeCodeLine: 6,
    description: `BWT finished. Output "${lastColumn}" creates ${outputRuns.length} runs vs ${inputRuns.length} in the original string.`,
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: 'Complete',
      activeLabel: 'BWT ready',
      resultLabel: lastColumn,
      decisionLabel: 'The transform did not compress by itself, but it concentrated repeated symbols so later stages can do it better.',
      rows: decorateRows(rows, [], rows.length, true),
      activeRows: [],
      firstColumn,
      lastColumn,
      output: lastColumn,
      runGroups: outputRuns,
      compressionRatio,
      computation: {
        label: 'Run comparison',
        expression: `${inputRuns.length} input runs → ${outputRuns.length} BWT runs`,
        result: compressionRatio === null ? null : `${compressionRatio.toFixed(2)}x denser`,
        note: 'Fewer, longer runs are exactly why BWT is so effective before RLE or entropy coding.',
      },
    }),
  });
}
