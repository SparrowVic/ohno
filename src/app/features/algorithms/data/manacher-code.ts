import { CodeLine } from '../models/detail';

export const MANACHER_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' manacher(s):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  t ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' insert #' }, { kind: 'text', text: ' between chars' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  center, right ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', ' }, { kind: 'num', text: '0' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i in 0..|t|-1:' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    mirror ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' 2*center - i' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' i < right:' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      P[i] ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' min(right - i, P[mirror])' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '    while' }, { kind: 'text', text: ' t[i - P[i] - 1] = t[i + P[i] + 1]:' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      P[i]++' }] },
  { number: 10, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' i + P[i] > right:' }] },
  { number: 11, tokens: [{ kind: 'text', text: '      center, right ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' i, i + P[i]' }] },
];
