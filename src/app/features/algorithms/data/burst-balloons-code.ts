import { CodeLine } from '../models/detail';

export const BURST_BALLOONS_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'burstBalloons' }, { kind: 'text', text: '(nums) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  pad nums with sentinel 1s and treat empty intervals as 0 coins;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' span from 1..n {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each interval (left, right) of that span {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      reset best score for this interval;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      for' }, { kind: 'text', text: ' each candidate last balloon k in [left, right] {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '        candidate = dp[left][k-1] + val[left-1]*val[k]*val[right+1] + dp[k+1][right];' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '        if' }, { kind: 'text', text: ' candidate is better: store score and k;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      commit best score for interval (left, right);' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  trace saved last-burst choices to rebuild one optimal order;' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' maximum coins and optimal burst sequence;' }] },
];
