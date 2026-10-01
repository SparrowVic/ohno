import { describe, expect, it } from 'vitest';

import { clampCursor, nextTransportAction, resolvePlaybackStatus } from './transport.utils';

describe('nextTransportAction', () => {
  it('pauses while playing', () => {
    expect(nextTransportAction(true, 10, 195)).toBe('pause');
    expect(nextTransportAction(true, 195, 195)).toBe('pause');
  });

  it('restarts from the last step instead of ignoring the key', () => {
    expect(nextTransportAction(false, 195, 195)).toBe('restart');
    expect(nextTransportAction(false, 300, 195)).toBe('restart');
  });

  it('plays from the start and from the middle of a run', () => {
    expect(nextTransportAction(false, 0, 195)).toBe('play');
    expect(nextTransportAction(false, 66, 195)).toBe('play');
    expect(nextTransportAction(false, 0, 0)).toBe('play');
  });
});

describe('resolvePlaybackStatus', () => {
  it('reports idle, paused, playing and complete', () => {
    expect(resolvePlaybackStatus(false, 0, 195)).toBe('idle');
    expect(resolvePlaybackStatus(false, 66, 195)).toBe('paused');
    expect(resolvePlaybackStatus(true, 66, 195)).toBe('playing');
    expect(resolvePlaybackStatus(false, 195, 195)).toBe('complete');
  });

  it('treats an empty history as idle', () => {
    expect(resolvePlaybackStatus(false, 0, 0)).toBe('idle');
  });
});

describe('clampCursor', () => {
  it('keeps the cursor inside the history', () => {
    expect(clampCursor(250, 195)).toBe(195);
    expect(clampCursor(-1, 195)).toBe(0);
    expect(clampCursor(3, -1)).toBe(0);
    expect(clampCursor(12.7, 195)).toBe(12);
  });
});
