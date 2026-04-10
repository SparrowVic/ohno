import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { NavigationService } from '../../../core/services/navigation-service';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import { AlgorithmRegistry } from '../registry/algorithm-registry';

type DifficultyFilter = 'all' | Difficulty;

interface PillOption {
  readonly value: DifficultyFilter;
  readonly label: string;
}

const PILLS: readonly PillOption[] = [
  { value: 'all', label: 'All' },
  { value: Difficulty.Easy, label: 'Easy' },
  { value: Difficulty.Medium, label: 'Medium' },
  { value: Difficulty.Hard, label: 'Hard' },
];

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

  readonly pills = PILLS;

  private readonly difficultyFilter = signal<DifficultyFilter>('all');
  readonly activeDifficulty = this.difficultyFilter.asReadonly();

  readonly title = computed(() => this.navigation.activeItem()?.sectionTitle ?? 'Algorithms');

  readonly filteredItems = computed<readonly AlgorithmItem[]>(() => {
    const sidebarFilter = this.navigation.activeItem()?.filter;
    const difficulty = this.difficultyFilter();

    const base: readonly AlgorithmItem[] = sidebarFilter
      ? this.registry.filterByCategory(sidebarFilter.category, sidebarFilter.subcategory)
      : this.registry.all();

    if (difficulty === 'all') {
      return base;
    }
    return base.filter((item) => item.difficulty === difficulty);
  });

  selectDifficulty(value: DifficultyFilter): void {
    this.difficultyFilter.set(value);
  }
}
