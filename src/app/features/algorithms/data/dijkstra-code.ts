import { CodeLine } from '../models/detail';

export const DIJKSTRA_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'dijkstra' },
      { kind: 'text', text: '(graph, source) {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' each node: distance[node] ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '∞' },
      { kind: 'text', text: ', previous[node] ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'kw', text: 'null' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  distance[source] ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' queue ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' createPriorityQueue(distance);' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'while' },
      { kind: 'text', text: ' (queue is not empty) {' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' current ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' extractMin(queue);' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' each neighbor of current {' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' candidate ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' distance[current] ' },
      { kind: 'op', text: '+' },
      { kind: 'text', text: ' weight(current, neighbor);' },
    ],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (candidate ' },
      { kind: 'op', text: '<' },
      { kind: 'text', text: ' distance[neighbor]) {' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '        distance[neighbor] ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' candidate;' },
    ],
  },
  {
    number: 11,
    tokens: [
      { kind: 'text', text: '        previous[neighbor] ' },
      { kind: 'op', text: '=' },
      { kind: 'text', text: ' current;' },
    ],
  },
  {
    number: 12,
    tokens: [{ kind: 'text', text: '    }' }],
  },
  {
    number: 13,
    tokens: [{ kind: 'text', text: '    settle(current);' }],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '  } ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' { distance, previous };' },
    ],
  },
  { number: 15, tokens: [{ kind: 'text', text: '}' }] },
];
