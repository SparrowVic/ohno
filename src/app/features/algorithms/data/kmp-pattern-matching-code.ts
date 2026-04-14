import { CodeLine } from '../models/detail';

export const KMP_PATTERN_MATCHING_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' kmp(text, pattern):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  fail ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'buildFailure' }, { kind: 'text', text: '(pattern)' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  i, j ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', ' }, { kind: 'num', text: '0' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' i < |text|:' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' text[i] = pattern[j]:' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      i++, j++' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' j = |pattern|:' }] },
  { number: 8, tokens: [{ kind: 'text', text: '        report(i - j); j ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' fail[j - 1]' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '    else if' }, { kind: 'text', text: ' j > 0:' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      j ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' fail[j - 1]' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' i++' }] },
];
