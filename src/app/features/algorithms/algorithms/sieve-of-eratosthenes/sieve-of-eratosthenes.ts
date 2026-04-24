import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  SieveCellState,
  SieveGridCell,
  SieveGridTraceState,
  SieveStatChip,
} from '../../models/sieve-grid';
import { SortStep } from '../../models/sort-step';
import { SieveEratosthenesScenario } from '../../utils/scenarios/sieve-grid/sieve-grid-scenarios';
import { createSieveGridStep } from '../sieve-grid-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.sieveGrid.eratosthenes.modeLabel'),
  resultFormat: t('features.algorithms.runtime.sieveGrid.eratosthenes.resultFormat'),
  phases: {
    setup: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.setup'),
    pick: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.pick'),
    skip: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.skip'),
    mark: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.mark'),
    collect: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.collect'),
    complete: t('features.algorithms.runtime.sieveGrid.eratosthenes.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.setup'),
    pickPrime: t('features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.pickPrime'),
    skipComposite: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.skipComposite',
    ),
    mark: t('features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.mark'),
    finishPrime: t('features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.finishPrime'),
    collectPrime: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.collectPrime',
    ),
    complete: t('features.algorithms.runtime.sieveGrid.eratosthenes.descriptions.complete'),
  },
  decisions: {
    pickFreshPrime: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.decisions.pickFreshPrime',
    ),
    alreadyComposite: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.decisions.alreadyComposite',
    ),
    crossMultiple: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.decisions.crossMultiple',
    ),
    finishedPrime: t(
      'features.algorithms.runtime.sieveGrid.eratosthenes.decisions.finishedPrime',
    ),
    aboveBound: t('features.algorithms.runtime.sieveGrid.eratosthenes.decisions.aboveBound'),
    collect: t('features.algorithms.runtime.sieveGrid.eratosthenes.decisions.collect'),
    complete: t('features.algorithms.runtime.sieveGrid.eratosthenes.decisions.complete'),
  },
  stats: {
    found: t('features.algorithms.runtime.sieveGrid.eratosthenes.stats.found'),
    crossed: t('features.algorithms.runtime.sieveGrid.eratosthenes.stats.crossed'),
    candidate: t('features.algorithms.runtime.sieveGrid.eratosthenes.stats.candidate'),
  },
} as const;

type CellModel = {
  value: number;
  composite: boolean;
  prime: boolean;
  markedBy: number | null;
};

function buildCells(
  models: readonly CellModel[],
  overrides: Record<number, SieveCellState>,
  currentPrime: number | null,
): SieveGridCell[] {
  return models.map((m) => {
    const state: SieveCellState = overrides[m.value]
      ? overrides[m.value]
      : m.value < 2
        ? 'skipped'
        : m.prime
          ? 'prime'
          : m.composite
            ? 'composite'
            : 'unchecked';
    const factorLabel =
      m.value !== currentPrime && (state === 'marking' || state === 'just-marked') && currentPrime
        ? `×${Math.round(m.value / currentPrime)}`
        : null;
    return { value: m.value, state, factorLabel };
  });
}

function buildStats(
  foundPrimes: number,
  crossedComposites: number,
  candidate: string,
): SieveStatChip[] {
  return [
    {
      label: I18N.stats.found,
      value: String(foundPrimes),
      tone: foundPrimes > 0 ? 'success' : 'info',
    },
    {
      label: I18N.stats.crossed,
      value: String(crossedComposites),
      tone: crossedComposites > 0 ? 'danger' : 'info',
    },
    { label: I18N.stats.candidate, value: candidate, tone: 'accent' },
  ];
}

export function* sieveOfEratosthenesGenerator(
  scenario: SieveEratosthenesScenario,
): Generator<SortStep> {
  const n = scenario.upper;
  const bound = Math.floor(Math.sqrt(n));
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;

  const models: CellModel[] = [];
  for (let v = 0; v <= n; v++) {
    models.push({ value: v, composite: v < 2, prime: false, markedBy: null });
  }

  let iteration = 0;
  let foundPrimes = 0;
  let crossedComposites = 0;

  const makeState = (partial: {
    phaseLabel: SieveGridTraceState['phaseLabel'];
    decisionLabel: SieveGridTraceState['decisionLabel'];
    tone: SieveGridTraceState['tone'];
    overrides: Record<number, SieveCellState>;
    activePrime: number | null;
    candidateLabel: string;
    resultLabel: SieveGridTraceState['resultLabel'];
  }): SieveGridTraceState => ({
    mode: 'eratosthenes',
    modeLabel: mode,
    presetLabel,
    phaseLabel: partial.phaseLabel,
    decisionLabel: partial.decisionLabel,
    tone: partial.tone,
    cells: buildCells(models, partial.overrides, partial.activePrime),
    activePrime: partial.activePrime,
    bound,
    stats: buildStats(foundPrimes, crossedComposites, partial.candidateLabel),
    resultLabel: partial.resultLabel,
    iteration,
  });

  // ---------- Setup ----------
  yield createSieveGridStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { n }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.pickFreshPrime,
      tone: 'idle',
      overrides: {},
      activePrime: null,
      candidateLabel: '—',
      resultLabel: null,
    }),
  });

  // ---------- Main loop: for p = 2..sqrt(n) ----------
  for (let p = 2; p * p <= n; p++) {
    iteration++;
    const pModel = models[p];
    if (pModel.composite) {
      // Skip — already marked as a multiple of a smaller prime.
      yield createSieveGridStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.skipComposite, { p }),
        state: makeState({
          phaseLabel: I18N.phases.skip,
          decisionLabel: I18N.decisions.alreadyComposite,
          tone: 'idle',
          overrides: { [p]: 'current' },
          activePrime: null,
          candidateLabel: String(p),
          resultLabel: null,
        }),
      });
      continue;
    }

    // Mark p as a confirmed prime.
    pModel.prime = true;
    foundPrimes++;
    yield createSieveGridStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.pickPrime, { p }),
      state: makeState({
        phaseLabel: I18N.phases.pick,
        decisionLabel: I18N.decisions.pickFreshPrime,
        tone: 'pick',
        overrides: { [p]: 'current-prime' },
        activePrime: p,
        candidateLabel: String(p),
        resultLabel: null,
      }),
    });

    // Cross out multiples starting at p*p.
    for (let k = p * p; k <= n; k += p) {
      const mModel = models[k];
      const wasAlreadyComposite = mModel.composite;
      if (!wasAlreadyComposite) {
        mModel.composite = true;
        mModel.markedBy = p;
        crossedComposites++;
      }
      iteration++;
      yield createSieveGridStep({
        activeCodeLine: wasAlreadyComposite ? 4 : 5,
        description: i18nText(I18N.descriptions.mark, { p, k }),
        state: makeState({
          phaseLabel: I18N.phases.mark,
          decisionLabel: I18N.decisions.crossMultiple,
          tone: 'mark',
          overrides: { [p]: 'current-prime', [k]: 'marking' },
          activePrime: p,
          candidateLabel: `${p} × ${Math.round(k / p)}`,
          resultLabel: null,
        }),
      });
    }

    iteration++;
    yield createSieveGridStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.finishPrime, { p }),
      state: makeState({
        phaseLabel: I18N.phases.pick,
        decisionLabel: I18N.decisions.finishedPrime,
        tone: 'settle',
        overrides: { [p]: 'prime' },
        activePrime: p,
        candidateLabel: String(p),
        resultLabel: null,
      }),
    });
  }

  // ---------- Collect remaining primes > sqrt(n) ----------
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (!models[i].composite) {
      if (!models[i].prime) {
        models[i].prime = true;
        foundPrimes++;
        iteration++;
        yield createSieveGridStep({
          activeCodeLine: 7,
          description: i18nText(I18N.descriptions.collectPrime, { i }),
          state: makeState({
            phaseLabel: I18N.phases.collect,
            decisionLabel: I18N.decisions.collect,
            tone: 'pick',
            overrides: { [i]: 'current-prime' },
            activePrime: i,
            candidateLabel: String(i),
            resultLabel: null,
          }),
        });
      }
      primes.push(i);
    }
  }

  // ---------- Complete ----------
  const summary = primes.length <= 18 ? primes.join(', ') : `${primes.slice(0, 16).join(', ')}…`;
  iteration++;
  yield createSieveGridStep({
    activeCodeLine: 6,
    description: i18nText(I18N.descriptions.complete, { count: primes.length, n }),
    state: makeState({
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.complete,
      tone: 'complete',
      overrides: {},
      activePrime: null,
      candidateLabel: String(n),
      resultLabel: i18nText(I18N.resultFormat, { count: primes.length, list: summary }),
    }),
  });
}
