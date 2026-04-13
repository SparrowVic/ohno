import { CodeLine } from '../models/detail';

export const PRIMS_MST_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'primsMst' }, { kind: 'text', text: '(graph, start) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  key[node] = ' }, { kind: 'num', text: '∞' }, { kind: 'text', text: ', parent[node] = null;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  key[start] = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (there is a node outside the tree) {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    current = node with minimum key outside the tree;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    add current to MST;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each neighbor of current {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (neighbor already in tree) continue;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (weight(current, neighbor) < key[neighbor]) {' }] },
  { number: 10, tokens: [{ kind: 'text', text: '        key[neighbor] = weight(current, neighbor);' }] },
  { number: 11, tokens: [{ kind: 'text', text: '        parent[neighbor] = current;' }] },
  { number: 12, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 13, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' parent tree;' }] },
  { number: 15, tokens: [{ kind: 'text', text: '}' }] },
];
