import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID,
  EXTENDED_EUCLIDEAN_TASKS,
  ExtendedEuclideanTask,
} from './extended-euclidean';

export interface ExtendedEuclideanPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface ExtendedEuclideanScenario extends BaseScenario {
  readonly kind: 'extended-euclidean';
  readonly a: number;
  readonly b: number;
  /** Exam-style prompt pulled from the active task's `instruction`
   *  field — rendered as a "Task:" block atop the scratchpad. Null
   *  when the task did not declare a prompt. */
  readonly taskPrompt: TranslatableText | null;
}

/* Task definitions live in `../extended-euclidean-tasks/` — one file per
 *  task, each carrying its own title / summary / instruction / hints /
 *  difficulty. The exports below are thin adapters: legacy preset
 *  options are derived from the task list for any remaining per-viz
 *  picker, and the scenario factory resolves a preset id against the
 *  same list rather than a local switch. */
export const EXTENDED_EUCLIDEAN_PRESETS: readonly ExtendedEuclideanPresetOption[] =
  EXTENDED_EUCLIDEAN_TASKS.map((task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }));

export const DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID = DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID;
export { EXTENDED_EUCLIDEAN_TASKS, DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID };
export type ExtendedEuclideanValues = ExtendedEuclideanTask['defaultValues'];

export function createExtendedEuclideanScenario(
  _size: number,
  presetId: string | null,
  customValues?: ExtendedEuclideanValues,
): ExtendedEuclideanScenario {
  const id = presetId ?? DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID;
  const task =
    EXTENDED_EUCLIDEAN_TASKS.find((candidate) => candidate.id === id) ??
    EXTENDED_EUCLIDEAN_TASKS.find(
      (candidate) => candidate.id === DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID,
    ) ??
    EXTENDED_EUCLIDEAN_TASKS[0];
  const a = customValues?.a ?? task.defaultValues.a;
  const b = customValues?.b ?? task.defaultValues.b;
  return {
    kind: 'extended-euclidean',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, { a, b }),
    a,
    b,
  };
}
