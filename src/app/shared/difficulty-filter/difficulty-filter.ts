import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { APP_LANG, AppLang } from '../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../core/i18n/difficulty-label';
import { Difficulty } from '../../features/algorithms/models/algorithm';
import { ShaderCardEffect } from '../shader-card-effect/shader-card-effect';

export type DifficultyFilterValue = 'all' | Difficulty;

export interface DifficultyFilterOption {
  readonly value: DifficultyFilterValue;
  readonly label: string;
  readonly tone: DifficultyFilterValue;
}

export function buildDifficultyFilterOptions(lang: AppLang): readonly DifficultyFilterOption[] {
  return [
    { value: 'all', label: lang === APP_LANG.EN ? 'All' : 'Wszystkie', tone: 'all' },
    {
      value: Difficulty.Easy,
      label: getDifficultyLabel(Difficulty.Easy, lang),
      tone: Difficulty.Easy,
    },
    {
      value: Difficulty.Medium,
      label: getDifficultyLabel(Difficulty.Medium, lang),
      tone: Difficulty.Medium,
    },
    {
      value: Difficulty.Hard,
      label: getDifficultyLabel(Difficulty.Hard, lang),
      tone: Difficulty.Hard,
    },
    {
      value: Difficulty.UltraHard,
      label: getDifficultyLabel(Difficulty.UltraHard, lang),
      tone: Difficulty.UltraHard,
    },
  ];
}

@Component({
  selector: 'app-difficulty-filter',
  imports: [ShaderCardEffect],
  templateUrl: './difficulty-filter.html',
  styleUrl: './difficulty-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifficultyFilter {
  readonly options = input.required<readonly DifficultyFilterOption[]>();
  readonly value = input.required<DifficultyFilterValue>();
  readonly ariaLabel = input('Difficulty filter');
  readonly valueChange = output<DifficultyFilterValue>();

  select(value: DifficultyFilterValue): void {
    if (value === this.value()) {
      return;
    }

    this.valueChange.emit(value);
  }
}
