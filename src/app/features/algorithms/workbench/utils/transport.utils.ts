export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete';
export type TransportAction = 'play' | 'pause' | 'restart';

export function nextTransportAction(playing: boolean, cursor: number, lastIndex: number): TransportAction {
  if (playing) return 'pause';
  return lastIndex > 0 && cursor >= lastIndex ? 'restart' : 'play';
}

export function resolvePlaybackStatus(playing: boolean, cursor: number, lastIndex: number): PlaybackStatus {
  if (playing) return 'playing';
  if (lastIndex > 0 && cursor >= lastIndex) return 'complete';
  return cursor <= 0 ? 'idle' : 'paused';
}

export function clampCursor(cursor: number, lastIndex: number): number {
  return Math.max(0, Math.min(Math.max(lastIndex, 0), Math.trunc(cursor)));
}
