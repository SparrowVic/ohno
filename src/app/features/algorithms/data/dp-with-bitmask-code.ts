import { CodeLine } from '../models/detail';

export const DP_WITH_BITMASK_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'bitmaskAssignment' }, { kind: 'text', text: '(costs) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[0][000...0] = 0 for the empty used-job mask;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' worker row i from 1..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each mask with popcount(mask) = i {' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '      for' }, { kind: 'text', text: ' each job bit inside the mask {' }] },
  { number: 6, tokens: [{ kind: 'text', text: '        relax dp[i][mask] with dp[i-1][mask without that job] + assignCost;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  backtrack parent jobs from dp[n][allJobsMask];' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' minimum-cost assignment;' }] },
];
