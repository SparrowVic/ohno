import { CodeLine } from '../models/detail';

export const LINE_INTERSECTION_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'events ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' sorted endpoints and candidate crossings' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: 'status ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' active segments ordered by y on sweep line' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' event is left endpoint: ' },
      { kind: 'fn', text: 'insert' },
      { kind: 'text', text: ' segment into status' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' event is right endpoint: ' },
      { kind: 'fn', text: 'remove' },
      { kind: 'text', text: ' segment from status' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' neighbor swap reveals a crossing: record intersection' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' all discovered intersection points' },
    ],
  },
];
