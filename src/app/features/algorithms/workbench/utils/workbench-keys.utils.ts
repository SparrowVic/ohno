export type WorkbenchKeyAction =
  | 'toggle'
  | 'stepBack'
  | 'stepForward'
  | 'reset'
  | 'tempoDown'
  | 'tempoUp'
  | 'tabCode'
  | 'tabInfo'
  | 'tabTrace'
  | 'focusLog';

export type KeyTargetKind = 'none' | 'control' | 'text';

export interface WorkbenchKeyContext {
  readonly key: string;
  readonly modifier: boolean;
  readonly target: KeyTargetKind;
  readonly paletteOpen: boolean;
}

const LETTER_ACTIONS: Readonly<Record<string, WorkbenchKeyAction>> = {
  r: 'reset',
  '[': 'tempoDown',
  ']': 'tempoUp',
  c: 'tabCode',
  i: 'tabInfo',
  t: 'tabTrace',
  l: 'focusLog',
};

const NAVIGATION_ACTIONS: Readonly<Record<string, WorkbenchKeyAction>> = {
  ' ': 'toggle',
  Spacebar: 'toggle',
  ArrowLeft: 'stepBack',
  ArrowRight: 'stepForward',
};

const TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'text',
  'number',
  'search',
  'email',
  'url',
  'tel',
  'password',
]);

const CONTROL_TAGS: ReadonlySet<string> = new Set(['BUTTON', 'A', 'SUMMARY']);

export function resolveWorkbenchKey(context: WorkbenchKeyContext): WorkbenchKeyAction | null {
  if (context.paletteOpen || context.modifier || context.target === 'text') return null;
  const navigation = NAVIGATION_ACTIONS[context.key];
  if (navigation) return context.target === 'control' ? null : navigation;
  return LETTER_ACTIONS[context.key.toLowerCase()] ?? null;
}

export function keyTargetKind(target: EventTarget | null): KeyTargetKind {
  if (!(target instanceof HTMLElement)) return 'none';
  if (isTextEditable(target)) return 'text';
  if (target instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(target.type) ? 'text' : 'control';
  if (CONTROL_TAGS.has(target.tagName) || target.getAttribute('role') === 'menu') return 'control';
  return 'none';
}

function isTextEditable(target: HTMLElement): boolean {
  if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
  return target.isContentEditable === true || target.getAttribute('contenteditable') === 'true';
}
