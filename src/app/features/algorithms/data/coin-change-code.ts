import { CodeLine } from '../models/detail';

export const COIN_CHANGE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'coinChange' }, { kind: 'text', text: '(coins, amount) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set dp[0][0] = 0 and mark all other amounts as unreachable;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' coin row i from 1..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' amt from 1..target {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare skipping the coin with taking it again from the same row;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' take branch is valid, reuse dp[i][amt-coin] + 1;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      otherwise only carry dp[i-1][amt];' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      commit dp[i][amt] = min(skip, take);' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' backtracking from dp[n][target] {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' taking the coin explains the cell: keep coin and stay in row;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' move up and skip denomination;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 15, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' minimum coin multiset;' }] },
];
