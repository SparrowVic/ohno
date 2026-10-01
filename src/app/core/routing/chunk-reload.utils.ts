export interface ReloadStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface ReloadMark {
  readonly url: string;
  readonly at: number;
}

export const CHUNK_RELOAD_KEY = 'ohno:chunk-reload';
export const CHUNK_RELOAD_COOLDOWN_MS = 10_000;

const CHUNK_ERROR_PATTERN =
  /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk [\w-]+ failed|valid JavaScript MIME type/i;

export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) return CHUNK_ERROR_PATTERN.test(`${error.name}: ${error.message}`);
  return typeof error === 'string' && CHUNK_ERROR_PATTERN.test(error);
}

function isReloadMark(value: unknown): value is ReloadMark {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Record<keyof ReloadMark, unknown>>;
  return typeof candidate.url === 'string' && typeof candidate.at === 'number';
}

function readMark(storage: ReloadStorage): ReloadMark | null {
  try {
    const raw = storage.getItem(CHUNK_RELOAD_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isReloadMark(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function claimChunkReload(storage: ReloadStorage | null, url: string, now: number): boolean {
  if (!storage) return false;
  const mark = readMark(storage);
  if (mark && mark.url === url && now - mark.at < CHUNK_RELOAD_COOLDOWN_MS) return false;
  try {
    storage.setItem(CHUNK_RELOAD_KEY, JSON.stringify({ url, at: now } satisfies ReloadMark));
    return true;
  } catch {
    return false;
  }
}

export function sameOriginPath(url: string, origin: string): string | null {
  try {
    const resolved = new URL(url, origin);
    return resolved.origin === origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : null;
  } catch {
    return null;
  }
}
