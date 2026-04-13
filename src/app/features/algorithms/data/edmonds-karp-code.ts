import { CodeLine } from '../models/detail';

export const EDMONDS_KARP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'edmondsKarp' }, { kind: 'text', text: '(network, source, sink) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  flow = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ' on every edge;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' (BFS can still reach sink in residual graph) {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    run BFS and record the parent residual edge for each discovered node;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    the BFS tree gives the shortest augmenting path to sink;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    bottleneck = minimum residual capacity on that path;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    add bottleneck flow to every edge on the path;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' maximum flow;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
