import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_MILLER_RABIN_TASK_ID,
  MILLER_RABIN_TASKS,
  MillerRabinTask,
  parseWitnesses,
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
  /** Odd integer being tested for primality. Must be ≥ 3. */
  readonly n: number;
  /** Parsed, normalised witness bases — every value satisfies
   *  `2 ≤ a < n`. Order controls the on-board narration sequence. */
  readonly witnesses: readonly number[];
  /** Exam-style prompt pulled from the active task's `instruction`
   *  field — rendered as a "Task:" block atop the scratchpad. */
  readonly taskPrompt: TranslatableText | null;
}

/* Task definitions live in `./miller-rabin/` — one file per variant,
 *  each carrying its own title / summary / instruction / hints /
 *  difficulty. The exports below are thin adapters: legacy preset
 *  options are derived from the task list for any per-viz picker,
 *  and the scenario factory resolves a preset id against the same
 *  list instead of a local switch. */
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
  const values = customValues ?? task.defaultValues;
  const witnesses = parseWitnesses(values.witnesses, values.n);
  return {
    kind: 'miller-rabin',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      n: values.n,
      witnesses: witnesses.join(', '),
    }),
    n: values.n,
    witnesses,
  };
}
