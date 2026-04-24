import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { animate } from 'animejs';

import { APP_LANG } from '../../i18n/app-lang';
import { AppLanguageService } from '../../i18n/app-language.service';
import { I18N_KEY } from '../../i18n/i18n-keys';
import { WorldFlagGlobe } from './world-flag-globe/world-flag-globe';

interface SelectedCountry {
  readonly code: string;
}

@Component({
  selector: 'app-language-switcher',
  imports: [WorldFlagGlobe, TranslocoPipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  private readonly language = inject(AppLanguageService);
  private readonly doc = inject(DOCUMENT);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly backdropRef = viewChild<ElementRef<HTMLElement>>('backdrop');

  protected readonly I18N_KEY = I18N_KEY;
  readonly activeLang = this.language.activeLang;
  readonly open = signal(false);
  readonly activeLangLabel = computed(
    () =>
      this.language.options.find((option) => option.value === this.activeLang())?.label ??
      this.activeLang().toUpperCase(),
  );

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }

      const panel = this.panelRef()?.nativeElement;
      const backdrop = this.backdropRef()?.nativeElement;
      if (!panel || !backdrop) {
        return;
      }

      animate(backdrop, {
        opacity: [0, 1],
        duration: 420,
        ease: 'outQuad',
      });

      animate(panel, {
        opacity: [0, 1],
        translateY: [26, 0],
        scale: [0.94, 1],
        duration: 760,
        ease: 'outExpo',
      });
    });

    effect((onCleanup) => {
      if (!this.open()) {
        this.doc.body.style.removeProperty('overflow');
        return;
      }

      const previousOverflow = this.doc.body.style.overflow;
      this.doc.body.style.overflow = 'hidden';
      onCleanup(() => {
        this.doc.body.style.overflow = previousOverflow;
      });
    });
  }

  toggleOpen(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  onCountrySelected(country: SelectedCountry): void {
    const nextLang = country.code === 'PL' ? APP_LANG.PL : APP_LANG.EN;
    this.language.setActiveLang(nextLang);
    this.close();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) {
      return;
    }

    const host = this.hostRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
