import { CodeLine } from '../models/detail';

export const SUBSET_SUM_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'subsetSum' }, { kind: 'text', text: '(values, target) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set dp[0][0] = true and mark every other sum false;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' item row i from 1..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' sum from 0..target {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare skipping value[i] with taking it from the previous row;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' value[i] fits, take branch checks dp[i-1][sum-value[i]];' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      otherwise only the skip branch remains;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      commit dp[i][sum] = skip OR take;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' tracing a reachable target sum {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' taking value[i] explains the cell: include it and reduce sum;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' move upward and skip item;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 15, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' whether target is reachable and one witness subset;' }] },
];
