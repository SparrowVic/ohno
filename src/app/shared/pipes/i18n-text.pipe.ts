import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../core/i18n/app-language.service';
import { looksLikeI18nKey } from '../../core/i18n/looks-like-i18n-key';
import { I18nText, isI18nText, TranslatableText } from '../../core/i18n/translatable-text';

@Pipe({
  name: 'i18nText',
  standalone: true,
  pure: false,
})
export class I18nTextPipe implements PipeTransform {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  transform(value: TranslatableText | null | undefined, fallback = ''): string {
    this.language.activeLang();

    if (isI18nText(value)) {
      return this.translateObject(value);
    }

    if (looksLikeI18nKey(value)) {
      return this.transloco.translate(value);
    }

    return value ?? fallback;
  }

  private translateObject(value: I18nText): string {
    return this.transloco.translate(value.key, value.params);
  }
}
