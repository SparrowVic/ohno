import { CodeLine } from '../models/detail';

export const A_STAR_PATHFINDING_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'aStar' }, { kind: 'text', text: '(grid, start, goal) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  open = { start }; g[start] = 0; f[start] = h(start, goal);' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (open is not empty) {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    current = node in open with smallest f-score;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (current === goal) reconstruct path;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    move current from open to closed;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each neighbor of current {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      tentativeG = g[current] + movementCost;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (tentativeG >= g[neighbor]) continue;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      parent[neighbor] = current; g[neighbor] = tentativeG;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '      f[neighbor] = g[neighbor] + h(neighbor, goal); open.add(neighbor);' }] },
  { number: 12, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 13, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' no path;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '}' }] },
];
