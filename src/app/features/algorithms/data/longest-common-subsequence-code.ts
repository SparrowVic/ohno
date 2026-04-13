import { CodeLine } from '../models/detail';

export const LONGEST_COMMON_SUBSEQUENCE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'lcs' }, { kind: 'text', text: '(a, b) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize first row and first column with 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i from 1..|a| {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' j from 1..|b| {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare a[i-1] with b[j-1];' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' they match: dp[i][j] = dp[i-1][j-1] + 1;' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '      else' }, { kind: 'text', text: ' dp[i][j] = max(dp[i-1][j], dp[i][j-1]);' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      store best subsequence length for this cell;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' i > 0 and j > 0 {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' characters match: add char and move diagonally;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else if' }, { kind: 'text', text: ' top >= left: move up;' }] },
  { number: 14, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' move left;' }] },
  { number: 15, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 16, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' recovered subsequence;' }] },
];
