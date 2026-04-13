import { CodeLine } from '../models/detail';

export const FLOYD_WARSHALL_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'floydWarshall' }, { kind: 'text', text: '(dist) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize dist[i][j] from edge weights and 0 on the diagonal;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each pivot k {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    test dist[i][j] against dist[i][k] + dist[k][j] for every pair (i, j);' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (route through k is shorter) dist[i][j] = dist[i][k] + dist[k][j];' }] },
  { number: 6, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' all-pairs shortest-path matrix;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '}' }] },
];
