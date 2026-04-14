import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { AlgorithmItem } from '../models/algorithm';

interface CardMetric {
  readonly label: string;
  readonly value: string;
}

function formatFacetLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => {
      if (chunk === 'dp') return 'DP';
      if (chunk === 'mst') return 'MST';
      return chunk.charAt(0).toUpperCase() + chunk.slice(1);
    })
    .join(' ');
}

function createPreviewBars(seed: string): readonly number[] {
  const source = seed.replace(/-/g, '') || 'visual';

  return Array.from({ length: 7 }, (_, index) => {
    const code = source.charCodeAt(index % source.length);
    return 26 + (code % 54);
  });
}

@Component({
  selector: 'app-algorithm-card',
  imports: [RouterLink],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard {
  private readonly language = inject(AppLanguageService);

  readonly algorithm = input.required<AlgorithmItem>();
  readonly facetLabel = computed(() =>
    formatFacetLabel(this.algorithm().subcategory || this.algorithm().category),
  );
  readonly difficultyLabel = computed(() =>
    getDifficultyLabel(this.algorithm().difficulty, this.language.activeLang()),
  );
  readonly statusLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Interactive'
        : 'Coming soon'
      : this.algorithm().implemented
        ? 'Interaktywny'
        : 'Wkrótce',
  );
  readonly ctaLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Open visualization'
        : 'In roadmap'
      : this.algorithm().implemented
        ? 'Otwórz wizualizację'
        : 'W roadmapie',
  );
  readonly previewLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? this.algorithm().implemented
        ? 'Live signal'
        : 'Roadmap'
      : this.algorithm().implemented
        ? 'Live signal'
        : 'Roadmap',
  );
  readonly previewHint = computed(() =>
    this.algorithm().implemented
      ? this.algorithm().complexity.timeAverage
      : this.language.activeLang() === APP_LANG.EN
        ? 'Interactive walkthrough planned'
        : 'Planowana interaktywna wizualizacja',
  );
  readonly displayTags = computed(() => this.algorithm().tags.slice(0, 3));
  readonly hiddenTagsCount = computed(
    () => this.algorithm().tags.length - this.displayTags().length,
  );
  readonly previewBars = computed(() => createPreviewBars(this.algorithm().id));
  readonly metrics = computed<readonly CardMetric[]>(() => {
    const lang = this.language.activeLang();
    return [
      {
        label: lang === APP_LANG.EN ? 'Time' : 'Czas',
        value: this.algorithm().complexity.timeAverage,
      },
      {
        label: lang === APP_LANG.EN ? 'Space' : 'Pamięć',
        value: this.algorithm().complexity.space,
      },
    ];
  });
}
