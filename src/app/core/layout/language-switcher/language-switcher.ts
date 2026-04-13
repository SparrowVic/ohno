import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AppLang } from '../../i18n/app-lang';
import { AppLanguageService } from '../../i18n/app-language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  private readonly language = inject(AppLanguageService);

  readonly options = this.language.options;
  readonly activeLang = this.language.activeLang;

  setLang(lang: AppLang): void {
    this.language.setActiveLang(lang);
  }
}
