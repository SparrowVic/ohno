import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { CRT_TASKS, DEFAULT_CRT_TASK_ID, parseCongruences } from './crt';
import type { CrtCongruence, CrtNotebookFlow, CrtTask } from './crt';

export interface CrtPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface CrtScenario extends BaseScenario {
  readonly kind: 'crt';
  readonly congruences: readonly CrtCongruence[];
  readonly notebookFlow: CrtNotebookFlow;
  readonly taskPrompt: TranslatableText | null;
}

export const CRT_PRESETS: readonly CrtPresetOption[] = CRT_TASKS.map((task) => ({
  id: task.id,
  label: typeof task.name === 'string' ? task.name : task.id,
  description: typeof task.summary === 'string' ? task.summary : '',
}));

export const DEFAULT_CRT_PRESET_ID = DEFAULT_CRT_TASK_ID;
export { CRT_TASKS, DEFAULT_CRT_TASK_ID };
export type CrtValues = CrtTask['defaultValues'];

export function createCrtScenario(
  _size: number,
  presetId: string | null,
  customValues?: CrtValues,
): CrtScenario {
  const id = presetId ?? DEFAULT_CRT_TASK_ID;
  const task =
    CRT_TASKS.find((candidate) => candidate.id === id) ??
    CRT_TASKS.find((candidate) => candidate.id === DEFAULT_CRT_TASK_ID) ??
    CRT_TASKS[0];
  const values: CrtValues = { ...task.defaultValues, ...customValues };
  const congruences = parseCongruences(values);

  return {
    kind: 'crt',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, congruences),
    notebookFlow: task.notebookFlow,
    congruences,
  };
}

function buildTaskPrompt(
  flow: CrtNotebookFlow,
  congruences: readonly CrtCongruence[],
): TranslatableText {
  const system = congruences.map(formatPromptCongruence).join('\n');
  switch (flow.kind) {
    case 'direct':
      return [
        'Znajdz najmniejsza nieujemna liczbe [[math]]x[[/math]], ktora spelnia uklad kongruencji:',
        '',
        system,
        '',
        'Uzyj bezposredniej konstrukcji CRT i pokaz, skad biora sie skladniki sumy.',
      ].join('\n');
    case 'progressive-merge':
      return [
        'Trzy procesy cykliczne zwracaja status poprawnosci w roznych momentach.',
        'Szukamy pierwszego wspolnego momentu [[math]]x[[/math]], dla ktorego:',
        '',
        system,
        '',
        'Nie uzywaj bezposredniej sumy CRT. Polacz najpierw pierwsze dwa warunki w jedna kongruencje, a potem dolacz trzeci warunek.',
      ].join('\n');
    case 'non-coprime-compatible':
      return [
        'System logow z trzech maszyn zapisuje znaczniki czasu z roznymi okresami.',
        'Dwie maszyny maja okresy, ktore nie sa wzglednie pierwsze, wiec zwykla wersja CRT nie wystarczy.',
        'Znajdz wszystkie [[math]]x[[/math]], ktore spelniaja:',
        '',
        system,
        '',
        'Najpierw sprawdz zgodnosc kongruencji, potem polacz warunki metoda podstawiania.',
      ].join('\n');
    case 'non-coprime-trap':
      return [
        'Rozwaz system warunkow:',
        '',
        system,
        '',
        'Sprawdz, czy system ma rozwiazanie. Nie wykonuj konstrukcji CRT, jezeli warunki sa sprzeczne.',
      ].join('\n');
    case 'garner-mixed-radix': {
      const [first, second, third] = congruences;
      const m1m2 = first.modulus * second.modulus;
      const m1m2m3 = m1m2 * third.modulus;
      return [
        'Liczba zostala zapisana jako zestaw reszt wzgledem kilku malych modulow.',
        'Trzeba odtworzyc jedna liczbe [[math]]x[[/math]] z zakresu [[math]]0 \\le x < M[[/math]], ale bez klasycznej sumy CRT.',
        'Uzyj reprezentacji mieszanej Garnera.',
        '',
        'Dane:',
        '',
        system,
        '',
        'Szukamy postaci:',
        '',
        `[[math]]x = c_0 + c_1 * ${first.modulus} + c_2 * ${first.modulus} * ${second.modulus} + c_3 * ${first.modulus} * ${second.modulus} * ${third.modulus}[[/math]]`,
        '',
        'czyli:',
        '',
        `[[math]]x = c_0 + ${first.modulus}c_1 + ${m1m2}c_2 + ${m1m2m3}c_3[[/math]]`,
      ].join('\n');
    }
  }
}

function formatPromptCongruence(congruence: CrtCongruence): string {
  return `[[math]]x = ${congruence.residue} \\;(\\mathrm{mod}\\; ${congruence.modulus})[[/math]]`;
}
