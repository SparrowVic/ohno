import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NavigationService } from '../../services/navigation-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly navigation = inject(NavigationService);

  readonly tabs = this.navigation.tabs;

  toggleSidebar(): void {
    this.navigation.toggleCollapsed();
  }
}
