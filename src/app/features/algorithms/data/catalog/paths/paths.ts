import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface CatalogPath {
  readonly groupId: string;
  readonly titleKey: string;
  readonly steps: readonly string[];
}

export const CATALOG_PATHS: readonly CatalogPath[] = [
  {
    groupId: 'overview',
    titleKey: t('features.algorithms.catalog.path.titles.overview'),
    steps: ['bubble-sort', 'binary-search', 'bfs', 'fibonacci-dp'],
  },
  {
    groupId: 'sorting',
    titleKey: t('features.algorithms.catalog.path.titles.sorting'),
    steps: ['bubble-sort', 'insertion-sort', 'merge-sort', 'quick-sort'],
  },
  {
    groupId: 'searching',
    titleKey: t('features.algorithms.catalog.path.titles.searching'),
    steps: ['linear-search', 'binary-search', 'binary-search-variants'],
  },
  {
    groupId: 'trees',
    titleKey: t('features.algorithms.catalog.path.titles.trees'),
    steps: ['tree-traversals', 'dfs', 'bfs', 'dp-on-trees'],
  },
  {
    groupId: 'graphs',
    titleKey: t('features.algorithms.catalog.path.titles.graphs'),
    steps: ['bfs', 'dfs', 'dijkstra', 'prims-mst'],
  },
  {
    groupId: 'dp',
    titleKey: t('features.algorithms.catalog.path.titles.dp'),
    steps: ['climbing-stairs', 'fibonacci-dp', 'coin-change', 'knapsack-01'],
  },
  {
    groupId: 'strings',
    titleKey: t('features.algorithms.catalog.path.titles.strings'),
    steps: ['run-length-encoding', 'kmp-pattern-matching', 'rabin-karp', 'manacher'],
  },
  {
    groupId: 'geometry',
    titleKey: t('features.algorithms.catalog.path.titles.geometry'),
    steps: ['line-intersection', 'convex-hull', 'closest-pair-of-points', 'sweep-line'],
  },
  {
    groupId: 'misc',
    titleKey: t('features.algorithms.catalog.path.titles.misc'),
    steps: ['euclidean-gcd', 'factorial', 'sieve-of-eratosthenes', 'two-pointers'],
  },
];

export function pathForGroup(groupId: string): CatalogPath {
  return CATALOG_PATHS.find((path) => path.groupId === groupId) ?? CATALOG_PATHS[0];
}
