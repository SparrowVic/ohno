import { CodeLine } from '../models/detail';

export const CLIMBING_STAIRS_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'climbStairs' }, { kind: 'text', text: '(n) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set ways[0] = 1 and ways[1] = 1;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' stair from 2..n {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    inspect the previous two landings;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    ways[stair] = ways[stair-1] + ways[stair-2];' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' ways[n];' }] },
];
