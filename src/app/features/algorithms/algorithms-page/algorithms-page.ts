import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { CommandPaletteService } from '../../../core/layout/command-palette/command-palette.service';
import { RecentAlgorithmsStore } from '../../../core/recent/recent-algorithms-store';
import { NavigationService } from '../../../core/services/navigation-service';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKey } from '../../../shared/instrument/key/key';
import { OhnoLatch } from '../../../shared/instrument/latch/latch';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../../shared/instrument/screen/screen';
import { OhnoSearchField } from '../../../shared/instrument/search-field/search-field';
import { isDisplayReady } from '../data/catalog/display-readiness/display-readiness';
import { ALL_DIFFICULTIES, toggleDifficulty } from '../data/catalog/difficulty-filter/difficulty-filter';
import { moduleId } from '../data/catalog/module-id/module-id';
import { pathProgress } from '../data/catalog/path-progress/path-progress';
import { pathForGroup } from '../data/catalog/paths/paths';
import { Difficulty } from '../models/algorithm';
import { OhnoModuleCard } from '../module-card/module-card';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import { bankIndex, buildCatalogGroups, buildMarqueeStats } from './catalog-groups.utils';
import { marqueeFontSize } from './marquee.utils';

interface LatchView {
  readonly difficulty: Difficulty;
  readonly label: string;
  readonly led: LedColor;
  readonly pressed: boolean;
}

const LATCH_ORDER: readonly Difficulty[] = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.UltraHard];
const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

@Component({
  selector: 'app-algorithms-page',
  imports: [OhnoEngraving, OhnoKey, OhnoLatch, OhnoModuleCard, OhnoPlate, OhnoReadout, OhnoScreen, OhnoSearchField, TranslocoPipe],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly isDisplayReady = isDisplayReady;
  private readonly activeDifficulties = signal<ReadonlySet<Difficulty>>(ALL_DIFFICULTIES);

  private readonly moduleIds = computed(() => {
    const catalog = this.registry.all();
    return new Map(catalog.map((item) => [item.id, moduleId(item, catalog)]));
  });

  protected readonly latches = computed<readonly LatchView[]>(() =>
    LATCH_ORDER.map((difficulty) => ({
      difficulty,
      label: this.translate(getDifficultyLabelKey(difficulty)),
      led: DIFFICULTY_LED[difficulty],
      pressed: this.activeDifficulties().has(difficulty),
    })),
  );

  protected readonly groups = computed(() =>
    buildCatalogGroups(
      this.navigation.sidebarGroups(),
      this.navigation.activeItemKey(),
      (filter) => this.registry.filter(filter),
      this.activeDifficulties(),
    ),
  );

  protected readonly marqueeEyebrow = computed(() => {
    const index = bankIndex(this.navigation.sidebarGroups(), this.navigation.activeGroupId());
    return index === null
      ? this.translate(I18N_KEY.features.algorithms.catalog.marquee.overviewEyebrow)
      : this.translate(I18N_KEY.features.algorithms.catalog.marquee.eyebrow, { index });
  });

  protected readonly marqueeTitle = computed(() => {
    const groupId = this.navigation.activeGroupId();
    const group = this.navigation.sidebarGroups().find((candidate) => candidate.id === groupId);
    const label = groupId === 'overview' || !group
      ? this.translate(I18N_KEY.features.algorithms.catalog.marquee.overviewTitle)
      : group.label;
    return label.toLocaleUpperCase();
  });

  protected readonly marqueeSize = computed(() => marqueeFontSize(this.marqueeTitle()));

  protected readonly marqueeStats = computed(() =>
    buildMarqueeStats(this.navigation.sidebarGroups(), this.navigation.activeGroupId(), {
      modules: this.translate(I18N_KEY.features.algorithms.catalog.marquee.modules),
      categories: this.translate(I18N_KEY.features.algorithms.catalog.marquee.categories),
      groups: this.translate(I18N_KEY.features.algorithms.catalog.marquee.groups),
    }),
  );

  protected readonly searchPlaceholder = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.placeholder, { count: this.registry.all().length }),
  );

  protected readonly path = computed(() =>
    pathProgress(pathForGroup(this.navigation.activeGroupId()), (id) => this.registry.getById(id), this.recent.finishedIds()),
  );

  protected readonly pathTitle = computed(() => this.translate(pathForGroup(this.navigation.activeGroupId()).titleKey));

  protected moduleIdOf(id: string): string {
    return this.moduleIds().get(id) ?? '';
  }

  protected toggleLatch(difficulty: Difficulty): void {
    this.activeDifficulties.update((active) => toggleDifficulty(active, difficulty));
  }

  protected openSearch(): void {
    this.palette.openSearch();
  }

  protected stepAriaLabel(index: number, name: string): string {
    return this.translate(I18N_KEY.features.algorithms.catalog.path.stepAriaLabel, { index, name });
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
