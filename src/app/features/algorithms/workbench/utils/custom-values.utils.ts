import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  TaskFloatField,
  TaskInputField,
  TaskInputSchema,
  TaskIntField,
  TaskStringField,
} from '../../models/task';

const ERRORS = I18N_KEY.features.algorithms.toolbar.customizeValues;
const INTEGER_PATTERN = /^-?\d+$/;
const FLOAT_PATTERN = /^-?\d+(?:[.,]\d+)?$/;

export type CustomFieldValue = number | string;

export function seedFieldText(field: TaskInputField<unknown>, raw: unknown): string {
  if (field.kind === 'string' || field.kind === 'textarea') return typeof raw === 'string' ? raw : '';
  return typeof raw === 'number' && Number.isFinite(raw) ? String(raw) : '';
}

export function parseFieldText(field: TaskInputField<unknown>, text: string): CustomFieldValue | null {
  const trimmed = text.trim();
  if (field.kind === 'int') return INTEGER_PATTERN.test(trimmed) ? Number.parseInt(trimmed, 10) : null;
  if (field.kind === 'float') return FLOAT_PATTERN.test(trimmed) ? Number.parseFloat(trimmed.replace(',', '.')) : null;
  if (field.kind === 'string') return text;
  return null;
}

export function validateFieldValue(field: TaskInputField<unknown>, value: CustomFieldValue | null): TranslatableText | null {
  switch (field.kind) {
    case 'int':
      return validateInt(field, typeof value === 'number' ? value : null);
    case 'float':
      return validateFloat(field, typeof value === 'number' ? value : null);
    case 'string':
      return validateString(field, typeof value === 'string' ? value : '');
    default:
      return ERRORS.fieldTypeUnsupportedLabel;
  }
}

export function collectCustomValues(
  schema: TaskInputSchema<Record<string, unknown>>,
  texts: Readonly<Record<string, string>>,
): Record<string, unknown> | null {
  const values: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema)) {
    const parsed = parseFieldText(field, texts[key] ?? '');
    if (parsed === null || validateFieldValue(field, parsed) !== null) return null;
    values[key] = parsed;
  }
  return values;
}

function validateInt(field: TaskIntField, value: number | null): TranslatableText | null {
  if (value === null || !Number.isInteger(value)) return ERRORS.notAnIntegerLabel;
  if (field.min !== undefined && value < field.min) return ERRORS.belowMinimumLabel;
  if (field.max !== undefined && value > field.max) return ERRORS.aboveMaximumLabel;
  if (field.nonZero && value === 0) return ERRORS.mustBeNonZeroLabel;
  return null;
}

function validateFloat(field: TaskFloatField, value: number | null): TranslatableText | null {
  if (value === null) return ERRORS.notAnIntegerLabel;
  if (field.min !== undefined && value < field.min) return ERRORS.belowMinimumLabel;
  if (field.max !== undefined && value > field.max) return ERRORS.aboveMaximumLabel;
  return null;
}

function validateString(field: TaskStringField, value: string): TranslatableText | null {
  const trimmed = value.trim();
  if (field.minLength !== undefined && trimmed.length < field.minLength) return ERRORS.belowMinimumLabel;
  if (field.maxLength !== undefined && trimmed.length > field.maxLength) return ERRORS.aboveMaximumLabel;
  if (field.pattern !== undefined && !field.pattern.test(value)) return ERRORS.notAnIntegerLabel;
  return null;
}
