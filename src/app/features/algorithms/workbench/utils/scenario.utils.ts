import { AlgorithmViewConfig, RandomRange } from '../../algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import { PresetOption } from '../../models/preset-option';
import { Task } from '../../models/task';

export type ConfigWithTasks = AlgorithmViewConfig & {
  readonly tasks: readonly Task<Record<string, unknown>>[];
  readonly defaultTaskId?: string;
  readonly createScenario: (size: number, presetId: string, customValues?: Record<string, unknown>) => unknown;
};

export function configHasTasks(config: AlgorithmViewConfig | null | undefined): config is ConfigWithTasks {
  if (!config) return false;
  const tasks = (config as { tasks?: readonly Task<unknown>[] }).tasks;
  return Array.isArray(tasks) && tasks.length > 0;
}

export function presetOptionsOf(config: AlgorithmViewConfig | null): readonly PresetOption[] {
  if (!config || configHasTasks(config) || !('presetOptions' in config)) return [];
  return config.presetOptions;
}

export function defaultPresetId(config: AlgorithmViewConfig | null): string | null {
  if (!config || !('defaultPresetId' in config)) return null;
  return config.defaultPresetId;
}

export function resolvePresetId(config: AlgorithmViewConfig | null, requested: string | null): string | null {
  if (!config || !('presetOptions' in config)) return null;
  if (requested !== null && config.presetOptions.some((option) => option.id === requested)) return requested;
  return config.defaultPresetId;
}

export function resolveTaskId(config: ConfigWithTasks, requested: string | null): string | null {
  if (requested !== null && config.tasks.some((task) => task.id === requested)) return requested;
  return config.defaultTaskId ?? config.tasks[0]?.id ?? null;
}

export function createRandomArray(size: number, range: RandomRange, random: () => number = Math.random): readonly number[] {
  const span = range.max - range.min + 1;
  return Array.from({ length: size }, () => Math.floor(random() * span) + range.min);
}
