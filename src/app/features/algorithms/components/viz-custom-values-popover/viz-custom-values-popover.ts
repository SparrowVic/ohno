import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { LabPopover } from '../../../../shared/components/lab-popover/lab-popover';
import { LabNumberInput } from '../../../../shared/controls/lab-number-input/lab-number-input';
import {
  TaskInputField,
  TaskInputSchema,
  TaskIntField,
} from '../../models/task';

/**
 * Form body of the customize-values popover. The outer chrome, the
 * outside-click + Escape close handling and the floating-panel look
 * all come from `LabPopover`. Individual fields use `LabNumberInput`
 * so the input styling matches `LabSelect` / `LabSlider` across the
 * toolbar.
 *
 * v1 renders only `kind: 'int'` fields — enough for GCD / EEA / Miller-
 * Rabin / Pollard's. `float` / `string` / `textarea` / `list` will
 * arrive as the algorithms that need them get migrated.
 */
@Component({
  selector: 'app-viz-custom-values-popover',
  imports: [
    I18nTextPipe,
    LabNumberInput,
    LabPopover,
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
  readonly taskValidate = input<((values: Record<string, unknown>) => TranslatableText | null) | null>(
    null,
  );

  readonly apply = output<Record<string, unknown>>();
  readonly close = output<void>();

  private readonly transloco = inject(TranslocoService);

  /** One `FormControl<number | null>` per schema field. Rebuilds
   *  whenever the schema changes (new task selected). */
  readonly form = computed(() => {
    const schema = this.schema();
    const seed = this.initialValues();
    const controls: Record<string, FormControl<number | null>> = {};
    for (const key of Object.keys(schema)) {
      const initial = seed[key];
      controls[key] = new FormControl<number | null>(
        typeof initial === 'number' ? initial : null,
      );
    }
    return new FormGroup(controls);
  });

  constructor() {
    // Reseed values if `initialValues` changes without the schema
    // itself swapping (e.g. same task, freshly resolved defaults
    // after a previous customization was cleared).
    effect(() => {
      const group = this.form();
      const seed = this.initialValues();
      for (const [key, control] of Object.entries(group.controls)) {
        const next = typeof seed[key] === 'number' ? (seed[key] as number) : null;
        if (control.value !== next) control.setValue(next, { emitEvent: false });
      }
    });
  }

  readonly fields = computed(() => {
    const schema = this.schema();
    const group = this.form();
    // Read group.value so this computed refreshes on every keystroke.
    void group.getRawValue();
    return Object.entries(schema).map(([key, field]) => {
      const control = group.controls[key] as FormControl<number | null>;
      const value = control?.value ?? null;
      return {
        key,
        field: field as TaskInputField<unknown>,
        control,
        label: this.resolveLabel(field.label),
        error: validateField(field as TaskInputField<unknown>, value),
      };
    });
  });

  readonly parsedValues = computed<Record<string, number> | null>(() => {
    const fields = this.fields();
    if (fields.some((f) => f.error !== null)) return null;
    const values: Record<string, number> = {};
    for (const f of fields) {
      if (f.control.value === null) return null;
      values[f.key] = f.control.value;
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

  private resolveLabel(raw: TranslatableText): string {
    if (typeof raw !== 'string') return String(raw);
    return looksLikeI18nKey(raw) ? this.transloco.translate(raw) : raw;
  }
}

function validateField(
  field: TaskInputField<unknown>,
  value: number | null,
): TranslatableText | null {
  if (field.kind === 'int') return validateInt(field, value);
  return I18N_KEY.features.algorithms.toolbar.customizeValues.fieldTypeUnsupportedLabel;
}

function validateInt(field: TaskIntField, value: number | null): TranslatableText | null {
  if (value === null) {
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
