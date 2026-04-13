import { CodeLine } from '../models/detail';

export const DP_CONVEX_HULL_TRICK_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'dpCht' }, { kind: 'text', text: '(x) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[0] and insert the first line into the hull;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each next query point i {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    x-queries arrive in monotone order;' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '    while' }, { kind: 'text', text: ' the next hull line is better at x[i]: pop the front;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    query the front line and compute dp[i];' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '    while' }, { kind: 'text', text: ' the new line makes the tail obsolete: pop the tail;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    append the new line for point i to the hull;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  backtrack predecessor links if you want one optimal transition chain;' }] },
  { number: 10, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' optimized DP values;' }] },
];
