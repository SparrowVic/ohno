import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { moduleDescriptionKey } from '../../../core/i18n/module-description-key';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../../shared/instrument/screen/screen';
import { previewFamily } from '../data/catalog/preview-family/preview-family';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import { OhnoModulePreview } from './module-preview/module-preview';
import { hashSeed } from './module-preview/module-preview.utils';

const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

@Component({
  selector: 'ohno-module-card',
  imports: [FaIconComponent, OhnoEngraving, OhnoLed, OhnoModulePreview, OhnoPlate, OhnoReadout, OhnoScreen, RouterLink, TranslocoPipe],
  templateUrl: './module-card.html',
  styleUrl: './module-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoModuleCard {
  readonly algorithm = input.required<AlgorithmItem>();
  readonly moduleId = input.required<string>();

  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { open: faChevronRight };
  protected readonly live = signal(false);

  protected readonly link = computed(() => ['/algorithms', this.algorithm().id]);
  protected readonly family = computed(() => previewFamily(this.algorithm()));
  protected readonly seed = computed(() => hashSeed(this.algorithm().id));
  protected readonly difficultyLed = computed(() => DIFFICULTY_LED[this.algorithm().difficulty]);
  protected readonly difficultyLabel = computed(() => this.translate(getDifficultyLabelKey(this.algorithm().difficulty)));
  protected readonly description = computed(() => {
    const key = moduleDescriptionKey(this.algorithm().id);
    const translated = this.translate(key);
    return translated === key ? this.algorithm().description : translated;
  });
  protected readonly openAriaLabel = computed(() =>
    this.translate(I18N_KEY.features.algorithms.catalog.card.openAriaLabel, { name: this.algorithm().name }),
  );

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
