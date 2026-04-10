import { Component, computed, inject } from '@angular/core';

import { NavigationService } from '../../services/navigation-service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    '[class.sidebar-host--collapsed]': 'collapsed()',
  },
})
export class Sidebar {
  private readonly navigation = inject(NavigationService);

  readonly groups = this.navigation.sidebarGroups;
  readonly collapsed = this.navigation.collapsed;
  private readonly activeItemKey = this.navigation.activeItemKey;

  readonly isEmpty = computed(() => this.groups().length === 0);

  isActive(groupId: string, itemId: string): boolean {
    return this.activeItemKey() === `${groupId}:${itemId}`;
  }

  selectItem(groupId: string, itemId: string): void {
    this.navigation.setActiveItem(groupId, itemId);
  }
}
