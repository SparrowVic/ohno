import { createStringStep } from './string-step';
import { SortStep } from '../models/sort-step';
import { RleRun, RleTraceState } from '../models/string';
import { RleScenario } from '../utils/string-scenarios/string-scenarios';

function makeState(args: {
  readonly scenario: RleScenario;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
  readonly scanIndex: number | null;
  readonly groupStart: number;
  readonly groupChar: string;
  readonly groupCount: number;
  readonly completedRuns: readonly RleRun[];
  readonly output: string;
  readonly phase: RleTraceState['phase'];
  readonly compressionRatio: number | null;
  readonly computation: RleTraceState['computation'];
}): RleTraceState {
  const source = args.scenario.source;
  return {
    mode: 'rle',
    modeLabel: 'Run scanner',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Input length', value: `${source.length} chars`, tone: 'info' },
      { label: 'Runs count', value: String(args.completedRuns.length), tone: 'accent' },
      {
        label: 'Output so far',
        value: args.output ? `${args.output.length} chars` : '—',
        tone: 'warning',
      },
      {
        label: 'Ratio',
        value:
          args.compressionRatio !== null
            ? `${(args.compressionRatio * 100).toFixed(0)}%`
            : '—',
        tone: args.compressionRatio !== null && args.compressionRatio < 1 ? 'success' : 'info',
      },
    ],
    source,
    scanIndex: args.scanIndex,
    groupStart: args.groupStart,
    groupChar: args.groupChar,
    groupCount: args.groupCount,
    completedRuns: args.completedRuns,
    output: args.output,
    phase: args.phase,
    compressionRatio: args.compressionRatio,
  };
}

export function* runLengthEncodingGenerator(scenario: RleScenario): Generator<SortStep> {
  // TODO: Polish this flow further with stronger scanner animation, bracket-style run grouping,
  // denser output composition, and clearer compression-gain storytelling for weak/no-gain cases.
  const text = scenario.source;
  const completedRuns: RleRun[] = [];
  let output = '';
  let runIdCounter = 0;

  // Init step
  yield createStringStep({
    activeCodeLine: 1,
    description: `Start RLE on "${text}" (${text.length} chars). We scan left to right, grouping consecutive identical characters.`,
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: 'Setup',
      activeLabel: 'i = 0',
      resultLabel: 'No runs yet',
      decisionLabel: 'Each run of identical characters becomes a single (char, count) pair.',
      scanIndex: null,
      groupStart: 0,
      groupChar: '',
      groupCount: 0,
      completedRuns: [],
      output: '',
      phase: 'scan',
      compressionRatio: null,
      computation: {
        label: 'Input',
        expression: `text = "${text}"`,
        result: `length = ${text.length}`,
        note: 'We will compress runs of repeated characters into count-char pairs.',
      },
    }),
  });

  let i = 0;
  while (i < text.length) {
    const groupStart = i;
    const groupChar = text[i]!;

    // Scan step: start of a new run
    yield createStringStep({
      activeCodeLine: 4,
      description: `Position ${i}: found '${groupChar}'. Starting a new run.`,
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Scan',
        activeLabel: `i = ${i}`,
        resultLabel: completedRuns.length > 0 ? output : '—',
        decisionLabel: `'${groupChar}' begins a new run. Count how many consecutive '${groupChar}' chars follow.`,
        scanIndex: i,
        groupStart,
        groupChar,
        groupCount: 1,
        completedRuns,
        output,
        phase: 'scan',
        compressionRatio: null,
        computation: {
          label: 'New run',
          expression: `text[${i}] = '${groupChar}'`,
          result: 'count = 1',
          note: 'Starting count for this run. Will extend while next char matches.',
        },
      }),
    });

    let j = i + 1;
    let count = 1;

    // Extend steps
    while (j < text.length && text[j] === groupChar) {
      count++;
      yield createStringStep({
        activeCodeLine: 6,
        description: `Position ${j}: '${text[j]}' matches '${groupChar}'. Extending run (count = ${count}).`,
        phase: 'compare',
        string: makeState({
          scenario,
          phaseLabel: 'Extend',
          activeLabel: `j = ${j}`,
          resultLabel: completedRuns.length > 0 ? output : '—',
          decisionLabel: `text[${j}] = '${text[j]}' = groupChar '${groupChar}' → extend the run.`,
          scanIndex: j,
          groupStart,
          groupChar,
          groupCount: count,
          completedRuns,
          output,
          phase: 'extend',
          compressionRatio: null,
          computation: {
            label: 'Extend run',
            expression: `text[${j}] = '${text[j]}' = '${groupChar}'`,
            result: `count = ${count}`,
            note: 'Each matching character increments the run counter by one.',
          },
        }),
      });
      j++;
    }

    // Emit step: run complete
    const runId = `run-${runIdCounter++}`;
    const newRun: RleRun = { id: runId, char: groupChar, count };
    completedRuns.push(newRun);
    output += `${count}${groupChar}`;

    yield createStringStep({
      activeCodeLine: 8,
      description: `Emit run: '${groupChar}' × ${count}. Output becomes "${output}".`,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Emit',
        activeLabel: `run '${groupChar}'×${count}`,
        resultLabel: output,
        decisionLabel: `The run ended at position ${j - 1}. Emit (${count}, '${groupChar}') to the output.`,
        scanIndex: j < text.length ? j : null,
        groupStart: j,
        groupChar: '',
        groupCount: 0,
        completedRuns: [...completedRuns],
        output,
        phase: 'emit',
        compressionRatio: null,
        computation: {
          label: 'Emit run',
          expression: `runs.push(('${groupChar}', ${count}))`,
          result: `output = "${output}"`,
          note: 'One (count, char) pair replaces an entire run in the output stream.',
        },
      }),
    });

    i = j;
  }

  const compressionRatio = output.length / text.length;

  // Complete step
  yield createStringStep({
    activeCodeLine: 8,
    description: `RLE complete. ${completedRuns.length} run${completedRuns.length !== 1 ? 's' : ''} found. Output: "${output}" (${output.length} chars vs ${text.length} original → ${(compressionRatio * 100).toFixed(0)}% ratio).`,
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: 'Complete',
      activeLabel: `${completedRuns.length} runs`,
      resultLabel: output,
      decisionLabel:
        compressionRatio < 1
          ? 'Compression saves space — the encoded output is shorter than the original.'
          : 'No compression gain — the encoded output is as long as or longer than the original.',
      scanIndex: null,
      groupStart: text.length,
      groupChar: '',
      groupCount: 0,
      completedRuns,
      output,
      phase: 'complete',
      compressionRatio,
      computation: {
        label: 'Compression ratio',
        expression: `${output.length} / ${text.length}`,
        result: `${compressionRatio.toFixed(2)} (${(compressionRatio * 100).toFixed(0)}%)`,
        note:
          compressionRatio < 1
            ? 'Output is shorter than the input — RLE provided compression.'
            : 'Output is not shorter — RLE works best with long repeated runs.',
      },
    }),
  });
}
