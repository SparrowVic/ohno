import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { RleRun, RleTraceState } from '../../models/string';
import { RleScenario } from '../../utils/scenarios/string/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.runLengthEncoding.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.string.runLengthEncoding.phases.setup'),
    scan: t('features.algorithms.runtime.string.runLengthEncoding.phases.scan'),
    extend: t('features.algorithms.runtime.string.runLengthEncoding.phases.extend'),
    emit: t('features.algorithms.runtime.string.runLengthEncoding.phases.emit'),
    complete: t('features.algorithms.runtime.string.runLengthEncoding.phases.complete'),
  },
  insights: {
    inputLengthLabel: t(
      'features.algorithms.runtime.string.runLengthEncoding.insights.inputLengthLabel',
    ),
    runsCountLabel: t(
      'features.algorithms.runtime.string.runLengthEncoding.insights.runsCountLabel',
    ),
    outputSoFarLabel: t(
      'features.algorithms.runtime.string.runLengthEncoding.insights.outputSoFarLabel',
    ),
    ratioLabel: t('features.algorithms.runtime.string.runLengthEncoding.insights.ratioLabel'),
    charsValue: t('features.algorithms.runtime.string.runLengthEncoding.insights.charsValue'),
    noneValue: t('features.algorithms.runtime.string.runLengthEncoding.insights.noneValue'),
    ratioValue: t('features.algorithms.runtime.string.runLengthEncoding.insights.ratioValue'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.string.runLengthEncoding.descriptions.start'),
    scan: t('features.algorithms.runtime.string.runLengthEncoding.descriptions.scan'),
    extend: t('features.algorithms.runtime.string.runLengthEncoding.descriptions.extend'),
    emit: t('features.algorithms.runtime.string.runLengthEncoding.descriptions.emit'),
    complete: t('features.algorithms.runtime.string.runLengthEncoding.descriptions.complete'),
  },
  decisions: {
    eachRunPair: t('features.algorithms.runtime.string.runLengthEncoding.decisions.eachRunPair'),
    newRun: t('features.algorithms.runtime.string.runLengthEncoding.decisions.newRun'),
    extendRun: t('features.algorithms.runtime.string.runLengthEncoding.decisions.extendRun'),
    emitRun: t('features.algorithms.runtime.string.runLengthEncoding.decisions.emitRun'),
    compressionSaves: t(
      'features.algorithms.runtime.string.runLengthEncoding.decisions.compressionSaves',
    ),
    noCompressionGain: t(
      'features.algorithms.runtime.string.runLengthEncoding.decisions.noCompressionGain',
    ),
  },
  computation: {
    labels: {
      input: t('features.algorithms.runtime.string.runLengthEncoding.computation.labels.input'),
      newRun: t('features.algorithms.runtime.string.runLengthEncoding.computation.labels.newRun'),
      extendRun: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.labels.extendRun',
      ),
      emitRun: t('features.algorithms.runtime.string.runLengthEncoding.computation.labels.emitRun'),
      compressionRatio: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.labels.compressionRatio',
      ),
    },
    results: {
      inputLength: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.results.inputLength',
      ),
      countValue: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.results.countValue',
      ),
      outputValue: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.results.outputValue',
      ),
      ratioValue: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.results.ratioValue',
      ),
    },
    notes: {
      input: t('features.algorithms.runtime.string.runLengthEncoding.computation.notes.input'),
      newRun: t('features.algorithms.runtime.string.runLengthEncoding.computation.notes.newRun'),
      extendRun: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.notes.extendRun',
      ),
      emitRun: t('features.algorithms.runtime.string.runLengthEncoding.computation.notes.emitRun'),
      compressionSaves: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.notes.compressionSaves',
      ),
      noCompressionGain: t(
        'features.algorithms.runtime.string.runLengthEncoding.computation.notes.noCompressionGain',
      ),
    },
  },
  labels: {
    noRunsYet: t('features.algorithms.runtime.string.runLengthEncoding.labels.noRunsYet'),
    emitActive: t('features.algorithms.runtime.string.runLengthEncoding.labels.emitActive'),
    runCount: t('features.algorithms.runtime.string.runLengthEncoding.labels.runCount'),
  },
} as const;

function makeState(args: {
  readonly scenario: RleScenario;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
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
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.inputLengthLabel,
        value: i18nText(I18N.insights.charsValue, { count: source.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.runsCountLabel,
        value: String(args.completedRuns.length),
        tone: 'accent',
      },
      {
        label: I18N.insights.outputSoFarLabel,
        value:
          args.output.length > 0
            ? i18nText(I18N.insights.charsValue, { count: args.output.length })
            : I18N.insights.noneValue,
        tone: 'warning',
      },
      {
        label: I18N.insights.ratioLabel,
        value:
          args.compressionRatio !== null
            ? i18nText(I18N.insights.ratioValue, {
                percent: (args.compressionRatio * 100).toFixed(0),
              })
            : I18N.insights.noneValue,
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
    description: i18nText(I18N.descriptions.start, {
      text,
      length: text.length,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.setup,
      activeLabel: 'i = 0',
      resultLabel: I18N.labels.noRunsYet,
      decisionLabel: I18N.decisions.eachRunPair,
      scanIndex: null,
      groupStart: 0,
      groupChar: '',
      groupCount: 0,
      completedRuns: [],
      output: '',
      phase: 'scan',
      compressionRatio: null,
      computation: {
        label: I18N.computation.labels.input,
        expression: `text = "${text}"`,
        result: i18nText(I18N.computation.results.inputLength, { count: text.length }),
        note: I18N.computation.notes.input,
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
      description: i18nText(I18N.descriptions.scan, {
        index: i,
        char: groupChar,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.scan,
        activeLabel: `i = ${i}`,
        resultLabel: completedRuns.length > 0 ? output : I18N.insights.noneValue,
        decisionLabel: i18nText(I18N.decisions.newRun, { char: groupChar }),
        scanIndex: i,
        groupStart,
        groupChar,
        groupCount: 1,
        completedRuns,
        output,
        phase: 'scan',
        compressionRatio: null,
        computation: {
          label: I18N.computation.labels.newRun,
          expression: `text[${i}] = '${groupChar}'`,
          result: i18nText(I18N.computation.results.countValue, { count: 1 }),
          note: I18N.computation.notes.newRun,
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
        description: i18nText(I18N.descriptions.extend, {
          index: j,
          char: text[j],
          groupChar,
          count,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          phaseLabel: I18N.phases.extend,
          activeLabel: `j = ${j}`,
          resultLabel: completedRuns.length > 0 ? output : I18N.insights.noneValue,
          decisionLabel: i18nText(I18N.decisions.extendRun, {
            index: j,
            char: text[j],
            groupChar,
          }),
          scanIndex: j,
          groupStart,
          groupChar,
          groupCount: count,
          completedRuns,
          output,
          phase: 'extend',
          compressionRatio: null,
          computation: {
            label: I18N.computation.labels.extendRun,
            expression: `text[${j}] = '${text[j]}' = '${groupChar}'`,
            result: i18nText(I18N.computation.results.countValue, { count }),
            note: I18N.computation.notes.extendRun,
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
      description: i18nText(I18N.descriptions.emit, {
        char: groupChar,
        count,
        output,
      }),
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.emit,
        activeLabel: i18nText(I18N.labels.emitActive, { char: groupChar, count }),
        resultLabel: output,
        decisionLabel: i18nText(I18N.decisions.emitRun, {
          endIndex: j - 1,
          count,
          char: groupChar,
        }),
        scanIndex: j < text.length ? j : null,
        groupStart: j,
        groupChar: '',
        groupCount: 0,
        completedRuns: [...completedRuns],
        output,
        phase: 'emit',
        compressionRatio: null,
        computation: {
          label: I18N.computation.labels.emitRun,
          expression: `runs.push(('${groupChar}', ${count}))`,
          result: i18nText(I18N.computation.results.outputValue, { output }),
          note: I18N.computation.notes.emitRun,
        },
      }),
    });

    i = j;
  }

  const compressionRatio = output.length / text.length;

  // Complete step
  yield createStringStep({
    activeCodeLine: 8,
    description: i18nText(I18N.descriptions.complete, {
      runs: completedRuns.length,
      output,
      outputLength: output.length,
      inputLength: text.length,
      percent: (compressionRatio * 100).toFixed(0),
    }),
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.complete,
      activeLabel: i18nText(I18N.labels.runCount, { count: completedRuns.length }),
      resultLabel: output,
      decisionLabel:
        compressionRatio < 1
          ? I18N.decisions.compressionSaves
          : I18N.decisions.noCompressionGain,
      scanIndex: null,
      groupStart: text.length,
      groupChar: '',
      groupCount: 0,
      completedRuns,
      output,
      phase: 'complete',
      compressionRatio,
      computation: {
        label: I18N.computation.labels.compressionRatio,
        expression: `${output.length} / ${text.length}`,
        result: i18nText(I18N.computation.results.ratioValue, {
          ratio: compressionRatio.toFixed(2),
          percent: (compressionRatio * 100).toFixed(0),
        }),
        note:
          compressionRatio < 1
            ? I18N.computation.notes.compressionSaves
            : I18N.computation.notes.noCompressionGain,
      },
    }),
  });
}
