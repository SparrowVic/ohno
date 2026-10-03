import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTone,
  NumberLabTraceState,
} from '../../models/number-lab';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { CrtCongruence } from '../../utils/scenarios/number-lab/crt';
import type { CrtScenario } from '../../utils/scenarios/number-lab/crt-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { withScratchpad } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.crt.modeLabel'),
  numberLabModeLabel: t('features.algorithms.runtime.numberLab.crt.modeLabel'),
  sections: {
    noSolutions: t('features.algorithms.runtime.scratchpadLab.crt.sections.noSolutions'),
    mergeFirstTwo: t('features.algorithms.runtime.scratchpadLab.crt.sections.mergeFirstTwo'),
    attachThird: t('features.algorithms.runtime.scratchpadLab.crt.sections.attachThird'),
    compatibility: t('features.algorithms.runtime.scratchpadLab.crt.sections.compatibility'),
    finalModulus: t('features.algorithms.runtime.scratchpadLab.crt.sections.finalModulus'),
    firstPairCompatibility: t('features.algorithms.runtime.scratchpadLab.crt.sections.firstPairCompatibility'),
    contradiction: t('features.algorithms.runtime.scratchpadLab.crt.sections.contradiction'),
    coefficient: t('features.algorithms.runtime.scratchpadLab.crt.sections.coefficient'),
    compose: t('features.algorithms.runtime.scratchpadLab.crt.sections.compose'),
  },
  notes: {
    coprimeUnique: t('features.algorithms.runtime.scratchpadLab.crt.notes.coprimeUnique'),
    coprime: t('features.algorithms.runtime.scratchpadLab.crt.notes.coprime'),
    solutionFamily: t('features.algorithms.runtime.scratchpadLab.crt.notes.solutionFamily'),
    forEachCondition: t('features.algorithms.runtime.scratchpadLab.crt.notes.forEachCondition'),
    forFirst: t('features.algorithms.runtime.scratchpadLab.crt.notes.forFirst'),
    forSecond: t('features.algorithms.runtime.scratchpadLab.crt.notes.forSecond'),
    forThird: t('features.algorithms.runtime.scratchpadLab.crt.notes.forThird'),
    forNth: t('features.algorithms.runtime.scratchpadLab.crt.notes.forNth'),
    reduceModM: t('features.algorithms.runtime.scratchpadLab.crt.notes.reduceModM'),
    fromFirst: t('features.algorithms.runtime.scratchpadLab.crt.notes.fromFirst'),
    substituteSecond: t('features.algorithms.runtime.scratchpadLab.crt.notes.substituteSecond'),
    inverseOf: t('features.algorithms.runtime.scratchpadLab.crt.notes.inverseOf'),
    therefore: t('features.algorithms.runtime.scratchpadLab.crt.notes.therefore'),
    thatIs: t('features.algorithms.runtime.scratchpadLab.crt.notes.thatIs'),
    backToX: t('features.algorithms.runtime.scratchpadLab.crt.notes.backToX'),
    afterFirstMerge: t('features.algorithms.runtime.scratchpadLab.crt.notes.afterFirstMerge'),
    nowSubstitute: t('features.algorithms.runtime.scratchpadLab.crt.notes.nowSubstitute'),
    thirdCondition: t('features.algorithms.runtime.scratchpadLab.crt.notes.thirdCondition'),
    reduce: t('features.algorithms.runtime.scratchpadLab.crt.notes.reduce'),
    weGet: t('features.algorithms.runtime.scratchpadLab.crt.notes.weGet'),
    compatibilityRule: t('features.algorithms.runtime.scratchpadLab.crt.notes.compatibilityRule'),
    pairCompatibleOne: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairCompatibleOne'),
    pairAlsoCompatible: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairAlsoCompatible'),
    pairCompatible: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairCompatible'),
    pairInconsistent: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairInconsistent'),
    commonDivisor: t('features.algorithms.runtime.scratchpadLab.crt.notes.commonDivisor'),
    divideBy: t('features.algorithms.runtime.scratchpadLab.crt.notes.divideBy'),
    afterMergeTwo: t('features.algorithms.runtime.scratchpadLab.crt.notes.afterMergeTwo'),
    lcmHere: t('features.algorithms.runtime.scratchpadLab.crt.notes.lcmHere'),
    substitute: t('features.algorithms.runtime.scratchpadLab.crt.notes.substitute'),
    pairCheck: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairCheck'),
    here: t('features.algorithms.runtime.scratchpadLab.crt.notes.here'),
    firstForces: t('features.algorithms.runtime.scratchpadLab.crt.notes.firstForces'),
    secondForces: t('features.algorithms.runtime.scratchpadLab.crt.notes.secondForces'),
    sameX: t('features.algorithms.runtime.scratchpadLab.crt.notes.sameX'),
    thirdIrrelevant: t('features.algorithms.runtime.scratchpadLab.crt.notes.thirdIrrelevant'),
    mixedRadix: t('features.algorithms.runtime.scratchpadLab.crt.notes.mixedRadix'),
    allButC0: t('features.algorithms.runtime.scratchpadLab.crt.notes.allButC0'),
    substituteC0: t('features.algorithms.runtime.scratchpadLab.crt.notes.substituteC0'),
    termsVanish: t('features.algorithms.runtime.scratchpadLab.crt.notes.termsVanish'),
    currentForm: t('features.algorithms.runtime.scratchpadLab.crt.notes.currentForm'),
    lookModulo: t('features.algorithms.runtime.scratchpadLab.crt.notes.lookModulo'),
    pairFirstSecond: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairFirstSecond'),
    pairFirstThird: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairFirstThird'),
    pairSecondThird: t('features.algorithms.runtime.scratchpadLab.crt.notes.pairSecondThird'),
  },
  phases: {
    test: t('features.algorithms.runtime.scratchpadLab.crt.phases.test'),
    merge: t('features.algorithms.runtime.scratchpadLab.crt.phases.merge'),
  },
  decisions: {
    inconsistent: t('features.algorithms.runtime.scratchpadLab.crt.decisions.inconsistent'),
  },
} as const;

const CALCULATION_INDENT = 1;
const RESULT_MARKER = '✓';
const NO_RESULT_MARKER = '×';

type LineBuilder = {
  readonly id: string;
  readonly kind: ScratchpadLine['kind'];
  readonly indent: number;
  readonly marker: string | null;
  readonly caption: ScratchpadLine['caption'];
  readonly captionPinned?: boolean;
  readonly content: ScratchpadLine['content'];
  readonly instruction: ScratchpadLine['instruction'];
  readonly annotation: ScratchpadLine['annotation'];
};

type MergeResult = {
  readonly residue: number;
  readonly modulus: number;
  readonly parameterValue: number;
  readonly reducedCoefficient: number;
  readonly reducedRhs: number;
  readonly reducedModulus: number;
  readonly inverse: number;
};

interface LiveState {
  /** Index of the congruence currently being merged in (0-based). */
  currentIndex: number | null;
  /** Running residue of the merged solution so far. */
  runningResidue: number | null;
  /** Running modulus (lcm of moduli merged so far). */
  runningModulus: number | null;
  /** Final summary string for the result panel. */
  resultText: string | null;
}

export function* crtGenerator(scenario: CrtScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const system = scenario.congruences;
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;
  const live: LiveState = {
    currentIndex: null,
    runningResidue: null,
    runningModulus: null,
    resultText: null,
  };

  function snapshot(opts: {
    readonly phase: ScratchpadLabTraceState['phaseLabel'];
    readonly decision: ScratchpadLabTraceState['decisionLabel'];
    readonly tone: ScratchpadLabTraceState['tone'];
    readonly currentLineId: string;
  }): ScratchpadLabTraceState {
    const currentIdx = lineBuilders.findIndex((line) => line.id === opts.currentLineId);
    const lines: ScratchpadLine[] = lineBuilders.map((builder, index) => {
      const state: ScratchpadLineState = index === currentIdx ? 'current' : 'settled';
      return {
        id: builder.id,
        kind: builder.kind,
        indent: builder.indent,
        marker: builder.marker,
        caption: builder.caption,
        captionPinned: builder.captionPinned,
        content: builder.content,
        instruction: builder.instruction,
        annotation: builder.annotation,
        state,
      };
    });

    return {
      mode: 'crt',
      modeLabel: I18N.modeLabel,
      phaseLabel: opts.phase,
      decisionLabel: opts.decision,
      presetLabel,
      taskPrompt: scenario.taskPrompt ?? null,
      tone: opts.tone,
      lines,
      margins: [],
      resultLabel: null,
      iteration: stepIndex,
    };
  }

  function appendStep(
    builder: LineBuilder,
    opts: {
      readonly activeCodeLine: number;
      readonly phase: ScratchpadLabTraceState['phaseLabel'];
      readonly decision: ScratchpadLabTraceState['decisionLabel'];
      readonly tone: ScratchpadLabTraceState['tone'];
    },
  ): SortStep {
    syncLiveFromBuilder(builder);
    lineBuilders.push(builder);
    stepIndex += 1;
    return withScratchpad(
      createNumberLabStep({
        activeCodeLine: opts.activeCodeLine,
        description: builder.content,
        state: numberLabState(builder),
      }),
      snapshot({ ...opts, currentLineId: builder.id }),
    );
  }

  function syncLiveFromBuilder(builder: LineBuilder): void {
    const id = builder.id;
    const text = typeof builder.content === 'string' ? builder.content : '';

    /* Section ids of the form `section-merge-N` mark which congruence
     *  we're currently merging into the running solution. */
    const mergeMatch = id.match(/section-merge-(\d+)/);
    if (mergeMatch) {
      live.currentIndex = Number(mergeMatch[1]) - 1;
    }

    /* The running solution after the i-th merge is emitted as a math
     *  line containing `x \\equiv K (\\mathrm{mod} M)` — pick out
     *  numeric K and M into the live registers. */
    const congruenceMatch = text.match(/x\s*\\?equiv\s*(-?\d+)\s*\\?\(?\\?mathrm\{mod\}\\?\s*(\d+)/);
    if (congruenceMatch) {
      live.runningResidue = Number(congruenceMatch[1]);
      live.runningModulus = Number(congruenceMatch[2]);
    }

    if (id.startsWith('result-') || id === 'final-equation') {
      const stripped = text.replace(/\[\[\/?math\]\]/g, '').replace(/\\;/g, ' ').trim();
      if (stripped) {
        live.resultText = live.resultText ? `${live.resultText};  ${stripped}` : stripped;
      }
    }
  }

  function buildRegisters(): readonly NumberLabRegister[] {
    const registers: NumberLabRegister[] = [
      { id: 'k', label: 'k', value: String(system.length), hint: null, tone: 'muted' },
    ];
    if (live.currentIndex !== null && live.currentIndex < system.length) {
      const cur = system[live.currentIndex];
      registers.push({
        id: 'i',
        label: 'i',
        value: String(live.currentIndex + 1),
        hint: null,
        tone: 'active',
      });
      registers.push({
        id: 'a',
        label: 'a_i',
        value: String(cur.residue),
        hint: null,
        tone: 'active',
      });
      registers.push({
        id: 'n',
        label: 'n_i',
        value: String(cur.modulus),
        hint: null,
        tone: 'active',
      });
    }
    if (live.runningResidue !== null) {
      registers.push({
        id: 'x',
        label: 'x',
        value: String(live.runningResidue),
        hint: null,
        tone: 'settled',
      });
    }
    if (live.runningModulus !== null) {
      registers.push({
        id: 'M',
        label: 'M',
        value: String(live.runningModulus),
        hint: null,
        tone: 'settled',
      });
    }
    return registers;
  }

  function buildHistory(): readonly NumberLabHistoryEntry[] {
    return system.map((cur, index) => ({
      id: `crt-${index}`,
      label: `(a_${index + 1}, n_${index + 1})`,
      value: `(${cur.residue}, ${cur.modulus})`,
      isCurrent: index === live.currentIndex,
    }));
  }

  function numberLabState(builder: LineBuilder): NumberLabTraceState {
    return {
      modeLabel: I18N.numberLabModeLabel,
      phaseLabel: phaseFor(builder),
      decisionLabel: decisionFor(builder),
      tone: numberLabToneFor(builder),
      registers: buildRegisters(),
      history: buildHistory(),
      formula: null,
      presetLabel,
      resultLabel: live.resultText,
      iteration: stepIndex,
    };
  }

  function line(opts: {
    readonly id: string;
    readonly kind: ScratchpadLine['kind'];
    readonly content: ScratchpadLine['content'];
    readonly indent?: number;
    readonly marker?: string | null;
  }): LineBuilder {
    const defaultIndent =
      opts.kind === 'equation' || opts.kind === 'substitute' || opts.kind === 'decision'
        ? CALCULATION_INDENT
        : 0;
    return {
      id: opts.id,
      kind: opts.kind,
      indent: opts.indent ?? defaultIndent,
      marker: opts.marker ?? null,
      caption: null,
      content: opts.content,
      instruction: null,
      annotation: null,
    };
  }

  function section(id: string, content: TranslatableText): LineBuilder {
    return line({ id, kind: 'note', content });
  }

  function note(id: string, content: TranslatableText, indent = CALCULATION_INDENT): LineBuilder {
    return line({ id, kind: 'note', content, indent });
  }

  function math(id: string, expression: string, indent = CALCULATION_INDENT): LineBuilder {
    return line({
      id,
      kind: 'equation',
      indent,
      content: `[[math]]${expression}[[/math]]`,
    });
  }

  function resultSection(): LineBuilder {
    return line({
      id: 'section-result',
      kind: 'result',
      marker: RESULT_MARKER,
      content: i18nText(NOTEBOOK_TEXT.sections.result),
    });
  }

  function noResultSection(): LineBuilder {
    return line({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content: i18nText(I18N.sections.noSolutions),
    });
  }

  function* emit(builder: LineBuilder, activeCodeLine = 1): Generator<SortStep> {
    yield appendStep(builder, {
      activeCodeLine,
      phase: phaseFor(builder),
      decision: decisionFor(builder),
      tone: toneFor(builder),
    });
  }

  function* emitPairwiseCoprimeTest(congruences: readonly CrtCongruence[]): Generator<SortStep> {
    yield* emit(section('section-coprime-test', i18nText(NOTEBOOK_TEXT.sections.coprimality)));
    for (let i = 0; i < congruences.length; i++) {
      for (let j = i + 1; j < congruences.length; j++) {
        const left = congruences[i].modulus;
        const right = congruences[j].modulus;
        yield* emit(math(`coprime-${i}-${j}`, `\\gcd(${left}, ${right}) = ${gcd(left, right)}`));
      }
    }
    yield* emit(
      note(
        'coprime-conclusion',
        i18nText(congruences.length === 3 ? I18N.notes.coprimeUnique : I18N.notes.coprime),
      ),
    );
  }

  function* emitCombinedModulus(
    congruences: readonly CrtCongruence[],
    idPrefix = 'combined',
  ): Generator<SortStep> {
    const moduli = congruences.map((congruence) => congruence.modulus);
    const M = product(moduli);
    yield* emit(section(`${idPrefix}-section`, i18nText(NOTEBOOK_TEXT.sections.modulus)));
    yield* emit(math(`${idPrefix}-product`, `M = ${moduli.join(' * ')}`));
    yield* emit(math(`${idPrefix}-value`, `M = ${M}`));
  }

  function* emitChecks(
    idPrefix: string,
    value: number,
    congruences: readonly CrtCongruence[],
  ): Generator<SortStep> {
    yield* emit(section(`${idPrefix}-section-check`, i18nText(NOTEBOOK_TEXT.sections.check)));
    for (let i = 0; i < congruences.length; i++) {
      const { residue, modulus } = congruences[i];
      yield* emit(math(`${idPrefix}-check-${i}`, `${value} \\bmod ${modulus} = ${residue}`));
    }
  }

  function* emitSolutionFamily(
    residue: number,
    modulus: number,
    parameter: string,
  ): Generator<SortStep> {
    yield* emit(resultSection());
    yield* emit(math('result-congruence', `x = ${residue} \\;(\\mathrm{mod}\\; ${modulus})`));
    yield* emit(note('result-family-label', i18nText(I18N.notes.solutionFamily)));
    yield* emit(math('result-family', `x = ${residue} + ${modulus}${parameter}`));
    yield* emit(math('result-domain', `${parameter} \\in \\mathbb{Z}`));
  }

  function* runDirect(): Generator<SortStep> {
    const M = product(system.map((congruence) => congruence.modulus));
    const terms = system.map((congruence, index) => {
      const Mi = M / congruence.modulus;
      const reduced = mod(Mi, congruence.modulus);
      const inverse = modInverse(reduced, congruence.modulus);
      return {
        index: index + 1,
        residue: congruence.residue,
        modulus: congruence.modulus,
        Mi,
        reduced,
        inverse,
        partial: congruence.residue * Mi * inverse,
      };
    });
    const sum = terms.reduce((acc, term) => acc + term.partial, 0);
    const result = mod(sum, M);

    yield* emitPairwiseCoprimeTest(system);
    yield* emitCombinedModulus(system);

    yield* emit(section('section-construction', i18nText(NOTEBOOK_TEXT.sections.construction)));
    yield* emit(note('construction-rule-label', i18nText(I18N.notes.forEachCondition)));
    yield* emit(math('construction-rule-Mi', `M_i = M / m_i`));
    yield* emit(math('construction-rule-yi', `y_i = M_i^{-1} \\;(\\mathrm{mod}\\; m_i)`));

    for (const term of terms) {
      yield* emit(note(`term-${term.index}-label`, termLabel(term.index)));
      yield* emit(
        math(`term-${term.index}-Mi`, `M_${term.index} = ${M} / ${term.modulus} = ${term.Mi}`),
      );
      yield* emit(
        math(
          `term-${term.index}-reduced`,
          `${term.Mi} = ${term.reduced} \\;(\\mathrm{mod}\\; ${term.modulus})`,
        ),
      );
      yield* emit(
        math(
          `term-${term.index}-inverse-check`,
          `${term.reduced} * ${term.inverse} = ${term.reduced * term.inverse} = 1 \\;(\\mathrm{mod}\\; ${term.modulus})`,
        ),
      );
      yield* emit(math(`term-${term.index}-inverse`, `y_${term.index} = ${term.inverse}`));
    }

    yield* emit(section('section-sum', i18nText(NOTEBOOK_TEXT.sections.sum)));
    yield* emit(math('sum-template', `x = a_1 * M_1 * y_1 + a_2 * M_2 * y_2 + a_3 * M_3 * y_3`));
    yield* emit(
      math(
        'sum-substitution',
        `x = ${terms.map((term) => `${term.residue} * ${term.Mi} * ${term.inverse}`).join(' + ')}`,
      ),
    );
    yield* emit(math('sum-partials', `x = ${terms.map((term) => term.partial).join(' + ')}`));
    yield* emit(math('sum-value', `x = ${sum}`));
    yield* emit(note('reduction-label', i18nText(I18N.notes.reduceModM)));
    yield* emit(math('reduction', `${sum} \\bmod ${M} = ${result}`));

    yield* emitChecks('direct', result, system);
    yield* emitSolutionFamily(result, M, 'k');
  }

  function* runProgressiveMerge(): Generator<SortStep> {
    const [first, second, third] = system;
    const totalModulus = product(system.map((congruence) => congruence.modulus));
    const firstMerge = mergeCongruences(
      first.residue,
      first.modulus,
      second.residue,
      second.modulus,
    );
    const secondMerge = mergeCongruences(
      firstMerge.residue,
      firstMerge.modulus,
      third.residue,
      third.modulus,
    );

    yield* emitPairwiseCoprimeTest(system);
    yield* emitCombinedModulus(system);

    yield* emit(section('section-merge-first-two', i18nText(I18N.sections.mergeFirstTwo)));
    yield* emit(note('merge-first-source-label', i18nText(I18N.notes.fromFirst)));
    yield* emit(math('merge-first-source', `x = ${first.residue} + ${first.modulus}k`));
    yield* emit(note('merge-first-substitute-label', i18nText(I18N.notes.substituteSecond)));
    yield* emit(
      math(
        'merge-first-substitution',
        `${first.residue} + ${first.modulus}k = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'merge-first-delta-raw',
        `${first.modulus}k = ${second.residue - first.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'merge-first-delta-reduced',
        `${first.modulus}k = ${mod(second.residue - first.residue, second.modulus)} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      note('merge-first-inverse-label', i18nText(I18N.notes.inverseOf, { value: first.modulus, modulus: second.modulus })),
    );
    yield* emit(
      math(
        'merge-first-inverse-check',
        `${first.modulus} * ${firstMerge.inverse} = ${first.modulus * firstMerge.inverse} = 1 \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'merge-first-inverse',
        `${first.modulus}^{-1} = ${firstMerge.inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(note('merge-first-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math(
        'merge-first-k-product',
        `k = ${mod(second.residue - first.residue, second.modulus)} * ${firstMerge.inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'merge-first-k-product-value',
        `k = ${mod(second.residue - first.residue, second.modulus) * firstMerge.inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'merge-first-k',
        `k = ${firstMerge.parameterValue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(note('merge-first-k-family-label', i18nText(I18N.notes.thatIs)));
    yield* emit(
      math('merge-first-k-family', `k = ${firstMerge.parameterValue} + ${second.modulus}t`),
    );
    yield* emit(note('merge-first-return-label', i18nText(I18N.notes.backToX)));
    yield* emit(
      math(
        'merge-first-return-1',
        `x = ${first.residue} + ${first.modulus}(${firstMerge.parameterValue} + ${second.modulus}t)`,
      ),
    );
    yield* emit(
      math(
        'merge-first-return-2',
        `x = ${first.residue} + ${first.modulus * firstMerge.parameterValue} + ${firstMerge.modulus}t`,
      ),
    );
    yield* emit(math('merge-first-return-3', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`));
    yield* emit(note('merge-first-result-label', i18nText(I18N.notes.afterFirstMerge)));
    yield* emit(
      math(
        'merge-first-result',
        `x = ${firstMerge.residue} \\;(\\mathrm{mod}\\; ${firstMerge.modulus})`,
      ),
    );

    yield* emit(section('section-attach-third', i18nText(I18N.sections.attachThird)));
    yield* emit(note('attach-third-substitution-label', i18nText(I18N.notes.nowSubstitute)));
    yield* emit(
      math('attach-third-substitution', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`),
    );
    yield* emit(note('attach-third-condition-label', i18nText(I18N.notes.thirdCondition)));
    yield* emit(
      math(
        'attach-third-condition',
        `${firstMerge.residue} + ${firstMerge.modulus}t = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('attach-third-reduce-label', i18nText(I18N.notes.reduce)));
    yield* emit(
      math(
        'attach-third-reduce-residue',
        `${firstMerge.residue} = ${mod(firstMerge.residue, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'attach-third-reduce-modulus',
        `${firstMerge.modulus} = ${mod(firstMerge.modulus, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('attach-third-equation-label', i18nText(I18N.notes.weGet)));
    yield* emit(
      math(
        'attach-third-equation',
        `${mod(firstMerge.modulus, third.modulus)}t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      note(
        'attach-third-inverse-label',
        i18nText(I18N.notes.inverseOf, { value: mod(firstMerge.modulus, third.modulus), modulus: third.modulus }),
      ),
    );
    yield* emit(
      math(
        'attach-third-inverse-check',
        `${mod(firstMerge.modulus, third.modulus)} * ${secondMerge.inverse} = ${mod(firstMerge.modulus, third.modulus) * secondMerge.inverse} = 1 \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'attach-third-inverse',
        `${mod(firstMerge.modulus, third.modulus)}^{-1} = ${secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('attach-third-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math(
        'attach-third-t-product',
        `t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus)} * ${secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'attach-third-t-product-value',
        `t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus) * secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'attach-third-t',
        `t = ${secondMerge.parameterValue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('attach-third-t-family-label', i18nText(I18N.notes.thatIs)));
    yield* emit(
      math('attach-third-t-family', `t = ${secondMerge.parameterValue} + ${third.modulus}u`),
    );
    yield* emit(note('attach-third-return-label', i18nText(I18N.notes.backToX)));
    yield* emit(
      math(
        'attach-third-return-1',
        `x = ${firstMerge.residue} + ${firstMerge.modulus}(${secondMerge.parameterValue} + ${third.modulus}u)`,
      ),
    );
    yield* emit(
      math(
        'attach-third-return-2',
        `x = ${firstMerge.residue} + ${firstMerge.modulus * secondMerge.parameterValue} + ${totalModulus}u`,
      ),
    );
    yield* emit(math('attach-third-return-3', `x = ${secondMerge.residue} + ${totalModulus}u`));

    yield* emitChecks('progressive', secondMerge.residue, system);
    yield* emitSolutionFamily(secondMerge.residue, totalModulus, 'u');
  }

  function* runNonCoprimeCompatible(): Generator<SortStep> {
    const [first, second, third] = system;
    const compatibility = compatibilityRows(system);
    const incompatible = compatibility.find((row) => row.remainder !== 0);

    yield* emit(section('section-compatibility-test', i18nText(I18N.sections.compatibility)));
    yield* emit(
      note(
        'compatibility-rule-label',
        i18nText(I18N.notes.compatibilityRule),
      ),
    );
    yield* emit(math('compatibility-rule', `\\gcd(m_i, m_j) \\mid (a_j - a_i)`));
    for (const row of compatibility) {
      yield* emit(note(`compatibility-${row.id}-label`, row.label));
      yield* emit(
        math(
          `compatibility-${row.id}-gcd`,
          `\\gcd(${row.left.modulus}, ${row.right.modulus}) = ${row.gcd}`,
        ),
      );
      yield* emit(
        math(
          `compatibility-${row.id}-diff`,
          `${row.right.residue} - ${row.left.residue} = ${row.diff}`,
        ),
      );
      if (row.gcd !== 1) {
        yield* emit(
          math(`compatibility-${row.id}-mod`, `${row.diff} \\bmod ${row.gcd} = ${row.remainder}`),
        );
      }
      yield* emit(
        note(
          `compatibility-${row.id}-conclusion`,
          i18nText(
            row.remainder === 0
              ? row.gcd === 1
                ? I18N.notes.pairCompatibleOne
                : row.id === '2-3'
                  ? I18N.notes.pairAlsoCompatible
                  : I18N.notes.pairCompatible
              : I18N.notes.pairInconsistent,
          ),
        ),
      );
    }

    if (incompatible) {
      yield* emit(noResultSection());
      return;
    }

    const firstMerge = mergeCongruences(
      first.residue,
      first.modulus,
      second.residue,
      second.modulus,
    );
    const secondMerge = mergeCongruences(
      firstMerge.residue,
      firstMerge.modulus,
      third.residue,
      third.modulus,
    );

    yield* emit(
      section('section-compatible-merge-first-two', i18nText(I18N.sections.mergeFirstTwo)),
    );
    yield* emit(note('compatible-merge-source-label', i18nText(I18N.notes.fromFirst)));
    yield* emit(math('compatible-merge-source', `x = ${first.residue} + ${first.modulus}k`));
    yield* emit(note('compatible-merge-substitute-label', i18nText(I18N.notes.substituteSecond)));
    yield* emit(
      math(
        'compatible-merge-substitution',
        `${first.residue} + ${first.modulus}k = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-delta',
        `${first.modulus}k = ${second.residue - first.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(note('compatible-merge-g-label', i18nText(I18N.notes.commonDivisor)));
    yield* emit(
      math(
        'compatible-merge-g',
        `g = \\gcd(${first.modulus}, ${second.modulus}) = ${gcd(first.modulus, second.modulus)}`,
      ),
    );
    yield* emit(
      note(
        'compatible-merge-divide-label',
        i18nText(I18N.notes.divideBy, { divisor: gcd(first.modulus, second.modulus) }),
      ),
    );
    yield* emit(
      math(
        'compatible-merge-before-divide',
        `${first.modulus}k = ${second.residue - first.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-after-divide',
        `${firstMerge.reducedCoefficient}k = ${firstMerge.reducedRhs} \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(
      note(
        'compatible-merge-inverse-label',
        i18nText(I18N.notes.inverseOf, { value: firstMerge.reducedCoefficient, modulus: firstMerge.reducedModulus }),
      ),
    );
    yield* emit(
      math(
        'compatible-merge-inverse-check',
        `${firstMerge.reducedCoefficient} * ${firstMerge.inverse} = ${firstMerge.reducedCoefficient * firstMerge.inverse} = 1 \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-inverse',
        `${firstMerge.reducedCoefficient}^{-1} = ${firstMerge.inverse} \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(note('compatible-merge-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math(
        'compatible-merge-k-product',
        `k = ${firstMerge.reducedRhs} * ${firstMerge.inverse} \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-k-product-value',
        `k = ${firstMerge.reducedRhs * firstMerge.inverse} \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-k',
        `k = ${firstMerge.parameterValue} \\;(\\mathrm{mod}\\; ${firstMerge.reducedModulus})`,
      ),
    );
    yield* emit(note('compatible-merge-k-family-label', i18nText(I18N.notes.thatIs)));
    yield* emit(
      math(
        'compatible-merge-k-family',
        `k = ${firstMerge.parameterValue} + ${firstMerge.reducedModulus}t`,
      ),
    );
    yield* emit(note('compatible-merge-return-label', i18nText(I18N.notes.backToX)));
    yield* emit(
      math(
        'compatible-merge-return-1',
        `x = ${first.residue} + ${first.modulus}(${firstMerge.parameterValue} + ${firstMerge.reducedModulus}t)`,
      ),
    );
    yield* emit(
      math(
        'compatible-merge-return-2',
        `x = ${first.residue} + ${first.modulus * firstMerge.parameterValue} + ${firstMerge.modulus}t`,
      ),
    );
    yield* emit(
      math('compatible-merge-return-3', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`),
    );
    yield* emit(note('compatible-merge-result-label', i18nText(I18N.notes.afterMergeTwo)));
    yield* emit(
      math(
        'compatible-merge-result',
        `x = ${firstMerge.residue} \\;(\\mathrm{mod}\\; ${firstMerge.modulus})`,
      ),
    );
    yield* emit(
      note(
        'compatible-merge-lcm-label',
        i18nText(I18N.notes.lcmHere, { modulus: firstMerge.modulus, left: first.modulus, right: second.modulus }),
      ),
    );

    yield* emit(section('section-compatible-attach-third', i18nText(I18N.sections.attachThird)));
    yield* emit(
      math('compatible-third-current', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`),
    );
    yield* emit(
      math(
        'compatible-third-target',
        `x = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-substitute-label', i18nText(I18N.notes.substitute)));
    yield* emit(
      math(
        'compatible-third-substitute',
        `${firstMerge.residue} + ${firstMerge.modulus}t = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-reduce-label', i18nText(I18N.notes.reduce)));
    yield* emit(
      math(
        'compatible-third-reduce-residue',
        `${firstMerge.residue} = ${mod(firstMerge.residue, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-reduce-modulus',
        `${firstMerge.modulus} = ${mod(firstMerge.modulus, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-equation-label', i18nText(I18N.notes.weGet)));
    yield* emit(
      math(
        'compatible-third-equation-full',
        `${mod(firstMerge.residue, third.modulus)} + ${mod(firstMerge.modulus, third.modulus)}t = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-equation-raw',
        `${mod(firstMerge.modulus, third.modulus)}t = ${third.residue - mod(firstMerge.residue, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-equation-reduced',
        `${mod(firstMerge.modulus, third.modulus)}t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      note(
        'compatible-third-inverse-label',
        i18nText(I18N.notes.inverseOf, { value: mod(firstMerge.modulus, third.modulus), modulus: third.modulus }),
      ),
    );
    yield* emit(
      math(
        'compatible-third-inverse-check',
        `${mod(firstMerge.modulus, third.modulus)} * ${secondMerge.inverse} = ${mod(firstMerge.modulus, third.modulus) * secondMerge.inverse} = 1 \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-inverse',
        `${mod(firstMerge.modulus, third.modulus)}^{-1} = ${secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math(
        'compatible-third-t-product',
        `t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus)} * ${secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-t-product-value',
        `t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus) * secondMerge.inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-t',
        `t = ${secondMerge.parameterValue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-t-family-label', i18nText(I18N.notes.thatIs)));
    yield* emit(
      math('compatible-third-t-family', `t = ${secondMerge.parameterValue} + ${third.modulus}u`),
    );
    yield* emit(note('compatible-third-return-label', i18nText(I18N.notes.backToX)));
    yield* emit(
      math(
        'compatible-third-return-1',
        `x = ${firstMerge.residue} + ${firstMerge.modulus}(${secondMerge.parameterValue} + ${third.modulus}u)`,
      ),
    );
    yield* emit(
      math(
        'compatible-third-return-2',
        `x = ${firstMerge.residue} + ${firstMerge.modulus * secondMerge.parameterValue} + ${secondMerge.modulus}u`,
      ),
    );
    yield* emit(
      math('compatible-third-return-3', `x = ${secondMerge.residue} + ${secondMerge.modulus}u`),
    );

    yield* emit(section('section-final-modulus', i18nText(I18N.sections.finalModulus)));
    yield* emit(
      math(
        'final-lcm',
        `\\mathrm{lcm}(${system.map((congruence) => congruence.modulus).join(', ')}) = ${lcmAll(system.map((congruence) => congruence.modulus))}`,
      ),
    );
    yield* emitChecks('compatible', secondMerge.residue, system);
    yield* emitSolutionFamily(secondMerge.residue, secondMerge.modulus, 'u');
  }

  function* runNonCoprimeTrap(): Generator<SortStep> {
    const [first, second] = system;
    const common = gcd(first.modulus, second.modulus);
    const diff = second.residue - first.residue;
    const remainder = mod(diff, common);

    yield* emit(section('section-trap-compatibility', i18nText(I18N.sections.firstPairCompatibility)));
    yield* emit(note('trap-rule-label', i18nText(I18N.notes.pairCheck)));
    yield* emit(math('trap-rule', `\\gcd(m_1, m_2) \\mid (a_2 - a_1)`));
    yield* emit(note('trap-here-label', i18nText(I18N.notes.here)));
    yield* emit(math('trap-gcd', `\\gcd(${first.modulus}, ${second.modulus}) = ${common}`));
    yield* emit(math('trap-diff', `${second.residue} - ${first.residue} = ${diff}`));
    yield* emit(math('trap-remainder', `${diff} \\bmod ${common} = ${remainder}`));
    yield* emit(note('trap-therefore-label', i18nText(I18N.notes.thatIs)));
    yield* emit(math('trap-not-divides', `${common} \\nmid ${diff}`));

    yield* emit(section('section-contradiction-diagnosis', i18nText(I18N.sections.contradiction)));
    yield* emit(note('trap-first-forces-label', i18nText(I18N.notes.firstForces)));
    yield* emit(
      math(
        'trap-first-mod-original',
        `x = ${first.residue} \\;(\\mathrm{mod}\\; ${first.modulus})`,
      ),
    );
    yield* emit(
      math(
        'trap-first-mod-common',
        `x = ${mod(first.residue, common)} \\;(\\mathrm{mod}\\; ${common})`,
      ),
    );
    yield* emit(note('trap-second-forces-label', i18nText(I18N.notes.secondForces)));
    yield* emit(
      math(
        'trap-second-mod-original',
        `x = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'trap-second-mod-common',
        `x = ${mod(second.residue, common)} \\;(\\mathrm{mod}\\; ${common})`,
      ),
    );
    yield* emit(note('trap-same-x-label', i18nText(I18N.notes.sameX)));
    yield* emit(
      math(
        'trap-conflict-first',
        `x = ${mod(first.residue, common)} \\;(\\mathrm{mod}\\; ${common})`,
      ),
    );
    yield* emit(
      math(
        'trap-conflict-second',
        `x = ${mod(second.residue, common)} \\;(\\mathrm{mod}\\; ${common})`,
      ),
    );
    yield* emit(
      note(
        'trap-third-irrelevant',
        i18nText(I18N.notes.thirdIrrelevant),
      ),
    );
    yield* emit(noResultSection());
  }

  function* runGarner(): Generator<SortStep> {
    const [first, second, third, fourth] = system;
    const m1m2 = first.modulus * second.modulus;
    const m1m2m3 = m1m2 * third.modulus;
    const M = product(system.map((congruence) => congruence.modulus));
    const c0 = first.residue;
    const c1Rhs = mod(second.residue - c0, second.modulus);
    const c1Inverse = modInverse(first.modulus, second.modulus);
    const c1 = mod(c1Rhs * c1Inverse, second.modulus);
    const base2 = c0 + first.modulus * c1;
    const c2Coeff = mod(m1m2, third.modulus);
    const c2Rhs = mod(third.residue - mod(base2, third.modulus), third.modulus);
    const c2Inverse = modInverse(c2Coeff, third.modulus);
    const c2 = mod(c2Rhs * c2Inverse, third.modulus);
    const base3 = base2 + m1m2 * c2;
    const c3Coeff = mod(m1m2m3, fourth.modulus);
    const c3Rhs = mod(fourth.residue - mod(base3, fourth.modulus), fourth.modulus);
    const c3Inverse = modInverse(c3Coeff, fourth.modulus);
    const c3 = mod(c3Rhs * c3Inverse, fourth.modulus);
    const x = c0 + first.modulus * c1 + m1m2 * c2 + m1m2m3 * c3;

    yield* emitPairwiseCoprimeTest(system);
    yield* emitCombinedModulus(system, 'garner-combined');

    yield* emit(section('section-c0', i18nText(I18N.sections.coefficient, { index: 0 })));
    yield* emit(note('c0-source-label', i18nText(I18N.notes.fromFirst)));
    yield* emit(math('c0-source', `x = ${first.residue} \\;(\\mathrm{mod}\\; ${first.modulus})`));
    yield* emit(note('c0-mixed-label', i18nText(I18N.notes.mixedRadix)));
    yield* emit(math('c0-mixed', `x = c_0 + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(
      note(
        'c0-conclusion-label',
        i18nText(I18N.notes.allButC0, { modulus: first.modulus }),
      ),
    );
    yield* emit(math('c0-value', `c_0 = ${c0}`));

    yield* emit(section('section-c1', i18nText(I18N.sections.coefficient, { index: 1 })));
    yield* emit(
      note('c1-substitution-label', i18nText(I18N.notes.substituteC0, { c0, modulus: second.modulus })),
    );
    yield* emit(math('c1-form', `x = ${c0} + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(math('c1-target', `x = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`));
    yield* emit(
      note(
        'c1-vanish-label',
        i18nText(I18N.notes.termsVanish, { first: m1m2, second: m1m2m3, modulus: second.modulus }),
      ),
    );
    yield* emit(
      math(
        'c1-equation-full',
        `${c0} + ${first.modulus}c_1 = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'c1-equation-raw',
        `${first.modulus}c_1 = ${second.residue - c0} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'c1-equation-reduced',
        `${first.modulus}c_1 = ${c1Rhs} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(note('c1-inverse-label', i18nText(I18N.notes.inverseOf, { value: first.modulus, modulus: second.modulus })));
    yield* emit(
      math(
        'c1-inverse-check',
        `${first.modulus} * ${c1Inverse} = ${first.modulus * c1Inverse} = 1 \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(
      math(
        'c1-inverse',
        `${first.modulus}^{-1} = ${c1Inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(note('c1-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math('c1-product', `c_1 = ${c1Rhs} * ${c1Inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`),
    );
    yield* emit(
      math(
        'c1-product-value',
        `c_1 = ${c1Rhs * c1Inverse} \\;(\\mathrm{mod}\\; ${second.modulus})`,
      ),
    );
    yield* emit(math('c1-value', `c_1 = ${c1}`));

    yield* emit(section('section-c2', i18nText(I18N.sections.coefficient, { index: 2 })));
    yield* emit(note('c2-current-label', i18nText(I18N.notes.currentForm)));
    yield* emit(
      math('c2-current-1', `x = ${c0} + ${first.modulus} * ${c1} + ${m1m2}c_2 + ${m1m2m3}c_3`),
    );
    yield* emit(math('c2-current-2', `x = ${base2} + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(note('c2-mod-label', i18nText(I18N.notes.lookModulo, { modulus: third.modulus })));
    yield* emit(
      math(
        'c2-mod-equation',
        `${base2} + ${m1m2}c_2 = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('c2-reduce-label', i18nText(I18N.notes.reduce)));
    yield* emit(
      math(
        'c2-reduce-base',
        `${base2} = ${mod(base2, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math('c2-reduce-coeff', `${m1m2} = ${c2Coeff} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(note('c2-equation-label', i18nText(I18N.notes.weGet)));
    yield* emit(
      math(
        'c2-equation-full',
        `${mod(base2, third.modulus)} + ${c2Coeff}c_2 = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math(
        'c2-equation-reduced',
        `${c2Coeff}c_2 = ${c2Rhs} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('c2-inverse-label', i18nText(I18N.notes.inverseOf, { value: c2Coeff, modulus: third.modulus })));
    yield* emit(
      math(
        'c2-inverse-check',
        `${c2Coeff} * ${c2Inverse} = ${c2Coeff * c2Inverse} = 1 \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math('c2-inverse', `${c2Coeff}^{-1} = ${c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(note('c2-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math('c2-product', `c_2 = ${c2Rhs} * ${c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(
      math('c2-product-value', `c_2 = ${c2Rhs * c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(math('c2-value', `c_2 = ${c2}`));

    yield* emit(section('section-c3', i18nText(I18N.sections.coefficient, { index: 3 })));
    yield* emit(note('c3-current-label', i18nText(I18N.notes.currentForm)));
    yield* emit(math('c3-current-1', `x = ${base2} + ${m1m2} * ${c2} + ${m1m2m3}c_3`));
    yield* emit(math('c3-current-2', `x = ${base3} + ${m1m2m3}c_3`));
    yield* emit(note('c3-mod-label', i18nText(I18N.notes.lookModulo, { modulus: fourth.modulus })));
    yield* emit(
      math(
        'c3-mod-equation',
        `${base3} + ${m1m2m3}c_3 = ${fourth.residue} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(note('c3-reduce-label', i18nText(I18N.notes.reduce)));
    yield* emit(
      math(
        'c3-reduce-base',
        `${base3} = ${mod(base3, fourth.modulus)} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(
      math('c3-reduce-coeff', `${m1m2m3} = ${c3Coeff} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(note('c3-equation-label', i18nText(I18N.notes.weGet)));
    yield* emit(
      math(
        'c3-equation-full',
        `${mod(base3, fourth.modulus)} + ${c3Coeff}c_3 = ${fourth.residue} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(
      math(
        'c3-equation-reduced',
        `${c3Coeff}c_3 = ${c3Rhs} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(note('c3-inverse-label', i18nText(I18N.notes.inverseOf, { value: c3Coeff, modulus: fourth.modulus })));
    yield* emit(
      math(
        'c3-inverse-check',
        `${c3Coeff} * ${c3Inverse} = ${c3Coeff * c3Inverse} = 1 \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(
      math('c3-inverse', `${c3Coeff}^{-1} = ${c3Inverse} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(note('c3-therefore-label', i18nText(I18N.notes.therefore)));
    yield* emit(
      math('c3-product', `c_3 = ${c3Rhs} * ${c3Inverse} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(math('c3-value', `c_3 = ${c3}`));

    yield* emit(section('section-compose', i18nText(I18N.sections.compose)));
    yield* emit(
      math('compose-template', `x = c_0 + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3`),
    );
    yield* emit(
      math(
        'compose-substitution',
        `x = ${c0} + ${first.modulus} * ${c1} + ${m1m2} * ${c2} + ${m1m2m3} * ${c3}`,
      ),
    );
    yield* emit(
      math('compose-partials', `x = ${c0} + ${first.modulus * c1} + ${m1m2 * c2} + ${m1m2m3 * c3}`),
    );
    yield* emit(math('compose-value', `x = ${x}`));

    yield* emitChecks('garner', x, system);
    yield* emitSolutionFamily(x, M, 'k');
  }

  switch (scenario.notebookFlow.kind) {
    case 'direct':
      yield* runDirect();
      return;
    case 'progressive-merge':
      yield* runProgressiveMerge();
      return;
    case 'non-coprime-compatible':
      yield* runNonCoprimeCompatible();
      return;
    case 'non-coprime-trap':
      yield* runNonCoprimeTrap();
      return;
    case 'garner-mixed-radix':
      yield* runGarner();
      return;
  }
}

function mergeCongruences(a1: number, m1: number, a2: number, m2: number): MergeResult {
  const common = gcd(m1, m2);
  const diff = a2 - a1;
  const reducedCoefficient = m1 / common;
  const reducedRhs = diff / common;
  const reducedModulus = m2 / common;
  const inverse = modInverse(mod(reducedCoefficient, reducedModulus), reducedModulus);
  const parameterValue = mod(reducedRhs * inverse, reducedModulus);
  const modulus = lcm(m1, m2);
  const residue = mod(a1 + m1 * parameterValue, modulus);
  return {
    residue,
    modulus,
    parameterValue,
    reducedCoefficient,
    reducedRhs,
    reducedModulus,
    inverse,
  };
}

function compatibilityRows(congruences: readonly CrtCongruence[]): readonly {
  readonly id: string;
  readonly label: TranslatableText;
  readonly left: CrtCongruence;
  readonly right: CrtCongruence;
  readonly gcd: number;
  readonly diff: number;
  readonly remainder: number;
}[] {
  const labels = [I18N.notes.pairFirstSecond, I18N.notes.pairFirstThird, I18N.notes.pairSecondThird];
  const pairs = [
    [0, 1],
    [0, 2],
    [1, 2],
  ] as const;
  return pairs.map(([i, j], index) => {
    const left = congruences[i];
    const right = congruences[j];
    const common = gcd(left.modulus, right.modulus);
    const diff = right.residue - left.residue;
    return {
      id: `${i + 1}-${j + 1}`,
      label: i18nText(labels[index]!),
      left,
      right,
      gcd: common,
      diff,
      remainder: mod(diff, common),
    };
  });
}

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('check')) return i18nText(NOTEBOOK_TEXT.sections.check);
  if (builder.id.includes('result') || builder.id.includes('no-result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('compatibility') || builder.id.includes('coprime')) return i18nText(I18N.phases.test);
  if (builder.id.includes('merge') || builder.id.includes('attach')) return i18nText(I18N.phases.merge);
  return i18nText(NOTEBOOK_TEXT.sections.computation);
}

function decisionFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('no-result')) return i18nText(I18N.decisions.inconsistent);
  if (builder.kind === 'result') return i18nText(NOTEBOOK_TEXT.decisions.result);
  if (builder.kind === 'note') return i18nText(NOTEBOOK_TEXT.decisions.note);
  return i18nText(NOTEBOOK_TEXT.decisions.compute);
}

function toneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result')
    return builder.id === 'section-no-result' ? 'conclude' : 'complete';
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

function numberLabToneFor(builder: LineBuilder): NumberLabTone {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'idle';
  if (builder.id.includes('merge') || builder.id.includes('reduce')) return 'update';
  return 'compare';
}

function termLabel(index: number): TranslatableText {
  switch (index) {
    case 1:
      return i18nText(I18N.notes.forFirst);
    case 2:
      return i18nText(I18N.notes.forSecond);
    case 3:
      return i18nText(I18N.notes.forThird);
    default:
      return i18nText(I18N.notes.forNth, { n: index });
  }
}

function product(values: readonly number[]): number {
  return values.reduce((acc, value) => acc * value, 1);
}

function lcmAll(values: readonly number[]): number {
  return values.reduce((acc, value) => lcm(acc, value), 1);
}

function lcm(a: number, b: number): number {
  return Math.abs((a / gcd(a, b)) * b);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function modInverse(a: number, m: number): number {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1) return Number.NaN;
  return mod(oldS, m);
}
