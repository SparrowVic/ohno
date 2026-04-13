import { CodeLine } from '../models/detail';

export const TOPOLOGICAL_SORT_KAHN_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'topologicalSortKahn' },
      { kind: 'text', text: '(graph: WeightedGraphData): string[] {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' inDegree = ' },
      { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Map<string, number>(graph.nodes.map((node) => [node.id, ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ']));' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' queue: string[] = [];' },
    ],
  },
  {
    number: 4,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' order: string[] = [];' },
    ],
  },
  {
    number: 5,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' edge of graph.edges) {' },
    ],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '    inDegree.set(edge.to, (inDegree.get(edge.to) ?? ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') ' },
      { kind: 'op', text: '+' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '1' },
      { kind: 'text', text: ');' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' node of graph.nodes) {' },
    ],
  },
  {
    number: 8,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' ((inDegree.get(node.id) ?? ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') ' },
      { kind: 'op', text: '===' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') queue.push(node.id);' },
    ],
  },
  {
    number: 9,
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
    number: 10,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' current = queue.shift()!;' },
    ],
  },
  {
    number: 11,
    tokens: [
      { kind: 'text', text: '    order.push(current);' },
    ],
  },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' edge of graph.edges.filter((item) => item.from === current)) {' },
    ],
  },
  {
    number: 13,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' next = (inDegree.get(edge.to) ?? ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') ' },
      { kind: 'op', text: '-' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '1' },
      { kind: 'text', text: ';' },
    ],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '      inDegree.set(edge.to, next);' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (next ' },
      { kind: 'op', text: '===' },
      { kind: 'text', text: ' ' },
      { kind: 'num', text: '0' },
      { kind: 'text', text: ') queue.push(edge.to);' },
    ],
  },
  {
    number: 16,
    tokens: [{ kind: 'text', text: '    }' }],
  },
  {
    number: 17,
    tokens: [{ kind: 'text', text: '  }' }],
  },
  {
    number: 18,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' order;' },
    ],
  },
  {
    number: 19,
    tokens: [{ kind: 'text', text: '}' }],
  },
];
