import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { Difficulty } from '../../../features/algorithms/models/algorithm';
import { BaseControlValueAccessor } from '../base-control-value-accessor';

export type SelectButtonValue = string | number;
export type DifficultyFilterValue = 'all' | Difficulty;

export interface SelectButtonOption<T extends SelectButtonValue = SelectButtonValue> {
  readonly value: T;
  readonly label: string;
  readonly tone?: string;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function buildDifficultySelectButtonOptions(
  translate: TranslateFn,
): readonly SelectButtonOption<DifficultyFilterValue>[] {
  return [
    { value: 'all', label: translate(t('shared.filters.all')), tone: 'all' },
    {
      value: Difficulty.Easy,
      label: translate(getDifficultyLabelKey(Difficulty.Easy)),
      tone: Difficulty.Easy,
    },
    {
      value: Difficulty.Medium,
      label: translate(getDifficultyLabelKey(Difficulty.Medium)),
      tone: Difficulty.Medium,
    },
    {
      value: Difficulty.Hard,
      label: translate(getDifficultyLabelKey(Difficulty.Hard)),
      tone: Difficulty.Hard,
    },
    {
      value: Difficulty.UltraHard,
      label: translate(getDifficultyLabelKey(Difficulty.UltraHard)),
      tone: Difficulty.UltraHard,
    },
  ];
}

@Component({
  selector: 'app-select-button',
  imports: [],
  templateUrl: './select-button.html',
  styleUrl: './select-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectButton),
      multi: true,
    },
  ],
})
export class SelectButton<
  T extends SelectButtonValue = SelectButtonValue,
> extends BaseControlValueAccessor<T> {
  readonly options = input.required<readonly SelectButtonOption<T>[]>();
  readonly label = input<string>('');
  readonly ariaLabel = input('Selection group');
  readonly valueInput = input<T | null>(null, { alias: 'value' });
  readonly valueChange = output<T>();

  readonly activeOption = computed(() => {
    const value = this.value();
    const options = this.options();
    return options.find((option) => value !== null && Object.is(option.value, value)) ?? options[0] ?? null;
  });
  readonly activeValue = computed(() => this.activeOption()?.value ?? null);
  readonly activeTone = computed(() => {
    const active = this.activeOption();
    return active ? this.optionTone(active) : '';
  });
  readonly activeIndex = computed(() => {
    const current = this.activeValue();
    if (current === null) {
      return 0;
    }
    const idx = this.options().findIndex((option) => option.value === current);
    return idx < 0 ? 0 : idx;
  });

  constructor() {
    super();

    effect(
      () => {
        this.writeValue(this.valueInput());
      },
      { allowSignalWrites: true },
    );
  }

  protected override coerceValue(value: T | null): T | null {
    const options = this.options();
    if (value !== null) {
      return options.find((option) => Object.is(option.value, value))?.value ?? options[0]?.value ?? null;
    }

    return options[0]?.value ?? null;
  }

  select(value: T): void {
    if (this.disabled() || Object.is(value, this.activeValue())) {
      return;
    }

    this.setValue(value);
    this.valueChange.emit(value);
    this.markAsTouched();
  }

  optionTone(option: SelectButtonOption<T>): string {
    return option.tone ?? String(option.value);
  }
}
