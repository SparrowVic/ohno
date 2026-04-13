import { CodeLine } from '../models/detail';

export const LONGEST_INCREASING_SUBSEQUENCE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'lisDp' }, { kind: 'text', text: '(values) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  initialize len[i] = 1 and prev[i] = none for every index;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each end index i from left to right {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each predecessor j < i {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      if values[j] < values[i], candidate = len[j] + 1;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' candidate improves len[i]: store len[i] and prev[i] = j;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    finalize best LIS that ends at i;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  choose the index with maximal len[i];' }] },
  { number: 11, tokens: [{ kind: 'text', text: '  backtrack prev[] pointers to recover one LIS;' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' subsequence and its length;' }] },
];
