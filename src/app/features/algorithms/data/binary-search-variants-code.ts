import { CodeLine } from '../models/detail';

export const BINARY_SEARCH_VARIANTS_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'binarySearchRange' },
      { kind: 'text', text: '(arr: number[], target: number): [number, number] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' low ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', high ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' arr.length - ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (low ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' high) {' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' mid ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' Math.floor((low + high) / ' }, { kind: 'num', text: '2' }, { kind: 'text', text: ');' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '    // lower bound probe' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[mid] ' }, { kind: 'op', text: '>=' },
      { kind: 'text', text: ' target) high ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' mid - ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'else' }, { kind: 'text', text: ' low ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' mid + ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    // move right while searching first match' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '  }' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '  // abort if lower bound is not target' },
    ],
  },
  {
    number: 11,
    tokens: [
      { kind: 'text', text: '  // switch to upper bound search' },
    ],
  },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '  low = first; high = arr.length - 1;' },
    ],
  },
  {
    number: 13,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (low ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' high) {' },
    ],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' mid ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' Math.floor((low + high) / ' }, { kind: 'num', text: '2' }, { kind: 'text', text: ');' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '    // upper bound probe' },
    ],
  },
  {
    number: 16,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[mid] ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' target) low ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' mid + ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 17,
    tokens: [
      { kind: 'text', text: '    // move right while searching last match' },
    ],
  },
  {
    number: 18,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'else' }, { kind: 'text', text: ' high ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' mid - ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' },
    ],
  },
  {
    number: 19,
    tokens: [
      { kind: 'text', text: '  }' },
    ],
  },
  {
    number: 20,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' [first, last];' },
    ],
  },
  { number: 21, tokens: [{ kind: 'text', text: '}' }] },
];
