import { CodeLine } from '../models/detail';

export const HUFFMAN_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'fn', text: ' huffman' }, { kind: 'text', text: '(text):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  freq ' }, { kind: 'op', text: '←' }, { kind: 'fn', text: ' countFreq' }, { kind: 'text', text: '(text)' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  heap ' }, { kind: 'op', text: '←' }, { kind: 'fn', text: ' minHeap' }, { kind: 'text', text: '(freq)' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' heap.size ' }, { kind: 'op', text: '>' }, { kind: 'num', text: ' 1' }, { kind: 'text', text: ':' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    L ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' heap.' }, { kind: 'fn', text: 'pop' }, { kind: 'text', text: '()' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    R ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' heap.' }, { kind: 'fn', text: 'pop' }, { kind: 'text', text: '()' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    node ' }, { kind: 'op', text: '←' }, { kind: 'fn', text: ' merge' }, { kind: 'text', text: '(L, R)' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    heap.' }, { kind: 'fn', text: 'push' }, { kind: 'text', text: '(node)' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  root ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' heap.' }, { kind: 'fn', text: 'pop' }, { kind: 'text', text: '()' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  codes ' }, { kind: 'op', text: '←' }, { kind: 'fn', text: ' assignCodes' }, { kind: 'text', text: '(root)' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' codes' }] },
];
