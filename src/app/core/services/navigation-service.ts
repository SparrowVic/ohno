import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import { NavTab, NavTabId, SidebarGroup } from '../models/navigation';

const NAV_TABS: readonly NavTab[] = [
  { id: 'algorithms', label: 'Algorithms', path: '/algorithms' },
  { id: 'structures', label: 'Structures', path: '/structures' },
  { id: 'playground', label: 'Playground', path: '/playground' },
];

const ALGORITHMS_SIDEBAR: readonly SidebarGroup[] = [
  {
    id: 'sorting',
    label: 'Sorting',
    items: [
      { id: 'all-sorting', label: 'All sorting', count: 7 },
      { id: 'comparison', label: 'Comparison', count: 5 },
      { id: 'non-comparison', label: 'Non-comparison', count: 2 },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    items: [
      { id: 'pathfinding', label: 'Pathfinding', count: 4 },
      { id: 'traversal', label: 'Traversal', count: 3 },
      { id: 'mst', label: 'MST', count: 2 },
    ],
  },
  {
    id: 'dp',
    label: 'Dynamic prog.',
    items: [
      { id: 'classic', label: 'Classic', count: 5 },
      { id: 'dp-strings', label: 'Strings', count: 3 },
    ],
  },
  {
    id: 'strings',
    label: 'Strings',
    items: [{ id: 'pattern-matching', label: 'Pattern matching', count: 4 }],
  },
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);

  readonly tabs: Signal<readonly NavTab[]> = signal(NAV_TABS);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly activeTabId: Signal<NavTabId> = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/structures')) return 'structures';
    if (url.startsWith('/playground')) return 'playground';
    return 'algorithms';
  });

  readonly sidebarGroups: Signal<readonly SidebarGroup[]> = computed(() => {
    switch (this.activeTabId()) {
      case 'algorithms':
        return ALGORITHMS_SIDEBAR;
      case 'structures':
      case 'playground':
        return [];
    }
  });

  private readonly collapsedState = signal(false);
  readonly collapsed: Signal<boolean> = this.collapsedState.asReadonly();

  private readonly activeItemState = signal<string>('sorting:all-sorting');
  readonly activeItemKey: Signal<string> = this.activeItemState.asReadonly();

  toggleCollapsed(): void {
    this.collapsedState.update((value) => !value);
  }

  setActiveItem(groupId: string, itemId: string): void {
    this.activeItemState.set(`${groupId}:${itemId}`);
  }
}
