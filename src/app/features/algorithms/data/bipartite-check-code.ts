import { CodeLine } from '../models/detail';

export const BIPARTITE_CHECK_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'isBipartite' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  color[node] = ' }, { kind: 'kw', text: 'null' }, { kind: 'text', text: ' for every node;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each node in graph {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (color[node] !== null) continue;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    queue = [node]; color[node] = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'while' }, { kind: 'text', text: ' (queue.length > 0) {' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      current = queue.shift();' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each neighbor of current {' }] },
  { number: 9, tokens: [{ kind: 'text', text: '        wanted = color[current] xor ' }, { kind: 'num', text: '1' }, { kind: 'text', text: ';' }] },
  { number: 10, tokens: [{ kind: 'text', text: '        ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (color[neighbor] === null) { color[neighbor] = wanted; queue.push(neighbor); }' }] },
  { number: 11, tokens: [{ kind: 'text', text: '        ' }, { kind: 'kw', text: 'else if' }, { kind: 'text', text: ' (color[neighbor] === color[current]) {' }] },
  { number: 12, tokens: [{ kind: 'text', text: '          ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' false;' }] },
  { number: 13, tokens: [{ kind: 'text', text: '        }' }] },
  { number: 14, tokens: [{ kind: 'text', text: '      } close(current);' }] },
  { number: 15, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 16, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' true;' }] },
  { number: 17, tokens: [{ kind: 'text', text: '}' }] },
];
