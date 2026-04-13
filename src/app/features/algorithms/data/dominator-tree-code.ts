import { CodeLine } from '../models/detail';

export const DOMINATOR_TREE_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'dominatorTree' }, { kind: 'text', text: '(cfg, entry) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  dom[entry] = {entry}; all other dom sets start as every node;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  repeat' }, { kind: 'text', text: ' until no dominator set changes {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each non-entry block b {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      newDom = intersection(dom[p] for every predecessor p of b);' }] },
  { number: 6, tokens: [{ kind: 'text', text: '      dom[b] = newDom ∪ {b};' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  choose idom[b] as the deepest strict dominator of each block;' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' the immediate-dominator tree;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
