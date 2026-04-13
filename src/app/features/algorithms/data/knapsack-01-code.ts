import { CodeLine } from '../models/detail';

export const KNAPSACK_01_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'knapsack01' }, { kind: 'text', text: '(items, capacity) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize dp[0..n][0..capacity] with 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' item i from 1..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' cap from 0..capacity {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare skip with take when weight[i] fits;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' weight[i] <= cap {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '        dp[i][cap] = max(dp[i-1][cap], dp[i-1][cap-weight[i]] + value[i]);' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      } else dp[i][cap] = dp[i-1][cap];' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' backtracking from dp[n][capacity] {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' take branch was used: include item and jump left/up;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' move up and skip item;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 15, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' optimal backpack;' }] },
];
