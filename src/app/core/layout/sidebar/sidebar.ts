import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { NavigationService } from '../../services/navigation-service';
import { NavIcon, NavIconName } from './nav-icon';

const GROUP_ICON_MAP: Record<string, NavIconName> = {
  overview: 'browse',
  sorting: 'sorting',
  searching: 'searching',
  trees: 'trees',
  graphs: 'graphs',
  dp: 'dp',
  strings: 'strings',
  geometry: 'geometry',
  misc: 'misc',
  catalog: 'browse',
  linear: 'linear',
  hashing: 'hashing',
  specialized: 'specialized',
};

@Component({
  selector: 'app-sidebar',
  imports: [NavIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly catalogCount = computed(() => this.groups()[0]?.items[0]?.count ?? 0);

  private readonly expandedGroupIds = signal<Set<string>>(new Set(['overview', 'catalog']));

  constructor() {
    effect(() => {
      const key = this.activeItemKey();
      const groups = this.groups();
      for (const group of groups) {
        for (const item of group.items) {
          if (`${group.id}:${item.id}` === key) {
            const groupId = group.id;
            untracked(() => {
              this.expandedGroupIds.update((ids) => new Set([...ids, groupId]));
            });
            return;
          }
        }
      }
    });
  }

  isActive(groupId: string, itemId: string): boolean {
    return this.activeItemKey() === `${groupId}:${itemId}`;
  }

  isGroupActive(groupId: string): boolean {
    return this.activeItemKey().startsWith(`${groupId}:`);
  }

  isExpanded(groupId: string): boolean {
    return this.expandedGroupIds().has(groupId);
  }

  toggleGroup(groupId: string): void {
    if (this.collapsed()) {
      this.navigation.toggleCollapsed();
      this.expandedGroupIds.update((ids) => new Set([...ids, groupId]));
      return;
    }

    this.expandedGroupIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  selectItem(groupId: string, itemId: string): void {
    this.navigation.setActiveItem(groupId, itemId);
  }

  getGroupIcon(groupId: string): NavIconName {
    return GROUP_ICON_MAP[groupId] ?? 'misc';
  }

  getCategoryCount(groupId: string): number {
    const group = this.groups().find((g) => g.id === groupId);
    return group?.items[0]?.count ?? 0;
  }
}
