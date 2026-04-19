import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { NavigationService } from '../../../core/services/navigation-service';
import { buildCategoryThemeVars } from '../../../shared/category-theme';
import {
  DifficultyFilterValue,
  LabDifficultyFilter,
  buildDifficultyFilterOptions,
} from '../../../shared/controls/lab-difficulty-filter/lab-difficulty-filter';
import {
  LabMultiSelect,
  LabMultiSelectGroup,
} from '../../../shared/controls/lab-multi-select/lab-multi-select';
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
  imports: [AlgorithmCard, NgStyle, LabDifficultyFilter, LabMultiSelect],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);

  readonly difficultyOptions = computed(() => buildDifficultyFilterOptions(this.language.activeLang()));

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

  readonly title = computed(() => this.navigation.activeItem()?.sectionTitle ?? 'Algorithms');

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
    return buildTraitGroupsView(
      this.language.activeLang(),
      this.selectedTraitsState(),
      this.traitCounts(),
    );
  });
  readonly traitSelectGroups = computed<readonly LabMultiSelectGroup<AlgorithmTraitId>[]>(() => {
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

  private readonly selectedTraitsByGroup = computed(() => groupSelectedTraits(this.selectedTraitsState()));

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
  readonly heroEyebrow = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Interactive Algorithm Atlas'
      : 'Interaktywny atlas algorytmów',
  );
  readonly heroDescription = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Scan topics faster, compare complexity at a glance and jump into polished visual walkthroughs without losing context.'
      : 'Przeglądaj tematy szybciej, porównuj złożoność na pierwszy rzut oka i przechodź do dopracowanych wizualizacji bez gubienia kontekstu.',
  );
  readonly filterSummary = computed(() => {
    const lang = this.language.activeLang();
    const difficulty = this.activeDifficulty();
    const traitCount = this.activeTraits().length;

    if (difficulty === 'all' && traitCount === 0) {
      return lang === APP_LANG.EN ? 'All difficulty levels' : 'Wszystkie poziomy trudności';
    }

    const parts: string[] = [];

    if (difficulty !== 'all') {
      const label = getDifficultyLabel(difficulty, lang).toLowerCase();
      parts.push(lang === APP_LANG.EN ? label : label);
    }

    if (traitCount > 0) {
      parts.push(
        lang === APP_LANG.EN ? `${traitCount} semantic traits` : `${traitCount} cech semantycznych`,
      );
    }

    return lang === APP_LANG.EN ? `Filtered by ${parts.join(' • ')}` : `Filtr: ${parts.join(' • ')}`;
  });
  readonly availabilitySummary = computed(() => {
    const lang = this.language.activeLang();
    return lang === APP_LANG.EN
      ? `${this.implementedCount()} interactive • ${this.upcomingCount()} roadmap`
      : `${this.implementedCount()} interaktywnych • ${this.upcomingCount()} w roadmapie`;
  });
  readonly resultsLabel = computed(() => {
    const lang = this.language.activeLang();
    return lang === APP_LANG.EN
      ? `${this.totalItems()} algorithms in focus`
      : `${this.totalItems()} algorytmów w bieżącym widoku`;
  });
  readonly resultsSubtitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Refine the current topic by difficulty and semantic traits without leaving the catalog context.'
      : 'Zawężaj bieżący temat po poziomie trudności i cechach semantycznych bez wychodzenia z kontekstu katalogu.',
  );
  readonly traitsTriggerLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Traits' : 'Cechy',
  );
  readonly traitsSummary = computed(() => {
    const count = this.activeTraits().length;
    const lang = this.language.activeLang();

    if (count === 0) {
      return lang === APP_LANG.EN ? 'Pick semantic filters' : 'Wybierz filtry semantyczne';
    }

    return lang === APP_LANG.EN ? `${count} selected` : `${count} wybrano`;
  });
  readonly traitsTriggerAriaLabel = computed(() => {
    const count = this.activeTraits().length;
    const lang = this.language.activeLang();

    if (count === 0) {
      return lang === APP_LANG.EN ? 'Traits filter' : 'Filtr cech';
    }

    return lang === APP_LANG.EN
      ? `Traits filter, ${count} selected`
      : `Filtr cech, wybrano ${count}`;
  });
  readonly traitsPopoverTitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Semantic filters' : 'Filtry semantyczne',
  );
  readonly traitsPopoverSubtitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Pick the properties and paradigms that matter for the current topic.'
      : 'Wybierz własności i paradygmaty, które mają znaczenie w bieżącym temacie.',
  );
  readonly traitsEmptyLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'No semantic facets are available in the current topic.'
      : 'W bieżącym temacie nie ma dostępnych cech semantycznych.',
  );
  readonly clearTraitsLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Clear all' : 'Wyczyść wszystko',
  );
  readonly difficultyGroupLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Difficulty filter' : 'Filtr trudności',
  );
  readonly emptyLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'No algorithms match the current filters.'
      : 'Żaden algorytm nie pasuje do bieżących filtrów.',
  );
  readonly stats = computed<readonly PageStat[]>(() => {
    return buildPageStats(
      this.language.activeLang(),
      this.totalItems(),
      this.implementedCount(),
      this.trackCount(),
    );
  });

  selectDifficulty(value: DifficultyFilterValue): void {
    this.difficultyFilter.set(value);
  }

  selectTraits(value: readonly AlgorithmTraitId[]): void {
    this.selectedTraitsState.set([...value]);
  }
}
