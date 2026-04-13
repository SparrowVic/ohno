import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { NavigationService } from '../../../core/services/navigation-service';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import { AlgorithmRegistry } from '../registry/algorithm-registry';

type DifficultyFilter = 'all' | Difficulty;

interface PillOption {
  readonly value: DifficultyFilter;
  readonly label: string;
}

@Component({
  selector: 'app-algorithms-page',
  imports: [AlgorithmCard],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);

  readonly pills = computed<readonly PillOption[]>(() => {
    const lang = this.language.activeLang();
    return [
      { value: 'all', label: lang === APP_LANG.EN ? 'All' : 'Wszystkie' },
      { value: Difficulty.Easy, label: getDifficultyLabel(Difficulty.Easy, lang) },
      { value: Difficulty.Medium, label: getDifficultyLabel(Difficulty.Medium, lang) },
      { value: Difficulty.Hard, label: getDifficultyLabel(Difficulty.Hard, lang) },
      { value: Difficulty.UltraHard, label: getDifficultyLabel(Difficulty.UltraHard, lang) },
    ];
  });

  private readonly difficultyFilter = signal<DifficultyFilter>('all');
  readonly activeDifficulty = this.difficultyFilter.asReadonly();

  readonly title = computed(() => this.navigation.activeItem()?.sectionTitle ?? 'Algorithms');
  readonly totalItems = computed(() => this.filteredItems().length);

  readonly filteredItems = computed<readonly AlgorithmItem[]>(() => {
    const sidebarFilter = this.navigation.activeItem()?.filter;
    const difficulty = this.difficultyFilter();

    const base = this.registry.filter(sidebarFilter);

    if (difficulty === 'all') {
      return base;
    }
    return base.filter((item) => item.difficulty === difficulty);
  });

  selectDifficulty(value: DifficultyFilter): void {
    this.difficultyFilter.set(value);
  }
}
