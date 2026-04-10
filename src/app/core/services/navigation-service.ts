import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import { NavTab, NavTabId, SidebarGroup, SidebarItem } from '../models/navigation';

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
      {
        id: 'all-sorting',
        label: 'All sorting',
        count: 7,
        sectionTitle: 'Sorting algorithms',
        filter: { category: 'sorting' },
      },
      {
        id: 'comparison',
        label: 'Comparison',
        count: 6,
        sectionTitle: 'Comparison sorts',
        filter: { category: 'sorting', subcategory: 'comparison' },
      },
      {
        id: 'non-comparison',
        label: 'Non-comparison',
        count: 1,
        sectionTitle: 'Non-comparison sorts',
        filter: { category: 'sorting', subcategory: 'non-comparison' },
      },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    items: [
      {
        id: 'pathfinding',
        label: 'Pathfinding',
        count: 4,
        sectionTitle: 'Pathfinding algorithms',
        filter: { category: 'graphs', subcategory: 'pathfinding' },
      },
      {
        id: 'traversal',
        label: 'Traversal',
        count: 3,
        sectionTitle: 'Graph traversal',
        filter: { category: 'graphs', subcategory: 'traversal' },
      },
      {
        id: 'mst',
        label: 'MST',
        count: 2,
        sectionTitle: 'Minimum spanning tree',
        filter: { category: 'graphs', subcategory: 'mst' },
      },
    ],
  },
  {
    id: 'dp',
    label: 'Dynamic prog.',
    items: [
      {
        id: 'classic',
        label: 'Classic',
        count: 5,
        sectionTitle: 'Classic DP problems',
        filter: { category: 'dp', subcategory: 'classic' },
      },
      {
        id: 'dp-strings',
        label: 'Strings',
        count: 3,
        sectionTitle: 'String DP problems',
        filter: { category: 'dp', subcategory: 'strings' },
      },
    ],
  },
  {
    id: 'strings',
    label: 'Strings',
    items: [
      {
        id: 'pattern-matching',
        label: 'Pattern matching',
        count: 4,
        sectionTitle: 'Pattern matching',
        filter: { category: 'strings', subcategory: 'pattern-matching' },
      },
    ],
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

  readonly activeItem: Signal<SidebarItem | null> = computed(() => {
    const key = this.activeItemState();
    for (const group of this.sidebarGroups()) {
      for (const item of group.items) {
        if (`${group.id}:${item.id}` === key) {
          return item;
        }
      }
    }
    return null;
  });

  toggleCollapsed(): void {
    this.collapsedState.update((value) => !value);
  }

  setActiveItem(groupId: string, itemId: string): void {
    this.activeItemState.set(`${groupId}:${itemId}`);
  }
}
