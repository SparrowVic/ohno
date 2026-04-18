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
}

export interface AlgorithmTraitGroupDefinition {
  readonly id: AlgorithmTraitGroupId;
  readonly label: string;
  readonly labelPl: string;
}

export const ALGORITHM_TRAIT_GROUPS: readonly AlgorithmTraitGroupDefinition[] = [
  { id: 'properties', label: 'Properties', labelPl: 'Własności' },
  { id: 'paradigms', label: 'Paradigms', labelPl: 'Paradygmaty' },
  { id: 'structures', label: 'Structures', labelPl: 'Struktury' },
  { id: 'domains', label: 'Problem types', labelPl: 'Typy problemów' },
];

export const ALGORITHM_TRAITS: readonly AlgorithmTraitDefinition[] = [
  { id: 'stable', group: 'properties', label: 'Stable', labelPl: 'Stable' },
  { id: 'in-place', group: 'properties', label: 'In-place', labelPl: 'In-place' },
  { id: 'online', group: 'properties', label: 'Online', labelPl: 'Online' },
  {
    id: 'probabilistic',
    group: 'properties',
    label: 'Probabilistic',
    labelPl: 'Probabilistyczne',
  },
  { id: 'greedy', group: 'paradigms', label: 'Greedy', labelPl: 'Greedy' },
  {
    id: 'divide-and-conquer',
    group: 'paradigms',
    label: 'Divide & conquer',
    labelPl: 'Dziel i zwyciężaj',
  },
  {
    id: 'dynamic-programming',
    group: 'paradigms',
    label: 'Dynamic programming',
    labelPl: 'Programowanie dynamiczne',
  },
  {
    id: 'backtracking',
    group: 'paradigms',
    label: 'Backtracking',
    labelPl: 'Backtracking',
  },
  { id: 'randomized', group: 'paradigms', label: 'Randomized', labelPl: 'Losowe' },
  { id: 'heap', group: 'structures', label: 'Heap', labelPl: 'Kopiec' },
  { id: 'trie', group: 'structures', label: 'Trie', labelPl: 'Trie' },
  { id: 'dsu', group: 'structures', label: 'DSU', labelPl: 'DSU' },
  {
    id: 'priority-queue',
    group: 'structures',
    label: 'Priority queue',
    labelPl: 'Kolejka priorytetowa',
  },
  { id: 'bitmask', group: 'structures', label: 'Bitmask', labelPl: 'Bitmask' },
  {
    id: 'shortest-path',
    group: 'domains',
    label: 'Shortest path',
    labelPl: 'Najkrótsza ścieżka',
  },
  { id: 'matching', group: 'domains', label: 'Matching', labelPl: 'Matching' },
  { id: 'mst', group: 'domains', label: 'MST', labelPl: 'MST' },
  { id: 'compression', group: 'domains', label: 'Compression', labelPl: 'Kompresja' },
  { id: 'palindromes', group: 'domains', label: 'Palindromes', labelPl: 'Palindromy' },
  {
    id: 'number-theory',
    group: 'domains',
    label: 'Number theory',
    labelPl: 'Teoria liczb',
  },
  { id: 'geometry', group: 'domains', label: 'Geometry', labelPl: 'Geometria' },
];

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/\s+/g, ' ')
    .trim();

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

  if (
    hasAny('number theory', 'modular', 'gcd', 'lcm', 'prime', 'totient', 'crt', 'diophantine')
  ) {
    traits.add('number-theory');
  }

  if (algorithm.category === 'geometry' || hasAny('geometry', 'hull', 'triangulation')) {
    traits.add('geometry');
  }

  return [...traits];
}
