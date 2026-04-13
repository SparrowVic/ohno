import { CodeLine } from '../models/detail';

export const WILDCARD_MATCHING_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'wildcardMatch' }, { kind: 'text', text: '(text, pattern) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[0][0] = true and extend row 0 across leading stars;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i from 1..|text| {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' j from 1..|pattern| {' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: " pattern[j-1] == '*': inspect empty and consume branches;" }] },
  { number: 6, tokens: [{ kind: 'text', text: '      dp[i][j] = dp[i][j-1] OR dp[i-1][j];' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '      else' }, { kind: 'text', text: ' inspect diagonal match with literal or ? wildcard;' }] },
  { number: 8, tokens: [{ kind: 'text', text: "      dp[i][j] = dp[i-1][j-1] AND (pattern[j-1] == '?' OR text[i-1] == pattern[j-1]);" }] },
  { number: 9, tokens: [{ kind: 'text', text: '  trace one valid route from dp[|text|][|pattern|] if it is true;' }] },
  { number: 10, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' whether the whole text matches the wildcard pattern;' }] },
];
