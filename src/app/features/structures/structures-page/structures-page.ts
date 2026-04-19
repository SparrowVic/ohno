import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { NavigationService } from '../../../core/services/navigation-service';
import {
  DifficultyFilterValue,
  LabDifficultyFilter,
  buildDifficultyFilterOptions,
} from '../../../shared/controls/lab-difficulty-filter/lab-difficulty-filter';
import { StructureCard } from '../structure-card/structure-card';
import { StructureItem } from '../models/structure';
import { StructureRegistry } from '../registry/structure-registry';

interface PageStat {
  readonly value: string;
  readonly label: string;
  readonly tone: 'accent' | 'success' | 'neutral';
}

@Component({
  selector: 'app-structures-page',
  imports: [StructureCard, LabDifficultyFilter],
  templateUrl: './structures-page.html',
  styleUrl: './structures-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuresPage {
  private readonly registry = inject(StructureRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);

  readonly difficultyOptions = computed(() => buildDifficultyFilterOptions(this.language.activeLang()));

  private readonly difficultyFilter = signal<DifficultyFilterValue>('all');
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
  readonly implementedCount = computed(
    () => this.filteredItems().filter((item) => item.implemented).length,
  );
  readonly upcomingCount = computed(() => this.totalItems() - this.implementedCount());
  readonly trackCount = computed(
    () => new Set(this.filteredItems().map((item) => item.subcategory || item.category)).size,
  );
  readonly heroEyebrow = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Structure Library' : 'Biblioteka struktur',
  );
  readonly heroDescription = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'A cleaner overview of foundational structures, grouped by learning track and ready for future interactive modules.'
      : 'Czytelniejszy przegląd struktur bazowych, pogrupowanych w ścieżki nauki i gotowych pod przyszłe interaktywne moduły.',
  );
  readonly filterSummary = computed(() => {
    const lang = this.language.activeLang();
    const difficulty = this.activeDifficulty();

    if (difficulty === 'all') {
      return lang === APP_LANG.EN ? 'All difficulty levels' : 'Wszystkie poziomy trudności';
    }

    const label = getDifficultyLabel(difficulty, lang).toLowerCase();
    return lang === APP_LANG.EN ? `Filtered by ${label}` : `Filtr: ${label}`;
  });
  readonly availabilitySummary = computed(() => {
    const lang = this.language.activeLang();
    return lang === APP_LANG.EN
      ? `${this.implementedCount()} live • ${this.upcomingCount()} roadmap`
      : `${this.implementedCount()} gotowych • ${this.upcomingCount()} w roadmapie`;
  });
  readonly resultsLabel = computed(() => {
    const lang = this.language.activeLang();
    return lang === APP_LANG.EN
      ? `${this.totalItems()} structures in focus`
      : `${this.totalItems()} struktur w bieżącym widoku`;
  });
  readonly resultsSubtitle = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Use the difficulty pills to rebalance the library while staying inside the current topic.'
      : 'Zmieniaj poziom trudności, pozostając w obrębie aktualnego obszaru biblioteki.',
  );
  readonly difficultyGroupLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Difficulty filter' : 'Filtr trudności',
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
        value: String(this.trackCount()),
        label: lang === APP_LANG.EN ? 'Tracks' : 'Ścieżki',
        tone: 'neutral',
      },
      {
        value: String(this.upcomingCount()),
        label: lang === APP_LANG.EN ? 'Roadmap' : 'Roadmap',
        tone: 'success',
      },
    ];
  });

  selectDifficulty(value: DifficultyFilterValue): void {
    this.difficultyFilter.set(value);
  }
}
