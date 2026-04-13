import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { StructureItem } from '../models/structure';

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
  readonly difficultyLabel = computed(() =>
    getDifficultyLabel(this.structure().difficulty, this.language.activeLang()),
  );
  readonly statusLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN ? 'Coming soon' : 'Wkrótce',
  );
}
