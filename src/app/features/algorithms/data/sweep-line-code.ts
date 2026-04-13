import { CodeLine } from '../models/detail';

export const SWEEP_LINE_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'events ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' sorted left/right rectangle edges' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: 'active ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' rectangles crossing current sweep x' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' event is left edge: add rectangle to active set' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' event is right edge: remove rectangle from active set' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: 'area ' },
      { kind: 'op', text: '+=' },
      { kind: 'text', text: ' unionY(active) × Δx' },
    ],
  },
];
