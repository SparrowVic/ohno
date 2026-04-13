import { CodeLine } from '../models/detail';

export const BELLMAN_FORD_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'bellmanFord' }, { kind: 'text', text: '(graph, source) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  distance[node] = ' }, { kind: 'num', text: '∞' }, { kind: 'text', text: ', parent[node] = null;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  distance[source] = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' pass = 1 to |V| - 1 {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    changed = false;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each directed edge (u, v, w) {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      candidate = distance[u] + w;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (candidate >= distance[v]) continue;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      distance[v] = candidate; parent[v] = u; changed = true;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 11, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (!changed) break;' }] },
  { number: 12, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 13, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each edge (u, v, w) {' }] },
  { number: 14, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (distance[u] + w < distance[v]) report negative cycle;' }] },
  { number: 15, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 16, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' { distance, parent };' }] },
  { number: 17, tokens: [{ kind: 'text', text: '}' }] },
];
