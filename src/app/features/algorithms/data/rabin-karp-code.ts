import { CodeLine } from '../models/detail';

export const RABIN_KARP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' rabinKarp(text, pattern):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  targetHash ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'hash' }, { kind: 'text', text: '(pattern)' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  windowHash ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'hash' }, { kind: 'text', text: '(text[0..m))' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' s in 0..|text|-m:' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' windowHash = targetHash:' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      verify characters one by one' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' s < |text|-m:' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      windowHash ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'roll' }, { kind: 'text', text: '(windowHash, out, in)' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' all verified matches' }] },
];
