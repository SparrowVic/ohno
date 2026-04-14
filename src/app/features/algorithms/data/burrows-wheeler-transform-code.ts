import { CodeLine } from '../models/detail';

export const BURROWS_WHEELER_TRANSFORM_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' bwt(s):' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  rotations ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' all cyclic rotations of s' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  sort(rotations)' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  F ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' first column of sorted matrix' }] },
  { number: 5, tokens: [{ kind: 'text', text: '  L ' }, { kind: 'op', text: '←' }, { kind: 'text', text: ' last column of sorted matrix' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' L' }] },
];
