import { CodeLine } from '../models/detail';

export const BINARY_SEARCH_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'binarySearch' },
      { kind: 'text', text: '(arr: number[], target: number): number {' },
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
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[mid] ' }, { kind: 'op', text: '===' },
      { kind: 'text', text: ' target) ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' mid;' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    // found exact match' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[mid] ' }, { kind: 'op', text: '<' },
      { kind: 'text', text: ' target) low ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' mid + ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    // search right half' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'else' }, { kind: 'text', text: ' high ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' mid - ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '    // search left half' },
    ],
  },
  { number: 11, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '-1' },
      { kind: 'text', text: ';' },
    ],
  },
  { number: 13, tokens: [{ kind: 'text', text: '}' }] },
];
