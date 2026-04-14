import { Component, inject } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';

import { I18N_KEY } from '../../i18n/i18n-keys';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { NavigationService } from '../../services/navigation-service';
import { NavbarTabDeck, NavbarTabDeckVariant } from './navbar-tab-deck/navbar-tab-deck';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, LanguageSwitcher, NavbarTabDeck],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly navigation = inject(NavigationService);

  readonly tabs = this.navigation.tabs;
  readonly activeTabId = this.navigation.activeTabId;
  readonly searchPlaceholder = translateSignal(I18N_KEY.navbar.searchPlaceholder);
  readonly tabDeckVariant: NavbarTabDeckVariant = 'pill';
}
