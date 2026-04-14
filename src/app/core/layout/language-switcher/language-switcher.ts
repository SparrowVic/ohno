import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppLang } from '../../i18n/app-lang';
import { AppLanguageService } from '../../i18n/app-language.service';
import { LabSelect, LabSelectOption } from '../../../shared/ui/lab-select/lab-select';

@Component({
  selector: 'app-language-switcher',
  imports: [FormsModule, LabSelect],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  private readonly language = inject(AppLanguageService);

  readonly options: readonly LabSelectOption<AppLang>[] = this.language.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  readonly activeLang = this.language.activeLang;

  setLang(lang: AppLang): void {
    this.language.setActiveLang(lang);
  }
}
