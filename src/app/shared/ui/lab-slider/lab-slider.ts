import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseControlValueAccessor } from '../../forms/base-control-value-accessor';

@Component({
  selector: 'app-lab-slider',
  imports: [],
  templateUrl: './lab-slider.html',
  styleUrl: './lab-slider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabSlider),
      multi: true,
    },
  ],
})
export class LabSlider extends BaseControlValueAccessor<number> {
  readonly label = input.required<string>();
  readonly min = input<number>(1);
  readonly max = input<number>(10);
  readonly step = input<number>(1);
  readonly valueSuffix = input<string>('');
  readonly minLabel = input<string>('');
  readonly maxLabel = input<string>('');

  readonly percent = computed(() => {
    const value = this.value() ?? this.min();
    const span = this.max() - this.min();
    if (span <= 0) return 0;
    return ((value - this.min()) / span) * 100;
  });

  readonly displayValue = computed(() => `${this.value() ?? this.min()}${this.valueSuffix()}`);

  protected override coerceValue(value: number | null): number {
    const next = value ?? this.min();
    return Math.min(this.max(), Math.max(this.min(), next));
  }

  onInput(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement;
    this.setValue(Number(target.value));
  }

  onBlur(): void {
    this.markAsTouched();
  }
}
