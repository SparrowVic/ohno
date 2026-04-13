import { CodeLine } from '../models/detail';

export const CLOSEST_PAIR_OF_POINTS_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'closestPair' },
      { kind: 'text', text: '(points):' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  px ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'sortByX' },
      { kind: 'text', text: '(points)' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  py ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'sortByY' },
      { kind: 'text', text: '(points)' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'kw', text: '  return' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'solve' },
      { kind: 'text', text: '(px, py)' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'solve' },
      { kind: 'text', text: '(px, py):' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'kw', text: '  if' },
      { kind: 'text', text: ' |px| ' },
      { kind: 'op', text: '≤' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '3' },
      { kind: 'text', text: ': return ' },
      { kind: 'fn', text: 'bruteForce' },
      { kind: 'text', text: '(px)' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '  midX ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' split x-coordinate of px' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '  best ' },
      { kind: 'op', text: '←' },
      { kind: 'fn', text: 'min' },
      { kind: 'text', text: '(' },
      { kind: 'fn', text: 'solve' },
      { kind: 'text', text: '(left), ' },
      { kind: 'fn', text: 'solve' },
      { kind: 'text', text: '(right))' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '  strip ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' { p ∈ py : |p.x - midX| < best.dist }' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'kw', text: '  for' },
      { kind: 'text', text: ' each strip point, compare next ' },
      { kind: 'num', text: '7' },
      { kind: 'text', text: ' neighbors by y' },
    ],
  },
  {
    number: 11,
    tokens: [
      { kind: 'kw', text: '  return' },
      { kind: 'text', text: ' best' },
    ],
  },
];
