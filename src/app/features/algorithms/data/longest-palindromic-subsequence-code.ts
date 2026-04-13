import { CodeLine } from '../models/detail';

export const LONGEST_PALINDROMIC_SUBSEQUENCE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'longestPalSubseq' }, { kind: 'text', text: '(s) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set every diagonal dp[i][i] = 1;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' span from 2..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each interval (i, j) of that span {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare the outer characters s[i] and s[j];' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' they match: dp[i][j] = dp[i+1][j-1] + 2;' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '      else' }, { kind: 'text', text: ' keep the better of dp[i+1][j] and dp[i][j-1];' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      commit best palindrome length for interval (i, j);' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' tracing the optimal interval choices {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' matching outer pair is optimal: take both and move inward;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' drop the weaker boundary and continue;' }] },
  { number: 14, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' longest palindromic subsequence;' }] },
];
