import { marker as t } from '@jsverse/transloco-keys-manager/marker';

const ALGORITHM_CATEGORY_LABEL_KEYS: Record<string, string> = {
  sorting: t('catalog.algorithms.categories.sorting'),
  searching: t('catalog.algorithms.categories.searching'),
  trees: t('catalog.algorithms.categories.trees'),
  graphs: t('catalog.algorithms.categories.graphs'),
  dp: t('catalog.algorithms.categories.dp'),
  strings: t('catalog.algorithms.categories.strings'),
  geometry: t('catalog.algorithms.categories.geometry'),
  misc: t('catalog.algorithms.categories.misc'),
};

const ALGORITHM_SUBCATEGORY_LABEL_KEYS: Record<string, string> = {
  comparison: t('catalog.algorithms.subcategories.comparison'),
  'non-comparison': t('catalog.algorithms.subcategories.nonComparison'),
  array: t('catalog.algorithms.subcategories.array'),
  binary: t('catalog.algorithms.subcategories.binary'),
  traversal: t('catalog.algorithms.subcategories.traversal'),
  pathfinding: t('catalog.algorithms.subcategories.pathfinding'),
  mst: t('catalog.algorithms.subcategories.mst'),
  connectivity: t('catalog.algorithms.subcategories.connectivity'),
  'flow-matching': t('catalog.algorithms.subcategories.flowMatching'),
  advanced: t('catalog.algorithms.subcategories.advanced'),
  classic: t('catalog.algorithms.subcategories.classic'),
  sequences: t('catalog.algorithms.subcategories.sequences'),
  optimization: t('catalog.algorithms.subcategories.optimization'),
  'pattern-matching': t('catalog.algorithms.subcategories.patternMatching'),
  'suffix-palindromes': t('catalog.algorithms.subcategories.suffixPalindromes'),
  compression: t('catalog.algorithms.subcategories.compression'),
  computational: t('catalog.algorithms.subcategories.computational'),
  math: t('catalog.algorithms.subcategories.math'),
  'array-techniques': t('catalog.algorithms.subcategories.arrayTechniques'),
  backtracking: t('catalog.algorithms.subcategories.backtracking'),
  recursion: t('catalog.algorithms.subcategories.recursion'),
  'game-theory': t('catalog.algorithms.subcategories.gameTheory'),
  randomized: t('catalog.algorithms.subcategories.randomized'),
};

const STRUCTURE_CATEGORY_LABEL_KEYS: Record<string, string> = {
  linear: t('catalog.structures.categories.linear'),
  hashing: t('catalog.structures.categories.hashing'),
  trees: t('catalog.structures.categories.trees'),
  specialized: t('catalog.structures.categories.specialized'),
};

const STRUCTURE_SUBCATEGORY_LABEL_KEYS: Record<string, string> = {
  'stack-queue': t('catalog.structures.subcategories.stackQueue'),
  'linked-list': t('catalog.structures.subcategories.linkedList'),
  'hash-table': t('catalog.structures.subcategories.hashTable'),
  probabilistic: t('catalog.structures.subcategories.probabilistic'),
  distributed: t('catalog.structures.subcategories.distributed'),
  search: t('catalog.structures.subcategories.search'),
  heaps: t('catalog.structures.subcategories.heaps'),
  'prefix-suffix': t('catalog.structures.subcategories.prefixSuffix'),
  range: t('catalog.structures.subcategories.range'),
  advanced: t('catalog.structures.subcategories.advanced'),
  ordered: t('catalog.structures.subcategories.ordered'),
  'set-union': t('catalog.structures.subcategories.setUnion'),
  spatial: t('catalog.structures.subcategories.spatial'),
};

export function getAlgorithmFacetLabelKey(facet: string): string | null {
  return ALGORITHM_SUBCATEGORY_LABEL_KEYS[facet] ?? ALGORITHM_CATEGORY_LABEL_KEYS[facet] ?? null;
}

export function getStructureFacetLabelKey(facet: string): string | null {
  return STRUCTURE_SUBCATEGORY_LABEL_KEYS[facet] ?? STRUCTURE_CATEGORY_LABEL_KEYS[facet] ?? null;
}
