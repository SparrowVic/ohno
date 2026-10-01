import { describe, expect, it } from 'vitest';

import { RecentEntry, parseRecentEntries, upsertRecent } from './recent-algorithms.utils';

const entry = (id: string, updatedAt: number, extra: Partial<RecentEntry> = {}): RecentEntry => ({
  id, step: 0, total: 0, finished: false, updatedAt, ...extra,
});

describe('upsertRecent', () => {
  it('puts the newest entry first and caps the list', () => {
    const list = upsertRecent([entry('a', 1), entry('b', 2), entry('c', 3)], entry('d', 4));
    expect(list.map((item) => item.id)).toEqual(['d', 'c', 'b']);
  });

  it('replaces an existing id instead of duplicating it', () => {
    const list = upsertRecent([entry('a', 1), entry('b', 2)], entry('a', 5, { step: 12, total: 41 }));
    expect(list.map((item) => item.id)).toEqual(['a', 'b']);
    expect(list[0].step).toBe(12);
  });

  it('never loses a finished flag when the run is merely reopened', () => {
    const list = upsertRecent([entry('a', 1, { finished: true, step: 10, total: 10 })], entry('a', 2));
    expect(list[0].finished).toBe(true);
    expect(list[0].step).toBe(10);
  });
});

describe('parseRecentEntries', () => {
  it('reads a valid list', () => {
    const raw = JSON.stringify([{ id: 'bubble-sort', step: 66, total: 196, finished: false, updatedAt: 9 }]);
    expect(parseRecentEntries(raw)).toEqual([{ id: 'bubble-sort', step: 66, total: 196, finished: false, updatedAt: 9 }]);
  });

  it('returns an empty list for null, garbage, non-arrays and malformed entries', () => {
    expect(parseRecentEntries(null)).toEqual([]);
    expect(parseRecentEntries('not json')).toEqual([]);
    expect(parseRecentEntries('"[]"')).toEqual([]);
    expect(parseRecentEntries('{"id":"x"}')).toEqual([]);
    expect(parseRecentEntries('[{"id":"x","step":1}]')).toEqual([]);
    expect(parseRecentEntries('[{"id":5,"step":1,"total":2,"finished":false,"updatedAt":1}]')).toEqual([]);
  });

  it('keeps the valid entries of a partly broken list', () => {
    const raw = JSON.stringify([{ id: 'ok', step: 1, total: 2, finished: false, updatedAt: 1 }, { id: 'bad' }]);
    expect(parseRecentEntries(raw).map((item) => item.id)).toEqual(['ok']);
  });
});
