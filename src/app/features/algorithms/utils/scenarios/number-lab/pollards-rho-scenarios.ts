import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_POLLARDS_RHO_TASK_ID,
  POLLARDS_RHO_MAX_ITERATIONS,
  POLLARDS_RHO_TASKS,
  PollardsRhoTask,
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
  readonly maxIterations: number;
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
  const values = customValues ?? task.defaultValues;
  return {
    kind: 'pollards-rho',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      n: values.n,
      c: values.c,
      x0: values.x0,
    }),
    n: values.n,
    c: values.c,
    x0: values.x0,
    maxIterations: POLLARDS_RHO_MAX_ITERATIONS,
  };
}
