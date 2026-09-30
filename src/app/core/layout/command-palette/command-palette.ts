import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faMagnifyingGlass } from '@fortawesome/pro-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ALGORITHM_TRAITS, deriveAlgorithmTraits } from '../../../features/algorithms/algorithm-traits/algorithm-traits';
import { moduleId } from '../../../features/algorithms/data/catalog/module-id/module-id';
import { AlgorithmItem, Difficulty } from '../../../features/algorithms/models/algorithm';
import { AlgorithmRegistry } from '../../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../../shared/instrument/kbd/kbd';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { AppLanguageService } from '../../i18n/app-language.service';
import { getAlgorithmFacetLabelKey } from '../../i18n/catalog-labels';
import { I18N_KEY } from '../../i18n/i18n-keys';
import { RecentAlgorithmsStore } from '../../recent/recent-algorithms-store';
import { CommandPaletteService } from './command-palette.service';
import { isTypingTarget, paletteAction } from './palette-keys.utils';
import { SearchEntry, cycleIndex, defaultEntries, searchEntries } from './search-index.utils';

interface ShortcutRow {
  readonly keys: readonly string[];
  readonly label: string;
}

const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

const RESULT_LIMIT = 8;
const SEARCH_MODE_SHORTCUTS = 5;

@Component({
  selector: 'ohno-command-palette',
  imports: [FaIconComponent, OhnoEngraving, OhnoKbd, OhnoLed, OhnoPlate, TranslocoPipe],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class OhnoCommandPalette {
  private readonly palette = inject(CommandPaletteService);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly router = inject(Router);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly injector = inject(Injector);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { search: faMagnifyingGlass };
  protected readonly open = this.palette.open;
  protected readonly mode = this.palette.mode;
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private previouslyFocused: HTMLElement | null = null;

  private readonly entries = computed<readonly SearchEntry[]>(() => {
    this.language.activeLang();
    const catalog = this.registry.all();
    return catalog.map((item) => this.toEntry(item, catalog));
  });

  protected readonly results = computed(() => {
    const query = this.query();
    if (query.trim().length === 0) {
      return defaultEntries(this.entries(), this.recent.entries().map((entry) => entry.id), RESULT_LIMIT);
    }
    return searchEntries(this.entries(), query, RESULT_LIMIT);
  });

  protected readonly activeOptionId = computed(() =>
    this.results().length > 0 ? `ohno-palette-option-${this.activeIndex()}` : null,
  );

  protected readonly placeholder = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.placeholder, { count: this.registry.all().length }),
  );

  protected readonly noResultsLabel = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.noResults, { query: this.query().trim() }),
  );

  protected readonly shortcutRows = computed<readonly ShortcutRow[]>(() => {
    const keys = I18N_KEY.core.instrument.shortcuts;
    const rows: ShortcutRow[] = [
      { keys: ['⌘K', '/'], label: this.translate(keys.search) },
      { keys: ['?'], label: this.translate(keys.shortcuts) },
      { keys: ['Esc'], label: this.translate(keys.close) },
      { keys: [this.translate(keys.spaceKey)], label: this.translate(keys.play) },
      { keys: ['←', '→'], label: this.translate(keys.step) },
      { keys: ['R'], label: this.translate(keys.reset) },
      { keys: ['[', ']'], label: this.translate(keys.tempo) },
      { keys: ['C', 'I', 'T'], label: this.translate(keys.tabs) },
      { keys: ['L'], label: this.translate(keys.log) },
    ];
    return this.mode() === 'shortcuts' ? rows : rows.slice(0, SEARCH_MODE_SHORTCUTS);
  });

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.onOpened() : this.onClosed()));
    });
  }

  protected difficultyLed(difficulty: Difficulty): LedColor {
    return DIFFICULTY_LED[difficulty];
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    const action = paletteAction({
      key: event.key,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      typing: isTypingTarget(event.target),
      open: this.open(),
    });
    if (action === null) return;
    event.preventDefault();
    if (action === 'toggle') this.palette.toggle();
    else if (action === 'search') this.palette.openSearch();
    else if (action === 'shortcuts') this.palette.openShortcuts();
    else this.close();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(cycleIndex(this.results().length, this.activeIndex(), event.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = this.results()[this.activeIndex()];
      if (hit) this.choose(hit);
    }
  }

  protected choose(hit: SearchEntry): void {
    this.close();
    void this.router.navigate(['/algorithms', hit.id]);
  }

  protected close(): void {
    this.palette.close();
  }

  private onOpened(): void {
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.query.set('');
    this.activeIndex.set(0);
    afterNextRender(() => this.input()?.nativeElement.focus(), { injector: this.injector });
  }

  private onClosed(): void {
    this.previouslyFocused?.focus({ preventScroll: true });
    this.previouslyFocused = null;
  }

  private toEntry(item: AlgorithmItem, catalog: readonly AlgorithmItem[]): SearchEntry {
    const traitIds = deriveAlgorithmTraits(item);
    const traitLabels = traitIds.map((id) => {
      const definition = ALGORITHM_TRAITS.find((trait) => trait.id === id);
      return definition ? this.translate(definition.labelKey) : id;
    });
    return {
      id: item.id,
      name: item.name,
      moduleId: moduleId(item, catalog),
      categoryId: item.category,
      subcategoryId: item.subcategory,
      categoryLabel: this.facetLabel(item.category),
      subcategoryLabel: this.facetLabel(item.subcategory),
      traits: [...traitIds, ...traitLabels],
      difficulty: item.difficulty,
    };
  }

  private facetLabel(facet: string): string {
    const key = getAlgorithmFacetLabelKey(facet);
    return key ? this.translate(key) : facet;
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
