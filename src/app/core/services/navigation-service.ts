import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import {
  NavTab,
  NavTabId,
  SidebarFilter,
  SidebarGroup,
  SidebarItem,
} from '../models/navigation';
import { AlgorithmRegistry } from '../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { StructureRegistry } from '../../features/structures/registry/structure-registry';

const NAV_TABS: readonly NavTab[] = [
  { id: 'algorithms', label: 'Algorithms', path: '/algorithms' },
  { id: 'structures', label: 'Structures', path: '/structures' },
];

interface SidebarItemDefinition {
  readonly id: string;
  readonly label: string;
  readonly sectionTitle: string;
  readonly filter: SidebarItem['filter'];
}

interface SidebarGroupDefinition {
  readonly id: string;
  readonly label: string;
  readonly items: readonly SidebarItemDefinition[];
}

type SidebarTabId = NavTabId;

const ALGORITHMS_SIDEBAR: readonly SidebarGroupDefinition[] = [
  {
    id: 'overview',
    label: 'Browse',
    items: [
      {
        id: 'all-algorithms',
        label: 'All algorithms',
        sectionTitle: 'All algorithms',
        filter: {},
      },
    ],
  },
  {
    id: 'sorting',
    label: 'Sorting',
    items: [
      {
        id: 'all-sorting',
        label: 'All sorting',
        sectionTitle: 'Sorting algorithms',
        filter: { category: 'sorting' },
      },
      {
        id: 'comparison',
        label: 'Comparison',
        sectionTitle: 'Comparison sorts',
        filter: { category: 'sorting', subcategory: 'comparison' },
      },
      {
        id: 'non-comparison',
        label: 'Non-comparison',
        sectionTitle: 'Non-comparison sorts',
        filter: { category: 'sorting', subcategory: 'non-comparison' },
      },
    ],
  },
  {
    id: 'searching',
    label: 'Searching',
    items: [
      {
        id: 'all-searching',
        label: 'All searching',
        sectionTitle: 'Search algorithms',
        filter: { category: 'searching' },
      },
      {
        id: 'array-search',
        label: 'Linear',
        sectionTitle: 'Linear search algorithms',
        filter: { category: 'searching', subcategory: 'array' },
      },
      {
        id: 'binary-search',
        label: 'Binary',
        sectionTitle: 'Binary search algorithms',
        filter: { category: 'searching', subcategory: 'binary' },
      },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    items: [
      {
        id: 'all-tree-algorithms',
        label: 'All trees',
        sectionTitle: 'Tree algorithms',
        filter: { category: 'trees' },
      },
      {
        id: 'tree-traversal',
        label: 'Traversal',
        sectionTitle: 'Tree traversal algorithms',
        filter: { category: 'trees', subcategory: 'traversal' },
      },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    items: [
      {
        id: 'all-graphs',
        label: 'All graphs',
        sectionTitle: 'Graph algorithms',
        filter: { category: 'graphs' },
      },
      {
        id: 'pathfinding',
        label: 'Pathfinding',
        sectionTitle: 'Pathfinding algorithms',
        filter: { category: 'graphs', subcategory: 'pathfinding' },
      },
      {
        id: 'traversal',
        label: 'Traversal',
        sectionTitle: 'Graph traversal',
        filter: { category: 'graphs', subcategory: 'traversal' },
      },
      {
        id: 'mst',
        label: 'MST',
        sectionTitle: 'Minimum spanning tree',
        filter: { category: 'graphs', subcategory: 'mst' },
      },
      {
        id: 'connectivity',
        label: 'Connectivity',
        sectionTitle: 'Graph connectivity algorithms',
        filter: { category: 'graphs', subcategory: 'connectivity' },
      },
      {
        id: 'flow-matching',
        label: 'Flow & matching',
        sectionTitle: 'Flow and matching algorithms',
        filter: { category: 'graphs', subcategory: 'flow-matching' },
      },
      {
        id: 'advanced-graphs',
        label: 'Advanced',
        sectionTitle: 'Advanced graph algorithms',
        filter: { category: 'graphs', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'dp',
    label: 'Dynamic prog.',
    items: [
      {
        id: 'all-dp',
        label: 'All DP',
        sectionTitle: 'Dynamic programming',
        filter: { category: 'dp' },
      },
      {
        id: 'classic',
        label: 'Classic',
        sectionTitle: 'Classic DP problems',
        filter: { category: 'dp', subcategory: 'classic' },
      },
      {
        id: 'dp-sequences',
        label: 'Sequences',
        sectionTitle: 'Sequence DP problems',
        filter: { category: 'dp', subcategory: 'sequences' },
      },
      {
        id: 'dp-advanced',
        label: 'Advanced',
        sectionTitle: 'Advanced DP problems',
        filter: { category: 'dp', subcategory: 'advanced' },
      },
      {
        id: 'dp-optimization',
        label: 'Optimization',
        sectionTitle: 'DP optimization techniques',
        filter: { category: 'dp', subcategory: 'optimization' },
      },
    ],
  },
  {
    id: 'strings',
    label: 'Strings',
    items: [
      {
        id: 'all-strings',
        label: 'All strings',
        sectionTitle: 'String algorithms',
        filter: { category: 'strings' },
      },
      {
        id: 'pattern-matching',
        label: 'Pattern matching',
        sectionTitle: 'Pattern matching',
        filter: { category: 'strings', subcategory: 'pattern-matching' },
      },
      {
        id: 'suffix-palindromes',
        label: 'Suffix & palindromes',
        sectionTitle: 'Suffix and palindrome structures',
        filter: { category: 'strings', subcategory: 'suffix-palindromes' },
      },
      {
        id: 'compression',
        label: 'Compression',
        sectionTitle: 'Compression and encoding',
        filter: { category: 'strings', subcategory: 'compression' },
      },
    ],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    items: [
      {
        id: 'all-geometry',
        label: 'All geometry',
        sectionTitle: 'Computational geometry',
        filter: { category: 'geometry' },
      },
      {
        id: 'geometry-computational',
        label: 'Computational',
        sectionTitle: 'Computational geometry algorithms',
        filter: { category: 'geometry', subcategory: 'computational' },
      },
      {
        id: 'geometry-advanced',
        label: 'Advanced',
        sectionTitle: 'Advanced geometry algorithms',
        filter: { category: 'geometry', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'misc',
    label: 'Other',
    items: [
      {
        id: 'all-misc',
        label: 'All other',
        sectionTitle: 'Other algorithms',
        filter: { category: 'misc' },
      },
      {
        id: 'math',
        label: 'Math',
        sectionTitle: 'Math algorithms',
        filter: { category: 'misc', subcategory: 'math' },
      },
      {
        id: 'array-techniques',
        label: 'Array techniques',
        sectionTitle: 'Array techniques',
        filter: { category: 'misc', subcategory: 'array-techniques' },
      },
      {
        id: 'backtracking',
        label: 'Backtracking',
        sectionTitle: 'Backtracking algorithms',
        filter: { category: 'misc', subcategory: 'backtracking' },
      },
      {
        id: 'recursion',
        label: 'Recursion',
        sectionTitle: 'Recursion and call stack',
        filter: { category: 'misc', subcategory: 'recursion' },
      },
      {
        id: 'game-theory',
        label: 'Game theory',
        sectionTitle: 'Game tree algorithms',
        filter: { category: 'misc', subcategory: 'game-theory' },
      },
      {
        id: 'randomized',
        label: 'Randomized',
        sectionTitle: 'Randomized algorithms',
        filter: { category: 'misc', subcategory: 'randomized' },
      },
    ],
  },
];

const STRUCTURES_SIDEBAR: readonly SidebarGroupDefinition[] = [
  {
    id: 'catalog',
    label: 'Browse',
    items: [
      {
        id: 'all-structures',
        label: 'All structures',
        sectionTitle: 'All structures',
        filter: {},
      },
    ],
  },
  {
    id: 'linear',
    label: 'Linear',
    items: [
      {
        id: 'all-linear',
        label: 'All linear',
        sectionTitle: 'Linear data structures',
        filter: { category: 'linear' },
      },
      {
        id: 'stack-queue',
        label: 'Stack / queue',
        sectionTitle: 'Stack and queue structures',
        filter: { category: 'linear', subcategory: 'stack-queue' },
      },
      {
        id: 'linked-list',
        label: 'Linked lists',
        sectionTitle: 'Linked list structures',
        filter: { category: 'linear', subcategory: 'linked-list' },
      },
    ],
  },
  {
    id: 'hashing',
    label: 'Hashing',
    items: [
      {
        id: 'all-hashing',
        label: 'All hashing',
        sectionTitle: 'Hashing structures',
        filter: { category: 'hashing' },
      },
      {
        id: 'hash-table',
        label: 'Hash tables',
        sectionTitle: 'Hash table structures',
        filter: { category: 'hashing', subcategory: 'hash-table' },
      },
      {
        id: 'probabilistic',
        label: 'Probabilistic',
        sectionTitle: 'Probabilistic structures',
        filter: { category: 'hashing', subcategory: 'probabilistic' },
      },
      {
        id: 'distributed',
        label: 'Distributed',
        sectionTitle: 'Distributed hashing',
        filter: { category: 'hashing', subcategory: 'distributed' },
      },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    items: [
      {
        id: 'all-structures-trees',
        label: 'All trees',
        sectionTitle: 'Tree data structures',
        filter: { category: 'trees' },
      },
      {
        id: 'search-trees',
        label: 'Search trees',
        sectionTitle: 'Search tree structures',
        filter: { category: 'trees', subcategory: 'search' },
      },
      {
        id: 'heaps',
        label: 'Heaps',
        sectionTitle: 'Heap structures',
        filter: { category: 'trees', subcategory: 'heaps' },
      },
      {
        id: 'prefix-suffix',
        label: 'Prefix / suffix',
        sectionTitle: 'Prefix and suffix trees',
        filter: { category: 'trees', subcategory: 'prefix-suffix' },
      },
      {
        id: 'range',
        label: 'Range',
        sectionTitle: 'Range query structures',
        filter: { category: 'trees', subcategory: 'range' },
      },
      {
        id: 'advanced-trees',
        label: 'Advanced',
        sectionTitle: 'Advanced tree structures',
        filter: { category: 'trees', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'specialized',
    label: 'Specialized',
    items: [
      {
        id: 'all-specialized',
        label: 'All specialized',
        sectionTitle: 'Specialized data structures',
        filter: { category: 'specialized' },
      },
      {
        id: 'ordered',
        label: 'Ordered',
        sectionTitle: 'Ordered randomized structures',
        filter: { category: 'specialized', subcategory: 'ordered' },
      },
      {
        id: 'set-union',
        label: 'Set union',
        sectionTitle: 'Disjoint set structures',
        filter: { category: 'specialized', subcategory: 'set-union' },
      },
      {
        id: 'spatial',
        label: 'Spatial',
        sectionTitle: 'Spatial indexing structures',
        filter: { category: 'specialized', subcategory: 'spatial' },
      },
    ],
  },
];

const DEFAULT_ACTIVE_ITEM_KEY: Record<SidebarTabId, string> = {
  algorithms: 'overview:all-algorithms',
  structures: 'catalog:all-structures',
};

const TAB_BASE_PATH: Record<SidebarTabId, string> = {
  algorithms: '/algorithms',
  structures: '/structures',
};

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly algorithms = inject(AlgorithmRegistry);
  private readonly structures = inject(StructureRegistry);

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
    return 'algorithms';
  });

  readonly sidebarGroups: Signal<readonly SidebarGroup[]> = computed(() => {
    switch (this.activeTabId()) {
      case 'algorithms':
        return this.buildSidebarGroups(ALGORITHMS_SIDEBAR, (filterValue) =>
          this.algorithms.count(filterValue),
        );
      case 'structures':
        return this.buildSidebarGroups(STRUCTURES_SIDEBAR, (filterValue) =>
          this.structures.count(filterValue),
        );
    }
  });

  private readonly collapsedState = signal(false);
  readonly collapsed: Signal<boolean> = this.collapsedState.asReadonly();

  private readonly activeItemState = signal<Record<SidebarTabId, string>>(DEFAULT_ACTIVE_ITEM_KEY);
  readonly activeItemKey: Signal<string> = computed(() => this.activeItemState()[this.activeTabId()]);

  readonly activeItem: Signal<SidebarItem | null> = computed(() => {
    const key = this.activeItemKey();
    for (const group of this.sidebarGroups()) {
      for (const item of group.items) {
        if (`${group.id}:${item.id}` === key) {
          return item;
        }
      }
    }
    return null;
  });

  constructor() {
    effect(() => {
      const tabId = this.activeTabId();
      const groups = this.sidebarGroups();
      const routedKey = this.findItemKeyByRoute(tabId, groups, this.currentUrl());
      if (routedKey) {
        this.activeItemState.update((state) =>
          state[tabId] === routedKey
            ? state
            : {
                ...state,
                [tabId]: routedKey,
              },
        );
        return;
      }

      const activeKey = this.activeItemKey();
      if (this.findItemByKey(groups, activeKey)) return;

      const fallbackKey =
        this.findItemByKey(groups, DEFAULT_ACTIVE_ITEM_KEY[tabId]) ??
        this.firstItemKey(groups);
      if (!fallbackKey) return;

      this.activeItemState.update((state) => ({
        ...state,
        [tabId]: fallbackKey,
      }));
    });
  }

  toggleCollapsed(): void {
    this.collapsedState.update((value) => !value);
  }

  setActiveItem(groupId: string, itemId: string): void {
    const tabId = this.activeTabId();
    const key = `${groupId}:${itemId}`;
    const item = this.getItemByKey(this.sidebarGroups(), key);
    if (!item) return;

    this.activeItemState.update((state) => ({
      ...state,
      [tabId]: key,
    }));

    void this.router.navigate([TAB_BASE_PATH[tabId]], {
      queryParams: this.filterToQueryParams(item.filter),
    });
  }

  private buildSidebarGroups(
    definitions: readonly SidebarGroupDefinition[],
    countByFilter: (filterValue: SidebarItem['filter']) => number,
  ): readonly SidebarGroup[] {
    return definitions.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items.map((item) => ({
        id: item.id,
        label: item.label,
        count: countByFilter(item.filter),
        sectionTitle: item.sectionTitle,
        filter: item.filter,
      })),
    }));
  }

  private findItemByKey(groups: readonly SidebarGroup[], key: string): string | null {
    for (const group of groups) {
      for (const item of group.items) {
        const currentKey = `${group.id}:${item.id}`;
        if (currentKey === key) {
          return currentKey;
        }
      }
    }
    return null;
  }

  private getItemByKey(groups: readonly SidebarGroup[], key: string): SidebarItem | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (`${group.id}:${item.id}` === key) {
          return item;
        }
      }
    }

    return null;
  }

  private findItemKeyByRoute(
    tabId: SidebarTabId,
    groups: readonly SidebarGroup[],
    url: string,
  ): string | null {
    const routeFilter = this.getFilterFromUrl(tabId, url);
    if (!routeFilter) {
      return null;
    }

    return this.findItemKeyByFilter(groups, routeFilter);
  }

  private getFilterFromUrl(tabId: SidebarTabId, url: string): SidebarFilter | null {
    const parsed = this.router.parseUrl(url);
    const primary = parsed.root.children['primary'];
    const segments = primary?.segments.map((segment) => segment.path) ?? [];
    const expected = TAB_BASE_PATH[tabId].replace(/^\//, '');

    if (segments.length !== 1 || segments[0] !== expected) {
      return null;
    }

    const category = parsed.queryParams['category'];
    const subcategory = parsed.queryParams['subcategory'];

    return {
      category: typeof category === 'string' && category.length > 0 ? category : undefined,
      subcategory:
        typeof subcategory === 'string' && subcategory.length > 0 ? subcategory : undefined,
    };
  }

  private findItemKeyByFilter(
    groups: readonly SidebarGroup[],
    filterValue: SidebarFilter,
  ): string | null {
    const exactKey = this.findMatchingItemKey(groups, filterValue);
    if (exactKey) {
      return exactKey;
    }

    if (filterValue.category && filterValue.subcategory) {
      return this.findMatchingItemKey(groups, { category: filterValue.category });
    }

    return this.findMatchingItemKey(groups, {});
  }

  private findMatchingItemKey(
    groups: readonly SidebarGroup[],
    filterValue: SidebarFilter,
  ): string | null {
    for (const group of groups) {
      for (const item of group.items) {
        const itemFilter = item.filter;
        if (
          itemFilter.category === filterValue.category &&
          itemFilter.subcategory === filterValue.subcategory
        ) {
          return `${group.id}:${item.id}`;
        }
      }
    }

    return null;
  }

  private filterToQueryParams(filterValue: SidebarFilter): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (filterValue.category) {
      queryParams['category'] = filterValue.category;
    }

    if (filterValue.subcategory) {
      queryParams['subcategory'] = filterValue.subcategory;
    }

    return queryParams;
  }

  private firstItemKey(groups: readonly SidebarGroup[]): string | null {
    const group = groups[0];
    const item = group?.items[0];
    return group && item ? `${group.id}:${item.id}` : null;
  }
}
