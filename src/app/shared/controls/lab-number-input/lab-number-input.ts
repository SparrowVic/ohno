import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseControlValueAccessor } from '../base-control-value-accessor';

/**
 * Labeled integer input sharing the same chrome as `LabSelect` /
 * `LabSlider`. Value is `number | null`; null means "user cleared the
 * field or typed something unparseable". Validation (required, min /
 * max, business rules) stays with the parent — pass a localized
 * message via `error` to paint the invalid state and render the
 * message below the field.
 *
 * Uses `control-field` mixins so dropdowns, sliders and number inputs
 * all share one visual language.
 */
@Component({
  selector: 'app-lab-number-input',
  imports: [],
  templateUrl: './lab-number-input.html',
  styleUrl: './lab-number-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabNumberInput),
      multi: true,
    },
  ],
})
export class LabNumberInput extends BaseControlValueAccessor<number | null> {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly error = input<string | null>(null);

  /** Raw string state so mid-typing ("1", "-", "-1") isn't coerced
   *  to NaN before the user finishes. We still emit number | null to
   *  the form control on every change. */
  private readonly rawSig = signal<string>('');
  readonly raw = this.rawSig.asReadonly();

  readonly hasError = computed(() => this.error() !== null);

  override writeValue(value: number | null): void {
    super.writeValue(value);
    this.rawSig.set(value === null || value === undefined ? '' : String(value));
  }

  onInput(event: Event): void {
    if (this.disabled()) return;
    const raw = (event.target as HTMLInputElement).value;
    this.rawSig.set(raw);
    const parsed = parseIntStrict(raw);
    this.setValue(parsed);
  }

  onBlur(): void {
    this.markAsTouched();
  }
}

function parseIntStrict(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^-?\d+$/.test(trimmed)) return null;
  const value = Number.parseInt(trimmed, 10);
  return Number.isNaN(value) ? null : value;
}
