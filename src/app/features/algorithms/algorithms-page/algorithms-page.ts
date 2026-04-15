import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { NavigationService } from '../../../core/services/navigation-service';
import { buildCategoryThemeVars } from '../../../shared/category-theme';
import { ShaderCardEffect } from '../../../shared/shader-card-effect/shader-card-effect';
import {
  ALGORITHM_TRAIT_GROUPS,
  ALGORITHM_TRAITS,
  AlgorithmTraitGroupId,
  AlgorithmTraitId,
  deriveAlgorithmTraits,
} from '../algorithm-traits';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import { AlgorithmRegistry } from '../registry/algorithm-registry';

type DifficultyFilter = 'all' | Difficulty;

interface PillOption {
  readonly value: DifficultyFilter;
  readonly label: string;
  readonly tone: DifficultyFilter;
}

interface PageStat {
  readonly value: string;
  readonly label: string;
  readonly tone: 'accent' | 'success' | 'neutral';
}

interface TraitOptionView {
  readonly id: AlgorithmTraitId;
  readonly label: string;
  readonly count: number;
  readonly selected: boolean;
}

interface TraitGroupView {
  readonly id: AlgorithmTraitGroupId;
  readonly label: string;
  readonly options: readonly TraitOptionView[];
}

const TRAIT_DEFINITION_BY_ID = new Map(ALGORITHM_TRAITS.map((trait) => [trait.id, trait] as const));

@Component({
  selector: 'app-algorithms-page',
  imports: [AlgorithmCard, NgStyle, ShaderCardEffect],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly pills = computed<readonly PillOption[]>(() => {
    const lang = this.language.activeLang();
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
  });

  private readonly difficultyFilter = signal<DifficultyFilter>('all');
  private readonly selectedTraitsState = signal<readonly AlgorithmTraitId[]>([]);
  private readonly traitsOpenState = signal(false);
  readonly activeDifficulty = this.difficultyFilter.asReadonly();
  readonly activeTraits = this.selectedTraitsState.asReadonly();
  readonly traitsOpen = this.traitsOpenState.asReadonly();
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
    const counts = new Map<AlgorithmTraitId, number>();

    for (const item of this.difficultyScopedItems()) {
      for (const trait of deriveAlgorithmTraits(item)) {
        counts.set(trait, (counts.get(trait) ?? 0) + 1);
      }
    }

    return counts;
  });

  readonly traitGroups = computed<readonly TraitGroupView[]>(() => {
    const lang = this.language.activeLang();
    const selectedTraits = new Set(this.selectedTraitsState());
    const counts = this.traitCounts();

    return ALGORITHM_TRAIT_GROUPS.map((group) => {
      const options = ALGORITHM_TRAITS.filter((trait) => trait.group === group.id)
        .map<TraitOptionView>((trait) => ({
          id: trait.id,
          label: lang === APP_LANG.EN ? trait.label : trait.labelPl,
          count: counts.get(trait.id) ?? 0,
          selected: selectedTraits.has(trait.id),
        }))
        .filter((option) => option.count > 0 || option.selected);

      return {
        id: group.id,
        label: lang === APP_LANG.EN ? group.label : group.labelPl,
        options,
      };
    }).filter((group) => group.options.length > 0);
  });

  readonly activeTraitOptions = computed<readonly TraitOptionView[]>(() => {
    const lang = this.language.activeLang();
    return this.selectedTraitsState()
      .map((id) => TRAIT_DEFINITION_BY_ID.get(id))
      .filter((trait): trait is NonNullable<typeof trait> => Boolean(trait))
      .map((trait) => ({
        id: trait.id,
        label: lang === APP_LANG.EN ? trait.label : trait.labelPl,
        count: this.traitCounts().get(trait.id) ?? 0,
        selected: true,
      }));
  });

  private readonly selectedTraitsByGroup = computed<
    ReadonlyMap<AlgorithmTraitGroupId, ReadonlySet<AlgorithmTraitId>>
  >(() => {
    const grouped = new Map<AlgorithmTraitGroupId, Set<AlgorithmTraitId>>();

    for (const traitId of this.selectedTraitsState()) {
      const definition = TRAIT_DEFINITION_BY_ID.get(traitId);
      if (!definition) {
        continue;
      }
      const bucket = grouped.get(definition.group) ?? new Set<AlgorithmTraitId>();
      bucket.add(traitId);
      grouped.set(definition.group, bucket);
    }

    return grouped;
  });

  readonly filteredItems = computed<readonly AlgorithmItem[]>(() => {
    const groupedTraits = this.selectedTraitsByGroup();

    if (groupedTraits.size === 0) {
      return this.difficultyScopedItems();
    }

    return this.difficultyScopedItems().filter((item) => {
      const itemTraits = new Set(deriveAlgorithmTraits(item));

      for (const traitIds of groupedTraits.values()) {
        let matchedGroup = false;

        for (const traitId of traitIds) {
          if (itemTraits.has(traitId)) {
            matchedGroup = true;
            break;
          }
        }

        if (!matchedGroup) {
          return false;
        }
      }

      return true;
    });
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
  readonly emptyLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'No algorithms match the current filters.'
      : 'Żaden algorytm nie pasuje do bieżących filtrów.',
  );
  readonly stats = computed<readonly PageStat[]>(() => {
    const lang = this.language.activeLang();
    return [
      {
        value: String(this.totalItems()),
        label: lang === APP_LANG.EN ? 'Visible now' : 'Widoczne teraz',
        tone: 'accent',
      },
      {
        value: String(this.implementedCount()),
        label: lang === APP_LANG.EN ? 'Interactive' : 'Interaktywne',
        tone: 'success',
      },
      {
        value: String(this.trackCount()),
        label: lang === APP_LANG.EN ? 'Tracks' : 'Ścieżki',
        tone: 'neutral',
      },
    ];
  });

  selectDifficulty(value: DifficultyFilter): void {
    this.difficultyFilter.set(value);
  }

  toggleTraitsOpen(): void {
    this.traitsOpenState.update((value) => !value);
  }

  toggleTrait(id: AlgorithmTraitId): void {
    this.selectedTraitsState.update((selected) =>
      selected.includes(id) ? selected.filter((traitId) => traitId !== id) : [...selected, id],
    );
  }

  clearTraits(): void {
    this.selectedTraitsState.set([]);
    this.traitsOpenState.set(false);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.traitsOpenState()) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.traitsOpenState.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.traitsOpenState.set(false);
  }
}
