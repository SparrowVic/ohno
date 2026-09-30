import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons';

import { AppLang, isAppLang } from '../../../../core/i18n/app-lang';
import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { CommandPaletteService } from '../../../../core/layout/command-palette/command-palette.service';
import { OhnoBrand } from '../../../../shared/instrument/brand/brand';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { LangToggleOption, OhnoLangToggle } from '../../../../shared/instrument/lang-toggle/lang-toggle';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoSearchField } from '../../../../shared/instrument/search-field/search-field';

@Component({
  selector: 'ohno-workbench-topbar',
  imports: [OhnoBrand, OhnoEngraving, OhnoKey, OhnoLangToggle, OhnoLed, OhnoSearchField, TranslocoPipe],
  templateUrl: './workbench-topbar.html',
  styleUrl: './workbench-topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoWorkbenchTopbar {
  readonly crumbs = input.required<readonly string[]>();
  readonly moduleCount = input.required<number>();

  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { back: faChevronLeft };
  protected readonly activeLang = this.language.activeLang;
  protected readonly langOptions: readonly LangToggleOption[] = this.language.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  protected readonly tagline = computed(() =>
    this.translate(I18N_KEY.features.algorithms.workbench.topbar.tagline, { count: this.moduleCount() }),
  );
  protected readonly placeholder = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.placeholder, { count: this.moduleCount() }),
  );

  protected openSearch(): void {
    this.palette.openSearch();
  }

  protected setLang(value: string): void {
    if (isAppLang(value)) this.language.setActiveLang(value as AppLang);
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
