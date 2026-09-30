import { describe, expect, it } from 'vitest';

import { MenuItem } from './menu.types';
import { nextMenuIndex } from './menu.utils';

const items: readonly MenuItem[] = [
  { id: 'ts', label: 'TypeScript' },
  { id: 'py', label: 'Python' },
  { id: 'rs', label: 'Rust', disabled: true },
  { id: 'go', label: 'Go' },
];

describe('nextMenuIndex', () => {
  it('moves down and up', () => {
    expect(nextMenuIndex(items, 0, 1)).toBe(1);
    expect(nextMenuIndex(items, 1, -1)).toBe(0);
  });

  it('skips disabled items', () => {
    expect(nextMenuIndex(items, 1, 1)).toBe(3);
    expect(nextMenuIndex(items, 3, -1)).toBe(1);
  });

  it('wraps around both ends', () => {
    expect(nextMenuIndex(items, 3, 1)).toBe(0);
    expect(nextMenuIndex(items, 0, -1)).toBe(3);
  });

  it('starts from the first enabled item when nothing is active', () => {
    expect(nextMenuIndex(items, -1, 1)).toBe(0);
  });

  it('starts from the last enabled item when moving up with nothing active', () => {
    expect(nextMenuIndex(items, -1, -1)).toBe(3);
  });
});
