import { CodeLine } from '../models/detail';

export const PROFILE_DP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'profileDp' }, { kind: 'text', text: '(columns) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[0][emptyMask] = 1;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each column c {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each frontier profile mask {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      enumerate every valid next profile produced by local placements;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      add the current count into dp[c+1][nextMask];' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  backtrack one valid chain of profile masks ending in emptyMask;' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' total tilings for the board;' }] },
];
