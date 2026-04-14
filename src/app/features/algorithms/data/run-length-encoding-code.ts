import { CodeLine } from '../models/detail';

export const RLE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'fn', text: ' rle' }, { kind: 'text', text: '(text):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  runs ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' []' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  i ' }, { kind: 'op', text: '←' }, { kind: 'num', text: ' 0' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' i ' }, { kind: 'op', text: '<' }, { kind: 'fn', text: ' len' }, { kind: 'text', text: '(text):' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    j, count ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' i, ' }, { kind: 'num', text: '0' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '    while' }, { kind: 'text', text: ' j ' }, { kind: 'op', text: '<' }, { kind: 'fn', text: ' len' }, { kind: 'op', text: ' and' }, { kind: 'text', text: ' text[j] ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' text[i]:' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      j' }, { kind: 'op', text: '++' }, { kind: 'text', text: '; count' }, { kind: 'op', text: '++' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    runs.' }, { kind: 'fn', text: 'push' }, { kind: 'text', text: '((text[i], count)); i ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' j' }] },
];
