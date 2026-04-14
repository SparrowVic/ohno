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

interface PageStat {
  readonly value: string;
  readonly label: string;
  readonly tone: 'accent' | 'success' | 'neutral';
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

  readonly filteredItems = computed<readonly AlgorithmItem[]>(() => {
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

    if (difficulty === 'all') {
      return lang === APP_LANG.EN ? 'All difficulty levels' : 'Wszystkie poziomy trudności';
    }

    const label = getDifficultyLabel(difficulty, lang).toLowerCase();
    return lang === APP_LANG.EN ? `Filtered by ${label}` : `Filtr: ${label}`;
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
      ? 'Refine the current topic by difficulty without leaving the catalog context.'
      : 'Zawężaj bieżący temat po poziomie trudności bez wychodzenia z kontekstu katalogu.',
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
}
