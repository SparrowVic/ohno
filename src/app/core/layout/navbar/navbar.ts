import { Component, inject } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { RouterLink } from '@angular/router';

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
  readonly homeAriaLabel = translateSignal(t('core.navbar.homeAriaLabel'));
  readonly commandAriaLabel = translateSignal(t('core.navbar.commandAriaLabel'));
  readonly searchEyebrow = translateSignal(t('core.navbar.searchEyebrow'));
  readonly searchPlaceholder = translateSignal(t('core.navbar.searchPlaceholder'));
  readonly tabDeckVariant: NavbarTabDeckVariant = 'pill';
}
