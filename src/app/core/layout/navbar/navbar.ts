import { Component, inject } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18N_KEY } from '../../i18n/i18n-keys';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { NavigationService } from '../../services/navigation-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly navigation = inject(NavigationService);

  readonly tabs = this.navigation.tabs;
  readonly searchPlaceholder = translateSignal(I18N_KEY.navbar.searchPlaceholder);

  toggleSidebar(): void {
    this.navigation.toggleCollapsed();
  }
}
