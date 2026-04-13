import { CodeLine } from '../models/detail';

export const VORONOI_DIAGRAM_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'text', text: 'sites ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' input points on the plane' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: 'sweep ' },
      { kind: 'op', text: '←' },
      { kind: 'text', text: ' descending line over site events' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'kw', text: 'when' },
      { kind: 'text', text: ' sweep hits a site: activate its influence front' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: 'close cell by clipping with perpendicular bisectors to other sites' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' all Voronoi cells' },
    ],
  },
];
