import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { CrtCongruence } from '../../utils/scenarios/number-lab/crt';
import type { CrtScenario } from '../../utils/scenarios/number-lab/crt-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.crt.modeLabel'),
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

export function* crtGenerator(scenario: CrtScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const system = scenario.congruences;
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;

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
    lineBuilders.push(builder);
    stepIndex += 1;
    return createScratchpadLabStep({
      activeCodeLine: opts.activeCodeLine,
      description: builder.content,
      state: snapshot({ ...opts, currentLineId: builder.id }),
    });
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

  function section(id: string, content: string): LineBuilder {
    return line({ id, kind: 'note', content });
  }

  function note(id: string, content: string, indent = CALCULATION_INDENT): LineBuilder {
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
      content: 'Wynik',
    });
  }

  function noResultSection(): LineBuilder {
    return line({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content: 'Brak rozwiazan',
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
    yield* emit(section('section-coprime-test', 'Test wzglednej pierwszosci'));
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
        congruences.length === 3
          ? 'Moduly sa parami wzglednie pierwsze, wiec istnieje dokladnie jedno rozwiazanie modulo ich iloczyn.'
          : 'Moduly sa parami wzglednie pierwsze.',
      ),
    );
  }

  function* emitCombinedModulus(
    congruences: readonly CrtCongruence[],
    idPrefix = 'combined',
  ): Generator<SortStep> {
    const moduli = congruences.map((congruence) => congruence.modulus);
    const M = product(moduli);
    yield* emit(section(`${idPrefix}-section`, 'Modul laczny'));
    yield* emit(math(`${idPrefix}-product`, `M = ${moduli.join(' * ')}`));
    yield* emit(math(`${idPrefix}-value`, `M = ${M}`));
  }

  function* emitChecks(
    idPrefix: string,
    value: number,
    congruences: readonly CrtCongruence[],
  ): Generator<SortStep> {
    yield* emit(section(`${idPrefix}-section-check`, 'Sprawdzenie'));
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
    yield* emit(note('result-family-label', 'Czyli wszystkie rozwiazania maja postac:'));
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

    yield* emit(section('section-construction', 'Konstrukcja CRT'));
    yield* emit(note('construction-rule-label', 'Dla kazdego warunku liczymy:'));
    yield* emit(math('construction-rule-Mi', `M_i = M / m_i`));
    yield* emit(math('construction-rule-yi', `y_i = M_i^{-1} \\;(\\mathrm{mod}\\; m_i)`));

    for (const term of terms) {
      yield* emit(note(`term-${term.index}-label`, `Dla ${ordinal(term.index)} kongruencji:`));
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

    yield* emit(section('section-sum', 'Suma CRT'));
    yield* emit(math('sum-template', `x = a_1 * M_1 * y_1 + a_2 * M_2 * y_2 + a_3 * M_3 * y_3`));
    yield* emit(
      math(
        'sum-substitution',
        `x = ${terms.map((term) => `${term.residue} * ${term.Mi} * ${term.inverse}`).join(' + ')}`,
      ),
    );
    yield* emit(math('sum-partials', `x = ${terms.map((term) => term.partial).join(' + ')}`));
    yield* emit(math('sum-value', `x = ${sum}`));
    yield* emit(note('reduction-label', 'Redukcja modulo M:'));
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

    yield* emit(section('section-merge-first-two', 'Laczenie pierwszych dwoch kongruencji'));
    yield* emit(note('merge-first-source-label', 'Z pierwszej kongruencji:'));
    yield* emit(math('merge-first-source', `x = ${first.residue} + ${first.modulus}k`));
    yield* emit(note('merge-first-substitute-label', 'Podstawiamy do drugiej:'));
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
      note('merge-first-inverse-label', `Odwrotnosc ${first.modulus} modulo ${second.modulus}:`),
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
    yield* emit(note('merge-first-therefore-label', 'Zatem:'));
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
    yield* emit(note('merge-first-k-family-label', 'Czyli:'));
    yield* emit(
      math('merge-first-k-family', `k = ${firstMerge.parameterValue} + ${second.modulus}t`),
    );
    yield* emit(note('merge-first-return-label', 'Wracamy do x:'));
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
    yield* emit(note('merge-first-result-label', 'Po pierwszym laczeniu mamy:'));
    yield* emit(
      math(
        'merge-first-result',
        `x = ${firstMerge.residue} \\;(\\mathrm{mod}\\; ${firstMerge.modulus})`,
      ),
    );

    yield* emit(section('section-attach-third', 'Dolaczenie trzeciej kongruencji'));
    yield* emit(note('attach-third-substitution-label', 'Teraz podstawiamy:'));
    yield* emit(
      math('attach-third-substitution', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`),
    );
    yield* emit(note('attach-third-condition-label', 'Warunek trzeci:'));
    yield* emit(
      math(
        'attach-third-condition',
        `${firstMerge.residue} + ${firstMerge.modulus}t = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('attach-third-reduce-label', 'Redukujemy:'));
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
    yield* emit(note('attach-third-equation-label', 'Dostajemy:'));
    yield* emit(
      math(
        'attach-third-equation',
        `${mod(firstMerge.modulus, third.modulus)}t = ${mod(third.residue - mod(firstMerge.residue, third.modulus), third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      note(
        'attach-third-inverse-label',
        `Odwrotnosc ${mod(firstMerge.modulus, third.modulus)} modulo ${third.modulus}:`,
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
    yield* emit(note('attach-third-therefore-label', 'Zatem:'));
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
    yield* emit(note('attach-third-t-family-label', 'Czyli:'));
    yield* emit(
      math('attach-third-t-family', `t = ${secondMerge.parameterValue} + ${third.modulus}u`),
    );
    yield* emit(note('attach-third-return-label', 'Wracamy do x:'));
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

    yield* emit(section('section-compatibility-test', 'Test zgodnosci'));
    yield* emit(
      note(
        'compatibility-rule-label',
        'Dla modulow niewzglednie pierwszych warunek zgodnosci pary jest taki:',
      ),
    );
    yield* emit(math('compatibility-rule', `\\gcd(m_i, m_j) \\mid (a_j - a_i)`));
    for (const row of compatibility) {
      yield* emit(note(`compatibility-${row.id}-label`, `${row.label}:`));
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
          row.remainder === 0
            ? row.gcd === 1
              ? 'Ta para jest zgodna, bo 1 dzieli kazda liczbe.'
              : row.id === '2-3'
                ? 'Ta para tez jest zgodna.'
                : 'Ta para jest zgodna.'
            : 'Ta para jest sprzeczna.',
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
      section('section-compatible-merge-first-two', 'Laczenie pierwszych dwoch kongruencji'),
    );
    yield* emit(note('compatible-merge-source-label', 'Z pierwszej kongruencji:'));
    yield* emit(math('compatible-merge-source', `x = ${first.residue} + ${first.modulus}k`));
    yield* emit(note('compatible-merge-substitute-label', 'Podstawiamy do drugiej:'));
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
    yield* emit(note('compatible-merge-g-label', 'Wspolny dzielnik:'));
    yield* emit(
      math(
        'compatible-merge-g',
        `g = \\gcd(${first.modulus}, ${second.modulus}) = ${gcd(first.modulus, second.modulus)}`,
      ),
    );
    yield* emit(
      note(
        'compatible-merge-divide-label',
        `Dzielimy kongruencje przez ${gcd(first.modulus, second.modulus)}:`,
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
        `Odwrotnosc ${firstMerge.reducedCoefficient} modulo ${firstMerge.reducedModulus}:`,
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
    yield* emit(note('compatible-merge-therefore-label', 'Zatem:'));
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
    yield* emit(note('compatible-merge-k-family-label', 'Czyli:'));
    yield* emit(
      math(
        'compatible-merge-k-family',
        `k = ${firstMerge.parameterValue} + ${firstMerge.reducedModulus}t`,
      ),
    );
    yield* emit(note('compatible-merge-return-label', 'Wracamy do x:'));
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
    yield* emit(note('compatible-merge-result-label', 'Po scaleniu pierwszych dwoch warunkow:'));
    yield* emit(
      math(
        'compatible-merge-result',
        `x = ${firstMerge.residue} \\;(\\mathrm{mod}\\; ${firstMerge.modulus})`,
      ),
    );
    yield* emit(
      note(
        'compatible-merge-lcm-label',
        `Tutaj ${firstMerge.modulus} = lcm(${first.modulus}, ${second.modulus}).`,
      ),
    );

    yield* emit(section('section-compatible-attach-third', 'Dolaczenie trzeciej kongruencji'));
    yield* emit(
      math('compatible-third-current', `x = ${firstMerge.residue} + ${firstMerge.modulus}t`),
    );
    yield* emit(
      math(
        'compatible-third-target',
        `x = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-substitute-label', 'Podstawiamy:'));
    yield* emit(
      math(
        'compatible-third-substitute',
        `${firstMerge.residue} + ${firstMerge.modulus}t = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('compatible-third-reduce-label', 'Redukujemy:'));
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
    yield* emit(note('compatible-third-equation-label', 'Dostajemy:'));
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
        `Odwrotnosc ${mod(firstMerge.modulus, third.modulus)} modulo ${third.modulus}:`,
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
    yield* emit(note('compatible-third-therefore-label', 'Zatem:'));
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
    yield* emit(note('compatible-third-t-family-label', 'Czyli:'));
    yield* emit(
      math('compatible-third-t-family', `t = ${secondMerge.parameterValue} + ${third.modulus}u`),
    );
    yield* emit(note('compatible-third-return-label', 'Wracamy do x:'));
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

    yield* emit(section('section-final-modulus', 'Modul koncowy'));
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

    yield* emit(section('section-trap-compatibility', 'Test zgodnosci pierwszej pary'));
    yield* emit(note('trap-rule-label', 'Dla pary kongruencji trzeba sprawdzic:'));
    yield* emit(math('trap-rule', `\\gcd(m_1, m_2) \\mid (a_2 - a_1)`));
    yield* emit(note('trap-here-label', 'Tutaj:'));
    yield* emit(math('trap-gcd', `\\gcd(${first.modulus}, ${second.modulus}) = ${common}`));
    yield* emit(math('trap-diff', `${second.residue} - ${first.residue} = ${diff}`));
    yield* emit(math('trap-remainder', `${diff} \\bmod ${common} = ${remainder}`));
    yield* emit(note('trap-therefore-label', 'Czyli:'));
    yield* emit(math('trap-not-divides', `${common} \\nmid ${diff}`));

    yield* emit(section('section-contradiction-diagnosis', 'Diagnoza sprzecznosci'));
    yield* emit(note('trap-first-forces-label', 'Pierwsza kongruencja wymusza:'));
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
    yield* emit(note('trap-second-forces-label', 'Druga kongruencja wymusza:'));
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
    yield* emit(note('trap-same-x-label', 'Ten sam x nie moze jednoczesnie spelniac:'));
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
        'Trzecia kongruencja nie ma znaczenia dla koncowego wniosku, bo sprzecznosc jest juz w pierwszych dwoch warunkach.',
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

    yield* emit(section('section-c0', 'Wspolczynnik c0'));
    yield* emit(note('c0-source-label', 'Z pierwszej kongruencji:'));
    yield* emit(math('c0-source', `x = ${first.residue} \\;(\\mathrm{mod}\\; ${first.modulus})`));
    yield* emit(note('c0-mixed-label', 'W reprezentacji mieszanej:'));
    yield* emit(math('c0-mixed', `x = c_0 + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(
      note(
        'c0-conclusion-label',
        `Wszystkie skladniki poza c0 sa wielokrotnosciami ${first.modulus}, wiec:`,
      ),
    );
    yield* emit(math('c0-value', `c_0 = ${c0}`));

    yield* emit(section('section-c1', 'Wspolczynnik c1'));
    yield* emit(
      note('c1-substitution-label', `Podstawiamy c0 = ${c0} i patrzymy modulo ${second.modulus}:`),
    );
    yield* emit(math('c1-form', `x = ${c0} + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(math('c1-target', `x = ${second.residue} \\;(\\mathrm{mod}\\; ${second.modulus})`));
    yield* emit(
      note(
        'c1-vanish-label',
        `Skladniki ${m1m2}c2 i ${m1m2m3}c3 znikaja modulo ${second.modulus}, wiec:`,
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
    yield* emit(note('c1-inverse-label', `Odwrotnosc ${first.modulus} modulo ${second.modulus}:`));
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
    yield* emit(note('c1-therefore-label', 'Zatem:'));
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

    yield* emit(section('section-c2', 'Wspolczynnik c2'));
    yield* emit(note('c2-current-label', 'Aktualna postac:'));
    yield* emit(
      math('c2-current-1', `x = ${c0} + ${first.modulus} * ${c1} + ${m1m2}c_2 + ${m1m2m3}c_3`),
    );
    yield* emit(math('c2-current-2', `x = ${base2} + ${m1m2}c_2 + ${m1m2m3}c_3`));
    yield* emit(note('c2-mod-label', `Patrzymy modulo ${third.modulus}:`));
    yield* emit(
      math(
        'c2-mod-equation',
        `${base2} + ${m1m2}c_2 = ${third.residue} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(note('c2-reduce-label', 'Redukujemy:'));
    yield* emit(
      math(
        'c2-reduce-base',
        `${base2} = ${mod(base2, third.modulus)} \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math('c2-reduce-coeff', `${m1m2} = ${c2Coeff} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(note('c2-equation-label', 'Dostajemy:'));
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
    yield* emit(note('c2-inverse-label', `Odwrotnosc ${c2Coeff} modulo ${third.modulus}:`));
    yield* emit(
      math(
        'c2-inverse-check',
        `${c2Coeff} * ${c2Inverse} = ${c2Coeff * c2Inverse} = 1 \\;(\\mathrm{mod}\\; ${third.modulus})`,
      ),
    );
    yield* emit(
      math('c2-inverse', `${c2Coeff}^{-1} = ${c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(note('c2-therefore-label', 'Zatem:'));
    yield* emit(
      math('c2-product', `c_2 = ${c2Rhs} * ${c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(
      math('c2-product-value', `c_2 = ${c2Rhs * c2Inverse} \\;(\\mathrm{mod}\\; ${third.modulus})`),
    );
    yield* emit(math('c2-value', `c_2 = ${c2}`));

    yield* emit(section('section-c3', 'Wspolczynnik c3'));
    yield* emit(note('c3-current-label', 'Aktualna postac:'));
    yield* emit(math('c3-current-1', `x = ${base2} + ${m1m2} * ${c2} + ${m1m2m3}c_3`));
    yield* emit(math('c3-current-2', `x = ${base3} + ${m1m2m3}c_3`));
    yield* emit(note('c3-mod-label', `Patrzymy modulo ${fourth.modulus}:`));
    yield* emit(
      math(
        'c3-mod-equation',
        `${base3} + ${m1m2m3}c_3 = ${fourth.residue} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(note('c3-reduce-label', 'Redukujemy:'));
    yield* emit(
      math(
        'c3-reduce-base',
        `${base3} = ${mod(base3, fourth.modulus)} \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(
      math('c3-reduce-coeff', `${m1m2m3} = ${c3Coeff} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(note('c3-equation-label', 'Dostajemy:'));
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
    yield* emit(note('c3-inverse-label', `Odwrotnosc ${c3Coeff} modulo ${fourth.modulus}:`));
    yield* emit(
      math(
        'c3-inverse-check',
        `${c3Coeff} * ${c3Inverse} = ${c3Coeff * c3Inverse} = 1 \\;(\\mathrm{mod}\\; ${fourth.modulus})`,
      ),
    );
    yield* emit(
      math('c3-inverse', `${c3Coeff}^{-1} = ${c3Inverse} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(note('c3-therefore-label', 'Zatem:'));
    yield* emit(
      math('c3-product', `c_3 = ${c3Rhs} * ${c3Inverse} \\;(\\mathrm{mod}\\; ${fourth.modulus})`),
    );
    yield* emit(math('c3-value', `c_3 = ${c3}`));

    yield* emit(section('section-compose', 'Zlozenie liczby'));
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
  readonly label: string;
  readonly left: CrtCongruence;
  readonly right: CrtCongruence;
  readonly gcd: number;
  readonly diff: number;
  readonly remainder: number;
}[] {
  const labels = [
    'Pierwsza i druga kongruencja',
    'Pierwsza i trzecia kongruencja',
    'Druga i trzecia kongruencja',
  ];
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
      label: labels[index],
      left,
      right,
      gcd: common,
      diff,
      remainder: mod(diff, common),
    };
  });
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('check')) return 'Sprawdzenie';
  if (builder.id.includes('result') || builder.id.includes('no-result')) return 'Wynik';
  if (builder.id.includes('compatibility') || builder.id.includes('coprime')) return 'Test';
  if (builder.id.includes('merge') || builder.id.includes('attach')) return 'Laczenie';
  return 'Obliczenia';
}

function decisionFor(builder: LineBuilder): string {
  if (builder.id.includes('no-result')) return 'System sprzeczny.';
  if (builder.kind === 'result') return 'Zapisujemy wynik.';
  if (builder.kind === 'note') return 'Zapisujemy kolejna czesc rozwiazania.';
  return 'Liczymy kolejny wiersz.';
}

function toneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result')
    return builder.id === 'section-no-result' ? 'conclude' : 'complete';
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

function ordinal(index: number): string {
  switch (index) {
    case 1:
      return 'pierwszej';
    case 2:
      return 'drugiej';
    case 3:
      return 'trzeciej';
    default:
      return `${index}.`;
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
