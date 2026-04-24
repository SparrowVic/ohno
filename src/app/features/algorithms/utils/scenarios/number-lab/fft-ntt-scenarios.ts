import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { DEFAULT_FFT_NTT_TASK_ID, FFT_NTT_TASKS, formatVector, parseVector } from './fft-ntt';
import type { FftNttNotebookFlow, FftNttTask, FftNttTaskValues } from './fft-ntt';

export interface FftNttPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface FftNttResolvedValues {
  readonly mod: number;
  readonly n: number;
  readonly omega: number;
  readonly omegaLabel: string;
  readonly A: readonly number[];
  readonly B: readonly number[];
  readonly badN: number;
  readonly goodN: number;
  readonly omega4: number;
  readonly omega8: number;
  readonly left: number;
  readonly right: number;
  readonly base: number;
  readonly omegaBad: number;
  readonly omegaGood: number;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface FftNttScenario extends BaseScenario {
  readonly kind: 'fft-ntt';
  readonly values: FftNttResolvedValues;
  readonly notebookFlow: FftNttNotebookFlow;
  readonly taskPrompt: TranslatableText | null;
}

export const FFT_NTT_PRESETS: readonly FftNttPresetOption[] = FFT_NTT_TASKS.map((task) => ({
  id: task.id,
  label: typeof task.name === 'string' ? task.name : task.id,
  description: typeof task.summary === 'string' ? task.summary : '',
}));

export const DEFAULT_FFT_NTT_PRESET_ID = DEFAULT_FFT_NTT_TASK_ID;
export { FFT_NTT_TASKS, DEFAULT_FFT_NTT_TASK_ID };
export type FftNttValues = FftNttTask['defaultValues'];

export function createFftNttScenario(
  _size: number,
  presetId: string | null,
  customValues?: FftNttValues,
): FftNttScenario {
  const id = presetId ?? DEFAULT_FFT_NTT_TASK_ID;
  const task =
    FFT_NTT_TASKS.find((candidate) => candidate.id === id) ??
    FFT_NTT_TASKS.find((candidate) => candidate.id === DEFAULT_FFT_NTT_TASK_ID) ??
    FFT_NTT_TASKS[0];
  const values: FftNttTaskValues = { ...task.defaultValues, ...customValues };
  const resolved = resolveValues(values, task.defaultValues);

  return {
    kind: 'fft-ntt',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, resolved),
    notebookFlow: task.notebookFlow,
    values: resolved,
  };
}

function resolveValues(values: FftNttTaskValues, defaults: FftNttTaskValues): FftNttResolvedValues {
  const omega = numberValue(values.omega, numberValue(defaults.omega, 4));
  return {
    mod: numberValue(values.mod, numberValue(defaults.mod, 17)),
    n: numberValue(values.n, numberValue(defaults.n, 4)),
    omega,
    omegaLabel: stringValue(values.omega, stringValue(defaults.omega, String(omega))),
    A: vectorValue(values.A, defaults.A, [1, 2, 3, 0]),
    B: vectorValue(values.B, defaults.B, [4, 5, 0, 0]),
    badN: numberValue(values.bad_n, numberValue(defaults.bad_n, 4)),
    goodN: numberValue(values.good_n, numberValue(defaults.good_n, 8)),
    omega4: numberValue(values.omega4, numberValue(defaults.omega4, 4)),
    omega8: numberValue(values.omega8, numberValue(defaults.omega8, 2)),
    left: numberValue(values.left, numberValue(defaults.left, 123)),
    right: numberValue(values.right, numberValue(defaults.right, 12)),
    base: numberValue(values.base, numberValue(defaults.base, 10)),
    omegaBad: numberValue(values.omega_bad, numberValue(defaults.omega_bad, 4)),
    omegaGood: numberValue(values.omega_good, numberValue(defaults.omega_good, 2)),
  };
}

function buildTaskPrompt(flow: FftNttNotebookFlow, values: FftNttResolvedValues): TranslatableText {
  switch (flow.kind) {
    case 'ntt-convolution':
      return [
        'Pomnóż wielomiany:',
        '',
        `[[math]]A(x) = ${formatPolynomial(values.A)}[[/math]]`,
        `[[math]]B(x) = ${formatPolynomial(values.B)}[[/math]]`,
        '',
        `używając NTT długości [[math]]${values.n}[[/math]] modulo [[math]]${values.mod}[[/math]] z pierwiastkiem [[math]]\\omega = ${values.omega}[[/math]].`,
      ].join('\n');
    case 'recursive-fft-split':
      return [
        'Policz FFT wektora:',
        '',
        `[[math]]A = ${formatVector(values.A)}[[/math]]`,
        '',
        'używając rekurencyjnego rozbicia Cooleya-Tukeya na część parzystą i nieparzystą.',
        'Przyjmij konwencję:',
        '',
        `[[math]]\\omega = ${values.omegaLabel}[[/math]]`,
      ].join('\n');
    case 'cyclic-vs-linear-trap':
      return [
        'Pokaż, co się stanie, gdy do liniowej konwolucji dwóch wektorów długości [[math]]4[[/math]] użyjemy NTT długości [[math]]4[[/math]] bez paddingu.',
        'Następnie popraw obliczenie przez padding do długości [[math]]8[[/math]].',
      ].join('\n');
    case 'big-integer-convolution':
      return [
        `Pomnóż liczby [[math]]${values.left}[[/math]] i [[math]]${values.right}[[/math]], traktując cyfry jako współczynniki wielomianu w bazie [[math]]${values.base}[[/math]].`,
        `Konwolucję cyfr policz przez NTT długości [[math]]${values.n}[[/math]] modulo [[math]]${values.mod}[[/math]].`,
      ].join('\n');
    case 'primitive-root-check':
      return [
        `Sprawdź, czy [[math]]\\omega = ${values.omegaBad}[[/math]] może być użyte jako pierwiastek pierwotny stopnia [[math]]${values.n}[[/math]] modulo [[math]]${values.mod}[[/math]].`,
        `Jeśli nie, pokaż, jak prowadzi to do kolizji transformaty, a potem napraw parametr przez wybór [[math]]\\omega = ${values.omegaGood}[[/math]].`,
      ].join('\n');
  }
}

function vectorValue(
  input: string | undefined,
  fallbackInput: string | undefined,
  hardFallback: readonly number[],
): readonly number[] {
  const parsed = parseVector(input);
  if (parsed.length > 0) return parsed;
  const fallback = parseVector(fallbackInput);
  return fallback.length > 0 ? fallback : hardFallback;
}

function numberValue(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function stringValue(value: number | string | undefined, fallback: string): string {
  if (typeof value === 'number') return String(value);
  return value?.trim() || fallback;
}

function formatPolynomial(coefficients: readonly number[]): string {
  const terms = coefficients
    .map((coefficient, index) => ({ coefficient, index }))
    .filter((term) => term.coefficient !== 0)
    .map(({ coefficient, index }) => {
      if (index === 0) return String(coefficient);
      if (index === 1) return coefficient === 1 ? 'x' : `${coefficient}x`;
      return coefficient === 1 ? `x^${index}` : `${coefficient}x^${index}`;
    });
  return terms.length > 0 ? terms.join(' + ') : '0';
}
