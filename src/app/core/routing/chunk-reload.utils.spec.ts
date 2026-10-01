import { describe, expect, it } from 'vitest';

import {
  CHUNK_RELOAD_COOLDOWN_MS,
  CHUNK_RELOAD_KEY,
  claimChunkReload,
  isChunkLoadError,
  ReloadStorage,
  sameOriginPath,
} from './chunk-reload.utils';

function memoryStorage(): ReloadStorage & { readonly values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

describe('isChunkLoadError', () => {
  it('recognises the lazy chunk failures of the major browsers', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/chunk-AB12.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError("'text/html' is not a valid JavaScript MIME type."))).toBe(true);
  });

  it('ignores ordinary navigation errors', () => {
    expect(isChunkLoadError(new Error('Cannot match any routes'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(42)).toBe(false);
  });
});

describe('claimChunkReload', () => {
  it('allows one reload per url inside the cooldown', () => {
    const storage = memoryStorage();
    expect(claimChunkReload(storage, '/algorithms/dijkstra', 1_000)).toBe(true);
    expect(claimChunkReload(storage, '/algorithms/dijkstra', 2_000)).toBe(false);
    expect(claimChunkReload(storage, '/algorithms/bfs', 2_000)).toBe(true);
    expect(claimChunkReload(storage, '/algorithms/bfs', 2_000 + CHUNK_RELOAD_COOLDOWN_MS)).toBe(true);
  });

  it('refuses to reload without a writable storage so a broken deploy never loops', () => {
    expect(claimChunkReload(null, '/a', 0)).toBe(false);
    const throwing: ReloadStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(claimChunkReload(throwing, '/a', 0)).toBe(false);
  });

  it('treats a corrupted mark as absent', () => {
    const storage = memoryStorage();
    storage.values.set(CHUNK_RELOAD_KEY, '{oops');
    expect(claimChunkReload(storage, '/a', 0)).toBe(true);
  });
});

describe('sameOriginPath', () => {
  it('keeps router urls on the current origin', () => {
    expect(sameOriginPath('/algorithms/kmp?view=tape#log', 'https://ohno.app')).toBe('/algorithms/kmp?view=tape#log');
  });

  it('rejects urls that resolve to another origin', () => {
    expect(sameOriginPath('//evil.example/x', 'https://ohno.app')).toBeNull();
    expect(sameOriginPath('https://evil.example/x', 'https://ohno.app')).toBeNull();
  });
});
