import { CodeLine } from '../models/detail';

export const LINEAR_SEARCH_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'linearSearch' },
      { kind: 'text', text: '(arr: number[], target: number): number {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' }, { kind: 'kw', text: 'let' },
      { kind: 'text', text: ' i ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' },
      { kind: 'text', text: '; i ' }, { kind: 'op', text: '<' }, { kind: 'text', text: ' arr.length; i++) {' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[i] ' },
      { kind: 'op', text: '===' }, { kind: 'text', text: ' target) ' }, { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' i;' },
    ],
  },
  { number: 4, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  // keep scanning' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '-1' },
      { kind: 'text', text: ';' },
    ],
  },
  { number: 7, tokens: [{ kind: 'text', text: '}' }] },
];
