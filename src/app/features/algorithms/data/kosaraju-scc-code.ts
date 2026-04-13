import { CodeLine } from '../models/detail';

export const KOSARAJU_SCC_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'kosarajuScc' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  init visited and empty finishStack;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each vertex v in graph {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' v is unvisited:' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      dfsOriginal(v);' }] },
  { number: 6, tokens: [{ kind: 'text', text: '  dfsOriginal(v): visit every original outgoing edge;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '  when dfsOriginal(v) finishes, push v onto finishStack;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  reverse every graph edge;' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' finishStack not empty {' }] },
  { number: 10, tokens: [{ kind: 'text', text: '    v = pop node with latest finishing time;' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' v is not assigned:' }] },
  { number: 12, tokens: [{ kind: 'text', text: '      dfsReverse(v) on reversed graph to collect one SCC;' }] },
  { number: 13, tokens: [{ kind: 'text', text: '      emit collected SCC;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 15, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' all SCCs;' }] },
];
