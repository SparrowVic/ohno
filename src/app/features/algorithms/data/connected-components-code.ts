import { CodeLine } from '../models/detail';

export const CONNECTED_COMPONENTS_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'connectedComponents' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  component[node] = ' }, { kind: 'kw', text: 'null' }, { kind: 'text', text: ' for every node;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  let nextComponent = 0;' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each node in graph {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (component[node] !== null) continue;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    nextComponent++; queue = [node]; component[node] = nextComponent;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (queue.length > 0) {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      current = queue.shift();' }] },
  { number: 9, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each neighbor of current {' }] },
  { number: 10, tokens: [{ kind: 'text', text: '        ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (component[neighbor] !== null) continue;' }] },
  { number: 11, tokens: [{ kind: 'text', text: '        component[neighbor] = nextComponent; queue.push(neighbor);' }] },
  { number: 12, tokens: [{ kind: 'text', text: '      } close(current);' }] },
  { number: 13, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 14, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 15, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' component labels;' }] },
  { number: 16, tokens: [{ kind: 'text', text: '}' }] },
];
