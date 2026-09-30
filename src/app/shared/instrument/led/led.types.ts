export type LedColor =
  | 'signal'
  | 'cyan'
  | 'pink'
  | 'lime'
  | 'amber'
  | 'red'
  | 'violet'
  | 'slate'
  | 'easy';

export const LED_COLOR_TOKENS: Readonly<Record<LedColor, string>> = {
  signal: 'var(--signal)',
  cyan: 'var(--cyan)',
  pink: 'var(--pink)',
  lime: 'var(--lime)',
  amber: 'var(--amber)',
  red: 'var(--red)',
  violet: 'var(--violet)',
  slate: 'var(--slate)',
  easy: 'var(--easy)',
};

export const LED_COLOR_RGB_TOKENS: Readonly<Record<LedColor, string>> = {
  signal: 'var(--signal-rgb)',
  cyan: 'var(--cyan-rgb)',
  pink: 'var(--pink-rgb)',
  lime: 'var(--lime-rgb)',
  amber: 'var(--amber-rgb)',
  red: 'var(--red-rgb)',
  violet: 'var(--violet-rgb)',
  slate: 'var(--slate-rgb)',
  easy: 'var(--easy-rgb)',
};
