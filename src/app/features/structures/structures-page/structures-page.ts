import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { NavigationService } from '../../../core/services/navigation-service';
import { Difficulty } from '../../algorithms/models/algorithm';
import { StructureCard } from '../structure-card/structure-card';
import { StructureItem } from '../models/structure';
import { StructureRegistry } from '../registry/structure-registry';

type DifficultyFilter = 'all' | Difficulty;

interface PillOption {
  readonly value: DifficultyFilter;
  readonly label: string;
}

@Component({
  selector: 'app-structures-page',
  imports: [StructureCard],
  templateUrl: './structures-page.html',
  styleUrl: './structures-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuresPage {
  private readonly registry = inject(StructureRegistry);
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
  readonly title = computed(() => this.navigation.activeItem()?.sectionTitle ?? 'Structures');

  readonly filteredItems = computed<readonly StructureItem[]>(() => {
    const sidebarFilter = this.navigation.activeItem()?.filter;
    const difficulty = this.difficultyFilter();
    const base = this.registry.filter(sidebarFilter);

    if (difficulty === 'all') {
      return base;
    }

    return base.filter((item) => item.difficulty === difficulty);
  });

  readonly totalItems = computed(() => this.filteredItems().length);

  selectDifficulty(value: DifficultyFilter): void {
    this.difficultyFilter.set(value);
  }
}
