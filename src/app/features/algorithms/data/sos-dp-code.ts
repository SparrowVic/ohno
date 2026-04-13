import { CodeLine } from '../models/detail';

export const SOS_DP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'sosDp' }, { kind: 'text', text: '(f) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  copy the base function values into row 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each bit b from 0..B-1 {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each mask {' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '      if' }, { kind: 'text', text: ' bit b is set in mask: add dp[b][mask without bit] into dp[b+1][mask];' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '      else' }, { kind: 'text', text: ' just carry the previous stage value;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '  trace the base submasks that feed one focused mask;' }] },
  { number: 8, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' sum over all subset contributions;' }] },
];
