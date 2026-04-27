import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { LabPopover } from '../../../../shared/components/lab-popover/lab-popover';
import { NumberInput } from '../../../../shared/controls/number-input/number-input';
import { TextInput } from '../../../../shared/controls/text-input/text-input';
import {
  TaskFloatField,
  TaskInputField,
  TaskInputSchema,
  TaskIntField,
  TaskStringField,
} from '../../models/task';

type ControlValue = number | string | null;

/**
 * Form body of the customize-values popover. Chrome + close handling
 * come from `LabPopover`; individual fields use `NumberInput` for
 * numerics (shared chrome with the rest of the toolbar) and a plain
 * `<input type="text">` for strings (CSV witnesses, CRT congruence
 * systems, etc.) styled to match.
 *
 * Supported kinds: `int`, `float`, `string`. `textarea` and `list`
 * arrive as the algorithms that need them ship.
 */
@Component({
  selector: 'app-viz-custom-values-popover',
  imports: [
    I18nTextPipe,
    NumberInput,
    LabPopover,
    TextInput,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
  templateUrl: './viz-custom-values-popover.html',
  styleUrl: './viz-custom-values-popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VizCustomValuesPopover {
  protected readonly I18N_KEY = I18N_KEY;
  readonly schema = input.required<TaskInputSchema<Record<string, unknown>>>();
  readonly initialValues = input.required<Record<string, unknown>>();
  readonly taskValidate = input<
    ((values: Record<string, unknown>) => TranslatableText | null) | null
  >(null);

  readonly apply = output<Record<string, unknown>>();
  readonly close = output<void>();

  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  /** Version counter bumped on every form value change. Gives
   *  derived computeds (fields, parsedValues, crossFieldError) a
   *  signal dependency they can track — Angular form state isn't
   *  reactive to the signal graph on its own. */
  private readonly formValueTick = signal(0);

  /** One control per schema field. `int` / `float` → number | null,
   *  `string` → string. Rebuilds whenever schema or initialValues
   *  change (new task selected, defaults reseeded). */
  readonly form = computed(() => {
    const schema = this.schema();
    const seed = this.initialValues();
    const controls: Record<string, FormControl<ControlValue>> = {};
    for (const [key, field] of Object.entries(schema)) {
      controls[key] = new FormControl<ControlValue>(
        seedFor(field, seed[key]),
        { nonNullable: false },
      );
    }
    const group = new FormGroup(controls);
    // Subscribe to every subsequent value change and bump the tick
    // signal. `takeUntilDestroyed` binds the subscription to the
    // component lifetime; the previous FormGroup is GC'd alongside.
    group.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formValueTick.update((v) => v + 1));
    return group;
  });

  constructor() {
    // Reseed values if `initialValues` changes without the schema
    // itself swapping (e.g. same task, freshly resolved defaults
    // after a previous customization was cleared).
    effect(() => {
      const group = this.form();
      const seed = this.initialValues();
      const schema = this.schema();
      for (const [key, control] of Object.entries(group.controls)) {
        const field = schema[key];
        if (!field) continue;
        const next = seedFor(field, seed[key]);
        if (!Object.is(control.value, next)) {
          control.setValue(next, { emitEvent: false });
        }
      }
    });
  }

  readonly fields = computed(() => {
    const schema = this.schema();
    const group = this.form();
    // Track the tick so this computed re-evaluates on every keystroke.
    this.formValueTick();
    return Object.entries(schema).map(([key, field]) => {
      const control = group.controls[key] as FormControl<ControlValue>;
      const value = control?.value ?? null;
      const typedField = field as TaskInputField<unknown>;
      const placeholder =
        typedField.kind === 'list' || typedField.placeholder === undefined
          ? ''
          : this.resolveLabel(typedField.placeholder);
      return {
        key,
        field: typedField,
        control,
        label: this.resolveLabel(field.label),
        placeholder,
        error: validateField(typedField, value),
      };
    });
  });

  readonly parsedValues = computed<Record<string, unknown> | null>(() => {
    const fields = this.fields();
    if (fields.some((f) => f.error !== null)) return null;
    const values: Record<string, unknown> = {};
    for (const f of fields) {
      const v = f.control.value;
      if (v === null) return null;
      values[f.key] = v;
    }
    return values;
  });

  readonly crossFieldError = computed<TranslatableText | null>(() => {
    const validator = this.taskValidate();
    const values = this.parsedValues();
    if (!validator || !values) return null;
    return validator(values);
  });

  readonly canApply = computed(
    () => this.parsedValues() !== null && this.crossFieldError() === null,
  );

  onApply(): void {
    const values = this.parsedValues();
    if (!values || !this.canApply()) return;
    this.apply.emit(values);
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }

  protected isStringField(field: TaskInputField<unknown>): boolean {
    return field.kind === 'string';
  }

  protected isNumberField(field: TaskInputField<unknown>): boolean {
    return field.kind === 'int' || field.kind === 'float';
  }

  private resolveLabel(raw: TranslatableText): string {
    if (typeof raw !== 'string') return String(raw);
    return looksLikeI18nKey(raw) ? this.transloco.translate(raw) : raw;
  }
}

function seedFor(field: TaskInputField<unknown>, raw: unknown): ControlValue {
  if (field.kind === 'string' || field.kind === 'textarea') {
    return typeof raw === 'string' ? raw : '';
  }
  return typeof raw === 'number' ? raw : null;
}

function validateField(
  field: TaskInputField<unknown>,
  value: ControlValue,
): TranslatableText | null {
  switch (field.kind) {
    case 'int':
      return validateInt(field, toNumberOrNull(value));
    case 'float':
      return validateFloat(field, toNumberOrNull(value));
    case 'string':
      return validateString(field, typeof value === 'string' ? value : '');
    default:
      return I18N_KEY.features.algorithms.toolbar.customizeValues.fieldTypeUnsupportedLabel;
  }
}

function toNumberOrNull(value: ControlValue): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function validateInt(field: TaskIntField, value: number | null): TranslatableText | null {
  if (value === null) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.notAnIntegerLabel;
  }
  if (!Number.isInteger(value)) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.notAnIntegerLabel;
  }
  if (field.min !== undefined && value < field.min) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.belowMinimumLabel;
  }
  if (field.max !== undefined && value > field.max) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.aboveMaximumLabel;
  }
  if (field.nonZero && value === 0) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.mustBeNonZeroLabel;
  }
  return null;
}

function validateFloat(field: TaskFloatField, value: number | null): TranslatableText | null {
  if (value === null) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.notAnIntegerLabel;
  }
  if (field.min !== undefined && value < field.min) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.belowMinimumLabel;
  }
  if (field.max !== undefined && value > field.max) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.aboveMaximumLabel;
  }
  return null;
}

function validateString(
  field: TaskStringField,
  value: string,
): TranslatableText | null {
  const trimmed = value.trim();
  if (field.minLength !== undefined && trimmed.length < field.minLength) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.belowMinimumLabel;
  }
  if (field.maxLength !== undefined && trimmed.length > field.maxLength) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.aboveMaximumLabel;
  }
  if (field.pattern !== undefined && !field.pattern.test(value)) {
    return I18N_KEY.features.algorithms.toolbar.customizeValues.notAnIntegerLabel;
  }
  return null;
}
