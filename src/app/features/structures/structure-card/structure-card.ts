import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { StructureItem } from '../models/structure';

function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function createPreviewOrbit(seed: string): readonly number[] {
  const source = seed.replace(/-/g, '') || 'nodes';

  return Array.from({ length: 5 }, (_, index) => {
    const code = source.charCodeAt(index % source.length);
    return 20 + (code % 56);
  });
}

@Component({
  selector: 'app-structure-card',
  imports: [],
  templateUrl: './structure-card.html',
  styleUrl: './structure-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCard {
  private readonly language = inject(AppLanguageService);

  readonly structure = input.required<StructureItem>();
  readonly facetLabel = computed(() =>
    formatFacetLabel(this.structure().subcategory || this.structure().category),
  );
  readonly difficultyLabel = computed(() =>
    getDifficultyLabel(this.structure().difficulty, this.language.activeLang()),
  );
  readonly statusLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Interactive'
        : 'Coming soon'
      : this.structure().implemented
        ? 'Interaktywna'
        : 'Wkrótce',
  );
  readonly ctaLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Open module'
        : 'In roadmap'
      : this.structure().implemented
        ? 'Otwórz moduł'
        : 'W roadmapie',
  );
  readonly previewHint = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.structure().implemented
        ? 'Interactive model ready'
        : 'Planned deep-dive module'
      : this.structure().implemented
        ? 'Interaktywny model gotowy'
        : 'Planowany moduł deep-dive',
  );
  readonly displayTags = computed(() => this.structure().tags.slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.structure().tags.length - this.displayTags().length,
  );
  readonly previewOrbit = computed(() => createPreviewOrbit(this.structure().id));
}
