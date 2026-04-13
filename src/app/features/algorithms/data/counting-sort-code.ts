import { CodeLine } from '../models/detail';

export const COUNTING_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'countingSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' max ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.max(' }, { kind: 'num', text: '0' },
      { kind: 'text', text: ', ...arr);' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' count ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Array.from({ length: max ' },
      { kind: 'op', text: '+' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ' }, () ' }, { kind: 'op', text: '=>' }, { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' }, { kind: 'text', text: ');' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' }, { kind: 'text', text: ' value ' }, { kind: 'kw', text: 'of' },
      { kind: 'text', text: ' arr) {' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '    count[value] ' }, { kind: 'op', text: '+=' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' },
    ],
  },
  { number: 6, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' write ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' value ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: '; value ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' max; value++) {' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (count[value] ' },
      { kind: 'op', text: '>' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' },
      { kind: 'text', text: ') {' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '      arr[write] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' value;' },
    ],
  },
  { number: 11, tokens: [{ kind: 'text', text: '      write++;' }] },
  { number: 12, tokens: [{ kind: 'text', text: '      count[value]--;' }] },
  { number: 13, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' arr;' },
    ],
  },
  { number: 16, tokens: [{ kind: 'text', text: '}' }] },
];
