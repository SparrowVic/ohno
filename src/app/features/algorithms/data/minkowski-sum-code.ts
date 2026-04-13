import { CodeLine } from '../models/detail';

export const MINKOWSKI_SUM_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'A ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' obstacle polygon in CCW order' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: "B' " },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' reflect robot polygon through origin' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: 'result[0] ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: " lowest(A) + lowest(B')" },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: 'edgesA, edgesB ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' edge vectors of both polygons' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: 'while' },
      { kind: 'text', text: ' edges remain: append the smaller-angle edge vector' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' merged Minkowski polygon' },
    ],
  },
];
