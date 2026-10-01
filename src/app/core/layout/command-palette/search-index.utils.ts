import { Difficulty } from '../../../features/algorithms/models/algorithm';

export interface SearchEntry {
  readonly id: string;
  readonly name: string;
  readonly moduleId: string;
  readonly categoryId: string;
  readonly subcategoryId: string;
  readonly categoryLabel: string;
  readonly subcategoryLabel: string;
  readonly traits: readonly string[];
  readonly difficulty: Difficulty;
}

const SUBSEQUENCE_MIN_LENGTH = 3;

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreEntry(entry: SearchEntry, query: string): number {
  const q = normalizeSearchText(query);
  if (q.length === 0) return 0;
  const name = normalizeSearchText(entry.name);
  if (name.startsWith(q)) return 100;
  if (name.split(' ').some((word) => word.startsWith(q))) return 80;
  if (name.includes(q)) return 60;
  if (normalizeSearchText(entry.moduleId).includes(q)) return 50;
  const facets = [entry.categoryLabel, entry.subcategoryLabel, entry.categoryId, entry.subcategoryId];
  if (facets.some((facet) => normalizeSearchText(facet).includes(q))) return 30;
  if (entry.traits.some((trait) => normalizeSearchText(trait).includes(q))) return 25;
  if (q.length >= SUBSEQUENCE_MIN_LENGTH && isSubsequence(q.replace(/ /g, ''), name)) return 15;
  return 0;
}

export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  limit = 8,
): readonly SearchEntry[] {
  if (normalizeSearchText(query).length === 0) return [];
  return entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((hit) => hit.entry);
}

export function defaultEntries(
  entries: readonly SearchEntry[],
  recentIds: readonly string[],
  limit = 8,
): readonly SearchEntry[] {
  const recent = recentIds
    .map((id) => entries.find((entry) => entry.id === id))
    .filter((entry): entry is SearchEntry => entry !== undefined);
  const rest = entries.filter((entry) => !recent.includes(entry));
  return [...recent, ...rest].slice(0, limit);
}

export function cycleIndex(count: number, current: number, direction: -1 | 1): number {
  if (count === 0) return -1;
  if (current < 0) return direction === 1 ? 0 : count - 1;
  return (current + direction + count) % count;
}

function isSubsequence(needle: string, haystack: string): boolean {
  let position = 0;
  for (const char of haystack) {
    if (char === needle[position]) position += 1;
    if (position === needle.length) return true;
  }
  return false;
}
