export interface RecentEntry {
  readonly id: string;
  readonly step: number;
  readonly total: number;
  readonly finished: boolean;
  readonly updatedAt: number;
}

export const RECENT_LIMIT = 3;

export function upsertRecent(
  list: readonly RecentEntry[],
  entry: RecentEntry,
  limit = RECENT_LIMIT,
): readonly RecentEntry[] {
  const previous = list.find((item) => item.id === entry.id);
  const reopened = previous && entry.total === 0;
  const merged: RecentEntry = reopened
    ? { ...previous, updatedAt: entry.updatedAt }
    : { ...entry, finished: entry.finished || previous?.finished === true };
  return [merged, ...list.filter((item) => item.id !== entry.id)]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function parseRecentEntries(raw: string | null): readonly RecentEntry[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isRecentEntry);
}

function isRecentEntry(value: unknown): value is RecentEntry {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['step'] === 'number' &&
    typeof candidate['total'] === 'number' &&
    typeof candidate['finished'] === 'boolean' &&
    typeof candidate['updatedAt'] === 'number'
  );
}
