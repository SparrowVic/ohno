import { CodeLine } from '../models/detail';

export const DIVIDE_CONQUER_DP_OPTIMIZATION_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'divideConquerDp' }, { kind: 'text', text: '(values, groups) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize dp[0][0] = 0 and every other state as unreachable;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each group row g from 1..k {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    recursively solve midpoints of the row using monotone split bounds;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    for each midpoint mid, inspect candidate splits only in [optL, optR];' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    commit dp[g][mid] and its optimal split, then recurse left/right with narrowed bounds;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  after all rows are solved, jump through saved opt splits;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  this yields the same answer as naive O(k n²), but with fewer split checks;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  backtrack partitions from dp[k][n];' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' optimal partition cost and segment plan;' }] },
];
