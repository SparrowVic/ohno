import { CodeLine } from '../models/detail';

export const BUCKET_SORT_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'bucketSort' },
      { kind: 'text', text: '(arr: number[]): number[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' min ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.min(...arr);' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' max ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.max(...arr);' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' buckets ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Array.from({ length: Math.ceil(Math.sqrt(arr.length)) }, ' },
      { kind: 'op', text: '() =>' }, { kind: 'text', text: ' [] as number[]);' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' }, { kind: 'text', text: ' value ' }, { kind: 'kw', text: 'of' },
      { kind: 'text', text: ' arr) placeIntoBucket(value, min, max, buckets);' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'let' }, { kind: 'text', text: ' write ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'let' }, { kind: 'text', text: ' bucket ' }, { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' }, { kind: 'num', text: '0' }, { kind: 'text', text: '; bucket ' },
      { kind: 'op', text: '<' }, { kind: 'text', text: ' buckets.length; bucket++) {' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    buckets[bucket].sort((left, right) ' }, { kind: 'op', text: '=>' },
      { kind: 'text', text: ' left - right);' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' }, { kind: 'text', text: ' value ' }, { kind: 'kw', text: 'of' },
      { kind: 'text', text: ' buckets[bucket]) {' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '      arr[write++] ' }, { kind: 'op', text: '=' }, { kind: 'text', text: ' value;' },
    ],
  },
  { number: 11, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 12, tokens: [{ kind: 'text', text: '  }' }] },
  {
    number: 13,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' arr;' },
    ],
  },
  { number: 14, tokens: [{ kind: 'text', text: '}' }] },
  {
    number: 15,
    tokens: [
      { kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'placeIntoBucket' },
      { kind: 'text', text: '(value: number, min: number, max: number, buckets: number[][]): void {' },
    ],
  },
  {
    number: 16,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' span ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.max(' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ', Math.floor((max - min) / buckets.length) + ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 17,
    tokens: [
      { kind: 'text', text: '  ' }, { kind: 'kw', text: 'const' }, { kind: 'text', text: ' index ' },
      { kind: 'op', text: '=' }, { kind: 'text', text: ' Math.min(buckets.length - ' }, { kind: 'num', text: '1' },
      { kind: 'text', text: ', Math.floor((value - min) / span));' },
    ],
  },
  { number: 18, tokens: [{ kind: 'text', text: '  buckets[index].push(value);' }] },
  { number: 19, tokens: [{ kind: 'text', text: '}' }] },
];
