import { CodeLine } from '../models/detail';

export const CONVEX_HULL_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'grahamScan' },
      { kind: 'text', text: '(pts):' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  pivot ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'minY' },
      { kind: 'text', text: '(pts)' },
      { kind: 'text', text: '  // bottommost pt' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  sorted ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'polarSort' },
      { kind: 'text', text: '(pivot, pts)' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  stack ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' [pivot, sorted[' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ']]' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: '  for' },
      { kind: 'text', text: ' p ' },
      { kind: 'kw', text: 'in' },
      { kind: 'text', text: ' sorted[' },
      { kind: 'num', text: '1' },
      { kind: 'text', text: '..]:' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'kw', text: '    while' },
      { kind: 'text', text: ' |stack| ' },
      { kind: 'op', text: '≥' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '2' },
      { kind: 'text', text: ' and' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'fn', text: 'cross' },
      { kind: 'text', text: '(stack[' },
      { kind: 'op', text: '-' },
      { kind: 'num', text: '2' },
      { kind: 'text', text: '], stack[' },
      { kind: 'op', text: '-' },
      { kind: 'num', text: '1' },
      { kind: 'text', text: '], p) ' },
      { kind: 'op', text: '≤' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ':' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '        stack.' },
      { kind: 'fn', text: 'pop' },
      { kind: 'text', text: '()' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '    stack.' },
      { kind: 'fn', text: 'push' },
      { kind: 'text', text: '(p)' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'kw', text: '  return' },
      { kind: 'text', text: ' stack' },
      { kind: 'text', text: '  // hull vertices' },
    ],
  },
];
