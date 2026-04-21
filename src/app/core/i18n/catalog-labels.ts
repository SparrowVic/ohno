import { I18N_KEY, I18nKey } from './i18n-keys';

const ALGORITHM_CATEGORY_LABEL_KEYS: Record<string, I18nKey> = {
  sorting: I18N_KEY.catalog.algorithms.categories.sorting,
  searching: I18N_KEY.catalog.algorithms.categories.searching,
  trees: I18N_KEY.catalog.algorithms.categories.trees,
  graphs: I18N_KEY.catalog.algorithms.categories.graphs,
  dp: I18N_KEY.catalog.algorithms.categories.dp,
  strings: I18N_KEY.catalog.algorithms.categories.strings,
  geometry: I18N_KEY.catalog.algorithms.categories.geometry,
  misc: I18N_KEY.catalog.algorithms.categories.misc,
};

const ALGORITHM_SUBCATEGORY_LABEL_KEYS: Record<string, I18nKey> = {
  comparison: I18N_KEY.catalog.algorithms.subcategories.comparison,
  'non-comparison': I18N_KEY.catalog.algorithms.subcategories.nonComparison,
  array: I18N_KEY.catalog.algorithms.subcategories.array,
  binary: I18N_KEY.catalog.algorithms.subcategories.binary,
  traversal: I18N_KEY.catalog.algorithms.subcategories.traversal,
  pathfinding: I18N_KEY.catalog.algorithms.subcategories.pathfinding,
  mst: I18N_KEY.catalog.algorithms.subcategories.mst,
  connectivity: I18N_KEY.catalog.algorithms.subcategories.connectivity,
  'flow-matching': I18N_KEY.catalog.algorithms.subcategories.flowMatching,
  advanced: I18N_KEY.catalog.algorithms.subcategories.advanced,
  classic: I18N_KEY.catalog.algorithms.subcategories.classic,
  sequences: I18N_KEY.catalog.algorithms.subcategories.sequences,
  optimization: I18N_KEY.catalog.algorithms.subcategories.optimization,
  'pattern-matching': I18N_KEY.catalog.algorithms.subcategories.patternMatching,
  'suffix-palindromes': I18N_KEY.catalog.algorithms.subcategories.suffixPalindromes,
  compression: I18N_KEY.catalog.algorithms.subcategories.compression,
  computational: I18N_KEY.catalog.algorithms.subcategories.computational,
  math: I18N_KEY.catalog.algorithms.subcategories.math,
  'array-techniques': I18N_KEY.catalog.algorithms.subcategories.arrayTechniques,
  backtracking: I18N_KEY.catalog.algorithms.subcategories.backtracking,
  recursion: I18N_KEY.catalog.algorithms.subcategories.recursion,
  'game-theory': I18N_KEY.catalog.algorithms.subcategories.gameTheory,
  randomized: I18N_KEY.catalog.algorithms.subcategories.randomized,
};

const STRUCTURE_CATEGORY_LABEL_KEYS: Record<string, I18nKey> = {
  linear: I18N_KEY.catalog.structures.categories.linear,
  hashing: I18N_KEY.catalog.structures.categories.hashing,
  trees: I18N_KEY.catalog.structures.categories.trees,
  specialized: I18N_KEY.catalog.structures.categories.specialized,
};

const STRUCTURE_SUBCATEGORY_LABEL_KEYS: Record<string, I18nKey> = {
  'stack-queue': I18N_KEY.catalog.structures.subcategories.stackQueue,
  'linked-list': I18N_KEY.catalog.structures.subcategories.linkedList,
  'hash-table': I18N_KEY.catalog.structures.subcategories.hashTable,
  probabilistic: I18N_KEY.catalog.structures.subcategories.probabilistic,
  distributed: I18N_KEY.catalog.structures.subcategories.distributed,
  search: I18N_KEY.catalog.structures.subcategories.search,
  heaps: I18N_KEY.catalog.structures.subcategories.heaps,
  'prefix-suffix': I18N_KEY.catalog.structures.subcategories.prefixSuffix,
  range: I18N_KEY.catalog.structures.subcategories.range,
  advanced: I18N_KEY.catalog.structures.subcategories.advanced,
  ordered: I18N_KEY.catalog.structures.subcategories.ordered,
  'set-union': I18N_KEY.catalog.structures.subcategories.setUnion,
  spatial: I18N_KEY.catalog.structures.subcategories.spatial,
};

export function getAlgorithmFacetLabelKey(facet: string): I18nKey | null {
  return ALGORITHM_SUBCATEGORY_LABEL_KEYS[facet] ?? ALGORITHM_CATEGORY_LABEL_KEYS[facet] ?? null;
}

export function getStructureFacetLabelKey(facet: string): I18nKey | null {
  return STRUCTURE_SUBCATEGORY_LABEL_KEYS[facet] ?? STRUCTURE_CATEGORY_LABEL_KEYS[facet] ?? null;
}
