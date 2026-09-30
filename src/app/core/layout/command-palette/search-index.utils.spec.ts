import { describe, expect, it } from 'vitest';

import { Difficulty } from '../../../features/algorithms/models/algorithm';
import { SearchEntry, cycleIndex, defaultEntries, normalizeSearchText, searchEntries } from './search-index.utils';

const entry = (id: string, name: string, extra: Partial<SearchEntry> = {}): SearchEntry => ({
  id, name, moduleId: 'MOD-01', categoryId: 'misc', subcategoryId: 'math', categoryLabel: 'Inne', subcategoryLabel: 'Matematyka', traits: [], difficulty: Difficulty.Easy, ...extra,
});

const entries: readonly SearchEntry[] = [
  entry('bubble-sort', 'Bubble Sort', { moduleId: 'SRT-01', categoryId: 'sorting', categoryLabel: 'Sortowanie', subcategoryLabel: 'Porównawcze' }),
  entry('bfs', 'BFS', { moduleId: 'GRF-01', categoryId: 'graphs', categoryLabel: 'Grafy', subcategoryLabel: 'Przechodzenie' }),
  entry('dijkstra', 'Dijkstra', { moduleId: 'GRF-03', categoryId: 'graphs', categoryLabel: 'Grafy', subcategoryLabel: 'Wyznaczanie ścieżek', traits: ['greedy', 'zachłanny', 'shortest-path'] }),
  entry('sieve-of-eratosthenes', 'Sieve of Eratosthenes'),
];

describe('normalizeSearchText', () => {
  it('lowercases, strips diacritics and collapses whitespace', () => {
    expect(normalizeSearchText('  Wyznaczanie   ŚCIEŻEK ')).toBe('wyznaczanie sciezek');
  });
});

describe('searchEntries', () => {
  it('ranks a name prefix above a substring and a substring above a category match', () => {
    expect(searchEntries(entries, 'b').map((hit) => hit.id)).toEqual(['bubble-sort', 'bfs']);
    expect(searchEntries(entries, 'sort')[0].id).toBe('bubble-sort');
  });

  it('matches category labels regardless of case and diacritics', () => {
    expect(searchEntries(entries, 'GRAFY').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
    expect(searchEntries(entries, 'gráfy').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
    expect(searchEntries(entries, 'sciezek').map((hit) => hit.id)).toEqual(['dijkstra']);
  });

  it('matches traits and module ids', () => {
    expect(searchEntries(entries, 'greedy').map((hit) => hit.id)).toEqual(['dijkstra']);
    expect(searchEntries(entries, 'grf-0').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
  });

  it('matches a subsequence of the name only for queries of three or more characters', () => {
    expect(searchEntries(entries, 'bblsrt').map((hit) => hit.id)).toEqual(['bubble-sort']);
    expect(searchEntries(entries, 'bs')).toEqual([]);
  });

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchEntries(entries, '   ')).toEqual([]);
    expect(searchEntries(entries, 's', 1)).toHaveLength(1);
  });
});

describe('defaultEntries', () => {
  it('lists recent modules first, then the catalog order, without duplicates', () => {
    expect(defaultEntries(entries, ['dijkstra', 'missing'], 3).map((hit) => hit.id)).toEqual(['dijkstra', 'bubble-sort', 'bfs']);
  });
});

describe('cycleIndex', () => {
  it('wraps around both ends and handles an empty list', () => {
    expect(cycleIndex(3, 2, 1)).toBe(0);
    expect(cycleIndex(3, 0, -1)).toBe(2);
    expect(cycleIndex(3, -1, 1)).toBe(0);
    expect(cycleIndex(0, -1, 1)).toBe(-1);
  });
});
