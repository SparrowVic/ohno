import { CodeLine } from '../models/detail';

export const STEINER_TREE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'steinerTree' }, { kind: 'text', text: '(graph, terminals) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed one-terminal states using shortest paths to each terminal;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  for every terminal subset mask {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    merge two smaller subset states at the same root node;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    propagate the merged subset through shortest paths to every other node;' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' the cheapest full-mask state and reconstruct its tree edges;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '}' }] },
];
