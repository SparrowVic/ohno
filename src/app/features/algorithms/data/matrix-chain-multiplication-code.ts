import { CodeLine } from '../models/detail';

export const MATRIX_CHAIN_MULTIPLICATION_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'matrixChainOrder' }, { kind: 'text', text: '(dims) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set diagonal m[i][i] = 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' chainLength from 2..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each interval (i, j) of that length {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      initialize m[i][j] = ∞;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      for' }, { kind: 'text', text: ' split k from i..j-1 {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '        cost = m[i][k] + m[k+1][j] + dims[i-1]*dims[k]*dims[j];' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '        if' }, { kind: 'text', text: ' cost is better: remember it and store split k;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      commit best cost for interval (i, j);' }] },
  { number: 11, tokens: [{ kind: 'text', text: '  trace stored split points to rebuild optimal parenthesization;' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' best cost and parentheses;' }] },
];
