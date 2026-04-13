import { CodeLine } from '../models/detail';

export const HUNGARIAN_ALGORITHM_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'hungarian' }, { kind: 'text', text: '(cost) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  start from the original square cost matrix;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  subtract each row minimum and then each column minimum;' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each row: row -= min(row);' }] },
  { number: 5, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each column: col -= min(col);' }] },
  { number: 6, tokens: [{ kind: 'text', text: '  find a maximum matching among zero cells;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '  cover all zeros with the minimum number of lines;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  smallest = minimum uncovered value;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  subtract smallest from uncovered cells and add it at double-covered intersections;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  repeat until a perfect zero matching exists, then read the assignment;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '}' }] },
];
