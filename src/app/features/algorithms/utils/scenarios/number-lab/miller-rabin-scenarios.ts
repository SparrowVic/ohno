import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { DEFAULT_MILLER_RABIN_TASK_ID, MILLER_RABIN_TASKS } from './miller-rabin';
import type {
  MillerRabinNotebookFlow,
  MillerRabinTask,
  MillerRabinTaskValues,
} from './miller-rabin';

export interface MillerRabinPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface MillerRabinScenario extends BaseScenario {
  readonly kind: 'miller-rabin';
  readonly n: number;
  readonly bases: readonly number[];
  readonly notebookFlow: MillerRabinNotebookFlow;
  readonly taskPrompt: TranslatableText | null;
}

export const MILLER_RABIN_PRESETS: readonly MillerRabinPresetOption[] = MILLER_RABIN_TASKS.map(
  (task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }),
);

export const DEFAULT_MILLER_RABIN_PRESET_ID = DEFAULT_MILLER_RABIN_TASK_ID;
export { MILLER_RABIN_TASKS, DEFAULT_MILLER_RABIN_TASK_ID };
export type MillerRabinValues = MillerRabinTask['defaultValues'];

export function createMillerRabinScenario(
  _size: number,
  presetId: string | null,
  customValues?: MillerRabinValues,
): MillerRabinScenario {
  const id = presetId ?? DEFAULT_MILLER_RABIN_TASK_ID;
  const task =
    MILLER_RABIN_TASKS.find((candidate) => candidate.id === id) ??
    MILLER_RABIN_TASKS.find((candidate) => candidate.id === DEFAULT_MILLER_RABIN_TASK_ID) ??
    MILLER_RABIN_TASKS[0];
  const values: MillerRabinTaskValues = { ...task.defaultValues, ...customValues };
  const bases = values.base1 !== undefined ? [values.base1, values.base2 ?? 2] : [values.base ?? 2];

  return {
    kind: 'miller-rabin',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, values, bases),
    notebookFlow: task.notebookFlow,
    n: values.n,
    bases,
  };
}

function buildTaskPrompt(
  flow: MillerRabinNotebookFlow,
  values: MillerRabinTaskValues,
  bases: readonly number[],
): TranslatableText {
  switch (flow.kind) {
    case 'prime-pass':
      return [
        `Sprawdź, czy [[math]]${values.n}[[/math]] przechodzi test Millera-Rabina dla bazy [[math]]${bases[0]}[[/math]].`,
        'Pokaż rozkład [[math]]n - 1[[/math]] oraz kolejne kwadraty modularne.',
      ].join('\n');
    case 'single-witness':
      return [
        `Sprawdź liczbę [[math]]${values.n}[[/math]] testem Millera-Rabina dla bazy [[math]]${bases[0]}[[/math]].`,
        'Ustal, czy baza jest świadkiem złożoności.',
      ].join('\n');
    case 'strong-liar-multibase':
      return [
        `Liczba [[math]]${values.n}[[/math]] przechodzi test Millera-Rabina dla bazy [[math]]${bases[0]}[[/math]], ale nie przechodzi go dla bazy [[math]]${bases[1]}[[/math]].`,
        'Pokaż oba testy i wyjaśnij, dlaczego jedna baza to za mało.',
      ].join('\n');
    case 'gcd-precheck':
      return [
        `Przed wykonaniem potęgowania modularnego sprawdź, czy baza [[math]]${bases[0]}[[/math]] jest względnie pierwsza z [[math]]${values.n}[[/math]].`,
        'Jeśli nie, zakończ test bez liczenia [[math]]a^d \\; (\\mathrm{mod}\\; n)[[/math]].',
      ].join('\n');
    case 'sqrt-factor-leak':
      return [
        `Dla [[math]]n = ${values.n}[[/math]] i bazy [[math]]${bases[0]}[[/math]] wykonaj test Millera-Rabina.`,
        'Gdy w ciągu kwadratów pojawi się nietrywialny pierwiastek z [[math]]1[[/math]], użyj [[math]]\\gcd(x - 1, n)[[/math]] oraz [[math]]\\gcd(x + 1, n)[[/math]] do odzyskania czynników.',
      ].join('\n');
  }
}
