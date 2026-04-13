import { CodeLine } from '../models/detail';

export const DP_ON_TREES_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'treeDp' }, { kind: 'text', text: '(root) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  root the tree and compute a postorder traversal;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each node u in postorder {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    initialize take[u] = weight[u] and skip[u] = 0;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    leaves already have their final values;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each child v of u {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      take[u] += skip[v]; skip[u] += max(take[v], skip[v]);' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    } commit best[u] = max(take[u], skip[u]);' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  start from the root with parentTaken = false;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '  backtrack chosen nodes using take/skip decisions;' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' one maximum-weight independent set;' }] },
];
