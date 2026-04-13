import { CodeLine } from '../models/detail';

export const KNUTH_DP_OPTIMIZATION_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'knuthDp' }, { kind: 'text', text: '(weights) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set dp[i][i] = 0 and opt[i][i] = i on the diagonal;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' interval length from 2..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each interval (i, j) of that length {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      only test split k inside [opt[i][j-1], opt[i+1][j]];' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      commit the best merge cost and store its split in opt[i][j];' }] },
  { number: 7, tokens: [{ kind: 'text', text: '  trace saved splits to rebuild one merge tree;' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' optimal interval merge cost;' }] },
];
