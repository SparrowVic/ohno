import { CodeLine } from '../models/detail';

export const TIM_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'timSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' minRun ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.min(arr.length || ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ', ' }, { kind: 'num', text: '8' }, { kind: 'text', text: ');' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' temp ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' ' }, { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Array<number>(arr.length).fill(' }, { kind: 'num', text: '0' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' start ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: '; start ' },
      { kind: 'op', text: '<' }, { kind: 'text', text: ' arr.length; start ' }, { kind: 'op', text: '+=' },
      { kind: 'text', text: ' minRun) {' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '    insertionSortRange(start, Math.min(start + minRun ' }, { kind: 'op', text: '-' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ', arr.length - 1));' },
    ],
  },
  { number: 6, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' width ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' minRun; width ' }, { kind: 'op', text: '<' }, { kind: 'text', text: ' arr.length; width ' },
      { kind: 'op', text: '*=' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '2' }, { kind: 'text', text: ') {' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' left ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' }, { kind: 'text', text: '; left ' }, { kind: 'op', text: '<' },
      { kind: 'text', text: ' arr.length; left ' }, { kind: 'op', text: '+=' },
      { kind: 'text', text: ' width * ' }, { kind: 'num', text: '2' }, { kind: 'text', text: ') {' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '      mergeRuns(left, left + width - ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ', Math.min(left + width * ' }, { kind: 'num', text: '2' },
      { kind: 'text', text: ' - ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ', arr.length - 1));' },
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
  {
    number: 14,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'insertionSortRange' },
      { kind: 'text', text: '(left: number, right: number): void {' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' i ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' left + ' },
      { kind: 'num', text: '1' }, { kind: 'text', text: '; i ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' right; i++) {' },
    ],
  },
  {
    number: 16,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' value ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' arr[i];' },
    ],
  },
  {
    number: 17,
    tokens: [
      { kind: 'text', text: '    insertIntoRun(arr, i, left, value);' },
    ],
  },
  { number: 18, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 19,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'mergeRuns' },
      { kind: 'text', text: '(left: number, middle: number, right: number): void {' },
    ],
  },
  {
    number: 20,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' i ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' left, j ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' middle + ' },
      { kind: 'num', text: '1' }, { kind: 'text', text: ', k ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' left;' },
    ],
  },
  {
    number: 21,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (i ' }, { kind: 'op', text: '<=' },
      { kind: 'text', text: ' middle ' }, { kind: 'op', text: '&&' }, { kind: 'text', text: ' j ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' right) {' },
    ],
  },
  {
    number: 22,
    tokens: [
      { kind: 'text', text: '    temp[k++] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' arr[i] ' }, { kind: 'op', text: '<=' }, { kind: 'text', text: ' arr[j] ? arr[i++] : arr[j++];' },
    ],
  },
  { number: 23, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 24,
    tokens: [
      { kind: 'text', text: '  copyTailAndWriteBack(temp, arr, left, right);' },
    ],
  },
  {
    number: 25,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' }, { kind: 'kw', text: 'let' },
      { kind: 'text', text: ' index ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' left; index ' },
      { kind: 'op', text: '<=' }, { kind: 'text', text: ' right; index++) arr[index] ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' temp[index];' },
    ],
  },
  { number: 26, tokens: [{ kind: 'text', text: '}' }] },
];
