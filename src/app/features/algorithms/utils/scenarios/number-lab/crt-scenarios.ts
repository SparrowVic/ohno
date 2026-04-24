import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  CRT_TASKS,
  CrtCongruence,
  CrtTask,
  DEFAULT_CRT_TASK_ID,
  parseCongruences,
} from './crt';

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
  /** Parsed, normalised system of congruences — every residue is in
   *  `[0, modulus)` and every modulus is ≥ 2. Order controls the
   *  on-board narration sequence. */
  readonly congruences: readonly CrtCongruence[];
  readonly taskPrompt: TranslatableText | null;
}

/* Tasks live in `./crt/` — one file per variant, each with its own
 *  title / summary / instruction / hints / difficulty. */
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
  const values = customValues ?? task.defaultValues;
  const congruences = parseCongruences(values.congruences);
  const M = congruences.reduce((acc, c) => acc * c.modulus, 1);
  return {
    kind: 'crt',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      congruences: formatCongruencesForPrompt(congruences),
      M,
    }),
    congruences,
  };
}

/** Render the parsed system as a KaTeX-ready list for the "Zadanie:"
 *  block — each congruence becomes its own inline `x ≡ r (mod m)` and
 *  they're comma-joined. Embedding `[[math]]...[[/math]]` inside an
 *  interpolated param is fine: Transloco substitutes a plain string,
 *  and MathText parses the markers downstream. */
function formatCongruencesForPrompt(congruences: readonly CrtCongruence[]): string {
  return congruences
    .map((c) => `[[math]]x \\equiv ${c.residue} \\pmod{${c.modulus}}[[/math]]`)
    .join(', ');
}
