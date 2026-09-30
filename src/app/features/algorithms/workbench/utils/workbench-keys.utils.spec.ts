import { describe, expect, it } from 'vitest';

import { keyTargetKind, resolveWorkbenchKey, WorkbenchKeyContext } from './workbench-keys.utils';

const base: Omit<WorkbenchKeyContext, 'key'> = { modifier: false, target: 'none', paletteOpen: false };

describe('resolveWorkbenchKey', () => {
  it('maps the workbench keyboard map', () => {
    expect(resolveWorkbenchKey({ ...base, key: ' ' })).toBe('toggle');
    expect(resolveWorkbenchKey({ ...base, key: 'Spacebar' })).toBe('toggle');
    expect(resolveWorkbenchKey({ ...base, key: 'ArrowLeft' })).toBe('stepBack');
    expect(resolveWorkbenchKey({ ...base, key: 'ArrowRight' })).toBe('stepForward');
    expect(resolveWorkbenchKey({ ...base, key: 'R' })).toBe('reset');
    expect(resolveWorkbenchKey({ ...base, key: '[' })).toBe('tempoDown');
    expect(resolveWorkbenchKey({ ...base, key: ']' })).toBe('tempoUp');
    expect(resolveWorkbenchKey({ ...base, key: 'c' })).toBe('tabCode');
    expect(resolveWorkbenchKey({ ...base, key: 'i' })).toBe('tabInfo');
    expect(resolveWorkbenchKey({ ...base, key: 't' })).toBe('tabTrace');
    expect(resolveWorkbenchKey({ ...base, key: 'l' })).toBe('focusLog');
    expect(resolveWorkbenchKey({ ...base, key: 'x' })).toBeNull();
  });

  it('ignores every key while the palette is open, with a modifier, or in a text field', () => {
    expect(resolveWorkbenchKey({ ...base, key: ' ', paletteOpen: true })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: 'r', modifier: true })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: ' ', target: 'text' })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: 'r', target: 'text' })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: 'ArrowRight', target: 'text' })).toBeNull();
  });

  it('keeps space and arrows native on a focused control but still takes letters', () => {
    expect(resolveWorkbenchKey({ ...base, key: ' ', target: 'control' })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: 'ArrowLeft', target: 'control' })).toBeNull();
    expect(resolveWorkbenchKey({ ...base, key: 'r', target: 'control' })).toBe('reset');
    expect(resolveWorkbenchKey({ ...base, key: ']', target: 'control' })).toBe('tempoUp');
  });
});

describe('keyTargetKind', () => {
  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, attributes: Record<string, string> = {}) => {
    const node = document.createElement(tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  };

  it('classifies text fields', () => {
    expect(keyTargetKind(element('input', { type: 'text' }))).toBe('text');
    expect(keyTargetKind(element('input', { type: 'number' }))).toBe('text');
    expect(keyTargetKind(element('textarea'))).toBe('text');
    expect(keyTargetKind(element('select'))).toBe('text');
    expect(keyTargetKind(element('div', { contenteditable: 'true' }))).toBe('text');
  });

  it('classifies keys, links, ranges and menus as controls', () => {
    expect(keyTargetKind(element('button'))).toBe('control');
    expect(keyTargetKind(element('a'))).toBe('control');
    expect(keyTargetKind(element('input', { type: 'range' }))).toBe('control');
    expect(keyTargetKind(element('div', { role: 'menu' }))).toBe('control');
  });

  it('treats the body, plain elements and missing targets as none', () => {
    expect(keyTargetKind(document.body)).toBe('none');
    expect(keyTargetKind(element('div'))).toBe('none');
    expect(keyTargetKind(null)).toBe('none');
  });
});
