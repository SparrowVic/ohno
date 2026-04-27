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
 * Labeled free-text input sharing the `NumberInput` chrome. Value
 * is a plain `string` — no coercion, no mid-typing rebuffering; the
 * component simply mirrors `<input type="text">` behavior through the
 * control visual language so CSV / expression / free-form fields
 * sit next to the number + select + slider controls without looking
 * foreign.
 *
 * Validation stays with the parent (pass `error` to paint the invalid
 * state and render the message below the field), matching how
 * `NumberInput` delegates upstream.
 */
@Component({
  selector: 'app-text-input',
  imports: [],
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true,
    },
  ],
})
export class TextInput extends BaseControlValueAccessor<string> {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly error = input<string | null>(null);
  /** Hint text rendered beneath the field (muted, 11px). Used for the
   *  "format: r:m, r:m, ..." kind of helper messages. Suppressed when
   *  `error` is non-null so the error always wins. */
  readonly hint = input<string | null>(null);
  /** Optional `monospace` flag — set for numeric / expression inputs
   *  (witnesses, CRT congruences) so digits stay tabular-aligned. */
  readonly mono = input<boolean>(false);

  private readonly rawSig = signal<string>('');
  readonly raw = this.rawSig.asReadonly();

  readonly hasError = computed(() => this.error() !== null);

  override writeValue(value: string | null): void {
    super.writeValue(value);
    this.rawSig.set(value ?? '');
  }

  onInput(event: Event): void {
    if (this.disabled()) return;
    const raw = (event.target as HTMLInputElement).value;
    this.rawSig.set(raw);
    this.setValue(raw);
  }

  onBlur(): void {
    this.markAsTouched();
  }
}
