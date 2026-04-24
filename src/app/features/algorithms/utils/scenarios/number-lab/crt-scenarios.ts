import { TranslatableText } from '../../../../../core/i18n/translatable-text';
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
  return {
    kind: 'crt',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: task.instruction ?? null,
    congruences: parseCongruences(values.congruences),
  };
}
