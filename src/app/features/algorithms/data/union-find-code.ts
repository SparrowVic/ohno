import { CodeLine } from '../models/detail';

export const UNION_FIND_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'unionFindDemo' }, { kind: 'text', text: '(operations) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  parent[x] = x; rank[x] = 0; size[x] = 1;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each operation in operations {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (operation is find) {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      follow parent pointers until the representative;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      compress visited nodes directly to that representative;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    } ' }, { kind: 'kw', text: 'else' }, { kind: 'text', text: ' {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      rootA = find(a); rootB = find(b);' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (rootA === rootB) continue;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      attach lower-rank root under higher-rank root and update size;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 12, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' all disjoint sets;' }] },
  { number: 13, tokens: [{ kind: 'text', text: '}' }] },
];
