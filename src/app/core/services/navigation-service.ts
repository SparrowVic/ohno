import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { filter, map } from 'rxjs';

import { AppLanguageService } from '../i18n/app-language.service';
import { SidebarFilter, SidebarGroup, SidebarItem } from '../models/navigation';
import { AlgorithmRegistry } from '../../features/algorithms/registry/algorithm-registry/algorithm-registry';


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

const DEFAULT_ACTIVE_ITEM_KEY = 'overview:all-algorithms';
const BASE_PATH = '/algorithms';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly algorithms = inject(AlgorithmRegistry);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly sidebarGroups: Signal<readonly SidebarGroup[]> = computed(() => {
    this.language.activeLang();
    return ALGORITHMS_SIDEBAR.map((group) => ({
      id: group.id,
      label: this.transloco.translate(group.labelKey),
      items: group.items.map((item) => ({
        id: item.id,
        label: this.transloco.translate(item.labelKey),
        count: this.algorithms.count(item.filter),
        sectionTitle: this.transloco.translate(item.sectionTitleKey),
        filter: item.filter,
      })),
    }));
  });

  private readonly activeItemState = signal(DEFAULT_ACTIVE_ITEM_KEY);
  readonly activeItemKey: Signal<string> = this.activeItemState.asReadonly();
  readonly activeGroupId: Signal<string> = computed(() => this.activeItemKey().split(':')[0]);

  readonly activeItem: Signal<SidebarItem | null> = computed(
    () => this.getItemByKey(this.sidebarGroups(), this.activeItemKey()),
  );

  constructor() {
    effect(() => {
      const groups = this.sidebarGroups();
      const routedKey = this.findItemKeyByRoute(groups, this.currentUrl());
      if (routedKey) {
        this.activeItemState.set(routedKey);
        return;
      }
      if (this.getItemByKey(groups, this.activeItemKey())) return;
      this.activeItemState.set(DEFAULT_ACTIVE_ITEM_KEY);
    });
  }

  setActiveItem(groupId: string, itemId: string): void {
    const key = `${groupId}:${itemId}`;
    const item = this.getItemByKey(this.sidebarGroups(), key);
    if (!item) return;
    this.activeItemState.set(key);
    void this.router.navigate([BASE_PATH], { queryParams: this.filterToQueryParams(item.filter) });
  }

  private getItemByKey(groups: readonly SidebarGroup[], key: string): SidebarItem | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (`${group.id}:${item.id}` === key) return item;
      }
    }
    return null;
  }

  private findItemKeyByRoute(groups: readonly SidebarGroup[], url: string): string | null {
    const routeFilter = this.getFilterFromUrl(url);
    if (!routeFilter) return null;
    return this.findItemKeyByFilter(groups, routeFilter);
  }

  private getFilterFromUrl(url: string): SidebarFilter | null {
    const parsed = this.router.parseUrl(url);
    const segments = parsed.root.children['primary']?.segments.map((segment) => segment.path) ?? [];
    if (segments.length !== 1 || segments[0] !== 'algorithms') return null;
    const category = parsed.queryParams['category'];
    const subcategory = parsed.queryParams['subcategory'];
    return {
      category: typeof category === 'string' && category.length > 0 ? category : undefined,
      subcategory: typeof subcategory === 'string' && subcategory.length > 0 ? subcategory : undefined,
    };
  }

  private findItemKeyByFilter(groups: readonly SidebarGroup[], filterValue: SidebarFilter): string | null {
    const exactKey = this.findMatchingItemKey(groups, filterValue);
    if (exactKey) return exactKey;
    if (filterValue.category && filterValue.subcategory) {
      return this.findMatchingItemKey(groups, { category: filterValue.category });
    }
    return this.findMatchingItemKey(groups, {});
  }

  private findMatchingItemKey(groups: readonly SidebarGroup[], filterValue: SidebarFilter): string | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.filter.category === filterValue.category && item.filter.subcategory === filterValue.subcategory) {
          return `${group.id}:${item.id}`;
        }
      }
    }
    return null;
  }

  private filterToQueryParams(filterValue: SidebarFilter): Record<string, string> {
    const queryParams: Record<string, string> = {};
    if (filterValue.category) queryParams['category'] = filterValue.category;
    if (filterValue.subcategory) queryParams['subcategory'] = filterValue.subcategory;
    return queryParams;
  }
}
