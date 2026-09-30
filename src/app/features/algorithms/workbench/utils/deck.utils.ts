import { TaskInputSchema } from '../../models/task';

export interface TaskChoice {
  readonly id: string;
  readonly label: string;
}

const CUSTOM_FIELD_KINDS: ReadonlySet<string> = new Set(['int', 'float', 'string']);

export function hasCustomFields(schema: TaskInputSchema<Record<string, unknown>> | null): boolean {
  if (!schema) return false;
  return Object.values(schema).some((field) => CUSTOM_FIELD_KINDS.has(field.kind));
}

export function showSizeSection(sizeOptions: readonly number[], tasks: readonly TaskChoice[]): boolean {
  return tasks.length === 0 && sizeOptions.length > 1;
}
