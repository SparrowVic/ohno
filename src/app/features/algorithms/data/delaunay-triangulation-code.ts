import { CodeLine } from '../models/detail';

export const DELAUNAY_TRIANGULATION_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'points ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' sites on the plane' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: 'triangulation ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' empty to start' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' each candidate triangle: compute circumcircle' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' circumcircle stays empty: commit triangle to mesh' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' Delaunay triangle mesh' },
    ],
  },
];
