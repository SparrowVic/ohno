import { CodeLine } from '../models/detail';

export const BFS_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'bfs' },
      { kind: 'text', text: '(graph, source) {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' queue ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' [source];' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' visited ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Set([source]);' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' level ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Map([[source, ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ']]);' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'while' },
      { kind: 'text', text: ' (queue.length ' },
      { kind: 'op', text: '>' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') {' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' current ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' queue.shift()!' },
      { kind: 'op', text: ';' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' neighbor of graph.neighbors(current)) {' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (visited.has(neighbor)) ' },
      { kind: 'kw', text: 'continue' },
      { kind: 'op', text: ';' },
    ],
  },
  {
    number: 9,
    tokens: [{ kind: 'text', text: '      visited.add(neighbor);' }],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '      level.set(neighbor, level.get(current)! ' },
      { kind: 'op', text: '+' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '1' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 11,
    tokens: [{ kind: 'text', text: '      queue.push(neighbor);' }],
  },
  { number: 12, tokens: [{ kind: 'text', text: '    }' }] },
  {
    number: 13,
    tokens: [{ kind: 'text', text: '    order.push(current);' }],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '  } ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' { level, order };' },
    ],
  },
  { number: 15, tokens: [{ kind: 'text', text: '}' }] },
];
