import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { NavigationService } from '../../../core/services/navigation-service';
import {
  DifficultyFilterValue,
  SelectButton,
  buildDifficultySelectButtonOptions,
} from '../../../shared/controls/select-button/select-button';
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
  imports: [StructureCard, SelectButton],
  templateUrl: './structures-page.html',
  styleUrl: './structures-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuresPage {
  private readonly registry = inject(StructureRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly difficultyOptions = computed(() =>
    buildDifficultySelectButtonOptions((key, params) => this.translate(key, params)),
  );

  private readonly difficultyFilter = signal<DifficultyFilterValue>('all');
  readonly activeDifficulty = this.difficultyFilter.asReadonly();
  readonly title = computed(
    () =>
      this.navigation.activeItem()?.sectionTitle ??
      this.translate(t('features.structures.page.title')),
  );

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
  readonly heroEyebrow = computed(() => this.translate(t('features.structures.page.heroEyebrow')));
  readonly heroDescription = computed(() =>
    this.translate(t('features.structures.page.heroDescription')),
  );
  readonly filterSummary = computed(() => {
    const difficulty = this.activeDifficulty();

    if (difficulty === 'all') {
      return this.translate(t('features.structures.page.filterSummary.all'));
    }

    const label = this.translate(getDifficultyLabelKey(difficulty)).toLowerCase();
    return this.translate(t('features.structures.page.filterSummary.filtered'), { label });
  });
  readonly availabilitySummary = computed(() => {
    return this.translate(t('features.structures.page.availabilitySummary'), {
      implemented: this.implementedCount(),
      upcoming: this.upcomingCount(),
    });
  });
  readonly resultsLabel = computed(() =>
    this.translate(t('features.structures.page.resultsLabel'), {
      count: this.totalItems(),
    }),
  );
  readonly resultsSubtitle = computed(() =>
    this.translate(t('features.structures.page.resultsSubtitle')),
  );
  readonly difficultyGroupLabel = computed(() =>
    this.translate(t('shared.filters.difficulty.ariaLabel')),
  );
  readonly emptyLabel = computed(() => this.translate(t('features.structures.page.emptyLabel')));
  readonly stats = computed<readonly PageStat[]>(() => {
    return [
      {
        value: String(this.totalItems()),
        label: this.translate(t('features.structures.page.stats.visibleNow')),
        tone: 'accent',
      },
      {
        value: String(this.trackCount()),
        label: this.translate(t('features.structures.page.stats.tracks')),
        tone: 'neutral',
      },
      {
        value: String(this.upcomingCount()),
        label: this.translate(t('features.structures.page.stats.roadmap')),
        tone: 'success',
      },
    ];
  });

  selectDifficulty(value: DifficultyFilterValue): void {
    this.difficultyFilter.set(value);
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
