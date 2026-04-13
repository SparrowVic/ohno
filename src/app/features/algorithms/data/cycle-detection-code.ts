import { CodeLine } from '../models/detail';

export const CYCLE_DETECTION_CODE: readonly CodeLine[] = [
  {
    number: 1,
    tokens: [
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'hasDirectedCycle' },
      { kind: 'text', text: '(graph: WeightedGraphData): boolean {' },
    ],
  },
  {
    number: 2,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' state = ' },
      { kind: 'kw', text: 'new' },
      { kind: 'text', text: ' Map<string, \"new\" | \"stack\" | \"done\">();' },
    ],
  },
  {
    number: 3,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' node of graph.nodes) {' },
    ],
  },
  {
    number: 4,
    tokens: [{ kind: 'text', text: '    state.set(node.id, \"new\");' }],
  },
  {
    number: 5,
    tokens: [{ kind: 'text', text: '  }' }],
  },
  {
    number: 6,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' node of graph.nodes) {' },
    ],
  },
  {
    number: 7,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (state.get(node.id) ' },
      { kind: 'op', text: '===' },
      { kind: 'text', text: ' \"new\" ' },
      { kind: 'op', text: '&&' },
      { kind: 'text', text: ' dfs(node.id)) ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' true;' },
    ],
  },
  {
    number: 8,
    tokens: [{ kind: 'text', text: '  }' }],
  },
  {
    number: 9,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' false;' },
    ],
  },
  {
    number: 10,
    tokens: [
      { kind: 'text', text: '  ' },
      { kind: 'kw', text: 'function' },
      { kind: 'text', text: ' ' },
      { kind: 'fn', text: 'dfs' },
      { kind: 'text', text: '(nodeId: string): boolean {' },
    ],
  },
  {
    number: 11,
    tokens: [{ kind: 'text', text: '    state.set(nodeId, \"stack\");' }],
  },
  {
    number: 12,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'for' },
      { kind: 'text', text: ' (' },
      { kind: 'kw', text: 'const' },
      { kind: 'text', text: ' edge of graph.edges.filter((item) => item.from === nodeId)) {' },
    ],
  },
  {
    number: 13,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (state.get(edge.to) ' },
      { kind: 'op', text: '===' },
      { kind: 'text', text: ' \"stack\") ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' true;' },
    ],
  },
  {
    number: 14,
    tokens: [
      { kind: 'text', text: '      ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (state.get(edge.to) ' },
      { kind: 'op', text: '===' },
      { kind: 'text', text: ' \"new\") {' },
    ],
  },
  {
    number: 15,
    tokens: [
      { kind: 'text', text: '        ' },
      { kind: 'kw', text: 'if' },
      { kind: 'text', text: ' (dfs(edge.to)) ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' true;' },
    ],
  },
  {
    number: 16,
    tokens: [{ kind: 'text', text: '      }' }],
  },
  {
    number: 17,
    tokens: [{ kind: 'text', text: '    }' }],
  },
  {
    number: 18,
    tokens: [{ kind: 'text', text: '    state.set(nodeId, \"done\");' }],
  },
  {
    number: 19,
    tokens: [
      { kind: 'text', text: '    ' },
      { kind: 'kw', text: 'return' },
      { kind: 'text', text: ' false;' },
    ],
  },
  {
    number: 20,
    tokens: [{ kind: 'text', text: '  }' }],
  },
  {
    number: 21,
    tokens: [{ kind: 'text', text: '}' }],
  },
];
