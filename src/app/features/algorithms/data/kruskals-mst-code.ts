import { CodeLine } from '../models/detail';

export const KRUSKALS_MST_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'kruskalMst' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  sort every edge by nondecreasing weight; make each node its own set;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  mst = []; totalWeight = 0;' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each edge (u, v) in sorted order {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    ru = find(u); rv = find(v);' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (ru === rv) skip edge; // it would create a cycle' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    accept edge into mst; union(ru, rv); totalWeight += weight;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (mst has V - 1 edges) break;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' mst, totalWeight;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
