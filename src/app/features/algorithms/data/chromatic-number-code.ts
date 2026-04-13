import { CodeLine } from '../models/detail';

export const CHROMATIC_NUMBER_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'chromaticNumber' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  order nodes, derive a lower bound, and choose the first palette size to test;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each palette size k {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    pick the next uncolored node in the search order;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    try each color that is not used by an adjacent node;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    if a color is legal, assign it and recurse deeper;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    if recursion fails, undo the color and continue searching;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    if all branches fail, increase k and restart;' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' the smallest k that colors the whole graph;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
