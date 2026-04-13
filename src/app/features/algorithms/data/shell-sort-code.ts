import { CodeLine } from '../models/detail';

export const SHELL_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'shellSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' gap ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' Math.floor(arr.length / ' }, { kind: 'num', text: '2' }, { kind: 'text', text: '); gap ' },
      { kind: 'op', text: '>' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' },
      { kind: 'text', text: '; gap = Math.floor(gap / ' }, { kind: 'num', text: '2' }, { kind: 'text', text: ')) {' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' i ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' gap; i ' },
      { kind: 'op', text: '<' }, { kind: 'text', text: ' arr.length; i++) {' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '      ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' value ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' arr[i];' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '      ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' j ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' i;' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '      ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (j ' },
      { kind: 'op', text: '>=' }, { kind: 'text', text: ' gap ' }, { kind: 'op', text: '&&' },
      { kind: 'text', text: ' arr[j - gap] ' }, { kind: 'op', text: '>' }, { kind: 'text', text: ' value) {' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '        arr[j] ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' arr[j - gap];' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '        j ' }, { kind: 'op', text: '-=' }, { kind: 'text', text: ' gap;' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '      arr[j] ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' value;' },
    ],
  },
  { number: 10, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 11, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' arr;' },
    ],
  },
  { number: 13, tokens: [{ kind: 'text', text: '}' }] },
];
