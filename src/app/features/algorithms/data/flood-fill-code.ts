import { CodeLine } from '../models/detail';

export const FLOOD_FILL_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'floodFill' }, { kind: 'text', text: '(grid, start, newColor) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  oldColor = grid[start]; queue = [start];' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (oldColor === newColor) return;' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (queue.length > 0) {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    current = queue.shift();' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (grid[current] !== oldColor) continue;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    grid[current] = newColor;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    add four neighbors with oldColor to the queue;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' filled grid;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '}' }] },
];
