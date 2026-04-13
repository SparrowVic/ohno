import { CodeLine } from '../models/detail';

export const EDIT_DISTANCE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'editDistance' }, { kind: 'text', text: '(a, b) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize border cells with insert/delete costs;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i from 1..|a| {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' j from 1..|b| {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      compare replace, delete and insert transitions;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' a[i-1] == b[j-1]: replace cost adds 0;' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '      else' }, { kind: 'text', text: ' replace cost adds 1;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      dp[i][j] = min(replace, delete, insert);' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' backtracking from dp[|a|][|b|] {' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' diagonal is optimal: keep or replace;' }] },
  { number: 13, tokens: [{ kind: 'kw', text: '    else if' }, { kind: 'text', text: ' up is optimal: delete;' }] },
  { number: 14, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' insert from left;' }] },
  { number: 15, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 16, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' distance and edit script;' }] },
];
