export type PaletteAction = 'toggle' | 'search' | 'shortcuts' | 'close' | null;

export interface PaletteKeyInput {
  readonly key: string;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly typing: boolean;
  readonly open: boolean;
}

export function paletteAction(input: PaletteKeyInput): PaletteAction {
  if ((input.metaKey || input.ctrlKey) && input.key.toLowerCase() === 'k') return 'toggle';
  if (input.open) return input.key === 'Escape' ? 'close' : null;
  if (input.typing) return null;
  if (input.key === '/') return 'search';
  if (input.key === '?') return 'shortcuts';
  return null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
