import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { NavigationService } from '../../../core/services/navigation-service';
import { buildCategoryThemeVars } from '../../../shared/category-theme';
import {
  DifficultyFilterValue,
  SelectButton,
  buildDifficultySelectButtonOptions,
} from '../../../shared/controls/select-button/select-button';
import {
  MultiSelect,
  MultiSelectGroup,
} from '../../../shared/controls/multi-select/multi-select';
import { AlgorithmTraitId } from '../algorithm-traits/algorithm-traits';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { AlgorithmItem } from '../models/algorithm';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import {
  buildPageStats,
  buildTraitCounts,
  buildTraitGroupsView,
  filterItemsByTraits,
  groupSelectedTraits,
  PageStat,
  TraitGroupView,
} from './algorithms-page.utils/algorithms-page.utils';

@Component({
  selector: 'app-algorithms-page',
  imports: [AlgorithmCard, NgStyle, SelectButton, MultiSelect],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly difficultyOptions = computed(() =>
    buildDifficultySelectButtonOptions((key, params) => this.translate(key, params)),
  );

  private readonly difficultyFilter = signal<DifficultyFilterValue>('all');
  private readonly selectedTraitsState = signal<readonly AlgorithmTraitId[]>([]);
  readonly activeDifficulty = this.difficultyFilter.asReadonly();
  readonly activeTraits = this.selectedTraitsState.asReadonly();
  readonly activeCategory = computed(
    () => this.navigation.activeItem()?.filter.category ?? 'overview',
  );
  readonly pageThemeStyle = computed<Record<string, string>>(() =>
    buildCategoryThemeVars(this.activeCategory(), 'page'),
  );

  readonly title = computed(
    () =>
      this.navigation.activeItem()?.sectionTitle ??
      this.translate(t('features.algorithms.page.title')),
  );

  readonly difficultyScopedItems = computed<readonly AlgorithmItem[]>(() => {
    const sidebarFilter = this.navigation.activeItem()?.filter;
    const difficulty = this.difficultyFilter();

    const base = this.registry.filter(sidebarFilter);

    if (difficulty === 'all') {
      return base;
    }
    return base.filter((item) => item.difficulty === difficulty);
  });

  readonly traitCounts = computed<ReadonlyMap<AlgorithmTraitId, number>>(() => {
    return buildTraitCounts(this.difficultyScopedItems());
  });

  readonly traitGroups = computed<readonly TraitGroupView[]>(() => {
    return buildTraitGroupsView(this.selectedTraitsState(), this.traitCounts(), (key, params) =>
      this.translate(key, params),
    );
  });
  readonly traitSelectGroups = computed<readonly MultiSelectGroup<AlgorithmTraitId>[]>(() => {
    return this.traitGroups().map((group) => ({
      id: group.id,
      label: group.label,
      options: group.options.map((option) => ({
        value: option.id,
        label: option.label,
        count: option.count,
      })),
    }));
  });

  private readonly selectedTraitsByGroup = computed(() =>
    groupSelectedTraits(this.selectedTraitsState()),
  );

  readonly filteredItems = computed<readonly AlgorithmItem[]>(() => {
    return filterItemsByTraits(this.difficultyScopedItems(), this.selectedTraitsByGroup());
  });

  readonly totalItems = computed(() => this.filteredItems().length);
  readonly implementedCount = computed(
    () => this.filteredItems().filter((item) => item.implemented).length,
  );
  readonly upcomingCount = computed(() => this.totalItems() - this.implementedCount());
  readonly trackCount = computed(
    () => new Set(this.filteredItems().map((item) => item.subcategory || item.category)).size,
  );
  readonly heroEyebrow = computed(() => this.translate(t('features.algorithms.page.heroEyebrow')));
  readonly heroDescription = computed(() =>
    this.translate(t('features.algorithms.page.heroDescription')),
  );
  readonly filterSummary = computed(() => {
    const difficulty = this.activeDifficulty();
    const traitCount = this.activeTraits().length;

    if (difficulty === 'all' && traitCount === 0) {
      return this.translate(t('features.algorithms.page.filterSummary.all'));
    }

    const parts: string[] = [];

    if (difficulty !== 'all') {
      parts.push(this.translate(getDifficultyLabelKey(difficulty)).toLowerCase());
    }

    if (traitCount > 0) {
      parts.push(
        this.translate(t('features.algorithms.page.filterSummary.semanticTraits'), {
          count: traitCount,
        }),
      );
    }

    return this.translate(t('features.algorithms.page.filterSummary.filtered'), {
      parts: parts.join(' • '),
    });
  });
  readonly availabilitySummary = computed(() => {
    return this.translate(t('features.algorithms.page.availabilitySummary'), {
      implemented: this.implementedCount(),
      upcoming: this.upcomingCount(),
    });
  });
  readonly resultsLabel = computed(() =>
    this.translate(t('features.algorithms.page.resultsLabel'), {
      count: this.totalItems(),
    }),
  );
  readonly resultsSubtitle = computed(() =>
    this.translate(t('features.algorithms.page.resultsSubtitle')),
  );
  readonly traitsTriggerLabel = computed(() =>
    this.translate(t('features.algorithms.page.traits.triggerLabel')),
  );
  readonly traitsSummary = computed(() => {
    const count = this.activeTraits().length;

    if (count === 0) {
      return this.translate(t('features.algorithms.page.traits.summaryEmpty'));
    }

    return this.translate(t('features.algorithms.page.traits.summarySelected'), { count });
  });
  readonly traitsTriggerAriaLabel = computed(() => {
    const count = this.activeTraits().length;

    if (count === 0) {
      return this.translate(t('features.algorithms.page.traits.ariaLabel'));
    }

    return this.translate(t('features.algorithms.page.traits.ariaLabelSelected'), { count });
  });
  readonly traitsPopoverTitle = computed(() =>
    this.translate(t('features.algorithms.page.traits.popoverTitle')),
  );
  readonly traitsPopoverSubtitle = computed(() =>
    this.translate(t('features.algorithms.page.traits.popoverSubtitle')),
  );
  readonly traitsEmptyLabel = computed(() =>
    this.translate(t('features.algorithms.page.traits.emptyLabel')),
  );
  readonly clearTraitsLabel = computed(() =>
    this.translate(t('features.algorithms.page.traits.clearLabel')),
  );
  readonly difficultyGroupLabel = computed(() =>
    this.translate(t('shared.filters.difficulty.ariaLabel')),
  );
  readonly emptyLabel = computed(() => this.translate(t('features.algorithms.page.emptyLabel')));
  readonly stats = computed<readonly PageStat[]>(() => {
    return buildPageStats(
      this.totalItems(),
      this.implementedCount(),
      this.trackCount(),
      (key, params) => this.translate(key, params),
    );
  });

  selectDifficulty(value: DifficultyFilterValue): void {
    this.difficultyFilter.set(value);
  }

  selectTraits(value: readonly AlgorithmTraitId[]): void {
    this.selectedTraitsState.set([...value]);
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
