import { CodeLine } from '../models/detail';

export const HOPCROFT_KARP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'hopcroftKarp' }, { kind: 'text', text: '(bipartiteGraph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  matching = ∅; pairU[u] = NIL; pairV[v] = NIL;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (BFS builds a layered graph to some free right node) {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    enqueue every free left node at distance 0;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    scan edges and assign alternating BFS layers;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each free left node {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      DFS only through edges that respect the BFS layering;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      flip every edge on each found augmenting path;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' maximum matching;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '}' }] },
];
