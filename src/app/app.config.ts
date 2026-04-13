import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco, translocoConfig } from '@jsverse/transloco';

import { routes } from './app.routes';
import {
  APP_LANG_OPTIONS,
  DEFAULT_APP_LANG,
  FALLBACK_APP_LANG,
} from './core/i18n/app-lang';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideTransloco({
      config: translocoConfig({
        availableLangs: APP_LANG_OPTIONS.map((option) => option.value),
        defaultLang: DEFAULT_APP_LANG,
        fallbackLang: FALLBACK_APP_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      }),
      loader: TranslocoHttpLoader,
    }),
  ],
};
