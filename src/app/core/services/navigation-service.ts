import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { filter, map } from 'rxjs';

import { AppLanguageService } from '../i18n/app-language.service';
import { NavTab, NavTabId, SidebarFilter, SidebarGroup, SidebarItem } from '../models/navigation';
import { AlgorithmRegistry } from '../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { StructureRegistry } from '../../features/structures/registry/structure-registry';

interface NavTabDefinition {
  readonly id: NavTabId;
  readonly labelKey: string;
  readonly path: string;
}

const NAV_TABS: readonly NavTabDefinition[] = [
  { id: 'algorithms', labelKey: t('core.navigation.tabs.algorithms'), path: '/algorithms' },
  { id: 'structures', labelKey: t('core.navigation.tabs.structures'), path: '/structures' },
];

interface SidebarItemDefinition {
  readonly id: string;
  readonly labelKey: string;
  readonly sectionTitleKey: string;
  readonly filter: SidebarItem['filter'];
}

interface SidebarGroupDefinition {
  readonly id: string;
  readonly labelKey: string;
  readonly items: readonly SidebarItemDefinition[];
}

type SidebarTabId = NavTabId;

const ALGORITHMS_SIDEBAR: readonly SidebarGroupDefinition[] = [
  {
    id: 'overview',
    labelKey: t('core.navigation.sidebar.algorithms.groups.overview'),
    items: [
      {
        id: 'all-algorithms',
        labelKey: t('core.navigation.sidebar.algorithms.items.allAlgorithms'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.allAlgorithms'),
        filter: {},
      },
    ],
  },
  {
    id: 'sorting',
    labelKey: t('core.navigation.sidebar.algorithms.groups.sorting'),
    items: [
      {
        id: 'all-sorting',
        labelKey: t('core.navigation.sidebar.algorithms.items.allSorting'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.sortingAlgorithms'),
        filter: { category: 'sorting' },
      },
      {
        id: 'comparison',
        labelKey: t('core.navigation.sidebar.algorithms.items.comparison'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.comparisonSorts'),
        filter: { category: 'sorting', subcategory: 'comparison' },
      },
      {
        id: 'non-comparison',
        labelKey: t('core.navigation.sidebar.algorithms.items.nonComparison'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.nonComparisonSorts'),
        filter: { category: 'sorting', subcategory: 'non-comparison' },
      },
    ],
  },
  {
    id: 'searching',
    labelKey: t('core.navigation.sidebar.algorithms.groups.searching'),
    items: [
      {
        id: 'all-searching',
        labelKey: t('core.navigation.sidebar.algorithms.items.allSearching'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.searchAlgorithms'),
        filter: { category: 'searching' },
      },
      {
        id: 'array-search',
        labelKey: t('core.navigation.sidebar.algorithms.items.arraySearch'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.linearSearchAlgorithms'),
        filter: { category: 'searching', subcategory: 'array' },
      },
      {
        id: 'binary-search',
        labelKey: t('core.navigation.sidebar.algorithms.items.binarySearch'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.binarySearchAlgorithms'),
        filter: { category: 'searching', subcategory: 'binary' },
      },
    ],
  },
  {
    id: 'trees',
    labelKey: t('core.navigation.sidebar.algorithms.groups.trees'),
    items: [
      {
        id: 'all-tree-algorithms',
        labelKey: t('core.navigation.sidebar.algorithms.items.allTrees'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.treeAlgorithms'),
        filter: { category: 'trees' },
      },
      {
        id: 'tree-traversal',
        labelKey: t('core.navigation.sidebar.algorithms.items.treeTraversal'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.treeTraversalAlgorithms'),
        filter: { category: 'trees', subcategory: 'traversal' },
      },
    ],
  },
  {
    id: 'graphs',
    labelKey: t('core.navigation.sidebar.algorithms.groups.graphs'),
    items: [
      {
        id: 'all-graphs',
        labelKey: t('core.navigation.sidebar.algorithms.items.allGraphs'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.graphAlgorithms'),
        filter: { category: 'graphs' },
      },
      {
        id: 'pathfinding',
        labelKey: t('core.navigation.sidebar.algorithms.items.pathfinding'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.pathfindingAlgorithms'),
        filter: { category: 'graphs', subcategory: 'pathfinding' },
      },
      {
        id: 'traversal',
        labelKey: t('core.navigation.sidebar.algorithms.items.graphTraversal'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.graphTraversal'),
        filter: { category: 'graphs', subcategory: 'traversal' },
      },
      {
        id: 'mst',
        labelKey: t('core.navigation.sidebar.algorithms.items.mst'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.minimumSpanningTree'),
        filter: { category: 'graphs', subcategory: 'mst' },
      },
      {
        id: 'connectivity',
        labelKey: t('core.navigation.sidebar.algorithms.items.connectivity'),
        sectionTitleKey: t(
          'core.navigation.sidebar.algorithms.sections.graphConnectivityAlgorithms',
        ),
        filter: { category: 'graphs', subcategory: 'connectivity' },
      },
      {
        id: 'flow-matching',
        labelKey: t('core.navigation.sidebar.algorithms.items.flowMatching'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.flowAndMatchingAlgorithms'),
        filter: { category: 'graphs', subcategory: 'flow-matching' },
      },
      {
        id: 'advanced-graphs',
        labelKey: t('core.navigation.sidebar.algorithms.items.advancedGraphs'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.advancedGraphAlgorithms'),
        filter: { category: 'graphs', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'dp',
    labelKey: t('core.navigation.sidebar.algorithms.groups.dp'),
    items: [
      {
        id: 'all-dp',
        labelKey: t('core.navigation.sidebar.algorithms.items.allDp'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.dynamicProgramming'),
        filter: { category: 'dp' },
      },
      {
        id: 'classic',
        labelKey: t('core.navigation.sidebar.algorithms.items.classic'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.classicDpProblems'),
        filter: { category: 'dp', subcategory: 'classic' },
      },
      {
        id: 'dp-sequences',
        labelKey: t('core.navigation.sidebar.algorithms.items.dpSequences'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.sequenceDpProblems'),
        filter: { category: 'dp', subcategory: 'sequences' },
      },
      {
        id: 'dp-advanced',
        labelKey: t('core.navigation.sidebar.algorithms.items.dpAdvanced'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.advancedDpProblems'),
        filter: { category: 'dp', subcategory: 'advanced' },
      },
      {
        id: 'dp-optimization',
        labelKey: t('core.navigation.sidebar.algorithms.items.dpOptimization'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.dpOptimizationTechniques'),
        filter: { category: 'dp', subcategory: 'optimization' },
      },
    ],
  },
  {
    id: 'strings',
    labelKey: t('core.navigation.sidebar.algorithms.groups.strings'),
    items: [
      {
        id: 'all-strings',
        labelKey: t('core.navigation.sidebar.algorithms.items.allStrings'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.stringAlgorithms'),
        filter: { category: 'strings' },
      },
      {
        id: 'pattern-matching',
        labelKey: t('core.navigation.sidebar.algorithms.items.patternMatching'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.patternMatching'),
        filter: { category: 'strings', subcategory: 'pattern-matching' },
      },
      {
        id: 'suffix-palindromes',
        labelKey: t('core.navigation.sidebar.algorithms.items.suffixPalindromes'),
        sectionTitleKey: t(
          'core.navigation.sidebar.algorithms.sections.suffixAndPalindromeStructures',
        ),
        filter: { category: 'strings', subcategory: 'suffix-palindromes' },
      },
      {
        id: 'compression',
        labelKey: t('core.navigation.sidebar.algorithms.items.compression'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.compressionAndEncoding'),
        filter: { category: 'strings', subcategory: 'compression' },
      },
    ],
  },
  {
    id: 'geometry',
    labelKey: t('core.navigation.sidebar.algorithms.groups.geometry'),
    items: [
      {
        id: 'all-geometry',
        labelKey: t('core.navigation.sidebar.algorithms.items.allGeometry'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.computationalGeometry'),
        filter: { category: 'geometry' },
      },
      {
        id: 'geometry-computational',
        labelKey: t('core.navigation.sidebar.algorithms.items.geometryComputational'),
        sectionTitleKey: t(
          'core.navigation.sidebar.algorithms.sections.computationalGeometryAlgorithms',
        ),
        filter: { category: 'geometry', subcategory: 'computational' },
      },
      {
        id: 'geometry-advanced',
        labelKey: t('core.navigation.sidebar.algorithms.items.geometryAdvanced'),
        sectionTitleKey: t(
          'core.navigation.sidebar.algorithms.sections.advancedGeometryAlgorithms',
        ),
        filter: { category: 'geometry', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'misc',
    labelKey: t('core.navigation.sidebar.algorithms.groups.misc'),
    items: [
      {
        id: 'all-misc',
        labelKey: t('core.navigation.sidebar.algorithms.items.allMisc'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.otherAlgorithms'),
        filter: { category: 'misc' },
      },
      {
        id: 'math',
        labelKey: t('core.navigation.sidebar.algorithms.items.math'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.mathAlgorithms'),
        filter: { category: 'misc', subcategory: 'math' },
      },
      {
        id: 'array-techniques',
        labelKey: t('core.navigation.sidebar.algorithms.items.arrayTechniques'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.arrayTechniques'),
        filter: { category: 'misc', subcategory: 'array-techniques' },
      },
      {
        id: 'backtracking',
        labelKey: t('core.navigation.sidebar.algorithms.items.backtracking'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.backtrackingAlgorithms'),
        filter: { category: 'misc', subcategory: 'backtracking' },
      },
      {
        id: 'recursion',
        labelKey: t('core.navigation.sidebar.algorithms.items.recursion'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.recursionAndCallStack'),
        filter: { category: 'misc', subcategory: 'recursion' },
      },
      {
        id: 'game-theory',
        labelKey: t('core.navigation.sidebar.algorithms.items.gameTheory'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.gameTreeAlgorithms'),
        filter: { category: 'misc', subcategory: 'game-theory' },
      },
      {
        id: 'randomized',
        labelKey: t('core.navigation.sidebar.algorithms.items.randomized'),
        sectionTitleKey: t('core.navigation.sidebar.algorithms.sections.randomizedAlgorithms'),
        filter: { category: 'misc', subcategory: 'randomized' },
      },
    ],
  },
];

const STRUCTURES_SIDEBAR: readonly SidebarGroupDefinition[] = [
  {
    id: 'catalog',
    labelKey: t('core.navigation.sidebar.structures.groups.catalog'),
    items: [
      {
        id: 'all-structures',
        labelKey: t('core.navigation.sidebar.structures.items.allStructures'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.allStructures'),
        filter: {},
      },
    ],
  },
  {
    id: 'linear',
    labelKey: t('core.navigation.sidebar.structures.groups.linear'),
    items: [
      {
        id: 'all-linear',
        labelKey: t('core.navigation.sidebar.structures.items.allLinear'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.linearDataStructures'),
        filter: { category: 'linear' },
      },
      {
        id: 'stack-queue',
        labelKey: t('core.navigation.sidebar.structures.items.stackQueue'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.stackAndQueueStructures'),
        filter: { category: 'linear', subcategory: 'stack-queue' },
      },
      {
        id: 'linked-list',
        labelKey: t('core.navigation.sidebar.structures.items.linkedList'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.linkedListStructures'),
        filter: { category: 'linear', subcategory: 'linked-list' },
      },
    ],
  },
  {
    id: 'hashing',
    labelKey: t('core.navigation.sidebar.structures.groups.hashing'),
    items: [
      {
        id: 'all-hashing',
        labelKey: t('core.navigation.sidebar.structures.items.allHashing'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.hashingStructures'),
        filter: { category: 'hashing' },
      },
      {
        id: 'hash-table',
        labelKey: t('core.navigation.sidebar.structures.items.hashTable'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.hashTableStructures'),
        filter: { category: 'hashing', subcategory: 'hash-table' },
      },
      {
        id: 'probabilistic',
        labelKey: t('core.navigation.sidebar.structures.items.probabilistic'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.probabilisticStructures'),
        filter: { category: 'hashing', subcategory: 'probabilistic' },
      },
      {
        id: 'distributed',
        labelKey: t('core.navigation.sidebar.structures.items.distributed'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.distributedHashing'),
        filter: { category: 'hashing', subcategory: 'distributed' },
      },
    ],
  },
  {
    id: 'trees',
    labelKey: t('core.navigation.sidebar.structures.groups.trees'),
    items: [
      {
        id: 'all-structures-trees',
        labelKey: t('core.navigation.sidebar.structures.items.allTrees'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.treeDataStructures'),
        filter: { category: 'trees' },
      },
      {
        id: 'search-trees',
        labelKey: t('core.navigation.sidebar.structures.items.searchTrees'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.searchTreeStructures'),
        filter: { category: 'trees', subcategory: 'search' },
      },
      {
        id: 'heaps',
        labelKey: t('core.navigation.sidebar.structures.items.heaps'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.heapStructures'),
        filter: { category: 'trees', subcategory: 'heaps' },
      },
      {
        id: 'prefix-suffix',
        labelKey: t('core.navigation.sidebar.structures.items.prefixSuffix'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.prefixAndSuffixTrees'),
        filter: { category: 'trees', subcategory: 'prefix-suffix' },
      },
      {
        id: 'range',
        labelKey: t('core.navigation.sidebar.structures.items.range'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.rangeQueryStructures'),
        filter: { category: 'trees', subcategory: 'range' },
      },
      {
        id: 'advanced-trees',
        labelKey: t('core.navigation.sidebar.structures.items.advancedTrees'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.advancedTreeStructures'),
        filter: { category: 'trees', subcategory: 'advanced' },
      },
    ],
  },
  {
    id: 'specialized',
    labelKey: t('core.navigation.sidebar.structures.groups.specialized'),
    items: [
      {
        id: 'all-specialized',
        labelKey: t('core.navigation.sidebar.structures.items.allSpecialized'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.specializedDataStructures'),
        filter: { category: 'specialized' },
      },
      {
        id: 'ordered',
        labelKey: t('core.navigation.sidebar.structures.items.ordered'),
        sectionTitleKey: t(
          'core.navigation.sidebar.structures.sections.orderedRandomizedStructures',
        ),
        filter: { category: 'specialized', subcategory: 'ordered' },
      },
      {
        id: 'set-union',
        labelKey: t('core.navigation.sidebar.structures.items.setUnion'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.disjointSetStructures'),
        filter: { category: 'specialized', subcategory: 'set-union' },
      },
      {
        id: 'spatial',
        labelKey: t('core.navigation.sidebar.structures.items.spatial'),
        sectionTitleKey: t('core.navigation.sidebar.structures.sections.spatialIndexingStructures'),
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
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly tabs: Signal<readonly NavTab[]> = computed(() => {
    this.language.activeLang();
    return NAV_TABS.map((tab) => ({
      id: tab.id,
      label: this.transloco.translate(tab.labelKey),
      path: tab.path,
    }));
  });

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
  readonly activeItemKey: Signal<string> = computed(
    () => this.activeItemState()[this.activeTabId()],
  );

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
        this.findItemByKey(groups, DEFAULT_ACTIVE_ITEM_KEY[tabId]) ?? this.firstItemKey(groups);
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
    this.language.activeLang();

    return definitions.map((group) => ({
      id: group.id,
      label: this.transloco.translate(group.labelKey),
      items: group.items.map((item) => ({
        id: item.id,
        label: this.transloco.translate(item.labelKey),
        count: countByFilter(item.filter),
        sectionTitle: this.transloco.translate(item.sectionTitleKey),
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
