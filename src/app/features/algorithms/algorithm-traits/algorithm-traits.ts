import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AlgorithmItem } from '../models/algorithm';

export type AlgorithmTraitGroupId = 'properties' | 'paradigms' | 'structures' | 'domains';

export type AlgorithmTraitId =
  | 'stable'
  | 'in-place'
  | 'online'
  | 'probabilistic'
  | 'greedy'
  | 'divide-and-conquer'
  | 'dynamic-programming'
  | 'backtracking'
  | 'randomized'
  | 'heap'
  | 'trie'
  | 'dsu'
  | 'priority-queue'
  | 'bitmask'
  | 'shortest-path'
  | 'matching'
  | 'mst'
  | 'compression'
  | 'palindromes'
  | 'number-theory'
  | 'geometry';

export interface AlgorithmTraitDefinition {
  readonly id: AlgorithmTraitId;
  readonly group: AlgorithmTraitGroupId;
  readonly label: string;
  readonly labelPl: string;
  readonly labelKey: string;
}

export interface AlgorithmTraitGroupDefinition {
  readonly id: AlgorithmTraitGroupId;
  readonly label: string;
  readonly labelPl: string;
  readonly labelKey: string;
}

export const ALGORITHM_TRAIT_GROUPS: readonly AlgorithmTraitGroupDefinition[] = [
  {
    id: 'properties',
    label: 'Properties',
    labelPl: 'Własności',
    labelKey: t('features.algorithms.traits.groups.properties'),
  },
  {
    id: 'paradigms',
    label: 'Paradigms',
    labelPl: 'Paradygmaty',
    labelKey: t('features.algorithms.traits.groups.paradigms'),
  },
  {
    id: 'structures',
    label: 'Structures',
    labelPl: 'Struktury',
    labelKey: t('features.algorithms.traits.groups.structures'),
  },
  {
    id: 'domains',
    label: 'Problem types',
    labelPl: 'Typy problemów',
    labelKey: t('features.algorithms.traits.groups.domains'),
  },
];

export const ALGORITHM_TRAITS: readonly AlgorithmTraitDefinition[] = [
  {
    id: 'stable',
    group: 'properties',
    label: 'Stable',
    labelPl: 'Stable',
    labelKey: t('features.algorithms.traits.items.stable'),
  },
  {
    id: 'in-place',
    group: 'properties',
    label: 'In-place',
    labelPl: 'In-place',
    labelKey: t('features.algorithms.traits.items.inPlace'),
  },
  {
    id: 'online',
    group: 'properties',
    label: 'Online',
    labelPl: 'Online',
    labelKey: t('features.algorithms.traits.items.online'),
  },
  {
    id: 'probabilistic',
    group: 'properties',
    label: 'Probabilistic',
    labelPl: 'Probabilistyczne',
    labelKey: t('features.algorithms.traits.items.probabilistic'),
  },
  {
    id: 'greedy',
    group: 'paradigms',
    label: 'Greedy',
    labelPl: 'Greedy',
    labelKey: t('features.algorithms.traits.items.greedy'),
  },
  {
    id: 'divide-and-conquer',
    group: 'paradigms',
    label: 'Divide & conquer',
    labelPl: 'Dziel i zwyciężaj',
    labelKey: t('features.algorithms.traits.items.divideAndConquer'),
  },
  {
    id: 'dynamic-programming',
    group: 'paradigms',
    label: 'Dynamic programming',
    labelPl: 'Programowanie dynamiczne',
    labelKey: t('features.algorithms.traits.items.dynamicProgramming'),
  },
  {
    id: 'backtracking',
    group: 'paradigms',
    label: 'Backtracking',
    labelPl: 'Backtracking',
    labelKey: t('features.algorithms.traits.items.backtracking'),
  },
  {
    id: 'randomized',
    group: 'paradigms',
    label: 'Randomized',
    labelPl: 'Losowe',
    labelKey: t('features.algorithms.traits.items.randomized'),
  },
  {
    id: 'heap',
    group: 'structures',
    label: 'Heap',
    labelPl: 'Kopiec',
    labelKey: t('features.algorithms.traits.items.heap'),
  },
  {
    id: 'trie',
    group: 'structures',
    label: 'Trie',
    labelPl: 'Trie',
    labelKey: t('features.algorithms.traits.items.trie'),
  },
  {
    id: 'dsu',
    group: 'structures',
    label: 'DSU',
    labelPl: 'DSU',
    labelKey: t('features.algorithms.traits.items.dsu'),
  },
  {
    id: 'priority-queue',
    group: 'structures',
    label: 'Priority queue',
    labelPl: 'Kolejka priorytetowa',
    labelKey: t('features.algorithms.traits.items.priorityQueue'),
  },
  {
    id: 'bitmask',
    group: 'structures',
    label: 'Bitmask',
    labelPl: 'Bitmask',
    labelKey: t('features.algorithms.traits.items.bitmask'),
  },
  {
    id: 'shortest-path',
    group: 'domains',
    label: 'Shortest path',
    labelPl: 'Najkrótsza ścieżka',
    labelKey: t('features.algorithms.traits.items.shortestPath'),
  },
  {
    id: 'matching',
    group: 'domains',
    label: 'Matching',
    labelPl: 'Matching',
    labelKey: t('features.algorithms.traits.items.matching'),
  },
  {
    id: 'mst',
    group: 'domains',
    label: 'MST',
    labelPl: 'MST',
    labelKey: t('features.algorithms.traits.items.mst'),
  },
  {
    id: 'compression',
    group: 'domains',
    label: 'Compression',
    labelPl: 'Kompresja',
    labelKey: t('features.algorithms.traits.items.compression'),
  },
  {
    id: 'palindromes',
    group: 'domains',
    label: 'Palindromes',
    labelPl: 'Palindromy',
    labelKey: t('features.algorithms.traits.items.palindromes'),
  },
  {
    id: 'number-theory',
    group: 'domains',
    label: 'Number theory',
    labelPl: 'Teoria liczb',
    labelKey: t('features.algorithms.traits.items.numberTheory'),
  },
  {
    id: 'geometry',
    group: 'domains',
    label: 'Geometry',
    labelPl: 'Geometria',
    labelKey: t('features.algorithms.traits.items.geometry'),
  },
];

const normalizeText = (value: string): string =>
  value.toLowerCase().replaceAll('&', 'and').replace(/\s+/g, ' ').trim();

export function deriveAlgorithmTraits(algorithm: AlgorithmItem): readonly AlgorithmTraitId[] {
  const haystack = normalizeText(
    [
      algorithm.name,
      algorithm.description,
      algorithm.category,
      algorithm.subcategory,
      ...algorithm.tags,
    ].join(' | '),
  );

  const hasAny = (...needles: readonly string[]): boolean =>
    needles.some((needle) => haystack.includes(normalizeText(needle)));

  const traits = new Set<AlgorithmTraitId>();

  if (algorithm.stable || hasAny('stable')) {
    traits.add('stable');
  }

  if (algorithm.inPlace || hasAny('in-place', 'in place')) {
    traits.add('in-place');
  }

  if (hasAny('online')) {
    traits.add('online');
  }

  if (hasAny('probabilistic', 'monte carlo', 'las vegas')) {
    traits.add('probabilistic');
  }

  if (hasAny('greedy')) {
    traits.add('greedy');
  }

  if (hasAny('divide and conquer')) {
    traits.add('divide-and-conquer');
  }

  if (
    algorithm.category === 'dp' ||
    hasAny('dp', 'dp table', 'memoization', 'tabulation', 'interval dp', 'tree dp')
  ) {
    traits.add('dynamic-programming');
  }

  if (hasAny('backtracking')) {
    traits.add('backtracking');
  }

  if (hasAny('randomized', 'randomised', 'probabilistic')) {
    traits.add('randomized');
  }

  if (hasAny('heap')) {
    traits.add('heap');
  }

  if (hasAny('trie')) {
    traits.add('trie');
  }

  if (hasAny('dsu', 'union-find', 'union find')) {
    traits.add('dsu');
  }

  if (hasAny('priority queue')) {
    traits.add('priority-queue');
  }

  if (hasAny('bitmask')) {
    traits.add('bitmask');
  }

  if (
    hasAny('shortest path', 'all-pairs', 'all pairs') ||
    (algorithm.category === 'graphs' && algorithm.subcategory === 'pathfinding')
  ) {
    traits.add('shortest-path');
  }

  if (hasAny('matching') || algorithm.subcategory === 'flow-matching') {
    traits.add('matching');
  }

  if (hasAny('mst') || algorithm.subcategory === 'mst') {
    traits.add('mst');
  }

  if (hasAny('compression') || algorithm.subcategory === 'compression') {
    traits.add('compression');
  }

  if (hasAny('palindrome', 'palindromes') || algorithm.subcategory === 'suffix-palindromes') {
    traits.add('palindromes');
  }

  if (hasAny('number theory', 'modular', 'gcd', 'lcm', 'prime', 'totient', 'crt', 'diophantine')) {
    traits.add('number-theory');
  }

  if (algorithm.category === 'geometry' || hasAny('geometry', 'hull', 'triangulation')) {
    traits.add('geometry');
  }

  return [...traits];
}
