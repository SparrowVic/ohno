import { CodeLine } from '../models/detail';

export const Z_ALGORITHM_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' zAlgorithm(s):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  L, R ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', ' }, { kind: 'num', text: '0' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i in 1..|s|-1:' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' i ≤ R:' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      Z[i] ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' min(R - i + 1, Z[i - L])' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '    while' }, { kind: 'text', text: ' i + Z[i] < |s| and s[Z[i]] = s[i + Z[i]]:' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      Z[i]++' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' i + Z[i] - 1 > R:' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      L, R ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' i, i + Z[i] - 1' }] },
];
