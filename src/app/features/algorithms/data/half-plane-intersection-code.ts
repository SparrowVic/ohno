import { CodeLine } from '../models/detail';

export const HALF_PLANE_INTERSECTION_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'feasible ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' canvas bounding box' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' each half-plane H in processing order:' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  line ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' boundary(H), keep the left side' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  feasible ' },
      { kind: 'op', text: '←' },
      { kind: 'fn', text: 'clipPolygon' },
      { kind: 'text', text: '(feasible, line)' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: '  if' },
      { kind: 'text', text: ' feasible is empty: ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' ∅' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' feasible' },
    ],
  },
];
