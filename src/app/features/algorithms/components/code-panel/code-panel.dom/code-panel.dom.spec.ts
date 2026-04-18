import { describe, expect, it, vi } from 'vitest';

import type { CodeRegion } from '../../../models/detail';
import {
  applyActiveLineHighlight,
  findClickedRegionId,
  syncCodeRegionState,
} from './code-panel.dom';

function createRoot(lines = 4): HTMLElement {
  const root = document.createElement('div');
  for (let lineNumber = 1; lineNumber <= lines; lineNumber += 1) {
    const line = document.createElement('div');
    line.className = 'code-panel__render-line';
    line.dataset['line'] = String(lineNumber);
    root.append(line);
  }
  return root;
}

describe('code-panel.dom', () => {
  it('findClickedRegionId resolves the region from a nested toggle target', () => {
    const button = document.createElement('button');
    button.className = 'code-panel__fold-toggle';
    button.dataset['regionId'] = 'main';
    const icon = document.createElement('span');
    button.append(icon);

    expect(findClickedRegionId(new MouseEvent('click', { bubbles: true }))).toBeNull();
    expect(findClickedRegionId({ target: icon } as MouseEvent)).toBe('main');
  });

  it('applyActiveLineHighlight toggles classes and scrolls the active line into view', () => {
    const root = createRoot(2);
    const first = root.querySelector<HTMLElement>('[data-line="1"]')!;
    const second = root.querySelector<HTMLElement>('[data-line="2"]')!;
    first.classList.add('code-panel__render-line--active');
    const scrollIntoView = vi.fn();
    Object.defineProperty(second, 'scrollIntoView', {
      value: scrollIntoView,
      configurable: true,
    });

    const current = applyActiveLineHighlight(root, 1, 2);

    expect(current).toBe(2);
    expect(first.classList.contains('code-panel__render-line--active')).toBe(false);
    expect(second.classList.contains('code-panel__render-line--active')).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('syncCodeRegionState marks hidden and collapsed lines for folded regions', () => {
    const root = createRoot(4);
    const regions: readonly CodeRegion[] = [
      { id: 'main', kind: 'function', startLine: 1, endLine: 3, collapsedByDefault: true },
    ];

    syncCodeRegionState(root, regions, new Set(['main']));

    const header = root.querySelector<HTMLElement>('[data-line="1"]')!;
    const hidden = [
      root.querySelector<HTMLElement>('[data-line="2"]')!,
      root.querySelector<HTMLElement>('[data-line="3"]')!,
    ];

    expect(header.classList.contains('code-panel__render-line--foldable')).toBe(true);
    expect(header.classList.contains('code-panel__render-line--collapsed')).toBe(true);
    expect(header.querySelector('.code-panel__fold-toggle')).not.toBeNull();
    expect(header.textContent).toContain('… 2 lines');
    expect(hidden.every((line) => line.classList.contains('code-panel__render-line--hidden'))).toBe(true);
  });
});
