import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import {
  DEFAULT_POLLARDS_RHO_TASK_ID,
  POLLARDS_RHO_MAX_ITERATIONS,
  POLLARDS_RHO_TASKS,
} from './pollards-rho';
import type {
  PollardsRhoNotebookFlow,
  PollardsRhoTask,
  PollardsRhoTaskValues,
} from './pollards-rho';

export interface PollardsRhoPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface PollardsRhoScenario extends BaseScenario {
  readonly kind: 'pollards-rho';
  readonly n: number;
  readonly c: number;
  readonly x0: number;
  readonly cFail: number;
  readonly cRetry: number;
  readonly batchSize: number;
  readonly cForCompositeFactor: number;
  readonly maxIterations: number;
  readonly notebookFlow: PollardsRhoNotebookFlow;
  readonly taskPrompt: TranslatableText | null;
}

export const POLLARDS_RHO_PRESETS: readonly PollardsRhoPresetOption[] = POLLARDS_RHO_TASKS.map(
  (task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }),
);

export const DEFAULT_POLLARDS_RHO_PRESET_ID = DEFAULT_POLLARDS_RHO_TASK_ID;
export { POLLARDS_RHO_TASKS, DEFAULT_POLLARDS_RHO_TASK_ID };
export type PollardsRhoValues = PollardsRhoTask['defaultValues'];

export function createPollardsRhoScenario(
  _size: number,
  presetId: string | null,
  customValues?: PollardsRhoValues,
): PollardsRhoScenario {
  const id = presetId ?? DEFAULT_POLLARDS_RHO_TASK_ID;
  const task =
    POLLARDS_RHO_TASKS.find((candidate) => candidate.id === id) ??
    POLLARDS_RHO_TASKS.find((candidate) => candidate.id === DEFAULT_POLLARDS_RHO_TASK_ID) ??
    POLLARDS_RHO_TASKS[0];
  const values: PollardsRhoTaskValues = { ...task.defaultValues, ...customValues };
  const c = values.c ?? values.c_retry ?? values.c_fail ?? 1;
  const cFail = values.c_fail ?? c;
  const cRetry = values.c_retry ?? c;
  const batchSize = values.m ?? 3;
  const cForCompositeFactor = values.c_for_21 ?? 2;

  return {
    kind: 'pollards-rho',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, values, {
      c,
      cFail,
      cRetry,
      batchSize,
      cForCompositeFactor,
    }),
    notebookFlow: task.notebookFlow,
    n: values.n,
    c,
    x0: values.x0,
    cFail,
    cRetry,
    batchSize,
    cForCompositeFactor,
    maxIterations: POLLARDS_RHO_MAX_ITERATIONS,
  };
}

function buildTaskPrompt(
  flow: PollardsRhoNotebookFlow,
  values: PollardsRhoTaskValues,
  resolved: {
    readonly c: number;
    readonly cFail: number;
    readonly cRetry: number;
    readonly batchSize: number;
    readonly cForCompositeFactor: number;
  },
): TranslatableText {
  switch (flow.kind) {
    case 'floyd-basic':
      return [
        `Rozłóż liczbę [[math]]${values.n}[[/math]] metodą Pollard's Rho. Użyj funkcji:`,
        '',
        `[[math]]f(x) = x^2 + ${resolved.c} \\;(\\mathrm{mod}\\; ${values.n})[[/math]]`,
        '',
        `oraz punktu startowego [[math]]x_0 = ${values.x0}[[/math]]. Wykonuj wariant Floyda, gdzie [[math]]x[[/math]] porusza się jednym krokiem, a [[math]]y[[/math]] dwoma krokami.`,
      ].join('\n');
    case 'retry-after-cycle':
      return [
        `Dla liczby [[math]]${values.n}[[/math]] uruchom Pollard's Rho z funkcją:`,
        '',
        `[[math]]f(x) = x^2 + ${resolved.cFail} \\;(\\mathrm{mod}\\; ${values.n})[[/math]]`,
        '',
        'Jeżeli algorytm zwróci [[math]]d = n[[/math]], potraktuj to jako nieudaną próbę i uruchom go ponownie z funkcją:',
        '',
        `[[math]]g(x) = x^2 + ${resolved.cRetry} \\;(\\mathrm{mod}\\; ${values.n})[[/math]]`,
        '',
        'Pokaż, dlaczego pierwsza próba nie daje dzielnika oraz jak druga próba naprawia sytuację.',
      ].join('\n');
    case 'brent-batch-gcd':
      return [
        `Rozłóż [[math]]${values.n}[[/math]] wariantem Brenta. Zamiast liczyć [[math]]\\gcd[[/math]] po każdej pojedynczej różnicy, grupuj maksymalnie [[math]]m = ${resolved.batchSize}[[/math]] różnice w iloczyn:`,
        '',
        '[[math]]q = product(|x - y_i|) \\;(\\mathrm{mod}\\; n)[[/math]]',
        '',
        'a następnie licz:',
        '',
        '[[math]]d = \\gcd(q, n)[[/math]]',
      ].join('\n');
    case 'recursive-factorization':
      return [
        `Użyj Pollard's Rho do pełnego rozkładu liczby [[math]]${values.n}[[/math]].`,
        'Po znalezieniu jednego dzielnika rozbijaj dalej pozostały iloraz, aż wszystkie czynniki będą pierwsze.',
      ].join('\n');
    case 'composite-factor-split':
      return [
        `Rozłóż [[math]]${values.n}[[/math]]. Zwróć uwagę, że Pollard's Rho może zwrócić dzielnik nietrywialny, który sam nadal jest złożony.`,
        'Trzeba go wtedy rozbić dalej.',
      ].join('\n');
  }
}
