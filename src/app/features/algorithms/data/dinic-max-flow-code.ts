import { CodeLine } from '../models/detail';

export const DINIC_MAX_FLOW_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'dinic' }, { kind: 'text', text: '(network, source, sink) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  flow = 0;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (BFS can still reach sink in residual graph) {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    assign level[source] = 0 and layer all residual-reachable nodes;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    build the admissible level graph from edges with level + 1;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (there exists an admissible source-to-sink path) {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      bottleneck = minimum residual capacity on that path;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      push bottleneck units of flow along the whole path;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' max flow;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '}' }] },
];
