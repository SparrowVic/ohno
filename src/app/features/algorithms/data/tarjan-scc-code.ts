import { CodeLine } from '../models/detail';

export const TARJAN_SCC_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'tarjanScc' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  init index, low, stack, onStack, componentId;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each vertex v in graph {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' index[v] is undefined:' }] },
  { number: 5, tokens: [{ kind: 'text', text: '      strongConnect(v);' }] },
  { number: 6, tokens: [{ kind: 'text', text: '  strongConnect(v): assign index[v] = low[v] = nextIndex; push v;' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each edge v → w {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    inspect outgoing edge to w;' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '    if' }, { kind: 'text', text: ' index[w] is undefined {' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      strongConnect(w);' }] },
  { number: 11, tokens: [{ kind: 'text', text: '      low[v] = min(low[v], low[w]);' }] },
  { number: 12, tokens: [{ kind: 'kw', text: '    } else if' }, { kind: 'text', text: ' w is on stack {' }] },
  { number: 13, tokens: [{ kind: 'text', text: '      low[v] = min(low[v], index[w]);' }] },
  { number: 14, tokens: [{ kind: 'text', text: '    } else skip finished SCC;' }] },
  { number: 15, tokens: [{ kind: 'kw', text: '  if' }, { kind: 'text', text: ' low[v] == index[v] {' }] },
  { number: 16, tokens: [{ kind: 'text', text: '    pop stack until v to emit one SCC;' }] },
  { number: 17, tokens: [{ kind: 'text', text: '  } else leave v on stack;' }] },
  { number: 18, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' all SCCs;' }] },
];
