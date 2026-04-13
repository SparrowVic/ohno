import { CodeLine } from '../models/detail';

export const BRIDGES_ARTICULATION_POINTS_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'findCriticalCuts' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  disc[node] = low[node] = ' }, { kind: 'kw', text: 'null' }, { kind: 'text', text: ' for every node;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  time = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' }] },
  { number: 4, tokens: [{ kind: 'text', text: '  ' }, { kind: 'kw', text: 'function' }, { kind: 'text', text: ' dfs(node, parent) {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    disc[node] = low[node] = ++time;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    childCount = ' }, { kind: 'num', text: '0' }, { kind: 'text', text: ';' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    ' }, { kind: 'kw', text: 'for' }, { kind: 'text', text: ' each neighbor of node {' }] },
  { number: 8, tokens: [{ kind: 'text', text: '      ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (neighbor !== parent and disc[neighbor] !== null) {' }] },
  { number: 9, tokens: [{ kind: 'text', text: '        low[node] = min(low[node], disc[neighbor]);' }] },
  { number: 10, tokens: [{ kind: 'text', text: '      } ' }, { kind: 'kw', text: 'else if' }, { kind: 'text', text: ' (disc[neighbor] === null) {' }] },
  { number: 11, tokens: [{ kind: 'text', text: '        dfs(neighbor, node); childCount++;' }] },
  { number: 12, tokens: [{ kind: 'text', text: '        low[node] = min(low[node], low[neighbor]);' }] },
  { number: 13, tokens: [{ kind: 'text', text: '        ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (low[neighbor] > disc[node]) mark bridge;' }] },
  { number: 14, tokens: [{ kind: 'text', text: '        ' }, { kind: 'kw', text: 'if' }, { kind: 'text', text: ' (parent !== null and low[neighbor] >= disc[node]) mark articulation;' }] },
  { number: 15, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 16, tokens: [{ kind: 'text', text: '    }' }] },
  { number: 17, tokens: [{ kind: 'text', text: '  } ' }, { kind: 'kw', text: 'return' }, { kind: 'text', text: ' bridges and articulation points;' }] },
  { number: 18, tokens: [{ kind: 'text', text: '}' }] },
];
