import { CodeLine } from '../models/detail';

export const MERGE_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'mergeSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' temp ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' ' }, { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Array<number>(arr.length).fill(' }, { kind: 'num', text: '0' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  sort(' }, { kind: 'num', text: '0' }, { kind: 'text', text: ', arr.length ' },
      { kind: 'op', text: '-' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' arr;' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'sort' }, { kind: 'text', text: '(left: number, right: number): void {' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (left ' },
      { kind: 'op', text: '>=' }, { kind: 'text', text: ' right) ' }, { kind: 'kw', text: 'return' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' middle ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.floor((left ' }, { kind: 'op', text: '+' },
      { kind: 'text', text: ' right) ' }, { kind: 'op', text: '/' }, { kind: 'text', text: ' ' },
      { kind: 'num', text: '2' }, { kind: 'text', text: ');' },
    ],
  },
  { number: 8, tokens: [{ kind: 'text', text: '    sort(left, middle);' }] },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    sort(middle ' }, { kind: 'op', text: '+' }, { kind: 'text', text: ' ' },
      { kind: 'num', text: '1' }, { kind: 'text', text: ', right);' },
    ],
  },
  { number: 10, tokens: [{ kind: 'text', text: '    merge(left, middle, right);' }] },
  { number: 11, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'merge' }, { kind: 'text', text: '(left: number, middle: number, right: number): void {' },
    ],
  },
  {
    number: 13,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' i ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' left, j ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' middle ' }, { kind: 'op', text: '+' }, { kind: 'text', text: ' ' },
      { kind: 'num', text: '1' }, { kind: 'text', text: ', k ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' left;' },
    ],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (i ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' middle ' }, { kind: 'op', text: '&&' },
      { kind: 'text', text: ' j ' }, { kind: 'op', text: '<=' }, { kind: 'text', text: ' right) {' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '      temp[k++] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' arr[i] ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' arr[j] ? arr[i++] : arr[j++];' },
    ],
  },
  { number: 16, tokens: [{ kind: 'text', text: '    }' }] },
  {
    number: 17,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (i ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' middle) temp[k++] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' arr[i++];' },
    ],
  },
  {
    number: 18,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (j ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' right) temp[k++] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' arr[j++];' },
    ],
  },
  {
    number: 19,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' index ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' left; index ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' right; index++) arr[index] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' temp[index];' },
    ],
  },
  { number: 20, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 21, tokens: [{ kind: 'text', text: '}' }] },
];
