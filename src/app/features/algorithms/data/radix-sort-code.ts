import { CodeLine } from '../models/detail';

export const RADIX_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'radixSort' },
      { kind: 'text', text: '(arr) {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' maxDigits ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' digitCount(max(arr));' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' },
      { kind: 'text', text: ' place ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: '; place ' },
      { kind: 'op', text: '<' },
      { kind: 'text', text: ' maxDigits; place++) {' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' buckets ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' Array.from({ length: ' },
      { kind: 'num', text: '10' },
      { kind: 'text', text: ' }, () => []);' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' value ' },
      { kind: 'kw', text: 'of' },
      { kind: 'text', text: ' arr) {' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' digit ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' getDigit(value, place);' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '      buckets[digit].push(value);' },
    ],
  },
  {
    number: 8,
    tokens: [{ kind: 'text', text: '    }' }],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    arr ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' [];' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' bucket ' },
      { kind: 'kw', text: 'of' },
      { kind: 'text', text: ' buckets) {' },
    ],
  },
  {
    number: 11,
    tokens: [
      { kind: 'text', text: '      arr.push(...bucket);' },
    ],
  },
  {
    number: 12,
    tokens: [{ kind: 'text', text: '    }' }],
  },
  {
    number: 13,
    tokens: [{ kind: 'text', text: '  }' }],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' arr;' },
    ],
  },
  {
    number: 15,
    tokens: [{ kind: 'text', text: '}' }],
  },
];
