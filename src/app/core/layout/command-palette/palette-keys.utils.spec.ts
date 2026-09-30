import { describe, expect, it } from 'vitest';

import { paletteAction } from './palette-keys.utils';

const press = (key: string, extra: Partial<Parameters<typeof paletteAction>[0]> = {}) =>
  paletteAction({ key, metaKey: false, ctrlKey: false, typing: false, open: false, ...extra });

describe('paletteAction', () => {
  it('toggles on ⌘K / Ctrl+K even while typing', () => {
    expect(press('k', { metaKey: true })).toBe('toggle');
    expect(press('K', { ctrlKey: true, typing: true })).toBe('toggle');
  });

  it('opens search on / and shortcuts on ? outside inputs only', () => {
    expect(press('/')).toBe('search');
    expect(press('?')).toBe('shortcuts');
    expect(press('/', { typing: true })).toBeNull();
    expect(press('?', { typing: true })).toBeNull();
  });

  it('closes on Escape only while open and ignores other keys', () => {
    expect(press('Escape', { open: true })).toBe('close');
    expect(press('Escape')).toBeNull();
    expect(press('/', { open: true })).toBeNull();
    expect(press('a')).toBeNull();
  });
});
