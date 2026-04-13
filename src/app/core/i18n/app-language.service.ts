import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import {
  AppLang,
  APP_LANG,
  APP_LANG_OPTIONS,
  DEFAULT_APP_LANG,
  isAppLang,
} from './app-lang';

const LANG_STORAGE_KEY = 'ohno:lang';

@Injectable({ providedIn: 'root' })
export class AppLanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly doc = inject(DOCUMENT);

  readonly options = APP_LANG_OPTIONS;
  readonly activeLang = computed<AppLang>(() => normalizeLang(this.transloco.activeLang()));

  constructor() {
    const initialLang = this.resolveInitialLang();
    if (initialLang !== this.activeLang()) {
      this.transloco.setActiveLang(initialLang);
    }

    effect(() => {
      const lang = this.activeLang();
      this.doc.documentElement.lang = lang;
      this.doc.defaultView?.localStorage.setItem(LANG_STORAGE_KEY, lang);
      void firstValueFrom(this.transloco.load(lang));
    });
  }

  setActiveLang(lang: AppLang): void {
    if (lang === this.activeLang()) return;
    this.transloco.setActiveLang(lang);
  }

  private resolveInitialLang(): AppLang {
    const savedLang = this.doc.defaultView?.localStorage.getItem(LANG_STORAGE_KEY);
    if (isAppLang(savedLang)) {
      return savedLang;
    }

    const browserLang = this.doc.defaultView?.navigator.language.toLowerCase();
    if (browserLang?.startsWith(APP_LANG.EN)) {
      return APP_LANG.EN;
    }

    return DEFAULT_APP_LANG;
  }
}

function normalizeLang(lang: string): AppLang {
  if (lang === APP_LANG.EN) return APP_LANG.EN;
  return APP_LANG.PL;
}
