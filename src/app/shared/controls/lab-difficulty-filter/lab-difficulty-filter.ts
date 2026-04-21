import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { Difficulty } from '../../../features/algorithms/models/algorithm';
import { BaseControlValueAccessor } from '../base-control-value-accessor';

export type DifficultyFilterValue = 'all' | Difficulty;

export interface DifficultyFilterOption {
  readonly value: DifficultyFilterValue;
  readonly label: string;
  readonly tone: DifficultyFilterValue;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function buildDifficultyFilterOptions(
  translate: TranslateFn,
): readonly DifficultyFilterOption[] {
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
  selector: 'app-lab-difficulty-filter',
  imports: [],
  templateUrl: './lab-difficulty-filter.html',
  styleUrl: './lab-difficulty-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabDifficultyFilter),
      multi: true,
    },
  ],
})
export class LabDifficultyFilter extends BaseControlValueAccessor<DifficultyFilterValue> {
  readonly options = input.required<readonly DifficultyFilterOption[]>();
  readonly label = input<string>('');
  readonly ariaLabel = input('Difficulty filter');
  readonly valueInput = input<DifficultyFilterValue>('all', { alias: 'value' });
  readonly valueChange = output<DifficultyFilterValue>();

  readonly activeValue = computed(() => this.value() ?? 'all');
  readonly activeIndex = computed(() => {
    const current = this.activeValue();
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

  protected override coerceValue(value: DifficultyFilterValue | null): DifficultyFilterValue {
    if (value === null) {
      return 'all';
    }

    return this.options().find((option) => option.value === value)?.value ?? 'all';
  }

  select(value: DifficultyFilterValue): void {
    if (this.disabled() || value === this.activeValue()) {
      return;
    }

    this.setValue(value);
    this.valueChange.emit(value);
    this.markAsTouched();
  }
}
