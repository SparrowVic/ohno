import { CodeLine } from '../models/detail';

export const REGEX_MATCHING_DP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'regexMatch' }, { kind: 'text', text: '(text, pattern) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[0][0] = true and propagate empty star groups on row 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each text char i and pattern token j {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    inspect the active pattern token;' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: " token is '*': compare zero-occurrence and consume-one branches;" }] },
  { number: 6, tokens: [{ kind: 'text', text: '      dp[i][j] = dp[i][j-2] OR (matches(prevToken, text[i-1]) AND dp[i-1][j]);' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' check diagonal match with literal token or dot wildcard;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      dp[i][j] = dp[i-1][j-1] AND tokenMatches;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  trace one valid derivation if dp[m][n] is true;' }] },
  { number: 10, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' whether the regex matches the full text;' }] },
];
