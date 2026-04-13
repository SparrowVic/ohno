import { CodeLine } from '../models/detail';

export const QUICK_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'quickSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  sort(' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', arr.length ' },
      { kind: 'op', text: '-' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' arr;' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'sort' }, { kind: 'text', text: '(low: number, high: number): void {' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (low ' },
      { kind: 'op', text: '>=' }, { kind: 'text', text: ' high) ' }, { kind: 'kw', text: 'return' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' pivot ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' arr[high];' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' storeIndex ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' low;' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' index ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' low; index ' }, { kind: 'op', text: '<' },
      { kind: 'text', text: ' high; index++) {' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (arr[index] ' },
      { kind: 'op', text: '<' }, { kind: 'text', text: ' pivot) {' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '        [arr[storeIndex], arr[index]] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' [arr[index], arr[storeIndex]];' },
    ],
  },
  { number: 11, tokens: [{ kind: 'text', text: '        storeIndex++;' }] },
  { number: 12, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 13, tokens: [{ kind: 'text', text: '    }' }] },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '    [arr[storeIndex], arr[high]] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' [arr[high], arr[storeIndex]];' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '    sort(low, storeIndex ' }, { kind: 'op', text: '-' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ');' },
    ],
  },
  {
    number: 16,
    tokens: [
      { kind: 'text', text: '    sort(storeIndex ' }, { kind: 'op', text: '+' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ', high);' },
    ],
  },
  { number: 17, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 18, tokens: [{ kind: 'text', text: '}' }] },
];
